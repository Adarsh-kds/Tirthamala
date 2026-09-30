import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCircuits, getTraditions } from "@/lib/data";
import { getCards } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CardGrid } from "@/components/CardGrid";

export const dynamicParams = false;
export const generateStaticParams = () => getTraditions().map((x) => ({ slug: x.slug }));

export async function generateMetadata({
  params,
}: PageProps<"/tradition/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const x = getTraditions().find((y) => y.slug === slug);
  return x
    ? {
        title: `${x.name} sacred sites`,
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
      <Breadcrumbs
        items={[{ name: t("nav.traditions"), href: "/traditions/" }, { name: x.name }]}
      />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {x.name}
      </h1>
      <p className="mt-2 max-w-3xl" style={{ color: "var(--text-soft)" }}>
        {x.summary}
      </p>
      {circuits.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-2xl font-semibold">{t("nav.circuits")}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {circuits.map((c) => (
              <li key={c.slug}>
                <Link className="underline" href={`/circuit/${c.slug}/`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-6">
        <h2 className="font-display text-2xl font-semibold">
          {cards.length} {t("home.sitesCount")}
        </h2>
        <CardGrid cards={cards} />
      </section>
    </main>
  );
}
