"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { t } from "@/lib/i18n";

maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  tradition: string;
  accuracy: string;
};
export type MapRoute = { slug: string; name: string; coords: [number, number][] };

type Props = {
  points: MapPoint[];
  routes?: MapRoute[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
  fit?: "india" | "points";
  className?: string;
};

const TRADS = [
  "shaiva",
  "shakta",
  "vaishnava",
  "ganapatya",
  "kaumara",
  "ayyappa",
  "saura",
  "navagraha",
  "dattatreya",
  "jain",
  "buddhist",
  "sikh",
  "islamic",
  "christian",
  "parsi",
  "other",
];

function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const trad: unknown[] = ["match", ["get", "tradition"]];
  for (const k of TRADS) trad.push(k, v(`--trad-${k}`) || "#444");
  trad.push(v("--trad-other") || "#444");
  return {
    trad,
    bg: v("--bg"),
    surface: v("--surface"),
    text: v("--text"),
    rule: v("--rule"),
    accent: v("--accent"),
  };
}

const fc = (features: object[]) => ({ type: "FeatureCollection", features }) as never;

function pointsGeo(points: MapPoint[]) {
  return fc(
    points.map((p) => ({
      type: "Feature",
      properties: {
        slug: p.slug,
        name: p.name,
        tradition: TRADS.includes(p.tradition) ? p.tradition : "other",
        exact: p.accuracy === "exact" ? 1 : 0,
      },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  );
}
function routesGeo(routes: MapRoute[]) {
  return fc(
    routes.map((r) => ({
      type: "Feature",
      properties: { slug: r.slug, name: r.name },
      geometry: { type: "LineString", coordinates: r.coords },
    })),
  );
}

export default function SiteMap({
  points,
  routes = [],
  selected,
  onSelect,
  fit = "india",
  className,
}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const latest = useRef({ points, routes, selected, onSelect });
  useEffect(() => {
    latest.current = { points, routes, selected, onSelect };
  });

  useEffect(() => {
    if (!el.current) return;
    const p = palette();
    const m = new maplibregl.Map({
      container: el.current,
      style: {
        version: 8,
        sources: {
          geo: {
            type: "geojson",
            data: new URL("/geo/south-asia.json", window.location.origin).toString(),
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": p.bg } },
          { id: "land", type: "fill", source: "geo", paint: { "fill-color": p.surface } },
          {
            id: "others",
            type: "fill",
            source: "geo",
            filter: ["!=", ["get", "iso"], "IND"],
            paint: { "fill-color": p.rule, "fill-opacity": 0.3 },
          },
          {
            id: "border",
            type: "line",
            source: "geo",
            paint: { "line-color": p.rule, "line-width": 1.2 },
          },
        ],
      },
      bounds: [
        [67.5, 6],
        [98.5, 37.5],
      ],
      fitBoundsOptions: { padding: 10 },
      minZoom: 3,
      maxZoom: 13,
      attributionControl: {
        compact: true,
        customAttribution: "Boundaries: Natural Earth (public domain), India point of view",
      },
      cooperativeGestures: true,
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const apply = () => {
      if (!ready.current) return;
      const { points: pts, routes: rts, selected: sel } = latest.current;
      (m.getSource("sites") as maplibregl.GeoJSONSource).setData(pointsGeo(pts));
      (m.getSource("routes") as maplibregl.GeoJSONSource).setData(routesGeo(rts));
      m.setFilter("selected", ["==", ["get", "slug"], sel ?? ""]);
    };
    (m as unknown as { _apply: () => void })._apply = apply;

    m.on("load", () => {
      m.addSource("routes", { type: "geojson", data: routesGeo(latest.current.routes) });
      m.addLayer({
        id: "routes",
        type: "line",
        source: "routes",
        paint: {
          "line-color": p.accent,
          "line-width": 2,
          "line-dasharray": [2, 2],
          "line-opacity": 0.8,
        },
      });
      m.addSource("sites", { type: "geojson", data: pointsGeo(latest.current.points) });
      m.addLayer({
        id: "sites",
        type: "circle",
        source: "sites",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.5, 8, 7, 12, 10],
          "circle-color": ["case", ["==", ["get", "exact"], 1], p.trad as never, p.bg],
          "circle-stroke-color": p.trad as never,
          "circle-stroke-width": ["case", ["==", ["get", "exact"], 1], 1.5, 2.5],
        },
      });
      m.addLayer({
        id: "selected",
        type: "circle",
        source: "sites",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "circle-radius": 13,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": p.text,
          "circle-stroke-width": 3,
        },
      });
      m.on("click", "sites", (e) => {
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (slug) latest.current.onSelect?.(slug);
      });
      m.on("mouseenter", "sites", () => (m.getCanvas().style.cursor = "pointer"));
      m.on("mouseleave", "sites", () => (m.getCanvas().style.cursor = ""));
      ready.current = true;
      apply();
      if (fit === "points") fitPoints();
    });

    const fitPoints = () => {
      const pts = latest.current.points;
      if (!pts.length) return;
      const b = new maplibregl.LngLatBounds();
      pts.forEach((pt) => b.extend([pt.lng, pt.lat]));
      m.fitBounds(b, { padding: 50, maxZoom: 9, duration: 0 });
    };

    const recolor = () => {
      if (!ready.current) return;
      const q = palette();
      m.setPaintProperty("bg", "background-color", q.bg);
      m.setPaintProperty("land", "fill-color", q.surface);
      m.setPaintProperty("border", "line-color", q.rule);
      m.setPaintProperty("others", "fill-color", q.rule);
      m.setPaintProperty("routes", "line-color", q.accent);
      m.setPaintProperty("sites", "circle-color", [
        "case",
        ["==", ["get", "exact"], 1],
        q.trad as never,
        q.bg,
      ]);
      m.setPaintProperty("sites", "circle-stroke-color", q.trad as never);
      m.setPaintProperty("selected", "circle-stroke-color", q.text);
    };
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", recolor);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", recolor);
      m.remove();
      map.current = null;
      ready.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current as (maplibregl.Map & { _apply?: () => void }) | null;
    m?._apply?.();
    if (m && ready.current && fit === "points" && points.length) {
      const b = new maplibregl.LngLatBounds();
      points.forEach((pt) => b.extend([pt.lng, pt.lat]));
      m.fitBounds(b, { padding: 50, maxZoom: 9, duration: 0 });
    }
  }, [points, routes, selected, fit]);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready.current || !selected) return;
    const pt = latest.current.points.find((q) => q.slug === selected);
    if (pt) m.easeTo({ center: [pt.lng, pt.lat], zoom: Math.max(m.getZoom(), 6), duration: 400 });
  }, [selected]);

  return (
    <div
      ref={el}
      role="region"
      aria-label={t("map.label")}
      className={className}
      style={{ minHeight: 360 }}
    />
  );
}
