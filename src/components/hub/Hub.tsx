"use client";
import Link from "next/link";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { t } from "@/lib/i18n";
import type { Card } from "@/lib/view";
import { SiteCard } from "../SiteCard";
import { StatusBadge, TraditionChip } from "../Badges";
import SiteMap from "../map/MapLoader";

type View = "cards" | "table" | "map";
type Trad = { slug: string; name: string };
const VIEWS: View[] = ["cards", "table", "map"];
const PAGE = 24;

export function Hub({
  cards,
  traditions,
  regions,
  initialView = "cards",
}: {
  cards: Card[];
  traditions: Trad[];
  regions: { name: string }[];
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const [q, setQ] = useState("");
  const [trad, setTrad] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = p.get("view") as View | null;
    if (v && VIEWS.includes(v)) setView(v);
    setQ(p.get("q") ?? "");
    setTrad(p.get("tradition") ?? "");
    setRegion(p.get("region") ?? "");
    setStatus(p.get("status") ?? "");
    setSelected(p.get("site"));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (view !== initialView) p.set("view", view);
    if (q) p.set("q", q);
    if (trad) p.set("tradition", trad);
    if (region) p.set("region", region);
    if (status) p.set("status", status);
    if (selected && view === "map") p.set("site", selected);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [view, q, trad, region, status, selected, initialView]);

  useEffect(() => {
    const onSearch = (e: Event) => {
      setQ((e as CustomEvent<string>).detail ?? "");
      setView("cards");
      setShown(PAGE);
    };
    window.addEventListener("atlas:search", onSearch);
    return () => window.removeEventListener("atlas:search", onSearch);
  }, []);

  const tradName = useMemo(() => new Map(traditions.map((x) => [x.slug, x.name])), [traditions]);
  const nameOf = (s: string) => tradName.get(s) ?? s;

  const hasQuery = q.trim().length > 0;
  // The search index is built only once someone searches, keeping first load light.
  const index = useMemo(() => {
    if (!hasQuery) return null;
    const ms = new MiniSearch<Card>({
      fields: ["name", "altText", "deitiesText", "place", "summary"],
      storeFields: [],
      idField: "slug",
      extractField: (d, f) =>
        f === "deitiesText"
          ? d.deities.join(" ")
          : f === "place"
            ? [d.city, d.state].join(" ")
            : (d as never)[f],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { name: 3, altText: 2 } },
    });
    ms.addAll(cards);
    return ms;
  }, [cards, hasQuery]);

  const filtered = useMemo(() => {
    let list = cards;
    if (q.trim() && index) {
      const ids = new Set(index.search(q.trim()).map((r) => r.id as string));
      list = list.filter((c) => ids.has(c.slug));
    }
    if (trad) list = list.filter((c) => c.traditions.includes(trad));
    if (region) list = list.filter((c) => c.state === region);
    if (status) list = list.filter((c) => c.status === status);
    return list;
  }, [cards, index, q, trad, region, status]);

  const points = useMemo(
    () =>
      filtered
        .filter((c) => c.lat !== undefined && c.lng !== undefined)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          lat: c.lat!,
          lng: c.lng!,
          tradition: c.traditions[0],
          accuracy: c.accuracy,
        })),
    [filtered],
  );
  const sel = selected ? filtered.find((c) => c.slug === selected) : undefined;

  const col = createColumnHelper<Card>();
  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: t("table.name"),
        cell: (i) => (
          <Link
            href={`/site/${i.row.original.slug}/`}
            className="underline"
            style={{ color: "var(--accent)" }}
          >
            {i.getValue()}
          </Link>
        ),
      }),
      col.accessor((r) => r.traditions.map(nameOf).join(", "), {
        id: "tradition",
        header: t("table.tradition"),
      }),
      col.accessor("state", { header: t("table.region") }),
      col.accessor("kind", { header: t("table.kind") }),
      col.accessor("status", {
        header: t("table.status"),
        cell: (i) => <StatusBadge status={i.getValue()} />,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tradName],
  );
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section aria-labelledby="hub-title">
      <h2 id="hub-title" className="sr-only">
        {t("hub.title")}
      </h2>
      <form role="search" className="filter-bar" onSubmit={(e) => e.preventDefault()}>
        <label className="field-label min-w-56 flex-[2]">
          {t("hub.search")}
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            className="field"
            placeholder={t("hub.searchPlaceholder")}
          />
        </label>
        <label className="field-label">
          {t("hub.tradition")}
          <select
            value={trad}
            onChange={(e) => {
              setTrad(e.target.value);
              setShown(PAGE);
            }}
            className="field"
          >
            <option value="">{t("hub.all")}</option>
            {traditions.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          {t("hub.region")}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setShown(PAGE);
            }}
            className="field"
          >
            <option value="">{t("hub.all")}</option>
            {regions.map((x) => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          {t("hub.verification")}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setShown(PAGE);
            }}
            className="field"
          >
            <option value="">{t("hub.all")}</option>
            <option value="verified">{t("status.verified")}</option>
            <option value="disputed">{t("status.disputed")}</option>
            <option value="needs-review">{t("status.needs-review")}</option>
          </select>
        </label>
        {(q || trad || region || status) && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setQ("");
              setTrad("");
              setRegion("");
              setStatus("");
            }}
          >
            {t("hub.clear")}
          </button>
        )}
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label={t("hub.views")} className="segmented">
          <span
            className="segmented-thumb"
            aria-hidden="true"
            style={{ transform: `translateX(${VIEWS.indexOf(view) * 100}%)` }}
          />
          {VIEWS.map((v) => (
            <button
              key={v}
              role="tab"
              type="button"
              id={`tab-${v}`}
              aria-selected={view === v}
              aria-controls="hub-panel"
              onClick={() => setView(v)}
              className="segmented-btn"
            >
              {t(`view.${v}`)}
            </button>
          ))}
        </div>
        <p
          className="text-xs tracking-wide uppercase"
          role="status"
          aria-live="polite"
          style={{ color: "var(--text-soft)" }}
        >
          {filtered.length} {t("hub.results")}
        </p>
      </div>

      <div id="hub-panel" role="tabpanel" aria-labelledby={`tab-${view}`} className="mt-4">
        {filtered.length === 0 && <p>{t("hub.empty")}</p>}

        {view === "cards" && filtered.length > 0 && (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, shown).map((c) => (
                <li key={c.slug} className="flex">
                  <div className="flex-1">
                    <SiteCard card={c} tradName={nameOf} />
                  </div>
                </li>
              ))}
            </ul>
            {shown < filtered.length && (
              <p className="mt-10 text-center">
                <button
                  type="button"
                  className="btn-outline-gold"
                  onClick={() => setShown(shown + PAGE)}
                >
                  {t("hub.more")} ({filtered.length - shown})
                </button>
              </p>
            )}
          </>
        )}

        {view === "table" && filtered.length > 0 && (
          <div className="glass-panel overflow-x-auto px-4 py-2">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t("table.caption")}</caption>
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        scope="col"
                        className="py-2 pr-4"
                        aria-sort={
                          h.column.getIsSorted() === "asc"
                            ? "ascending"
                            : h.column.getIsSorted() === "desc"
                              ? "descending"
                              : "none"
                        }
                      >
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className="font-semibold"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <span aria-hidden="true">
                            {h.column.getIsSorted() === "asc"
                              ? " ▲"
                              : h.column.getIsSorted() === "desc"
                                ? " ▼"
                                : ""}
                          </span>
                        </button>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b align-top"
                    style={{ borderColor: "var(--rule)" }}
                  >
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className="py-2 pr-4">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "map" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="glass-panel h-[70vh] min-h-[420px] overflow-hidden">
              <SiteMap
                points={points}
                selected={selected}
                onSelect={setSelected}
                className="h-full w-full"
              />
            </div>
            <aside aria-label={t("map.preview")} className="glass-panel p-5">
              {sel ? (
                <div className="space-y-2">
                  <h3
                    className="font-display text-xl font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {sel.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                    {[sel.city, sel.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-sm">{sel.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {sel.traditions.map((tr) => (
                      <TraditionChip key={tr} slug={tr} name={nameOf(tr)} />
                    ))}
                  </div>
                  <StatusBadge status={sel.status} />
                  <p>
                    <Link href={`/site/${sel.slug}/`} className="underline">
                      {t("map.open")}
                    </Link>
                  </p>
                </div>
              ) : (
                <p className="text-sm">{t("map.select")}</p>
              )}
              <Legend />
              <p className="mt-3 text-xs" style={{ color: "var(--text-soft)" }}>
                {filtered.length - points.length} {t("map.unlocated")}
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--text-soft)" }}>
                {t("map.a11yNote")}
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export function Legend() {
  return (
    <div
      className="mt-4 border-t pt-3 text-xs"
      style={{ borderColor: "var(--rule)", color: "var(--text-soft)" }}
    >
      <p className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: "var(--text-soft)" }}
        />{" "}
        {t("legend.exact")}
      </p>
      <p className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full border-2"
          style={{ borderColor: "var(--text-soft)" }}
        />{" "}
        {t("legend.approx")}
      </p>
      <p className="mt-1">{t("legend.colour")}</p>
    </div>
  );
}
