import Link from "next/link";
import { t } from "@/lib/i18n";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/lib/site-config";

export type Crumb = { name: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: t("nav.atlas"), href: "/" }, ...items];
  return (
    <>
      <nav
        aria-label={t("nav.breadcrumb")}
        className="text-sm"
        style={{ color: "var(--text-soft)" }}
      >
        <ol className="flex flex-wrap gap-x-2">
          {all.map((c, i) => (
            <li key={i} className="flex gap-2">
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="underline">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={i === all.length - 1 ? "page" : undefined}>{c.name}</span>
              )}
              {i < all.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            ...(c.href ? { item: new URL(c.href, SITE_URL).toString() } : {}),
          })),
        }}
      />
    </>
  );
}
