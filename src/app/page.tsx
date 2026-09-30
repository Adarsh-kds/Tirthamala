import Link from "next/link";
import { getCards, getRegions } from "@/lib/catalog";
import { getCircuits, getTraditions } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Hub } from "@/components/hub/Hub";

export default function Home() {
  const cards = getCards();
  const traditions = getTraditions().map((x) => ({ slug: x.slug, name: x.name }));
  const regions = getRegions().map((r) => ({ name: r.name }));
  const circuits = getCircuits()
    .filter((c) => c.kind === "traditional")
    .slice(0, 8);
  const published = cards.filter((c) => c.contentState === "published").length;
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 max-w-3xl">
        <h1
          className="font-display text-4xl font-semibold md:text-5xl"
          style={{ color: "var(--accent)" }}
        >
          {t("home.headline")}
        </h1>
        <p className="mt-3 text-lg" style={{ color: "var(--text-soft)" }}>
          {t("home.lede")}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--text-soft)" }}>
          {cards.length} {t("home.sitesCount")} · {published} {t("home.publishedCount")} ·{" "}
          <Link href="/about/#verification" className="underline">
            {t("home.howVerified")}
          </Link>
        </p>
      </section>
      <Hub cards={cards} traditions={traditions} regions={regions} />
      <section className="mt-14" aria-labelledby="circuits-h">
        <h2
          id="circuits-h"
          className="font-display text-3xl font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {t("home.circuits")}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {circuits.map((c) => (
            <li
              key={c.slug}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--rule)", background: "var(--surface)" }}
            >
              <Link
                href={`/circuit/${c.slug}/`}
                className="font-display text-lg font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--accent)" }}
              >
                {c.name}
              </Link>
              <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                {c.members.length} {t("circuit.sites")}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/circuits/" className="underline">
            {t("home.allCircuits")}
          </Link>
        </p>
      </section>
    </main>
  );
}
