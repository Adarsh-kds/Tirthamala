import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadDataset } from "./dataset.ts";

const trad = [{ slug: "shaiva", name: "Shaiva", summary: "s", accent: "--trad-shaiva", order: 1 }];

function site(slug: string, over: Record<string, unknown> = {}) {
  return {
    id: slug,
    slug,
    name: slug,
    kind: "temple",
    traditions: ["shaiva"],
    location: { country: "India", coordinateAccuracy: "unverified" },
    outsideIndia: false,
    tier: "C",
    contentState: "stub",
    summary: `Summary of ${slug}.`,
    verification: { status: "needs-review", notes: "n", lastChecked: "2026-09-29" },
    ...over,
  };
}
function circuit(slug: string, members: string[], over: Record<string, unknown> = {}) {
  return {
    id: slug,
    slug,
    name: slug,
    traditions: ["shaiva"],
    kind: "traditional",
    ordered: false,
    description: "d",
    members: members.map((siteSlug) => ({ siteSlug })),
    verification: { status: "needs-review", notes: "n", lastChecked: "2026-09-29" },
    ...over,
  };
}
function fixture(sites: unknown[], circuits: unknown[], raw?: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "tirtha-"));
  mkdirSync(path.join(root, "sites"));
  mkdirSync(path.join(root, "circuits"));
  writeFileSync(path.join(root, "traditions.json"), JSON.stringify(trad));
  for (const s of sites as { slug: string }[])
    writeFileSync(path.join(root, "sites", `${s.slug}.json`), JSON.stringify(s));
  for (const c of circuits as { slug: string }[])
    writeFileSync(path.join(root, "circuits", `${c.slug}.json`), JSON.stringify(c));
  for (const [f, body] of Object.entries(raw ?? {})) writeFileSync(path.join(root, f), body);
  return loadDataset(root);
}

describe("loadDataset", () => {
  it("accepts valid data", () => {
    expect(fixture([site("a")], [circuit("c", ["a"])]).problems).toEqual([]);
  });
  it("rejects a circuit member that does not exist", () => {
    expect(fixture([site("a")], [circuit("c", ["a", "ghost"])]).problems.join()).toMatch(
      /does not resolve/,
    );
  });
  it("rejects orphan sites", () => {
    expect(fixture([site("a"), site("b")], [circuit("c", ["a"])]).problems.join()).toMatch(
      /orphan/,
    );
  });
  it("rejects coordinates outside the country", () => {
    const s = site("a", {
      location: {
        country: "India",
        lat: 51,
        lng: 0,
        coordinateAccuracy: "exact",
        coordinateSources: [],
      },
    });
    expect(fixture([s], [circuit("c", ["a"])]).problems.join()).toMatch(/outside India/);
  });
  it("rejects verified sites without sources", () => {
    const s = site("a", {
      verification: { status: "verified", notes: "n", lastChecked: "2026-09-29" },
    });
    expect(fixture([s], [circuit("c", ["a"])]).problems.join()).toMatch(/at least 2 sources/);
  });
  it("rejects published pages below the tier word minimum", () => {
    const s = site("a", {
      contentState: "published",
      location: {
        country: "India",
        lat: 20,
        lng: 78,
        coordinateAccuracy: "exact",
        coordinateSources: ["one", "two"],
      },
      sources: [
        { title: "t1", url: "https://example.org/1", type: "primary", accessed: "2026-09-29" },
        { title: "t2", url: "https://example.org/2", type: "secondary", accessed: "2026-09-29" },
      ],
      verification: { status: "verified", notes: "n", lastChecked: "2026-09-29" },
    });
    expect(fixture([s], [circuit("c", ["a"])]).problems.join()).toMatch(
      /published Tier C needs 120 words/,
    );
  });
  it("rejects duplicate summaries", () => {
    const a = site("a", { summary: "Same." });
    const b = site("b", { summary: "Same." });
    expect(fixture([a, b], [circuit("c", ["a", "b"])]).problems.join()).toMatch(/duplicates/);
  });
  it("rejects unknown traditions and unknown fields", () => {
    const s = site("a", { traditions: ["nope"], extra: 1 });
    const p = fixture([s], [circuit("c", ["a"])]).problems.join();
    expect(p).toMatch(/Unrecognized key|unknown tradition/);
  });
  it("rejects ordered circuits without order numbers", () => {
    expect(fixture([site("a")], [circuit("c", ["a"], { ordered: true })]).problems.join()).toMatch(
      /need an order/,
    );
  });
  it("reports invalid JSON", () => {
    expect(fixture([], [], { "sites/bad.json": "{oops" }).problems.join()).toMatch(/invalid JSON/);
  });
  it("requires outsideIndia to match the country", () => {
    const s = site("a", { outsideIndia: true });
    expect(fixture([s], [circuit("c", ["a"])]).problems.join()).toMatch(/outsideIndia/);
  });
});
