"use client";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

type Mode = "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the theme set by theme-init.js after hydration
    setMode(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    const el = document.documentElement;
    if (next === "light") el.setAttribute("data-theme", "light");
    else el.removeAttribute("data-theme");
    try {
      if (next === "light") localStorage.setItem("theme", "light");
      else localStorage.removeItem("theme");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-label={mode === "dark" ? t("theme.toLight") : t("theme.toDark")}
      title={mode === "dark" ? t("theme.toLight") : t("theme.toDark")}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.1rem] w-[1.1rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {mode === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
