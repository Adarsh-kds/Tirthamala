import type { Metadata } from "next";
import Link from "next/link";
import { getRegions } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { PageHeading } from "@/components/Article";

export const metadata: Metadata = {
  title: t("nav.regions"),
  description: t("states.description"),
  alternates: { canonical: "/states/" },
};

export default function States() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <PageHeading crumbs={[{ name: t("nav.regions") }]} title={t("nav.regions")} />
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {getRegions().map((r) => (
          <li key={r.slug}>
            <Link className="underline" href={`/state/${r.slug}/`}>
              {r.name}
            </Link>{" "}
            <span className="text-text-soft text-sm">({r.count})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
