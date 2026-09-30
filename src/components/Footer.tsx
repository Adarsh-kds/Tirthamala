import Link from "next/link";
import { t } from "@/lib/i18n";
import { BOUNDARY_NOTE, CORRECTIONS_EMAIL, PUBLISHER } from "@/lib/site-config";

export function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: "var(--rule)", background: "var(--surface)" }}
    >
      <div
        className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm md:grid-cols-3"
        style={{ color: "var(--text-soft)" }}
      >
        <div>
          <p className="font-display text-lg" style={{ color: "var(--accent)" }}>
            {t("brand.name")}
          </p>
          <p className="mt-2">{t("footer.about")}</p>
          <p className="mt-2">
            {t("footer.publisher")} {PUBLISHER.name}, {PUBLISHER.org}.
          </p>
        </div>
        <nav aria-label={t("footer.nav")}>
          <ul className="space-y-1">
            <li>
              <Link href="/about/" className="underline">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link href="/sources/" className="underline">
                {t("nav.sources")}
              </Link>
            </li>
            <li>
              <Link href="/corrections/" className="underline">
                {t("nav.corrections")}
              </Link>
            </li>
            <li>
              <Link href="/privacy/" className="underline">
                {t("nav.privacy")}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p>{BOUNDARY_NOTE}</p>
          <p className="mt-2">
            <a className="underline" href={`mailto:${CORRECTIONS_EMAIL}`}>
              {t("footer.report")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
