"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";

export function HeroParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (still || !fine) return;
    // Writing `translate` per layer avoids restyling every SVG node under the hero.
    const layers = [...el.querySelectorAll<HTMLElement>("[data-depth]")].map((node) => {
      const [dx, dy] = (node.dataset.depth ?? "0,0").split(",").map(Number);
      return { node, dx, dy };
    });
    const glow = el.querySelector<HTMLElement>(".hero-cursor");
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = x / r.width - 0.5;
        const py = y / r.height - 0.5;
        for (const l of layers) l.node.style.translate = `${px * l.dx}px ${py * l.dy}px`;
        if (glow) glow.style.translate = `${x}px ${y}px`;
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <section ref={ref} className={className} aria-labelledby="hero-title">
      {children}
    </section>
  );
}

export function HeroSearch() {
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="hero-search"
      onSubmit={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("atlas:search", { detail: q.trim() }));
        document.getElementById("atlas")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <label htmlFor="hero-q" className="sr-only">
        {t("hero.searchLabel")}
      </label>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 opacity-70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </svg>
      <input
        id="hero-q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("hero.searchPlaceholder")}
        autoComplete="off"
      />
      <button type="submit" className="btn-gold">
        {t("hero.searchButton")}
      </button>
    </form>
  );
}
