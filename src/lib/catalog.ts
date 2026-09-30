import { getSites, getTraditions } from "./data.ts";
import { regionOf, slugify, toCard, type Card } from "./view.ts";

export const getCards = (): Card[] => {
  const rank = { published: 0, draft: 1, stub: 2 } as Record<string, number>;
  return getSites()
    .map((s) => toCard(s))
    .sort((a, b) => rank[a.contentState] - rank[b.contentState] || a.name.localeCompare(b.name));
};

export function getRegions() {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const s of getSites()) {
    const name = regionOf(s);
    const slug = slugify(name);
    const cur = map.get(slug) ?? { slug, name, count: 0 };
    cur.count++;
    map.set(slug, cur);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const traditionName = (slug: string) =>
  getTraditions().find((t) => t.slug === slug)?.name ?? slug;
