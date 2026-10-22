import { test, expect } from "@playwright/test";

test("all conversion tools validate input, preserve precision and swap units", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("输入数值", { exact: true });
  const result = page.locator(".result-number");
  const copy = page.getByRole("button", { name: "复制结果", exact: true });
  await input.fill("-1");
  await expect(page.getByRole("alert")).toContainText("不能为负数");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(copy).toBeDisabled();
  await input.fill("");
  await expect(copy).toBeDisabled();
  await input.fill("2.54");
  await expect(result).toHaveText("1in");
  await page.getByRole("button", { name: "交换单位", exact: true }).click();
  await expect(page.getByLabel("原始单位", { exact: true })).toHaveValue("in");
  await expect(page.getByLabel("目标单位", { exact: true })).toHaveValue("cm");
  await input.fill("1");
  await expect(result).toHaveText("2.54cm");
  await page.getByRole("navigation").getByRole("button", { name: "重量", exact: true }).click();
  await input.fill("0.45359237");
  await expect(result).toHaveText("1lb");
  await page.getByRole("navigation").getByRole("button", { name: "容量", exact: true }).click();
  await expect(page.getByLabel("目标单位", { exact: true }).locator('option[value="oz"]')).toHaveCount(0);
  await input.fill("29.5735295625");
  await expect(result).toHaveText("1US fl oz");
  await page.getByLabel("目标单位", { exact: true }).selectOption("imp-floz");
  await page.getByLabel("显示小数位", { exact: true }).selectOption("6");
  await expect(result).toHaveText("1.040843Imperial fl oz");
  await page.getByRole("navigation").getByRole("button", { name: "温度", exact: true }).click();
  await input.fill("-40");
  await expect(result).toHaveText("-40°F");
  await input.fill("-273.16");
  await expect(page.getByRole("alert")).toContainText("绝对零度");
  await expect(copy).toBeDisabled();
  await page.reload();
  await expect(page.getByLabel("显示小数位", { exact: true })).toHaveValue("6");
});

test("clipboard rejection gives actionable feedback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => { throw new Error("denied"); } },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "复制结果", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("复制失败，请选中结果手动复制。");
  await expect(page.locator(".result-number")).toHaveText("39.37in");
});

test("favorites persist while product data stays out of storage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "目标市场", exact: true }).selectOption("DE");
  await page.getByRole("button", { name: "收藏市场" }).click();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 德国" })).toBeVisible();
  await page.getByRole("navigation").getByRole("button", { name: "商品规格", exact: true }).click();
  await page.getByRole("textbox").fill("PRIVATE-SKU,1,2,3,4");
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain("PRIVATE-SKU");
  await page.reload();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 德国" })).toBeVisible();
  await page.getByRole("button", { name: "已收藏" }).click();
  await page.reload();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 德国" })).toHaveCount(0);
});

test("corrupt stored preferences recover to usable defaults", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unitport.preferences.v1", "{broken"));
  await page.goto("/");
  await expect(page.getByRole("combobox", { name: "目标市场", exact: true })).toHaveValue("US");
  await expect(page.locator(".result-number")).toHaveText("39.37in");
  await expect(page.getByText("偏好自动保存")).toBeVisible();
});

test("every tool in both languages fits the viewport and loads brand assets without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto("/");
  for (const locale of ["zh", "en"]) {
    if (locale === "en") await page.getByRole("button", { name: "Switch to English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale === "zh" ? "zh-CN" : "en");
    const tools = page.getByRole("navigation").getByRole("button");
    for (let i = 0; i < await tools.count(); i++) {
      await tools.nth(i).click();
      await expect(tools.nth(i)).toHaveAttribute("aria-current", "page");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  const images = page.locator("img");
  for (let i = 0; i < await images.count(); i++) {
    await expect(images.nth(i)).toHaveJSProperty("complete", true);
    expect(await images.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});
