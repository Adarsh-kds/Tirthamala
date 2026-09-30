import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CircuitSchema,
  SiteSchema,
  TraditionSchema,
  type Circuit,
  type Site,
  type Tradition,
} from "./schema.ts";
import { TIER_MIN_WORDS } from "./tiers.ts";
import { siteWordCount } from "./words.ts";

export type Dataset = {
  sites: Site[];
  circuits: Circuit[];
  traditions: Tradition[];
  problems: string[];
  warnings: string[];
};

// Coarse country boxes [minLng, minLat, maxLng, maxLat]; India uses the outer extent of its official depiction.
const BBOX: Record<string, [number, number, number, number]> = {
  India: [68.1, 6.7, 97.4, 37.1],
  Nepal: [80.0, 26.3, 88.2, 30.5],
  Pakistan: [60.8, 23.6, 77.9, 37.1],
  Bangladesh: [88.0, 20.7, 92.7, 26.7],
  "Sri Lanka": [79.6, 5.9, 81.9, 9.9],
  China: [78.0, 27.0, 99.5, 37.0],
};

function readJson(file: string, problems: string[]): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    problems.push(`${file}: invalid JSON (${(e as Error).message})`);
    return undefined;
  }
}

function parseDir<T>(
  dir: string,
  schema: {
    safeParse: (v: unknown) => {
      success: boolean;
      data?: T;
      error?: { issues: { path: PropertyKey[]; message: string }[] };
    };
  },
  problems: string[],
): { file: string; value: T }[] {
  if (!existsSync(dir)) return [];
  const out: { file: string; value: T }[] = [];
  for (const f of readdirSync(dir)
    .filter((x) => x.endsWith(".json"))
    .sort()) {
    const raw = readJson(path.join(dir, f), problems);
    if (raw === undefined) continue;
    const r = schema.safeParse(raw);
    if (!r.success) {
      for (const i of r.error!.issues)
        problems.push(`${path.basename(dir)}/${f}: ${i.path.join(".") || "(root)"}: ${i.message}`);
      continue;
    }
    out.push({ file: f, value: r.data as T });
  }
  return out;
}

export function loadDataset(root: string): Dataset {
  const problems: string[] = [];
  const warnings: string[] = [];

  const tradFile = path.join(root, "traditions.json");
  const traditions: Tradition[] = [];
  const rawTrads = existsSync(tradFile) ? readJson(tradFile, problems) : undefined;
  if (Array.isArray(rawTrads)) {
    for (const t of rawTrads) {
      const r = TraditionSchema.safeParse(t);
      if (r.success) traditions.push(r.data);
      else
        r.error.issues.forEach((i) =>
          problems.push(`traditions.json: ${i.path.join(".")}: ${i.message}`),
        );
    }
  } else problems.push("traditions.json: missing or not an array");
  const tradSlugs = new Set(traditions.map((t) => t.slug));

  const siteFiles = parseDir<Site>(path.join(root, "sites"), SiteSchema, problems);
  const circuitFiles = parseDir<Circuit>(path.join(root, "circuits"), CircuitSchema, problems);
  const sites = siteFiles.map((x) => x.value);
  const circuits = circuitFiles.map((x) => x.value);

  for (const { file, value } of siteFiles)
    if (file !== `${value.slug}.json`)
      problems.push(`sites/${file}: filename must match slug "${value.slug}"`);
  for (const { file, value } of circuitFiles)
    if (file !== `${value.slug}.json`)
      problems.push(`circuits/${file}: filename must match slug "${value.slug}"`);

  const siteSlugs = new Set<string>();
  for (const s of sites) {
    if (siteSlugs.has(s.slug)) problems.push(`duplicate site slug ${s.slug}`);
    siteSlugs.add(s.slug);
    for (const t of s.traditions)
      if (!tradSlugs.has(t)) problems.push(`sites/${s.slug}: unknown tradition "${t}"`);
    const { lat, lng, country } = s.location;
    if (lat !== undefined && lng !== undefined) {
      const b = BBOX[country];
      if (lng < b[0] || lng > b[2] || lat < b[1] || lat > b[3])
        problems.push(`sites/${s.slug}: coordinates ${lat},${lng} fall outside ${country}`);
    }
    if (s.contentState === "published") {
      if (s.verification.status === "needs-review")
        problems.push(`sites/${s.slug}: published content cannot be needs-review`);
      const words = siteWordCount(s);
      if (words < TIER_MIN_WORDS[s.tier])
        problems.push(
          `sites/${s.slug}: published Tier ${s.tier} needs ${TIER_MIN_WORDS[s.tier]} words, has ${words}`,
        );
    }
    if (s.verification.status === "verified" && s.contentState === "stub")
      warnings.push(`sites/${s.slug}: verified but content is still a stub`);
  }

  const circuitSlugs = new Set<string>();
  const memberCount = new Map<string, number>();
  for (const c of circuits) {
    if (circuitSlugs.has(c.slug)) problems.push(`duplicate circuit slug ${c.slug}`);
    circuitSlugs.add(c.slug);
    for (const t of c.traditions)
      if (!tradSlugs.has(t)) problems.push(`circuits/${c.slug}: unknown tradition "${t}"`);
    for (const m of c.members) {
      if (!siteSlugs.has(m.siteSlug))
        problems.push(`circuits/${c.slug}: member "${m.siteSlug}" does not resolve to a site`);
      memberCount.set(m.siteSlug, (memberCount.get(m.siteSlug) ?? 0) + 1);
    }
    const standard = c.members.filter((m) => m.role === "standard").length;
    if (
      c.countInTradition &&
      standard !== c.countInTradition &&
      c.verification.status === "verified"
    ) {
      problems.push(
        `circuits/${c.slug}: verified but has ${standard} standard members, expected ${c.countInTradition}`,
      );
    } else if (c.countInTradition && standard !== c.countInTradition) {
      warnings.push(
        `circuits/${c.slug}: ${standard} of ${c.countInTradition} traditional members listed so far`,
      );
    }
  }
  for (const s of sites)
    if (!memberCount.has(s.slug))
      problems.push(`sites/${s.slug}: orphan, not a member of any circuit`);

  const summaries = new Map<string, string>();
  for (const s of sites) {
    const prev = summaries.get(s.summary);
    if (prev) problems.push(`sites/${s.slug}: summary duplicates ${prev}`);
    summaries.set(s.summary, s.slug);
  }
  const seoTitles = new Map<string, string>();
  for (const s of sites) {
    if (!s.seo) continue;
    const prev = seoTitles.get(s.seo.title);
    if (prev) problems.push(`sites/${s.slug}: seo.title duplicates ${prev}`);
    seoTitles.set(s.seo.title, s.slug);
  }

  const needs = sites.filter((s) => s.verification.status === "needs-review").length;
  if (needs)
    warnings.push(`${needs} of ${sites.length} sites are needs-review (expected until researched)`);
  return { sites, circuits, traditions, problems, warnings };
}
