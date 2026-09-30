import { z } from "zod";

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(SLUG, "must be lowercase kebab-case");
const isoDate = z.iso.date();

export const COUNTRIES = [
  "India",
  "Nepal",
  "Pakistan",
  "Bangladesh",
  "China",
  "Sri Lanka",
] as const;

export const SITE_KINDS = [
  "temple",
  "shrine",
  "town",
  "confluence",
  "lake",
  "mountain",
  "cave",
  "monastery",
  "gurdwara",
  "dargah",
  "mosque",
  "church",
  "fire-temple",
  "site",
] as const;

export const SourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.url(),
    type: z.enum(["primary", "official", "secondary", "lead"]),
    accessed: isoDate,
    publisher: z.string().optional(),
  })
  .strict();

export const VerificationSchema = z
  .object({
    status: z.enum(["verified", "disputed", "needs-review"]),
    notes: z.string(),
    lastChecked: isoDate,
  })
  .strict();

export const ImageSchema = z
  .object({
    src: z.string().min(1),
    alt: z.string().min(1),
    credit: z.string().min(1),
    licence: z.string().min(1),
    sourceUrl: z.url(),
  })
  .strict();

export const LocationSchema = z
  .object({
    country: z.enum(COUNTRIES),
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    coordinateAccuracy: z.enum(["exact", "approximate", "area", "unverified"]),
    altitudeM: z.number().optional(),
    coordinateSources: z.array(z.string()).default([]),
    note: z.string().optional(),
  })
  .strict();

export const HistoryPeriodSchema = z
  .object({
    era: z.string().min(1),
    text: z.string().min(1),
    confidence: z.enum(["certain", "probable", "traditional"]),
    sources: z.array(z.number().int().nonnegative()).default([]),
  })
  .strict();

export const SiteSchema = z
  .object({
    id: slug,
    slug,
    name: z.string().min(1),
    altNames: z.array(z.string()).default([]),
    nameDevanagari: z.string().optional(),
    nameNative: z.string().optional(),
    kind: z.enum(SITE_KINDS),
    traditions: z.array(slug).min(1),
    deities: z.array(z.string()).default([]),
    location: LocationSchema,
    outsideIndia: z.boolean(),
    tier: z.enum(["A", "B", "C"]),
    contentState: z.enum(["stub", "draft", "published"]),
    summary: z.string().min(1),
    legend: z
      .array(z.object({ text: z.string().min(1), attributedTo: z.string().min(1) }).strict())
      .default([]),
    history: z
      .object({
        periods: z.array(HistoryPeriodSchema).default([]),
        confidence: z.enum(["certain", "probable", "traditional"]).optional(),
        notes: z.string().optional(),
      })
      .strict()
      .default({ periods: [] }),
    architecture: z.string().optional(),
    rebuilding: z.string().optional(),
    significance: z.string().optional(),
    festivals: z.array(z.string()).default([]),
    ritualsNote: z.string().optional(),
    visiting: z
      .object({
        bestSeason: z.string().optional(),
        closedSeason: z.string().optional(),
        howToReach: z.string().optional(),
        officialUrl: z.url().optional(),
      })
      .strict()
      .default({}),
    images: z.array(ImageSchema).default([]),
    sources: z.array(SourceSchema).default([]),
    verification: VerificationSchema,
    variants: z.string().optional(),
    seo: z
      .object({ title: z.string().min(1), description: z.string().min(1) })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (s.id !== s.slug)
      ctx.addIssue({ code: "custom", message: "id must equal slug", path: ["id"] });
    const { lat, lng } = s.location;
    if ((lat === undefined) !== (lng === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "lat and lng must be set together",
        path: ["location"],
      });
    }
    const hasCoords = lat !== undefined && lng !== undefined;
    if (hasCoords && s.location.coordinateAccuracy === "unverified") {
      ctx.addIssue({
        code: "custom",
        message: "coordinates present but accuracy is 'unverified'",
        path: ["location"],
      });
    }
    if (!hasCoords && s.location.coordinateAccuracy !== "unverified") {
      ctx.addIssue({
        code: "custom",
        message: "accuracy set but coordinates missing",
        path: ["location"],
      });
    }
    const inIndia = s.location.country === "India";
    if (s.outsideIndia === inIndia) {
      ctx.addIssue({
        code: "custom",
        message: "outsideIndia must match location.country",
        path: ["outsideIndia"],
      });
    }
    s.history.periods.forEach((p, i) =>
      p.sources.forEach((n) => {
        if (n >= s.sources.length) {
          ctx.addIssue({
            code: "custom",
            message: `source index ${n} out of range`,
            path: ["history", "periods", i, "sources"],
          });
        }
      }),
    );
    if (s.verification.status !== "needs-review") {
      if (!hasCoords)
        ctx.addIssue({
          code: "custom",
          message: "verified/disputed sites need coordinates",
          path: ["location"],
        });
      if (s.sources.length < 2)
        ctx.addIssue({
          code: "custom",
          message: "verified/disputed sites need at least 2 sources",
          path: ["sources"],
        });
      if (!s.sources.some((x) => x.type === "primary" || x.type === "official")) {
        ctx.addIssue({
          code: "custom",
          message: "need at least one primary or official source",
          path: ["sources"],
        });
      }
      const needed = s.location.coordinateAccuracy === "exact" ? 2 : 1;
      if (hasCoords && s.location.coordinateSources.length < needed) {
        ctx.addIssue({
          code: "custom",
          message: `${s.location.coordinateAccuracy} coordinates need at least ${needed} coordinateSources`,
          path: ["location", "coordinateSources"],
        });
      }
    }
    if (s.verification.status === "disputed" && !s.variants) {
      ctx.addIssue({
        code: "custom",
        message: "disputed sites must document variants",
        path: ["variants"],
      });
    }
  });

export const MemberSchema = z
  .object({
    siteSlug: slug,
    order: z.number().int().positive().optional(),
    role: z.enum(["standard", "claimant", "variant"]).default("standard"),
    note: z.string().optional(),
  })
  .strict();

export const CircuitSchema = z
  .object({
    id: slug,
    slug,
    name: z.string().min(1),
    altNames: z.array(z.string()).default([]),
    traditions: z.array(slug).min(1),
    kind: z.enum(["traditional", "regional", "editorial"]),
    ordered: z.boolean(),
    route: z.boolean().optional(),
    description: z.string().min(1),
    history: z.string().optional(),
    significance: z.string().optional(),
    members: z.array(MemberSchema).min(1),
    countInTradition: z.number().int().positive().optional(),
    variantsNote: z.string().optional(),
    sources: z.array(SourceSchema).default([]),
    verification: VerificationSchema,
    seo: z
      .object({ title: z.string().min(1), description: z.string().min(1) })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (c.id !== c.slug)
      ctx.addIssue({ code: "custom", message: "id must equal slug", path: ["id"] });
    const seen = new Set<string>();
    c.members.forEach((m, i) => {
      if (seen.has(m.siteSlug))
        ctx.addIssue({
          code: "custom",
          message: `duplicate member ${m.siteSlug}`,
          path: ["members", i],
        });
      seen.add(m.siteSlug);
      if (c.ordered && m.role === "standard" && m.order === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "ordered circuits need an order on standard members",
          path: ["members", i, "order"],
        });
      }
    });
    if (c.verification.status !== "needs-review" && c.sources.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "verified/disputed circuits need at least 2 sources",
        path: ["sources"],
      });
    }
  });

export const TraditionSchema = z
  .object({
    slug,
    name: z.string().min(1),
    summary: z.string().min(1),
    accent: z.string().regex(/^--trad-[a-z]+$/),
    order: z.number().int().positive(),
  })
  .strict();

export type Site = z.infer<typeof SiteSchema>;
export type Circuit = z.infer<typeof CircuitSchema>;
export type Tradition = z.infer<typeof TraditionSchema>;
export type Source = z.infer<typeof SourceSchema>;
