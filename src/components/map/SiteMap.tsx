"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import type { MapPoint } from "@/lib/view";

maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export type MapRoute = { slug: string; name: string; coords: [number, number][] };

type Props = {
  points: MapPoint[];
  routes?: MapRoute[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
  fit?: "india" | "points";
  className?: string;
};

type Palette = ReturnType<typeof palette>;

function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const other = v("--trad-other") || "#888";
  return {
    trad: (slug: string) => v(`--trad-${slug}`) || other,
    bg: v("--bg"),
    surface: v("--surface"),
    text: v("--text"),
    rule: v("--rule"),
    accent: v("--accent"),
  };
}

const fc = (features: object[]) => ({ type: "FeatureCollection", features }) as never;

const pointsGeo = (points: MapPoint[], p: Palette) =>
  fc(
    points.map((pt) => ({
      type: "Feature",
      properties: { slug: pt.slug, color: p.trad(pt.tradition), exact: pt.accuracy === "exact" },
      geometry: { type: "Point", coordinates: [pt.lng, pt.lat] },
    })),
  );

const routesGeo = (routes: MapRoute[]) =>
  fc(
    routes.map((r) => ({
      type: "Feature",
      properties: { slug: r.slug },
      geometry: { type: "LineString", coordinates: r.coords },
    })),
  );

function fitTo(m: maplibregl.Map, points: MapPoint[]) {
  if (!points.length) return;
  const b = new maplibregl.LngLatBounds();
  points.forEach((pt) => b.extend([pt.lng, pt.lat]));
  m.fitBounds(b, { padding: 50, maxZoom: 9, duration: 0 });
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
  const sync = useRef<(() => void) | null>(null);
  const ready = useRef(false);
  const latest = useRef({ points, routes, selected, onSelect });
  useEffect(() => {
    latest.current = { points, routes, selected, onSelect };
  });

  useEffect(() => {
    if (!el.current) return;
    let p = palette();
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

    const siteColor = () =>
      ["case", ["get", "exact"], ["get", "color"], p.bg] as maplibregl.ExpressionSpecification;

    sync.current = () => {
      if (!ready.current) return;
      const { points: pts, routes: rts, selected: sel } = latest.current;
      (m.getSource("sites") as maplibregl.GeoJSONSource).setData(pointsGeo(pts, p));
      (m.getSource("routes") as maplibregl.GeoJSONSource).setData(routesGeo(rts));
      m.setFilter("selected", ["==", ["get", "slug"], sel ?? ""]);
    };

    m.on("load", () => {
      const { points: pts, routes: rts } = latest.current;
      m.addSource("routes", { type: "geojson", data: routesGeo(rts) });
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
      m.addSource("sites", { type: "geojson", data: pointsGeo(pts, p) });
      m.addLayer({
        id: "sites",
        type: "circle",
        source: "sites",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.5, 8, 7, 12, 10],
          "circle-color": siteColor(),
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-width": ["case", ["get", "exact"], 1.5, 2.5],
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
      sync.current?.();
      if (fit === "points") fitTo(m, latest.current.points);
    });

    const recolor = () => {
      if (!ready.current) return;
      p = palette();
      m.setPaintProperty("bg", "background-color", p.bg);
      m.setPaintProperty("land", "fill-color", p.surface);
      m.setPaintProperty("border", "line-color", p.rule);
      m.setPaintProperty("others", "fill-color", p.rule);
      m.setPaintProperty("routes", "line-color", p.accent);
      m.setPaintProperty("sites", "circle-color", siteColor());
      m.setPaintProperty("selected", "circle-stroke-color", p.text);
      sync.current?.();
    };
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mo.disconnect();
      m.remove();
      map.current = null;
      sync.current = null;
      ready.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sync.current?.();
    const m = map.current;
    if (m && ready.current && fit === "points") fitTo(m, points);
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
