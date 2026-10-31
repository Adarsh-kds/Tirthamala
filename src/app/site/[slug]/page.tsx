import type { Metadata } from "next";
import { IntentLink } from "@/components/IntentLink";
import { notFound } from "next/navigation";
import { circuitsForSite, getSite, getSites, getTraditions } from "@/lib/data";
import { regionOf, slugify, distanceKm, relatedFor, toCard, toPoints } from "@/lib/view";
import { CORRECTIONS_EMAIL, INDEXING_ON, SITE_URL } from "@/lib/site-config";
import { t } from "@/lib/i18n";
import { AccuracyBadge, StatusBadge, TraditionChip } from "@/components/Badges";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DraftNote, Paras, Section, SourceList } from "@/components/Article";
import { JsonLd } from "@/components/JsonLd";
import SiteMap from "@/components/map/LazyMap";
import { Legend } from "@/components/map/Legend";
import type { Site } from "@/lib/schema";

export const dynamicParams = false;
export const generateStaticParams = () => getSites().map((s) => ({ slug: s.slug }));

const indexable = (s: Site) => INDEXING_ON && s.contentState === "published";

export async function generateMetadata({ params }: PageProps<"/site/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getSite(slug);
  if (!s) return {};
  const place = [s.location.city, regionOf(s)].filter(Boolean).join(", ");
  return {
    title: s.seo?.title ?? `${s.name}${place ? `, ${place}` : ""}`,
    description: s.seo?.description ?? s.summary,
    alternates: { canonical: `/site/${s.slug}/` },
    robots: { index: indexable(s), follow: true },
    openGraph: { title: s.name, description: s.summary, type: "article" },
  };
}

const HINDU = new Set([
  "shaiva",
  "shakta",
  "vaishnava",
  "ganapatya",
  "kaumara",
  "ayyappa",
  "saura",
  "navagraha",
]);

const PROSE = ["architecture", "rebuilding", "significance"] as const;
const VISITING = ["bestSeason", "closedSeason", "howToReach"] as const;

function schemaType(s: Site) {
  if (s.kind === "church") return "Church";
  if (s.kind === "mosque") return "Mosque";
  if (s.kind === "temple" && s.traditions.some((x) => HINDU.has(x))) return "HinduTemple";
  if (s.traditions.includes("buddhist") && (s.kind === "temple" || s.kind === "monastery"))
    return "BuddhistTemple";
  return "PlaceOfWorship";
}

export default async function SitePage({ params }: PageProps<"/site/[slug]">) {
  const { slug } = await params;
  const s = getSite(slug);
  if (!s) notFound();
  const trads = getTraditions();
  const tradName = (x: string) => trads.find((y) => y.slug === x)?.name ?? x;
  const circuits = circuitsForSite(s.slug);
  const { lat, lng } = s.location;
  const hasCoords = lat !== undefined && lng !== undefined;
  const allSites = getSites();
  const nearby = hasCoords
    ? allSites
        .filter(
          (o) => o.slug !== s.slug && o.location.lat !== undefined && o.location.lng !== undefined,
        )
        .map((o) => ({ o, d: distanceKm([lat, lng], [o.location.lat!, o.location.lng!]) }))
        .filter((x) => x.d <= 150)
        .sort((a, b) => a.d - b.d)
        .slice(0, 6)
    : [];
  const byslug = new Map(allSites.map((x) => [x.slug, x]));
  const related = relatedFor(s, allSites);
  const region = regionOf(s);
  const isDraft = s.contentState !== "published";
  const mapPoints = [s, ...nearby.map((n) => n.o)].map(toCard).flatMap(toPoints);
  const subject = t("site.mailSubject", { name: s.name });
  const body = t("site.mailBody", { url: `${SITE_URL}/site/${s.slug}/` });
  const mailto = `mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs
        items={[
          { name: tradName(s.traditions[0]), href: `/tradition/${s.traditions[0]}/` },
          { name: region, href: `/state/${slugify(region)}/` },
          { name: s.name },
        ]}
      />
      <header className="mt-4">
        <h1 className="font-display text-accent text-4xl font-semibold md:text-5xl">{s.name}</h1>
        {s.nameDevanagari && (
          <p lang="sa" className="font-sanskrit text-accent-warm mt-1 text-2xl">
            {s.nameDevanagari}
          </p>
        )}
        {s.altNames.length > 0 && (
          <p className="text-text-soft mt-1 text-sm">
            {t("site.alsoKnown")} {s.altNames.join(", ")}
          </p>
        )}
        <p className="text-text-soft mt-2">
          {[s.location.city, s.location.district, region, s.location.country]
            .filter((v, i, a) => v && a.indexOf(v) === i)
            .join(", ")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {s.traditions.map((x) => (
            <TraditionChip key={x} slug={x} name={tradName(x)} />
          ))}
          <StatusBadge status={s.verification.status} />
          <AccuracyBadge accuracy={s.location.coordinateAccuracy} />
        </div>
        <p className="mt-4 text-lg">{s.summary}</p>
      </header>

      {isDraft && (
        <DraftNote>
          {t("site.draftBody")}{" "}
          <a className="underline" href="#verification">
            {t("site.seeVerification")}
          </a>
        </DraftNote>
      )}

      {s.legend.length > 0 && (
        <Section id="legend" title={t("site.legend")}>
          {s.legend.map((l, i) => (
            <div key={i} className="mt-3">
              <p className="text-text-soft text-sm italic">{l.attributedTo}</p>
              <p className="mt-1">{l.text}</p>
            </div>
          ))}
        </Section>
      )}

      {(s.history.periods.length > 0 || s.history.notes) && (
        <Section id="history" title={t("site.history")}>
          {s.history.periods.map((p, i) => (
            <div key={i} className="mt-4">
              <h3 className="font-semibold">
                {p.era}{" "}
                <span className="text-text-soft text-sm font-normal">
                  ({t(`confidence.${p.confidence}`)})
                </span>
              </h3>
              <p className="mt-1">
                {p.text}
                {p.sources.map((n) => (
                  <sup key={n}>
                    <a
                      href={`#src-${n + 1}`}
                      className="ml-0.5 underline"
                      aria-label={`${t("site.source")} ${n + 1}`}
                    >
                      [{n + 1}]
                    </a>
                  </sup>
                ))}
              </p>
            </div>
          ))}
          <Paras text={s.history.notes} />
        </Section>
      )}

      {PROSE.map(
        (k) =>
          s[k] && (
            <Section key={k} id={k} title={t(`site.${k}`)}>
              <Paras text={s[k]} />
            </Section>
          ),
      )}

      {(s.ritualsNote || s.festivals.length > 0) && (
        <Section id="rituals" title={t("site.rituals")}>
          <Paras text={s.ritualsNote} />
          {s.festivals.length > 0 && (
            <ul className="mt-3 list-disc pl-6">
              {s.festivals.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {(VISITING.some((k) => s.visiting[k]) || s.visiting.officialUrl) && (
        <Section id="visiting" title={t("site.visiting")}>
          <dl className="mt-3 grid gap-2">
            {VISITING.map(
              (k) =>
                s.visiting[k] && (
                  <div key={k}>
                    <dt className="font-semibold">{t(`site.${k}`)}</dt>
                    <dd>{s.visiting[k]}</dd>
                  </div>
                ),
            )}
            {s.visiting.officialUrl && (
              <div>
                <dt className="font-semibold">{t("site.official")}</dt>
                <dd>
                  <a className="underline" href={s.visiting.officialUrl} rel="noopener noreferrer">
                    {s.visiting.officialUrl}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <p className="text-text-soft mt-3 text-sm">{t("site.visitingNote")}</p>
        </Section>
      )}

      <Section id="location" title={t("site.location")} eager>
        {hasCoords ? (
          <>
            <p className="mt-3">
              {lat!.toFixed(4)}°, {lng!.toFixed(4)}° ·{" "}
              {t(`accuracy.${s.location.coordinateAccuracy}`)}
              {s.location.altitudeM ? ` · ${s.location.altitudeM} m` : ""}
            </p>
            {s.location.note && <p className="mt-2 text-sm">{s.location.note}</p>}
            <div className="border-rule mt-3 h-80 overflow-hidden rounded-lg border">
              <SiteMap
                points={mapPoints}
                selected={s.slug}
                fit="points"
                className="h-full w-full"
              />
            </div>
            <div className="mt-2 max-w-xs">
              <Legend />
            </div>
          </>
        ) : (
          <p className="mt-3">{t("site.noCoords")}</p>
        )}
        {nearby.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold">{t("site.nearby")}</h3>
            <ul className="mt-2 list-disc pl-6">
              {nearby.map(({ o, d }) => (
                <li key={o.slug}>
                  <IntentLink className="underline" href={`/site/${o.slug}/`}>
                    {o.name}
                  </IntentLink>{" "}
                  — {t("site.nearbyDistance", { km: Math.round(d) })}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      {circuits.length > 0 && (
        <Section id="circuits" title={t("site.circuits")}>
          <ul className="mt-3 list-disc pl-6">
            {circuits.map((c) => {
              const m = c.members.find((x) => x.siteSlug === s.slug)!;
              return (
                <li key={c.slug}>
                  <IntentLink className="underline" href={`/circuit/${c.slug}/`}>
                    {c.name}
                  </IntentLink>
                  {m.order ? ` — ${t("site.circuitOrder", { n: m.order })}` : ""}
                  {m.role !== "standard" ? ` (${t(`role.${m.role}`)})` : ""}
                  {m.note ? `. ${m.note}` : ""}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {related.length > 0 && (
        <Section id="related" title={t("site.related")}>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {related.map((r) => {
              const o = byslug.get(r.siteSlug);
              if (!o) return null;
              return (
                <li key={r.siteSlug}>
                  <span className="text-text-soft">{t(`relation.${r.relation}`)}:</span>{" "}
                  <IntentLink className="underline" href={`/site/${o.slug}/`}>
                    {o.name}
                  </IntentLink>
                  {r.note ? `. ${r.note}` : ""}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {s.variants && (
        <Section id="variants" title={t("site.variants")}>
          <Paras text={s.variants} />
        </Section>
      )}

      <Section id="verification" title={t("site.verification")}>
        <p className="mt-3">
          <StatusBadge status={s.verification.status} /> · {t("site.lastChecked")}{" "}
          {s.verification.lastChecked}
        </p>
        <p className="mt-2">{s.verification.notes}</p>
        <p className="text-text-soft mt-2 text-sm">{t("site.verificationHelp")}</p>
      </Section>

      <Section id="sources" title={t("site.sources")}>
        <SourceList sources={s.sources} />
      </Section>

      <p className="mt-10 text-sm">
        <a className="underline" href={mailto}>
          {t("site.reportError")}
        </a>
      </p>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": schemaType(s),
          name: s.name,
          description: s.summary,
          url: `${SITE_URL}/site/${s.slug}/`,
          ...(s.altNames.length ? { alternateName: s.altNames } : {}),
          address: {
            "@type": "PostalAddress",
            addressLocality: s.location.city,
            addressRegion: s.location.state,
            addressCountry: s.location.country,
          },
          ...(hasCoords && s.location.coordinateAccuracy !== "unverified"
            ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
            : {}),
        }}
      />
    </main>
  );
}
