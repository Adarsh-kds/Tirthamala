import type { Metadata } from "next";
import Link from "next/link";
import { getTraditions } from "@/lib/data";
import { getCards } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TraditionChip } from "@/components/Badges";

export const metadata: Metadata = {
  title: "Traditions",
  description:
    "Browse the atlas by tradition: Shaiva, Shakta, Vaishnava, Jain, Buddhist, Sikh, Islamic, Christian and more.",
  alternates: { canonical: "/traditions/" },
};

export default function Traditions() {
  const cards = getCards();
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.traditions") }]} />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {t("nav.traditions")}
      </h1>
      <ul className="mt-6 space-y-4">
        {getTraditions().map((x) => (
          <li key={x.slug}>
            <Link
              href={`/tradition/${x.slug}/`}
              className="font-display text-xl font-semibold underline"
              style={{ color: "var(--accent)" }}
            >
              <TraditionChip slug={x.slug} name={x.name} />
            </Link>{" "}
            <span className="text-sm" style={{ color: "var(--text-soft)" }}>
              {cards.filter((c) => c.traditions.includes(x.slug)).length} {t("home.sitesCount")}
            </span>
            <p className="text-sm">{x.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
