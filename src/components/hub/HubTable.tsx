"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { t, type MessageKey } from "@/lib/i18n";
import type { Card } from "@/lib/view";
import { StatusBadge } from "../Badges";

type Col = "name" | "tradition" | "state" | "kind" | "status";
type Sort = { col: Col; dir: 1 | -1 } | null;

const COLS: [Col, MessageKey][] = [
  ["name", "table.name"],
  ["tradition", "table.tradition"],
  ["state", "table.region"],
  ["kind", "table.kind"],
  ["status", "table.status"],
];

export default function HubTable({
  cards,
  nameOf,
}: {
  cards: Card[];
  nameOf: (slug: string) => string;
}) {
  const [sort, setSort] = useState<Sort>(null);
  const value = (c: Card, col: Col) =>
    col === "tradition" ? c.traditions.map(nameOf).join(", ") : c[col];
  const rows = useMemo(() => {
    if (!sort) return cards;
    return [...cards].sort(
      (a, b) => sort.dir * value(a, sort.col).localeCompare(value(b, sort.col)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, sort]);
  // Click cycles ascending, descending, unsorted.
  const toggle = (col: Col) =>
    setSort((s) => (s?.col !== col ? { col, dir: 1 } : s.dir === 1 ? { col, dir: -1 } : null));

  return (
    <div className="glass-panel overflow-x-auto px-4 py-2">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{t("table.caption")}</caption>
        <thead>
          <tr className="border-rule border-b">
            {COLS.map(([col, label]) => {
              const dir = sort?.col === col ? sort.dir : 0;
              return (
                <th
                  key={col}
                  scope="col"
                  className="py-2 pr-4"
                  aria-sort={dir === 1 ? "ascending" : dir === -1 ? "descending" : "none"}
                >
                  <button type="button" onClick={() => toggle(col)} className="font-semibold">
                    {t(label)}
                    <span aria-hidden="true">{dir === 1 ? " ▲" : dir === -1 ? " ▼" : ""}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.slug} className="border-rule border-b align-top">
              <td className="py-2 pr-4">
                <Link href={`/site/${c.slug}/`} className="text-accent underline">
                  {c.name}
                </Link>
              </td>
              <td className="py-2 pr-4">{value(c, "tradition")}</td>
              <td className="py-2 pr-4">{c.state}</td>
              <td className="py-2 pr-4">{c.kind}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={c.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
