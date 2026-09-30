import type { MetadataRoute } from "next";
import { getCircuits, getSites, getTraditions } from "@/lib/data";
import { getRegions } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE_URL}${p}`;
  return [
    ...[
      "/",
      "/map/",
      "/circuits/",
      "/traditions/",
      "/states/",
      "/about/",
      "/sources/",
      "/corrections/",
      "/privacy/",
    ].map((p) => ({ url: u(p) })),
    ...getTraditions().map((x) => ({ url: u(`/tradition/${x.slug}/`) })),
    ...getRegions().map((x) => ({ url: u(`/state/${x.slug}/`) })),
    ...getCircuits()
      .filter((c) => c.verification.status !== "needs-review")
      .map((c) => ({ url: u(`/circuit/${c.slug}/`) })),
    ...getSites()
      .filter((s) => s.contentState === "published")
      .map((s) => ({ url: u(`/site/${s.slug}/`), lastModified: s.verification.lastChecked })),
  ];
}
