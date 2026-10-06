import Link from "next/link";
import { t } from "@/lib/i18n";
import { BOUNDARY_NOTE, CORRECTIONS_EMAIL, PUBLISHER } from "@/lib/site-config";
import { Temples } from "./motifs/Skyline";

const EXPLORE = [
  ["/", "nav.atlas"],
  ["/map/", "nav.map"],
  ["/circuits/", "nav.circuits"],
  ["/traditions/", "nav.traditions"],
  ["/states/", "nav.regions"],
] as const;

const PROJECT = [
  ["/about/", "nav.about"],
  ["/sources/", "nav.sources"],
  ["/corrections/", "nav.corrections"],
  ["/privacy/", "nav.privacy"],
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-skyline" aria-hidden="true">
        <Temples id="footer-a" />
        <Temples id="footer-b" />
      </div>
      <div className="footer-body">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-[0.8rem] md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-xl font-semibold">
              <span className="gold-text">{t("brand.name")}</span>{" "}
              <span
                lang="sa"
                className="font-sanskrit text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                {t("hero.titleSa")}
              </span>
            </p>
            <p className="mt-2 leading-relaxed" style={{ color: "var(--text-soft)" }}>
              {t("footer.about")}
            </p>
          </div>
          <nav aria-label={t("footer.explore")}>
            <p className="footer-h">{t("footer.explore")}</p>
            <ul className="mt-3 space-y-1.5">
              {EXPLORE.map(([href, key]) => (
                <li key={href}>
                  <Link href={href} className="footer-link">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("footer.nav")}>
            <p className="footer-h">{t("footer.project")}</p>
            <ul className="mt-3 space-y-1.5">
              {PROJECT.map(([href, key]) => (
                <li key={href}>
                  <Link href={href} className="footer-link">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ color: "var(--text-soft)" }}>
            <p className="leading-relaxed">{BOUNDARY_NOTE}</p>
            <p className="mt-3">
              <a className="link-gold" href={`mailto:${CORRECTIONS_EMAIL}`}>
                {t("footer.report")}
              </a>
            </p>
          </div>
        </div>
        <div className="footer-bar">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-[0.72rem] md:flex-row">
            <p>
              {t("footer.publisher")} {PUBLISHER.name}, {PUBLISHER.org} · {t("footer.made")}
            </p>
            <p className="flex items-center gap-2">
              <span
                lang="sa"
                className="font-sanskrit text-[0.85rem]"
                style={{ color: "var(--accent-gold)" }}
              >
                {t("footer.shloka")}
              </span>
              <span aria-hidden="true">·</span>
              <span className="italic">{t("footer.shlokaMeaning")}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
