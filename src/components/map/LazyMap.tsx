"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { t } from "@/lib/i18n";
import SiteMap from "./MapLoader";

const whenIdle = (fn: () => void) => {
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(fn, { timeout: 4000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 1500);
  return () => clearTimeout(id);
};

// Loads the map library and builds the map (shader compilation included) while the browser is idle
// after page load, so none of that work lands mid-scroll. Nearing the viewport mounts it earlier.
export default function LazyMap(props: ComponentProps<typeof SiteMap>) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    let cancelNext = () => {};
    const cancel = whenIdle(() => {
      import("./SiteMap").then(() => (cancelNext = whenIdle(() => setOn(true))));
    });
    return () => {
      cancel();
      cancelNext();
    };
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || on) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && setOn(true), {
      rootMargin: "600px 0px",
    });
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
            className="border-accent text-accent rounded border px-4 py-2 text-sm"
            onClick={() => setOn(true)}
          >
            {t("map.load")}
          </button>
        </div>
      )}
    </div>
  );
}
