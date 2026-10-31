import type { Metadata } from "next";
import { getCards, getRegions } from "@/lib/catalog";
import { getTraditions } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Hub } from "@/components/hub/Hub";
import { PageHeading } from "@/components/Article";

export const metadata: Metadata = {
  title: t("map.title"),
  description: t("map.description"),
  alternates: { canonical: "/map/" },
};

export default function MapPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <PageHeading crumbs={[{ name: t("nav.map") }]} title={t("nav.map")} />
      <div className="mt-4">
        <Hub
          initial={[]}
          total={getCards().length}
          traditions={getTraditions().map((x) => ({ slug: x.slug, name: x.name }))}
          regions={getRegions().map((r) => ({ name: r.name }))}
          initialView="map"
        />
      </div>
    </main>
  );
}
