import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCards, getRegions } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { slugify } from "@/lib/view";
import { PageHeading } from "@/components/Article";
import { Hub } from "@/components/hub/Hub";
import { getTraditions } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => getRegions().map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: PageProps<"/state/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getRegions().find((x) => x.slug === slug);
  return r
    ? {
        title: t("state.title", { name: r.name }),
        description: t("state.description", { name: r.name }),
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
      <PageHeading
        crumbs={[{ name: t("nav.regions"), href: "/states/" }, { name: r.name }]}
        title={r.name}
      />
      <p className="text-text-soft mt-2">
        {cards.length} {t("home.sitesCount")}
      </p>
      <div className="mt-4">
        <Hub
          initial={cards.slice(0, 24)}
          total={cards.length}
          traditions={getTraditions().map((y) => ({ slug: y.slug, name: y.name }))}
          regions={[]}
          scope={{ region: r.name }}
        />
      </div>
    </main>
  );
}
