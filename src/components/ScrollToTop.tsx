"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Next.js keeps the scroll position when the new page is still in view; every new page should open at the top.
export function ScrollToTop() {
  const path = usePathname();
  const first = useRef(true);
  const backOrForward = useRef(false);

  useEffect(() => {
    const onPop = () => (backOrForward.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    // Back and Forward keep the browser's restored position; links to a #section scroll there instead.
    const skip = first.current || backOrForward.current || window.location.hash;
    first.current = false;
    backOrForward.current = false;
    if (!skip) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

  return null;
}
