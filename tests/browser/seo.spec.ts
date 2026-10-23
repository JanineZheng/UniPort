import { test, expect } from "@playwright/test";
import { pages } from "../../src/config/pages";

for (const entry of pages) {
  test(`${entry.path} serves indexable HTML and a working bilingual tool`, async ({ browser, page, request }, testInfo) => {
    const staticContext = await browser.newContext({ javaScriptEnabled: false });
    try {
      const staticPage = await staticContext.newPage();
      const response = await staticPage.goto(new URL(entry.path, testInfo.project.use.baseURL).href);
      expect(response?.status()).toBe(200);
      await expect(staticPage).toHaveTitle(entry.title);
      await expect(staticPage.getByRole("heading", { level: 1 })).toHaveText(entry.heading);
      await expect(staticPage.locator('meta[name="description"]')).toHaveAttribute("content", entry.description);
      await expect(staticPage.locator('meta[property="og:title"]')).toHaveAttribute("content", entry.title);
      await expect(staticPage.locator('meta[property="og:description"]')).toHaveAttribute("content", entry.description);
      await expect(staticPage.getByText(entry.formula, { exact: true })).toBeVisible();
      await expect(staticPage.getByText(entry.example, { exact: true })).toBeVisible();
      const schema = JSON.parse(await staticPage.locator('script[type="application/ld+json"]').innerText());
      expect(schema).toMatchObject({ "@type": "WebApplication", name: entry.heading, description: entry.description, isAccessibleForFree: true });
      if (process.env.SITE_URL) {
        const canonical = `${new URL(process.env.SITE_URL).origin}${entry.path}`;
        await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
        await expect(staticPage.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
        expect(schema.url).toBe(canonical);
        const sitemap = await request.get("/sitemap.xml");
        expect(sitemap.status()).toBe(200);
        expect(await sitemap.text()).toContain(`<loc>${canonical}</loc>`);
        expect(await (await request.get("/robots.txt")).text()).toContain(`Sitemap: ${new URL(process.env.SITE_URL).origin}/sitemap.xml`);
      } else {
        await expect(staticPage.locator('link[rel="canonical"]')).toHaveCount(0);
        expect(schema.url).toBeUndefined();
        expect(await (await request.get("/robots.txt")).text()).not.toContain("Sitemap:");
      }
    } finally {
      await staticContext.close();
    }

    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    if (entry.tool === "currency") await page.route("https://api.frankfurter.dev/**", route => route.fulfill({ json: [{ base: "CNY", quote: "USD", rate: 0.14, date: new Date().toISOString().slice(0, 10) }] }));
    await page.goto(entry.path);
    for (const locale of ["en", "zh"] as const) {
      if (locale === "zh") await page.getByRole("button", { name: "切换到中文" }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "en" ? "en" : "zh-CN");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "en" ? entry.heading : entry.zh);
      await expect(page.getByRole("navigation").locator('[aria-current="page"]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const links = page.getByRole("navigation").getByRole("link");
      await expect(links).toHaveCount(pages.length - 1);
      expect(await links.evaluateAll(elements => elements.map(el => el.getAttribute("href")))).toEqual(
        expect.arrayContaining(pages.filter(other => other.path !== "/").map(other => other.path)),
      );
      expect(await page.locator("img").evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
      if (entry.path === "/" && locale === "en") {
        if (testInfo.project.name === "mobile") {
          expect(await page.locator(".result-number").evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(844);
        }
        await testInfo.attach("home-layout", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("keyboard skip link reaches the converter", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to converter" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#workspace$/);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Currency", exact: true })).toHaveCount(1);
});

test("unknown pages return 404 and known pages drop trailing slashes", async ({ request }) => {
  const missing = await request.get("/not-a-tool");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('name="robots" content="noindex"');
  const redirect = await request.get("/cm-to-inches/?example=1", { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe("/cm-to-inches?example=1");
});
