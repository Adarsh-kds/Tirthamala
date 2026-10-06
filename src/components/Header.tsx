"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  ["/", "nav.atlas"],
  ["/map/", "nav.map"],
  ["/circuits/", "nav.circuits"],
  ["/traditions/", "nav.traditions"],
  ["/states/", "nav.regions"],
  ["/about/", "nav.about"],
] as const;

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span lang="sa" className="font-sanskrit">
        ॐ
      </span>
    </span>
  );
}

export function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="site-header" data-scrolled={scrolled || open ? "true" : "false"}>
      <div className="header-pill">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandMark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.45rem] font-semibold tracking-wide">
              <span className="gold-text">{t("brand.name")}</span>
            </span>
            <span
              lang="sa"
              className="font-sanskrit mt-1 text-[0.78rem]"
              style={{ color: "var(--text-soft)" }}
            >
              {t("hero.titleSa")}
            </span>
          </span>
        </Link>

        <nav aria-label={t("nav.primary")} className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.85rem]">
            {NAV.map(([href, key]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="nav-link"
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            onClick={() => setOpen((o) => !o)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label={t("nav.primary")}
        className="mobile-sheet lg:hidden"
        data-open={open ? "true" : "false"}
        hidden={!open}
      >
        <ul className="flex flex-col gap-1">
          {NAV.map(([href, key]) => (
            <li key={href}>
              <Link
                href={href}
                className="mobile-link"
                aria-current={isActive(href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
