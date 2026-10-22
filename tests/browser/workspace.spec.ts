import { test, expect } from "@playwright/test";
test("unit conversion, overrides, market switching, persistence and language", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "跨越单位，连接市场。",
  );
  await expect(page.locator(".result-number")).toHaveText("39.37in");
  await page.getByLabel("目标单位", { exact: true }).selectOption("ft");
  await page.getByLabel("输入数值", { exact: true }).fill("30.48");
  await expect(page.locator(".result-number")).toHaveText("1ft");
  await page.reload();
  await expect(page.getByLabel("目标单位", { exact: true })).toHaveValue("ft");
  await page
    .locator(".favorites")
    .getByRole("button", { name: "🇯🇵 日本" })
    .click();
  await expect(page.getByLabel("目标市场", { exact: true })).toHaveValue("JP");
  await expect(page.getByLabel("目标单位", { exact: true })).toHaveValue("cm");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Different units. One workspace.",
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "切换到中文" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("batch validation blocks incomplete copy and copies exact English output", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "商品规格" })
    .click();
  await page
    .getByRole("textbox")
    .fill("A,25.4,50.8,76.2,0.45359237\nB,0,1,2,3");
  await expect(
    page.getByRole("button", { name: "复制全部英文规格" }),
  ).toBeDisabled();
  await page.getByRole("textbox").fill("A,25.4,50.8,76.2,0.45359237");
  await page.getByRole("button", { name: "复制全部英文规格" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "A — Dimensions (L × W × H): 10 × 20 × 30 in; Weight: 1 lb.",
  );
});
test("DST overlap requires choice, gap has no output, currency is honest", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("所在国家 / 地区").selectOption("US");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "时区", exact: false })
    .click();
  await page
    .getByLabel("出发城市", { exact: true })
    .selectOption("America/New_York");
  await page.getByLabel("出发城市的当地日期与时间").fill("2026-11-01T01:30");
  await expect(
    page.getByRole("button", { name: "复制英文时间" }),
  ).toBeDisabled();
  await page.getByRole("radio").first().check();
  await expect(
    page.getByRole("button", { name: "复制英文时间" }),
  ).toBeEnabled();
  await page.getByLabel("出发城市的当地日期与时间").fill("2026-03-08T02:30");
  await expect(page.getByRole("alert")).toContainText("不存在");
  await expect(
    page.getByRole("button", { name: "复制英文时间" }),
  ).toBeDisabled();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "汇率", exact: false })
    .click();
  await expect(
    page.getByText("尚未接入汇率数据源，因此暂不提供换算数值。"),
  ).toBeVisible();
});
test("storage unavailable does not break the workspace", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/");
  await expect(page.getByText("偏好仅本次有效")).toBeVisible();
  await page.getByLabel("输入数值", { exact: true }).fill("2.54");
  await expect(page.locator(".result-number")).toHaveText("1in");
});
