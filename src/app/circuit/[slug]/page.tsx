import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCircuit, getCircuits, getSite, getTraditions } from "@/lib/data";
import { INDEXING_ON, SITE_URL } from "@/lib/site-config";
import { t } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { StatusBadge, AccuracyBadge } from "@/components/Badges";
import SiteMap from "@/components/map/LazyMap";
import { Legend } from "@/components/hub/Hub";

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
    description: c.seo?.description ?? c.description.slice(0, 160),
    alternates: { canonical: `/circuit/${c.slug}/` },
    robots: { index: indexable(c.verification.status), follow: true },
  };
}

const paras = (text?: string) =>
  text
    ? text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mt-3">
          {p}
        </p>
      ))
    : null;

export default async function CircuitPage({ params }: PageProps<"/circuit/[slug]">) {
  const { slug } = await params;
  const c = getCircuit(slug);
  if (!c) notFound();
  const trads = getTraditions();
  const members = [...c.members]
    .map((m) => ({ m, s: getSite(m.siteSlug)! }))
    .sort((a, b) => (a.m.order ?? 999) - (b.m.order ?? 999) || a.s.name.localeCompare(b.s.name));
  const located = members.filter(
    ({ s }) => s.location.lat !== undefined && s.location.lng !== undefined,
  );
  const points = located.map(({ s }) => ({
    slug: s.slug,
    name: s.name,
    lat: s.location.lat!,
    lng: s.location.lng!,
    tradition: s.traditions[0],
    accuracy: s.location.coordinateAccuracy,
  }));
  const routeCoords = c.route
    ? located
        .filter(({ m }) => m.role === "standard" && m.order !== undefined)
        .map(({ s }) => [s.location.lng!, s.location.lat!] as [number, number])
    : [];
  const routes =
    routeCoords.length > 1 ? [{ slug: c.slug, name: c.name, coords: routeCoords }] : [];
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.circuits"), href: "/circuits/" }, { name: c.name }]} />
      <h1
        className="font-display mt-4 text-4xl font-semibold md:text-5xl"
        style={{ color: "var(--accent)" }}
      >
        {c.name}
      </h1>
      {c.altNames.length > 0 && (
        <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
          {t("site.alsoKnown")} {c.altNames.join(", ")}
        </p>
      )}
      <p
        className="mt-3 flex flex-wrap items-center gap-3 text-sm"
        style={{ color: "var(--text-soft)" }}
      >
        <StatusBadge status={c.verification.status} />
        {c.traditions.map((x) => trads.find((y) => y.slug === x)?.name ?? x).join(", ")} ·{" "}
        {c.members.length} {t("circuit.sites")}
        {c.countInTradition ? ` · ${t("circuit.traditionCount")} ${c.countInTradition}` : ""}
      </p>
      {c.verification.status === "needs-review" && (
        <aside
          role="note"
          className="mt-4 rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--accent-gold)", background: "var(--surface)" }}
        >
          <strong>{t("site.draftTitle")}</strong> {t("circuit.draftBody")}
        </aside>
      )}
      <p className="mt-4 text-lg">{c.description}</p>
      {c.history && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            {t("site.history")}
          </h2>
          {paras(c.history)}
        </section>
      )}
      {c.significance && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            {t("site.significance")}
          </h2>
          {paras(c.significance)}
        </section>
      )}
      {c.variantsNote && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            {t("site.variants")}
          </h2>
          {paras(c.variantsNote)}
        </section>
      )}

      <section className="mt-8" aria-labelledby="cmap">
        <h2
          id="cmap"
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {t("circuit.map")}
        </h2>
        {points.length > 0 ? (
          <>
            <div
              className="mt-3 h-96 overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--rule)" }}
            >
              <SiteMap points={points} routes={routes} fit="points" className="h-full w-full" />
            </div>
            {routes.length > 0 && (
              <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
                {t("circuit.routeNote")}
              </p>
            )}
            <div className="mt-2 max-w-xs">
              <Legend />
            </div>
            {points.length < members.length && (
              <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
                {members.length - points.length} {t("map.unlocated")}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3">{t("circuit.noCoords")}</p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="cmembers">
        <h2
          id="cmembers"
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {t("circuit.members")}
        </h2>
        <ol className={`mt-3 space-y-3 ${c.ordered ? "list-none" : "list-disc pl-6"}`}>
          {members.map(({ m, s }) => (
            <li key={s.slug}>
              <Link
                href={`/site/${s.slug}/`}
                className="underline"
                style={{ color: "var(--accent)" }}
              >
                {c.ordered && m.order ? `${m.order}. ` : ""}
                {s.name}
              </Link>{" "}
              <span className="text-sm" style={{ color: "var(--text-soft)" }}>
                {[s.location.city, s.location.state]
                  .filter((v, i, a) => v && a.indexOf(v) === i)
                  .join(", ")}
                {m.role !== "standard" ? ` · ${m.role}` : ""}
              </span>{" "}
              <StatusBadge status={s.verification.status} />{" "}
              <AccuracyBadge accuracy={s.location.coordinateAccuracy} />
              {m.note && <p className="text-sm">{m.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8" id="verification">
        <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
          {t("site.verification")}
        </h2>
        <p className="mt-2">
          {c.verification.notes} ({t("site.lastChecked")} {c.verification.lastChecked})
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>
          {t("site.sources")}
        </h2>
        {c.sources.length === 0 ? (
          <p className="mt-2">{t("site.noSources")}</p>
        ) : (
          <ol className="mt-3 list-decimal space-y-1 pl-6">
            {c.sources.map((x, i) => (
              <li key={i}>
                <a className="underline" href={x.url} rel="noopener noreferrer">
                  {x.title}
                </a>
                {x.publisher ? `, ${x.publisher}` : ""}{" "}
                <span className="text-sm" style={{ color: "var(--text-soft)" }}>
                  ({t(`source.${x.type}`)})
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
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
