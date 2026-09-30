import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { circuitsForSite, getSite, getSites, getTraditions } from "@/lib/data";
import { regionOf, slugify, distanceKm, ACCURACY_LABEL } from "@/lib/view";
import { CORRECTIONS_EMAIL, INDEXING_ON, SITE_URL } from "@/lib/site-config";
import { t } from "@/lib/i18n";
import { AccuracyBadge, StatusBadge, TraditionChip } from "@/components/Badges";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import SiteMap from "@/components/map/LazyMap";
import { Legend } from "@/components/hub/Hub";
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

const paras = (text?: string) =>
  text
    ? text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mt-3">
          {p}
        </p>
      ))
    : null;
const CONF: Record<string, string> = {
  certain: "Documented",
  probable: "Probable",
  traditional: "Traditional account",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10">
      <h2
        id={`${id}-h`}
        className="font-display text-2xl font-semibold"
        style={{ color: "var(--accent)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function schemaType(s: Site) {
  if (s.kind === "church") return "Church";
  if (s.kind === "mosque") return "Mosque";
  if (
    s.kind === "temple" &&
    s.traditions.some((x) =>
      [
        "shaiva",
        "shakta",
        "vaishnava",
        "ganapatya",
        "kaumara",
        "ayyappa",
        "saura",
        "navagraha",
      ].includes(x),
    )
  )
    return "HinduTemple";
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
  const nearby = hasCoords
    ? getSites()
        .filter(
          (o) => o.slug !== s.slug && o.location.lat !== undefined && o.location.lng !== undefined,
        )
        .map((o) => ({ o, d: distanceKm([lat, lng], [o.location.lat!, o.location.lng!]) }))
        .filter((x) => x.d <= 150)
        .sort((a, b) => a.d - b.d)
        .slice(0, 6)
    : [];
  const region = regionOf(s);
  const isDraft = s.contentState !== "published";
  const mapPoints = hasCoords
    ? [s, ...nearby.map((n) => n.o)].map((x) => ({
        slug: x.slug,
        name: x.name,
        lat: x.location.lat!,
        lng: x.location.lng!,
        tradition: x.traditions[0],
        accuracy: x.location.coordinateAccuracy,
      }))
    : [];
  const mailto = `mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent(`Correction: ${s.name}`)}&body=${encodeURIComponent(`Page: ${SITE_URL}/site/${s.slug}/\n\nWhat should change, and your source:\n`)}`;

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
        <h1
          className="font-display text-4xl font-semibold md:text-5xl"
          style={{ color: "var(--accent)" }}
        >
          {s.name}
        </h1>
        {s.nameDevanagari && (
          <p
            lang="sa"
            className="font-sanskrit mt-1 text-2xl"
            style={{ color: "var(--accent-warm)" }}
          >
            {s.nameDevanagari}
          </p>
        )}
        {s.altNames.length > 0 && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
            {t("site.alsoKnown")} {s.altNames.join(", ")}
          </p>
        )}
        <p className="mt-2" style={{ color: "var(--text-soft)" }}>
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
        <aside
          role="note"
          className="mt-6 rounded-lg border p-4 text-sm"
          style={{ borderColor: "var(--accent-gold)", background: "var(--surface)" }}
        >
          <strong>{t("site.draftTitle")}</strong> {t("site.draftBody")}{" "}
          <a className="underline" href="#verification">
            {t("site.seeVerification")}
          </a>
        </aside>
      )}

      {s.legend.length > 0 && (
        <Section id="legend" title={t("site.legend")}>
          {s.legend.map((l, i) => (
            <div key={i} className="mt-3">
              <p className="text-sm italic" style={{ color: "var(--text-soft)" }}>
                {l.attributedTo}
              </p>
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
                <span className="text-sm font-normal" style={{ color: "var(--text-soft)" }}>
                  ({CONF[p.confidence]})
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
          {paras(s.history.notes)}
        </Section>
      )}

      {s.architecture && (
        <Section id="architecture" title={t("site.architecture")}>
          {paras(s.architecture)}
        </Section>
      )}
      {s.rebuilding && (
        <Section id="rebuilding" title={t("site.rebuilding")}>
          {paras(s.rebuilding)}
        </Section>
      )}
      {s.significance && (
        <Section id="significance" title={t("site.significance")}>
          {paras(s.significance)}
        </Section>
      )}

      {(s.ritualsNote || s.festivals.length > 0) && (
        <Section id="rituals" title={t("site.rituals")}>
          {paras(s.ritualsNote)}
          {s.festivals.length > 0 && (
            <ul className="mt-3 list-disc pl-6">
              {s.festivals.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {(s.visiting.bestSeason ||
        s.visiting.closedSeason ||
        s.visiting.howToReach ||
        s.visiting.officialUrl) && (
        <Section id="visiting" title={t("site.visiting")}>
          <dl className="mt-3 grid gap-2">
            {s.visiting.bestSeason && (
              <div>
                <dt className="font-semibold">{t("site.bestSeason")}</dt>
                <dd>{s.visiting.bestSeason}</dd>
              </div>
            )}
            {s.visiting.closedSeason && (
              <div>
                <dt className="font-semibold">{t("site.closedSeason")}</dt>
                <dd>{s.visiting.closedSeason}</dd>
              </div>
            )}
            {s.visiting.howToReach && (
              <div>
                <dt className="font-semibold">{t("site.howToReach")}</dt>
                <dd>{s.visiting.howToReach}</dd>
              </div>
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
          <p className="mt-3 text-sm" style={{ color: "var(--text-soft)" }}>
            {t("site.visitingNote")}
          </p>
        </Section>
      )}

      <Section id="location" title={t("site.location")}>
        {hasCoords ? (
          <>
            <p className="mt-3">
              {lat!.toFixed(4)}°, {lng!.toFixed(4)}° ·{" "}
              {ACCURACY_LABEL[s.location.coordinateAccuracy]}
              {s.location.altitudeM ? ` · ${s.location.altitudeM} m` : ""}
            </p>
            {s.location.note && <p className="mt-2 text-sm">{s.location.note}</p>}
            <div
              className="mt-3 h-80 overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--rule)" }}
            >
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
                  <Link className="underline" href={`/site/${o.slug}/`}>
                    {o.name}
                  </Link>{" "}
                  — about {Math.round(d)} km {t("site.straightLine")}
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
                  <Link className="underline" href={`/circuit/${c.slug}/`}>
                    {c.name}
                  </Link>
                  {m.order ? ` — #${m.order}` : ""}
                  {m.role !== "standard" ? ` (${m.role})` : ""}
                  {m.note ? `. ${m.note}` : ""}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {s.variants && (
        <Section id="variants" title={t("site.variants")}>
          {paras(s.variants)}
        </Section>
      )}

      <Section id="verification" title={t("site.verification")}>
        <p className="mt-3">
          <StatusBadge status={s.verification.status} /> · {t("site.lastChecked")}{" "}
          {s.verification.lastChecked}
        </p>
        <p className="mt-2">{s.verification.notes}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
          {t("site.verificationHelp")}
        </p>
      </Section>

      <Section id="sources" title={t("site.sources")}>
        {s.sources.length === 0 ? (
          <p className="mt-3">{t("site.noSources")}</p>
        ) : (
          <ol className="mt-3 list-decimal space-y-1 pl-6">
            {s.sources.map((x, i) => (
              <li key={i} id={`src-${i + 1}`}>
                <a className="underline" href={x.url} rel="noopener noreferrer">
                  {x.title}
                </a>
                {x.publisher ? `, ${x.publisher}` : ""}{" "}
                <span className="text-sm" style={{ color: "var(--text-soft)" }}>
                  ({t(`source.${x.type}`)}; {t("site.accessed")} {x.accessed})
                </span>
              </li>
            ))}
          </ol>
        )}
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
