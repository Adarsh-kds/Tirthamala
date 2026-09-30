import path from "node:path";
import { loadDataset, type Dataset } from "./dataset.ts";
import type { Circuit, Site } from "./schema.ts";

let cache: Dataset | undefined;

function dataset(): Dataset {
  if (cache) return cache;
  const ds = loadDataset(path.join(process.cwd(), "data"));
  if (ds.problems.length) {
    throw new Error(
      `Invalid data (${ds.problems.length} problems):\n${ds.problems.slice(0, 25).join("\n")}`,
    );
  }
  cache = ds;
  return ds;
}

export const getSites = () => dataset().sites;
export const getCircuits = () => dataset().circuits;
export const getTraditions = () => [...dataset().traditions].sort((a, b) => a.order - b.order);
export const getSite = (slug: string): Site | undefined => getSites().find((s) => s.slug === slug);
export const getCircuit = (slug: string): Circuit | undefined =>
  getCircuits().find((c) => c.slug === slug);
export const circuitsForSite = (slug: string): Circuit[] =>
  getCircuits().filter((c) => c.members.some((m) => m.siteSlug === slug));
