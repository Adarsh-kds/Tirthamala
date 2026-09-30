import type { Site } from "./schema.ts";

const count = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);

export function siteWordCount(s: Site): number {
  const parts = [
    s.summary,
    s.architecture,
    s.rebuilding,
    s.significance,
    s.ritualsNote,
    s.history.notes,
    s.visiting.bestSeason,
    s.visiting.closedSeason,
    s.visiting.howToReach,
    ...s.legend.map((l) => l.text),
    ...s.history.periods.map((p) => p.text),
    ...s.festivals,
  ];
  return parts.reduce((n, p) => n + count(p), 0);
}
