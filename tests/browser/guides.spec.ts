import { test, expect } from "@playwright/test";
import { supplierGuide as guide } from "../../src/config/guides";

test("supplier guide serves a complete static article and canonical route", async ({ browser, request }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    expect((await page.goto(new URL(guide.path, testInfo.project.use.baseURL).href))?.status()).toBe(200);
    await expect(page).toHaveTitle(guide.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(guide.heading);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", guide.description);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(schema).toMatchObject({ "@type": "TechArticle", headline: guide.heading, author: { name: "Uniport" } });
    await expect(page.getByLabel("Example supplier input")).toContainText("SAMPLE-A,25.4,50.8,76.2,0.45359237");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (process.env.SITE_URL) {
      const canonical = new URL(guide.path, process.env.SITE_URL).href;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
      expect(schema.url).toBe(canonical);
      expect(await (await request.get("/sitemap.xml")).text()).toContain(`<loc>${canonical}</loc>`);
    }
    const redirect = await request.get(`${guide.path}/?example=1`, { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe(`${guide.path}?example=1`);
  } finally { await context.close(); }
});

test("the guide example converts to its documented output and is linked from the tool", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } }));
  await page.goto(guide.path);
  const input = await page.getByLabel("Example supplier input").innerText();
  const output = (await page.getByLabel("Example English output").innerText()).split("\n");
  await page.getByRole("link", { name: "Convert your product specs →", exact: true }).click();
  await page.getByLabel("Source dimensions", { exact: true }).selectOption("cm");
  await page.getByLabel("Target dimensions", { exact: true }).selectOption("in");
  await page.getByLabel("Source weight", { exact: true }).selectOption("kg");
  await page.getByLabel("Target weight", { exact: true }).selectOption("lb");
  await page.getByRole("textbox").fill(input);
  await expect(page.locator(".spec-row p")).toHaveText(output);
  await expect(page.getByRole("button", { name: "Copy all English specs", exact: true })).toBeEnabled();
  const guideLink = page.getByRole("link", { name: "Read the supplier specs guide with a worked example →" });
  await expect(guideLink).toHaveAttribute("href", guide.path);
  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.getByRole("link", { name: "阅读完整操作指南与示例（英文） →" })).toHaveAttribute("href", guide.path);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
