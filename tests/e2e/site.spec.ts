import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  ["home", "/"],
  ["map", "/map/"],
  ["published site", "/site/kedarnath-temple/"],
  ["draft site", "/site/adi-badri/"],
  ["circuit", "/circuit/chota-char-dham/"],
  ["circuits index", "/circuits/"],
  ["tradition", "/tradition/shaiva/"],
  ["state", "/state/uttarakhand/"],
  ["about", "/about/"],
  ["sources", "/sources/"],
  ["corrections", "/corrections/"],
  ["privacy", "/privacy/"],
] as const;

for (const [name, url] of PAGES) {
  test(`axe: ${name}`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("load");
    if (url === "/map/" || url.startsWith("/circuit/") || url.includes("kedarnath"))
      await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual([]);
  });
}

test("hub search filters and syncs URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search" }).fill("kedarnath");
  await expect(page.getByRole("status")).toContainText("results");
  await expect(page.getByRole("link", { name: "Kedarnath Temple" }).first()).toBeVisible();
  await expect(page).toHaveURL(/q=kedarnath/);
});

test("view switching shows table and map", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Table" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page).toHaveURL(/view=table/);
  await page.getByRole("tab", { name: "Map" }).click();
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
  await expect(page).toHaveURL(/view=map/);
});

test("direct link restores view and filter", async ({ page }) => {
  await page.goto("/?view=table&tradition=sikh");
  await expect(page.getByRole("tab", { name: "Table", selected: true })).toBeVisible();
  await expect(page.getByLabel("Tradition")).toHaveValue("sikh");
});

test("published site page shows sources and breadcrumbs", async ({ page }) => {
  await page.goto("/site/kedarnath-temple/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kedarnath");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();
  await expect(page.getByText("Draft page.")).toHaveCount(0);
});

test("draft site page carries the draft notice", async ({ page }) => {
  await page.goto("/site/adi-badri/");
  await expect(page.getByText("Draft page.")).toBeVisible();
});

test("pages are noindex until launch and robots disallows", async ({ page, request }) => {
  await page.goto("/site/kedarnath-temple/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /");
});

test("no third-party requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", ""].includes(u.hostname) && u.protocol.startsWith("http"))
      external.push(r.url());
  });
  for (const url of ["/", "/map/", "/site/kedarnath-temple/"]) {
    await page.goto(url);
    await page.waitForTimeout(1200);
  }
  expect(external).toEqual([]);
});

test("skip link is first focusable and works", async ({ page }) => {
  await page.goto("/about/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});

test("unknown path shows themed 404", async ({ page }) => {
  const res = await page.goto("/site/does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This path leads nowhere yet")).toBeVisible();
});

test("mobile layout has no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const url of ["/", "/site/kedarnath-temple/", "/circuit/chota-char-dham/"]) {
    await page.goto(url);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, url).toBeLessThanOrEqual(1);
  }
});
