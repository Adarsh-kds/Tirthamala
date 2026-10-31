"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Marks [data-motion] blocks that are off screen so CSS can pause their looping animations,
// which otherwise restyle the page on every scroll frame.
export function MotionGate() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
    });
    document.querySelectorAll("[data-motion]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
