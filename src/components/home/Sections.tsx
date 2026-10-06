import Link from "next/link";
import { t } from "@/lib/i18n";
import { TraditionIcon } from "../motifs/TraditionIcon";
import { SectionHeading } from "../motifs/Ornament";

export function Marquee({ names }: { names: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {names.map((n, i) => (
        <li key={i} lang="sa" className="font-sanskrit">
          {n}
          <span className="marquee-dot" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="region" aria-label={t("home.marqueeLabel")}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

type CircuitCard = {
  slug: string;
  name: string;
  count: number;
  tradition: string;
  blurb: string;
};

export function CircuitRail({ circuits }: { circuits: CircuitCard[] }) {
  return (
    <section id="journeys" aria-labelledby="circuits-h" className="section">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          id="circuits-h"
          eyebrow={t("home.circuitsEyebrow")}
          title={t("home.circuits")}
          lede={t("home.circuitsLede")}
        />
      </div>
      <div className="rail-wrap">
        <ul className="rail" aria-label={t("home.scrollHint")} tabIndex={0}>
          {circuits.map((c, i) => (
            <li key={c.slug} className="reveal">
              <Link
                href={`/circuit/${c.slug}/`}
                className="arch-card"
                style={{ ["--c" as string]: `var(--trad-${c.tradition})` }}
              >
                <span className="arch-index font-display">{String(i + 1).padStart(2, "0")}</span>
                <span className="arch-art" aria-hidden="true">
                  <TraditionIcon slug={c.tradition} className="h-14 w-14" />
                </span>
                <span className="font-display mt-auto text-[1.4rem] leading-tight font-semibold">
                  {c.name}
                </span>
                <span
                  className="mt-2 line-clamp-2 text-[0.75rem] leading-snug"
                  style={{ color: "var(--text-soft)" }}
                >
                  {c.blurb}
                </span>
                <span
                  className="mt-3 text-[0.68rem] tracking-[0.18em] uppercase"
                  style={{ color: "var(--c)" }}
                >
                  {c.count} {t("circuit.sites")}
                </span>
                <span className="arch-go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-center">
        <Link href="/circuits/" className="link-gold">
          {t("home.allCircuits")}
        </Link>
      </p>
    </section>
  );
}

type Trad = { slug: string; name: string; count: number };

export function TraditionGrid({ traditions }: { traditions: Trad[] }) {
  return (
    <section aria-labelledby="trad-h" className="section">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          id="trad-h"
          eyebrow={t("home.traditionsEyebrow")}
          title={t("home.traditions")}
          lede={t("home.traditionsLede")}
        />
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {traditions.map((x) => (
            <li key={x.slug} className="reveal">
              <Link
                href={`/tradition/${x.slug}/`}
                className="trad-tile"
                style={{ ["--c" as string]: `var(--trad-${x.slug})` }}
              >
                <span className="trad-icon" aria-hidden="true">
                  <TraditionIcon slug={x.slug} className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="font-display block truncate text-lg leading-tight font-semibold">
                    {x.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {x.count} {t("home.sitesCount")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
