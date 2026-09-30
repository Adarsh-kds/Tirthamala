import type { Metadata } from "next";
import Link from "next/link";
import { getRegions } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "States and regions",
  description: "Browse sacred sites by state, union territory or region.",
  alternates: { canonical: "/states/" },
};

export default function States() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ name: t("nav.regions") }]} />
      <h1 className="font-display mt-4 text-4xl font-semibold" style={{ color: "var(--accent)" }}>
        {t("nav.regions")}
      </h1>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {getRegions().map((r) => (
          <li key={r.slug}>
            <Link className="underline" href={`/state/${r.slug}/`}>
              {r.name}
            </Link>{" "}
            <span className="text-sm" style={{ color: "var(--text-soft)" }}>
              ({r.count})
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
