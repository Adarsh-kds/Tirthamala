"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { t } from "@/lib/i18n";
import SiteMap from "./MapLoader";

// Mounts the heavy map only when it nears the viewport, so page load stays light.
export default function LazyMap(props: ComponentProps<typeof SiteMap>) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || on) return;
    if (!("IntersectionObserver" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fallback for old browsers
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) setOn(true);
      },
      { rootMargin: "0px", threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return (
    <div ref={box} className="h-full w-full">
      {on ? (
        <SiteMap {...props} />
      ) : (
        <div className="flex h-full min-h-[360px] items-center justify-center">
          <button
            type="button"
            className="rounded border px-4 py-2 text-sm"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            onClick={() => setOn(true)}
          >
            {t("map.load")}
          </button>
        </div>
      )}
    </div>
  );
}
