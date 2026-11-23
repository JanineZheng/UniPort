import { test, expect } from "@playwright/test";
import { supplierGuide as guide, dimensionsGuide, guides } from "../../src/config/guides";

for (const guide of guides) {
test(`${guide.path} serves a complete static article and canonical route`, async ({ browser, request }, testInfo) => {
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
    if (guide.path === dimensionsGuide.path) {
      await expect(page.getByLabel("Example dimensions input")).toHaveText("30 × 20 × 10 cm");
    } else {
      await expect(page.getByLabel("Example supplier input")).toContainText("SAMPLE-A,25.4,50.8,76.2,0.45359237");
    }
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
}

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


test("dimensions guide example and unit caveat match the actual tool", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } }));
  await page.goto(dimensionsGuide.path);
  const input = await page.getByLabel("Example dimensions input").innerText();
  const output = await page.getByLabel("Example dimensions output").innerText();
  await page.getByRole("link", { name: dimensionsGuide.action, exact: true }).click();
  const paste = page.getByLabel("Paste L × W × H (optional unit)", { exact: true });
  await paste.fill(input);
  await page.getByRole("button", { name: "Use dimensions", exact: true }).click();
  await page.getByLabel("Result unit", { exact: true }).selectOption("in");
  await page.getByLabel("Decimal places", { exact: true }).selectOption("2");
  await expect(page.getByLabel("Dimension unit", { exact: true })).toHaveValue("cm");
  await expect(page.locator(".shipping-number")).toHaveText(output.replace("Dimensions (L × W × H): ", ""));
  await expect(page.getByRole("button", { name: "Copy result", exact: true })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Read the L × W × H conversion guide and worked example →" })).toHaveAttribute("href", dimensionsGuide.path);

  await page.getByLabel("Dimension unit", { exact: true }).selectOption("mm");
  await paste.fill("60 x 40 x 20");
  await page.getByRole("button", { name: "Use dimensions", exact: true }).click();
  await expect(page.getByLabel("Dimension unit", { exact: true })).toHaveValue("mm");
  await expect(page.getByLabel("Length", { exact: true })).toHaveValue("60");
  await paste.fill("L: 30 cm W: 20 cm H: 10 cm");
  await page.getByRole("button", { name: "Use dimensions", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Use a format such as 30 × 20 × 10 cm.");
  await expect(page.getByLabel("Length", { exact: true })).toHaveValue("60");
  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.getByRole("link", { name: "阅读长宽高转换指南与完整示例（英文） →" })).toHaveAttribute("href", dimensionsGuide.path);
});
