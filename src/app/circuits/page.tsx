import type { Metadata } from "next";
import { IntentLink } from "@/components/IntentLink";
import { getCircuits } from "@/lib/data";
import { t } from "@/lib/i18n";
import { PageHeading } from "@/components/Article";
import { StatusBadge } from "@/components/Badges";

export const metadata: Metadata = {
  title: t("circuits.title"),
  description: t("circuits.description"),
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
      <PageHeading crumbs={[{ name: t("nav.circuits") }]} title={t("nav.circuits")} />
      <p className="text-text-soft mt-2">{t("circuits.lede")}</p>
      {groups.map(([kind, key]) => (
        <section key={kind} className="mt-8">
          <h2 className="font-display text-2xl font-semibold">{t(key)}</h2>
          <ul className="mt-3 space-y-2">
            {all
              .filter((c) => c.kind === kind)
              .map((c) => (
                <li key={c.slug}>
                  <IntentLink href={`/circuit/${c.slug}/`} className="text-accent underline">
                    {c.name}
                  </IntentLink>{" "}
                  <span className="text-text-soft text-sm">
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
