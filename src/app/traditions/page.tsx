import type { Metadata } from "next";
import { IntentLink } from "@/components/IntentLink";
import { getTraditions } from "@/lib/data";
import { getCards } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { PageHeading } from "@/components/Article";
import { TraditionChip } from "@/components/Badges";

export const metadata: Metadata = {
  title: t("nav.traditions"),
  description: t("traditions.description"),
  alternates: { canonical: "/traditions/" },
};

export default function Traditions() {
  const cards = getCards();
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <PageHeading crumbs={[{ name: t("nav.traditions") }]} title={t("nav.traditions")} />
      <ul className="mt-6 space-y-4">
        {getTraditions().map((x) => (
          <li key={x.slug}>
            <IntentLink
              href={`/tradition/${x.slug}/`}
              className="font-display text-accent text-xl font-semibold underline"
            >
              <TraditionChip slug={x.slug} name={x.name} />
            </IntentLink>{" "}
            <span className="text-text-soft text-sm">
              {cards.filter((c) => c.traditions.includes(x.slug)).length} {t("home.sitesCount")}
            </span>
            <p className="text-sm">{x.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
