import Link from "next/link";
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

export function Header() {
  return (
    <header
      className="border-b"
      style={{ borderColor: "var(--rule)", background: "var(--surface)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {t("brand.name")}{" "}
          <span lang="sa" className="font-sanskrit text-xl" style={{ color: "var(--accent-warm)" }}>
            {t("brand.sanskrit")}
          </span>
        </Link>
        <nav aria-label={t("nav.primary")}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {NAV.map(([href, key]) => (
              <li key={href}>
                <Link href={href} className="underline-offset-4 hover:underline">
                  {t(key)}
                </Link>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
