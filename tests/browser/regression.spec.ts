import { test, expect } from "@playwright/test";

test("all conversion tools validate input, preserve precision and swap units", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Enter value", { exact: true });
  const result = page.locator(".result-number");
  const copy = page.getByRole("button", { name: "Copy result", exact: true });
  await input.fill("-1");
  await expect(page.getByRole("alert")).toContainText("cannot be negative");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(copy).toBeDisabled();
  await input.fill("");
  await expect(copy).toBeDisabled();
  await input.fill("2.54");
  await expect(result).toHaveText("1in");
  await page.getByRole("button", { name: "Swap units", exact: true }).click();
  await expect(page.getByLabel("Source unit", { exact: true })).toHaveValue("in");
  await expect(page.getByLabel("Target unit", { exact: true })).toHaveValue("cm");
  await input.fill("1");
  await expect(result).toHaveText("2.54cm");
  await page.getByRole("navigation").getByRole("link", { name: "Weight", exact: true }).click();
  await input.fill("0.45359237");
  await expect(result).toHaveText("1lb");
  await page.getByRole("navigation").getByRole("link", { name: "Volume", exact: true }).click();
  await expect(page.getByLabel("Target unit", { exact: true }).locator('option[value="oz"]')).toHaveCount(0);
  await input.fill("29.5735295625");
  await expect(result).toHaveText("1US fl oz");
  await page.getByLabel("Target unit", { exact: true }).selectOption("imp-floz");
  await page.getByLabel("Decimal places", { exact: true }).selectOption("6");
  await expect(result).toHaveText("1.040843Imperial fl oz");
  await page.getByRole("navigation").getByRole("link", { name: "Temperature", exact: true }).click();
  await input.fill("-40");
  await expect(result).toHaveText("-40°F");
  await input.fill("-273.16");
  await expect(page.getByRole("alert")).toContainText("absolute zero");
  await expect(copy).toBeDisabled();
  await page.reload();
  await expect(page.getByLabel("Decimal places", { exact: true })).toHaveValue("6");
});

test("clipboard rejection gives actionable feedback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => { throw new Error("denied"); } },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Copy failed. Select the result and copy manually.");
  await expect(page.locator(".result-number")).toHaveText("39.37in");
});

test("favorites persist while product data stays out of storage", async ({ page }) => {
  await page.goto("/");
  await page.locator("summary").click();
  await page.getByRole("combobox", { name: "Target market", exact: true }).selectOption("DE");
  await page.getByRole("button", { name: "Save market" }).click();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 Germany" })).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Product specs", exact: true }).click();
  await page.getByRole("textbox").fill("PRIVATE-SKU,1,2,3,4");
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain("PRIVATE-SKU");
  await page.reload();
  await page.locator("summary").click();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 Germany" })).toBeVisible();
  await page.getByRole("button", { name: "Saved" }).click();
  await page.reload();
  await page.locator("summary").click();
  await expect(page.locator(".favorites").getByRole("button", { name: "🇩🇪 Germany" })).toHaveCount(0);
});

test("corrupt stored preferences recover to usable defaults", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unitport.preferences.v1", "{broken"));
  await page.goto("/");
  await page.locator("summary").click();
  await expect(page.getByRole("combobox", { name: "Target market", exact: true })).toHaveValue("US");
  await expect(page.locator(".result-number")).toHaveText("39.37in");
  await expect(page.getByText("Preferences saved locally")).toBeVisible();
});

test("unit overrides, market switching and language persist on the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Target unit", { exact: true }).selectOption("ft");
  await page.getByLabel("Enter value", { exact: true }).fill("30.48");
  await expect(page.locator(".result-number")).toHaveText("1ft");
  await page.reload();
  await expect(page.getByLabel("Target unit", { exact: true })).toHaveValue("ft");
  await page.locator("summary").click();
  await page.locator(".favorites").getByRole("button", { name: "🇯🇵 Japan" }).click();
  await expect(page.getByLabel("Target market", { exact: true })).toHaveValue("JP");
  await expect(page.getByLabel("Target unit", { exact: true })).toHaveValue("cm");
  await page.getByRole("button", { name: "切换到中文" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("尺寸、重量，一换就能用。");
  await expect(page.getByRole("button", { name: "Switch to English" })).toBeVisible();
});
