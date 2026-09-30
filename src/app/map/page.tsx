import type { Metadata } from "next";
import { getCards, getRegions } from "@/lib/catalog";
import { getTraditions } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Hub } from "@/components/hub/Hub";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Map of sacred sites",
  description:
    "An interactive map of the pilgrimage sites in the atlas, coloured by tradition, with approximate locations shown as open rings.",
  alternates: { canonical: "/map/" },
};

export default function MapPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.map") }]} />
      <h1
        className="font-display mt-4 mb-4 text-4xl font-semibold"
        style={{ color: "var(--accent)" }}
      >
        {t("nav.map")}
      </h1>
      <Hub
        cards={getCards()}
        traditions={getTraditions().map((x) => ({ slug: x.slug, name: x.name }))}
        regions={getRegions().map((r) => ({ name: r.name }))}
        initialView="map"
      />
    </main>
  );
}
