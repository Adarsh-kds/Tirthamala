import type { Metadata } from "next";
import Link from "next/link";
import { getCircuits } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBadge } from "@/components/Badges";

export const metadata: Metadata = {
  title: "Pilgrimage circuits",
  description:
    "Traditional, regional and editorial pilgrimage circuits of India, with the sites that belong to each.",
  alternates: { canonical: "/circuits/" },
};

export default function Circuits() {
  const all = getCircuits();
  const groups = [
    ["traditional", "circuits.traditional"],
    ["regional", "circuits.regional"],
    ["editorial", "circuits.editorial"],
  ] as const;
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.circuits") }]} />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {t("nav.circuits")}
      </h1>
      <p className="mt-2" style={{ color: "var(--text-soft)" }}>
        {t("circuits.lede")}
      </p>
      {groups.map(([kind, key]) => (
        <section key={kind} className="mt-8">
          <h2 className="font-display text-2xl font-semibold">{t(key)}</h2>
          <ul className="mt-3 space-y-2">
            {all
              .filter((c) => c.kind === kind)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/circuit/${c.slug}/`}
                    className="underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {c.name}
                  </Link>{" "}
                  <span className="text-sm" style={{ color: "var(--text-soft)" }}>
                    {c.members.length} {t("circuit.sites")}
                  </span>{" "}
                  <StatusBadge status={c.verification.status} />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
