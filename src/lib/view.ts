import type { Site } from "./schema.ts";

export type Card = {
  slug: string;
  name: string;
  nameDevanagari?: string;
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

export const isPublished = (s: { contentState: string }) => s.contentState === "published";

export const STATUS_LABEL: Record<string, string> = {
  verified: "Verified",
  disputed: "Sources differ",
  "needs-review": "Needs review",
};

export const ACCURACY_LABEL: Record<string, string> = {
  exact: "Exact location",
  approximate: "Approximate location",
  area: "Area only",
  unverified: "Location not yet verified",
};

export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
