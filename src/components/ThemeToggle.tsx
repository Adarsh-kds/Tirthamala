"use client";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

type Mode = "system" | "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Mode | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after hydration
      if (saved === "light" || saved === "dark") setMode(saved);
    } catch {}
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    if (mode === "system") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", mode);
    try {
      if (mode === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", mode);
    } catch {}
  }, [mode]);
  const next: Mode = mode === "system" ? "dark" : mode === "dark" ? "light" : "system";
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      className="rounded border px-3 py-1 text-sm"
      style={{ borderColor: "var(--rule)" }}
      aria-label={`${t("theme.label")}: ${t(`theme.${mode}`)}. ${t("theme.switch")} ${t(`theme.${next}`)}`}
    >
      {t(`theme.${mode}`)}
    </button>
  );
}
