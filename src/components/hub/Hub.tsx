"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import type MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { toPoints, type Card } from "@/lib/view";
import { SiteCard } from "../SiteCard";
import { StatusBadge, TraditionChip } from "../Badges";
import { Legend } from "../map/Legend";
import SiteMap from "../map/MapLoader";

const HubTable = dynamic(() => import("./HubTable"));

type View = "cards" | "table" | "map";
type Trad = { slug: string; name: string };
type Filters = { q: string; tradition: string; region: string; status: string };
type Scope = { tradition?: string; region?: string };
type Select = { key: keyof Filters; label: string; options: [string, string][] };
const VIEWS: View[] = ["cards", "table", "map"];
const PAGE = 24;
const EMPTY: Filters = { q: "", tradition: "", region: "", status: "" };

function buildIndex(Search: typeof MiniSearch<Card>, cards: Card[]) {
  const ms = new Search({
    fields: ["name", "altNames", "deities", "place", "summary"],
    storeFields: [],
    idField: "slug",
    extractField: (d, f) =>
      f === "altNames"
        ? (d.altNames ?? []).join(" ")
        : f === "deities"
          ? d.deities.join(" ")
          : f === "place"
            ? [d.city, d.state].join(" ")
            : (d as never)[f],
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { name: 3, altNames: 2 } },
  });
  ms.addAll(cards);
  return ms;
}

const inScope = (c: Card, s: Scope) =>
  (!s.tradition || c.traditions.includes(s.tradition)) && (!s.region || c.state === s.region);

// `initial` is the server-rendered first page; the full list loads from /cards.json only when needed.
export function Hub({
  initial,
  total,
  traditions,
  regions,
  scope = {},
  initialView = "cards",
}: {
  initial: Card[];
  total: number;
  traditions: Trad[];
  regions: { name: string }[];
  scope?: Scope;
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const [f, setF] = useState<Filters>(EMPTY);
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<string | null>(null);
  const [all, setAll] = useState<Card[] | null>(null);
  const [search, setSearch] = useState<{ S: typeof MiniSearch<Card> } | null>(null);

  const update = (patch: Partial<Filters>) => {
    setF((cur) => ({ ...cur, ...patch }));
    setShown(PAGE);
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = p.get("view") as View | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring state from the URL after hydration
    if (v && VIEWS.includes(v)) setView(v);
    setF({
      q: p.get("q") ?? "",
      tradition: p.get("tradition") ?? "",
      region: p.get("region") ?? "",
      status: p.get("status") ?? "",
    });
    setSelected(p.get("site"));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (view !== initialView) p.set("view", view);
    for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
    if (selected && view === "map") p.set("site", selected);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [view, f, selected, initialView]);

  useEffect(() => {
    const onSearch = (e: Event) => {
      const q = (e as CustomEvent<string>).detail ?? "";
      setF((cur) => ({ ...cur, q }));
      setShown(PAGE);
      setView("cards");
    };
    window.addEventListener("atlas:search", onSearch);
    return () => window.removeEventListener("atlas:search", onSearch);
  }, []);

  const query = f.q.trim();
  const filtering = Boolean(query || f.tradition || f.region || f.status);
  const needAll = filtering || view !== "cards" || shown > initial.length;
  useEffect(() => {
    if (!needAll || all) return;
    let live = true;
    fetch("/cards.json")
      .then((r) => r.json() as Promise<Card[]>)
      .then((list) => live && setAll(list));
    return () => {
      live = false;
    };
  }, [needAll, all]);

  // MiniSearch loads only after the first search, keeping first load light.
  useEffect(() => {
    if (!query || search) return;
    import("minisearch").then(({ default: S }) => setSearch({ S }));
  }, [query, search]);

  const { tradition: scopeTrad, region: scopeRegion } = scope;
  const cards = useMemo(
    () =>
      all ? all.filter((c) => inScope(c, { tradition: scopeTrad, region: scopeRegion })) : initial,
    [all, initial, scopeTrad, scopeRegion],
  );
  const index = useMemo(
    () => (search && all ? buildIndex(search.S, cards) : null),
    [search, all, cards],
  );

  const tradName = useMemo(() => new Map(traditions.map((x) => [x.slug, x.name])), [traditions]);
  const nameOf = (s: string) => tradName.get(s) ?? s;

  const filtered = useMemo(() => {
    let list = cards;
    if (query && index) {
      const ids = new Set(index.search(query).map((r) => r.id as string));
      list = list.filter((c) => ids.has(c.slug));
    } else if (query) {
      const needle = query.toLowerCase();
      list = list.filter((c) =>
        [c.name, ...(c.altNames ?? [])].some((n) => n.toLowerCase().includes(needle)),
      );
    }
    if (f.tradition) list = list.filter((c) => c.traditions.includes(f.tradition));
    if (f.region) list = list.filter((c) => c.state === f.region);
    if (f.status) list = list.filter((c) => c.status === f.status);
    return list;
  }, [cards, index, query, f.tradition, f.region, f.status]);

  const points = useMemo(() => filtered.flatMap(toPoints), [filtered]);
  const sel = selected ? filtered.find((c) => c.slug === selected) : undefined;

  const choices: Select[] = [
    {
      key: "tradition",
      label: t("hub.tradition"),
      options: traditions.map((x): [string, string] => [x.slug, x.name]),
    },
    {
      key: "region",
      label: t("hub.region"),
      options: regions.map((x): [string, string] => [x.name, x.name]),
    },
    {
      key: "status",
      label: t("hub.verification"),
      options: [
        ["verified", t("status.verified")],
        ["disputed", t("status.disputed")],
        ["needs-review", t("status.needs-review")],
      ],
    },
  ];
  // A scoped Hub (one tradition or state) hides the filter that would contradict its scope.
  const selects = choices.filter((x) => !(x.key in scope && scope[x.key as keyof Scope]));

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
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            className="field"
            placeholder={t("hub.searchPlaceholder")}
          />
        </label>
        {selects.map((s) => (
          <label key={s.key} className="field-label">
            {s.label}
            <select
              value={f[s.key]}
              onChange={(e) => update({ [s.key]: e.target.value })}
              className="field"
            >
              <option value="">{t("hub.all")}</option>
              {s.options.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ))}
        {Object.values(f).some(Boolean) && (
          <button type="button" className="btn-ghost" onClick={() => update(EMPTY)}>
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
          className="text-text-soft text-xs tracking-wide uppercase"
          role="status"
          aria-live="polite"
        >
          {all || !filtering ? (all ? filtered.length : total) : "…"} {t("hub.results")}
        </p>
      </div>

      <div id="hub-panel" role="tabpanel" aria-labelledby={`tab-${view}`} className="mt-4">
        {filtered.length === 0 && (all || !filtering) && <p>{t("hub.empty")}</p>}

        {view === "cards" && filtered.length > 0 && (
          <>
            <ul className="card-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, shown).map((c) => (
                <li key={c.slug} className="flex">
                  <div className="flex-1">
                    <SiteCard card={c} tradName={nameOf} />
                  </div>
                </li>
              ))}
            </ul>
            {shown < (all ? filtered.length : total) && (
              <p className="mt-10 text-center">
                <button
                  type="button"
                  className="btn-outline-gold"
                  onClick={() => setShown(shown + PAGE)}
                >
                  {t("hub.more")} ({(all ? filtered.length : total) - shown})
                </button>
              </p>
            )}
          </>
        )}

        {view === "table" && filtered.length > 0 && <HubTable cards={filtered} nameOf={nameOf} />}

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
                  <h3 className="font-display text-accent text-xl font-semibold">{sel.name}</h3>
                  <p className="text-text-soft text-sm">
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
              <p className="text-text-soft mt-3 text-xs">
                {filtered.length - points.length} {t("map.unlocated")}
              </p>
              <p className="text-text-soft mt-2 text-xs">{t("map.a11yNote")}</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
