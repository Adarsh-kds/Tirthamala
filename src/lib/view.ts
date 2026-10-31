import type { RELATIONS, Site } from "./schema.ts";

export type Card = {
  slug: string;
  name: string;
  nameDevanagari?: string;
  altNames?: string[];
  kind: string;
  traditions: string[];
  deities: string[];
  state: string;
  city?: string;
  lat?: number;
  lng?: number;
  accuracy: string;
  contentState: string;
  status: string;
  summary: string;
};

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  tradition: string;
  accuracy: string;
};

// Zero or one map point, so lists can flatMap straight into map data.
export const toPoints = (c: Card): MapPoint[] =>
  c.lat === undefined || c.lng === undefined
    ? []
    : [
        {
          slug: c.slug,
          name: c.name,
          lat: c.lat,
          lng: c.lng,
          tradition: c.traditions[0],
          accuracy: c.accuracy,
        },
      ];

export function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const regionOf = (s: Site) => s.location.state ?? s.location.country;

export function toCard(s: Site): Card {
  return {
    slug: s.slug,
    name: s.name,
    nameDevanagari: s.nameDevanagari,
    altNames: s.altNames.length ? s.altNames : undefined,
    kind: s.kind,
    traditions: s.traditions,
    deities: s.deities,
    state: regionOf(s),
    city: s.location.city,
    lat: s.location.lat,
    lng: s.location.lng,
    accuracy: s.location.coordinateAccuracy,
    contentState: s.contentState,
    status: s.verification.status,
    summary: shorten(s.summary, 130),
  };
}

export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type RelatedView = {
  siteSlug: string;
  relation: (typeof RELATIONS)[number] | "contains";
  note?: string;
};

// Merges explicit links with their mirrors so a link stored on one record shows on both pages.
export function relatedFor(site: Site, all: Site[]): RelatedView[] {
  const out = new Map<string, RelatedView>();
  for (const r of site.related) out.set(r.siteSlug, { ...r });
  for (const o of all) {
    for (const r of o.related) {
      if (r.siteSlug !== site.slug || out.has(o.slug)) continue;
      out.set(o.slug, {
        siteSlug: o.slug,
        relation: r.relation === "part-of" ? "contains" : r.relation,
        note: r.note,
      });
    }
  }
  return [...out.values()];
}
