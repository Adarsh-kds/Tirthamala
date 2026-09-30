import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCards, getRegions } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { slugify } from "@/lib/view";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CardGrid } from "@/components/CardGrid";

export const dynamicParams = false;
export const generateStaticParams = () => getRegions().map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: PageProps<"/state/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getRegions().find((x) => x.slug === slug);
  return r
    ? {
        title: `Sacred sites in ${r.name}`,
        description: `Pilgrimage sites and temples in ${r.name}, listed in the Tirtha Atlas.`,
        alternates: { canonical: `/state/${r.slug}/` },
      }
    : {};
}

export default async function StatePage({ params }: PageProps<"/state/[slug]">) {
  const { slug } = await params;
  const r = getRegions().find((x) => x.slug === slug);
  if (!r) notFound();
  const cards = getCards().filter((c) => slugify(c.state) === slug);
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.regions"), href: "/states/" }, { name: r.name }]} />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {r.name}
      </h1>
      <p className="mt-2" style={{ color: "var(--text-soft)" }}>
        {cards.length} {t("home.sitesCount")}
      </p>
      <CardGrid cards={cards} />
    </main>
  );
}
