import type { Metadata } from "next";
import { IntentLink } from "@/components/IntentLink";
import { notFound } from "next/navigation";
import { getCircuits, getTraditions } from "@/lib/data";
import { getCards, getRegions } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { PageHeading } from "@/components/Article";
import { Hub } from "@/components/hub/Hub";

export const dynamicParams = false;
export const generateStaticParams = () => getTraditions().map((x) => ({ slug: x.slug }));

export async function generateMetadata({
  params,
}: PageProps<"/tradition/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const x = getTraditions().find((y) => y.slug === slug);
  return x
    ? {
        title: t("tradition.title", { name: x.name }),
        description: x.summary,
        alternates: { canonical: `/tradition/${x.slug}/` },
      }
    : {};
}

export default async function TraditionPage({ params }: PageProps<"/tradition/[slug]">) {
  const { slug } = await params;
  const x = getTraditions().find((y) => y.slug === slug);
  if (!x) notFound();
  const cards = getCards().filter((c) => c.traditions.includes(slug));
  const circuits = getCircuits().filter((c) => c.traditions.includes(slug));
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <PageHeading
        crumbs={[{ name: t("nav.traditions"), href: "/traditions/" }, { name: x.name }]}
        title={x.name}
      />
      <p className="text-text-soft mt-2 max-w-3xl">{x.summary}</p>
      {circuits.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-2xl font-semibold">{t("nav.circuits")}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {circuits.map((c) => (
              <li key={c.slug}>
                <IntentLink className="underline" href={`/circuit/${c.slug}/`}>
                  {c.name}
                </IntentLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-6">
        <h2 className="font-display text-2xl font-semibold">
          {cards.length} {t("home.sitesCount")}
        </h2>
        <div className="mt-4">
          <Hub
            initial={cards.slice(0, 24)}
            total={cards.length}
            traditions={getTraditions().map((y) => ({ slug: y.slug, name: y.name }))}
            regions={getRegions().map((r) => ({ name: r.name }))}
            scope={{ tradition: slug }}
          />
        </div>
      </section>
    </main>
  );
}
