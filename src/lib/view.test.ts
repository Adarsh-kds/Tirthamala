import { describe, expect, it } from "vitest";
import { distanceKm, relatedFor, slugify, toCard } from "./view.ts";
import type { Site } from "./schema.ts";

describe("relatedFor", () => {
  const mk = (slug: string, related: object[] = []) => ({ slug, related }) as unknown as Site;
  it("mirrors one-directional links and inverts part-of", () => {
    const a = mk("a", [{ siteSlug: "b", relation: "part-of" }]);
    const b = mk("b");
    expect(relatedFor(a, [a, b])[0].relation).toBe("part-of");
    expect(relatedFor(b, [a, b])).toEqual([
      { siteSlug: "a", relation: "contains", note: undefined },
    ]);
  });
});

describe("view helpers", () => {
  it("slugifies region names", () => {
    expect(slugify("Jammu and Kashmir")).toBe("jammu-and-kashmir");
    expect(slugify("Tibet Autonomous Region")).toBe("tibet-autonomous-region");
  });
  it("computes great-circle distance", () => {
    // Delhi to Mumbai is about 1,150 km in a straight line.
    const d = distanceKm([28.6139, 77.209], [19.076, 72.8777]);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1200);
  });
  it("builds a slim card", () => {
    const site = {
      slug: "a",
      name: "A",
      altNames: [],
      kind: "temple",
      traditions: ["shaiva"],
      deities: [],
      location: {
        country: "India",
        state: "Kerala",
        coordinateAccuracy: "unverified",
        coordinateSources: [],
      },
      tier: "C",
      contentState: "stub",
      summary: "s",
      verification: { status: "needs-review" },
    } as unknown as Site;
    const card = toCard(site);
    expect(card.state).toBe("Kerala");
    expect(card.status).toBe("needs-review");
  });
});
