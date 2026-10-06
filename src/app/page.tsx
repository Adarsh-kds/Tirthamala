import Link from "next/link";
import { getCards, getRegions } from "@/lib/catalog";
import { getCircuits, getTraditions } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Hub } from "@/components/hub/Hub";
import { Hero } from "@/components/home/Hero";
import { CircuitRail, Marquee, TraditionGrid } from "@/components/home/Sections";
import { SectionHeading } from "@/components/motifs/Ornament";

const HERO_CHIPS = ["char-dham", "jyotirlingas", "shakti-peethas", "ashtavinayak"];

export default function Home() {
  const cards = getCards();
  const allTraditions = getTraditions();
  const traditions = allTraditions.map((x) => ({ slug: x.slug, name: x.name }));
  const regions = getRegions().map((r) => ({ name: r.name }));
  const allCircuits = getCircuits();
  const circuits = allCircuits.filter((c) => c.kind === "traditional").slice(0, 10);
  const published = cards.filter((c) => c.contentState === "published").length;

  const chips = HERO_CHIPS.map((s) => allCircuits.find((c) => c.slug === s))
    .filter((c) => c !== undefined)
    .map((c) => ({ slug: c.slug, name: c.name.replace(/^The /, "").replace(/\s*\(.*\)$/, "") }));

  const marquee = [
    ...new Set(
      cards
        .filter((c) => c.nameDevanagari && c.contentState === "published")
        .map((c) => c.nameDevanagari!),
    ),
  ].slice(0, 28);

  return (
    <main id="main" className="home">
      <Hero
        chips={chips}
        stats={[
          { value: cards.length, label: t("hero.stat.sites") },
          { value: allCircuits.length, label: t("hero.stat.circuits") },
          { value: allTraditions.length, label: t("hero.stat.traditions") },
        ]}
      />
      <div className="om-watermark" aria-hidden="true">
        <span lang="sa" className="font-sanskrit">
          ॐ
        </span>
      </div>
      {marquee.length > 0 && <Marquee names={marquee} />}
      <CircuitRail
        circuits={circuits.map((c) => ({
          slug: c.slug,
          name: c.name,
          count: c.members.length,
          tradition: c.traditions[0] ?? "other",
          blurb: c.description,
        }))}
      />
      <TraditionGrid
        traditions={allTraditions.map((x) => ({
          slug: x.slug,
          name: x.name,
          count: cards.filter((c) => c.traditions.includes(x.slug)).length,
        }))}
      />
      <section id="atlas" aria-labelledby="atlas-h" className="section scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            id="atlas-h"
            eyebrow={t("home.atlasEyebrow")}
            title={t("home.atlasTitle")}
            lede={t("home.lede")}
          />
          <p className="mt-3 text-center text-xs" style={{ color: "var(--text-soft)" }}>
            {cards.length} {t("home.sitesCount")} · {published} {t("home.publishedCount")} ·{" "}
            <Link href="/about/#verification" className="link-gold">
              {t("home.howVerified")}
            </Link>
          </p>
          <div className="mt-10">
            <Hub cards={cards} traditions={traditions} regions={regions} />
          </div>
        </div>
      </section>
    </main>
  );
}
