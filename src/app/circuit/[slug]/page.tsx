import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCircuit, getCircuits, getSite, getTraditions } from "@/lib/data";
import { INDEXING_ON, SITE_URL } from "@/lib/site-config";
import { shorten, toCard, toPoints } from "@/lib/view";
import { t } from "@/lib/i18n";
import { DraftNote, PageHeading, Paras, Section, SourceList } from "@/components/Article";
import { JsonLd } from "@/components/JsonLd";
import { StatusBadge, AccuracyBadge } from "@/components/Badges";
import SiteMap from "@/components/map/LazyMap";
import { Legend } from "@/components/map/Legend";

export const dynamicParams = false;
export const generateStaticParams = () => getCircuits().map((c) => ({ slug: c.slug }));

// A circuit page is indexable once the circuit itself is verified/disputed.
const indexable = (status: string) => INDEXING_ON && status !== "needs-review";

export async function generateMetadata({
  params,
}: PageProps<"/circuit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCircuit(slug);
  if (!c) return {};
  return {
    title: c.seo?.title ?? c.name,
    description: c.seo?.description ?? shorten(c.description, 160),
    alternates: { canonical: `/circuit/${c.slug}/` },
    robots: { index: indexable(c.verification.status), follow: true },
  };
}

const PROSE = [
  ["history", "site.history"],
  ["significance", "site.significance"],
  ["variantsNote", "site.variants"],
] as const;

export default async function CircuitPage({ params }: PageProps<"/circuit/[slug]">) {
  const { slug } = await params;
  const c = getCircuit(slug);
  if (!c) notFound();
  const trads = getTraditions();
  const members = [...c.members]
    .map((m) => ({ m, s: getSite(m.siteSlug)! }))
    .sort((a, b) => (a.m.order ?? 999) - (b.m.order ?? 999) || a.s.name.localeCompare(b.s.name));
  const points = members.map(({ s }) => toCard(s)).flatMap(toPoints);
  const routeCoords = c.route
    ? members
        .filter(
          ({ m, s }) =>
            m.role === "standard" && m.order !== undefined && s.location.lat !== undefined,
        )
        .map(({ s }) => [s.location.lng!, s.location.lat!] as [number, number])
    : [];
  const routes =
    routeCoords.length > 1 ? [{ slug: c.slug, name: c.name, coords: routeCoords }] : [];
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <PageHeading
        crumbs={[{ name: t("nav.circuits"), href: "/circuits/" }, { name: c.name }]}
        title={c.name}
        large
      />
      {c.altNames.length > 0 && (
        <p className="text-text-soft mt-1 text-sm">
          {t("site.alsoKnown")} {c.altNames.join(", ")}
        </p>
      )}
      <p className="text-text-soft mt-3 flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status={c.verification.status} />
        {c.traditions.map((x) => trads.find((y) => y.slug === x)?.name ?? x).join(", ")} ·{" "}
        {c.members.length} {t("circuit.sites")}
        {c.countInTradition ? ` · ${t("circuit.traditionCount")} ${c.countInTradition}` : ""}
      </p>
      {c.verification.status === "needs-review" && <DraftNote>{t("circuit.draftBody")}</DraftNote>}
      <p className="mt-4 text-lg">{c.description}</p>
      {PROSE.map(
        ([k, title]) =>
          c[k] && (
            <Section key={k} id={k} title={t(title)}>
              <Paras text={c[k]} />
            </Section>
          ),
      )}

      <Section id="map" title={t("circuit.map")}>
        {points.length > 0 ? (
          <>
            <div className="border-rule mt-3 h-96 overflow-hidden rounded-lg border">
              <SiteMap points={points} routes={routes} fit="points" className="h-full w-full" />
            </div>
            {routes.length > 0 && (
              <p className="text-text-soft mt-2 text-sm">{t("circuit.routeNote")}</p>
            )}
            <div className="mt-2 max-w-xs">
              <Legend />
            </div>
            {points.length < members.length && (
              <p className="text-text-soft mt-2 text-sm">
                {members.length - points.length} {t("map.unlocated")}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3">{t("circuit.noCoords")}</p>
        )}
      </Section>

      <Section id="members" title={t("circuit.members")}>
        <ol className={`mt-3 space-y-3 ${c.ordered ? "list-none" : "list-disc pl-6"}`}>
          {members.map(({ m, s }) => (
            <li key={s.slug}>
              <Link href={`/site/${s.slug}/`} className="text-accent underline">
                {c.ordered && m.order ? `${m.order}. ` : ""}
                {s.name}
              </Link>{" "}
              <span className="text-text-soft text-sm">
                {[s.location.city, s.location.state]
                  .filter((v, i, a) => v && a.indexOf(v) === i)
                  .join(", ")}
                {m.role !== "standard" ? ` · ${t(`role.${m.role}`)}` : ""}
              </span>{" "}
              <StatusBadge status={s.verification.status} />{" "}
              <AccuracyBadge accuracy={s.location.coordinateAccuracy} />
              {m.note && <p className="text-sm">{m.note}</p>}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="verification" title={t("site.verification")}>
        <p className="mt-3">
          {c.verification.notes} ({t("site.lastChecked")} {c.verification.lastChecked})
        </p>
      </Section>
      <Section id="sources" title={t("site.sources")}>
        <SourceList sources={c.sources} />
      </Section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: c.name,
          url: `${SITE_URL}/circuit/${c.slug}/`,
          itemListOrder: c.ordered
            ? "https://schema.org/ItemListOrderAscending"
            : "https://schema.org/ItemListUnordered",
          itemListElement: members.map(({ s }, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/site/${s.slug}/`,
            name: s.name,
          })),
        }}
      />
    </main>
  );
}
