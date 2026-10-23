import { test, expect } from "@playwright/test";
const defaults = ["Currency", "Weight", "Dimensions", "Cubic feet / CBM", "Length", "Product specs", "Time zones", "Volume", "Temperature"];
test("keyboard sorting persists across pages, updates shortcuts and resets", async ({page}) => {
  await page.goto("/");
  const labels = () => page.getByRole("navigation").getByRole("link").locator("span:nth-child(2)");
  await expect(labels()).toHaveText(defaults);
  await page.getByRole("button", {name: "Customize order", exact: true}).click();
  await page.getByRole("button", {name: "Move Weight", exact: true}).focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", {name: "Done sorting", exact: true}).click();
  await expect(labels()).toHaveText(["Weight", "Currency", ...defaults.slice(2)]);
  await expect(page.locator('.quick-start a strong')).toHaveText(["Weight", "Currency", "Dimensions"]);
  await page.getByRole("button", {name: "切换到中文"}).click();
  await page.getByRole("navigation").getByRole("link", {name: "长度", exact: true}).click();
  await expect(page.getByRole("navigation").getByRole("link").first()).toHaveAccessibleName("重量");
  await page.reload();
  await expect(page.getByRole("navigation").getByRole("link").first()).toHaveAccessibleName("重量");
  await page.getByRole("button", {name: "调整排序", exact: true}).click();
  await page.getByRole("button", {name: "恢复默认", exact: true}).click();
  await page.getByRole("button", {name: "完成排序", exact: true}).click();
  await expect(page.getByRole("navigation").getByRole("link").first()).toHaveAccessibleName("汇率");
  await page.reload();
  await expect(page.getByRole("navigation").getByRole("link").first()).toHaveAccessibleName("汇率");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("cards drag horizontally and vertically using mouse or touch", async ({page, context}, info) => {
  await page.goto("/kg-to-lbs");
  await page.getByRole("button", {name: "Customize order", exact: true}).click();
  const card = (name: string) => page.getByRole("button", {name: `Move ${name}`, exact: true});
  await card("Currency").scrollIntoViewIfNeeded();
  async function drag(from: string, to: string) {
    const a = await card(from).boundingBox(), b = await card(to).boundingBox();
    if (!a || !b) throw new Error("missing card");
    const x = a.x+a.width/2, y = a.y+a.height/2, tx=b.x+b.width/2, ty=b.y+b.height/2;
    if (info.project.name === "mobile") {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", {type: "touchStart", touchPoints: [{x,y}]});
      for (let i=1;i<=8;i++) await cdp.send("Input.dispatchTouchEvent", {type: "touchMove", touchPoints: [{x:x+(tx-x)*i/8,y:y+(ty-y)*i/8}]});
      await cdp.send("Input.dispatchTouchEvent", {type: "touchEnd", touchPoints: []});
      await cdp.detach();
    } else {
      await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(tx,ty,{steps: 8}); await page.mouse.up();
    }
  }
  await drag("Currency", "Weight");
  await expect(page.locator('[data-sort-tool]').first()).toHaveAttribute("data-sort-tool", "weight");
  await drag("Currency", "Cubic feet / CBM");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("unitport.preferences.v1")!).toolOrder);
  expect(saved.indexOf("currency")).toBeGreaterThan(1);
  await page.getByRole("button", {name: "Done sorting", exact: true}).click();
  await page.reload();
  const hrefs = await page.getByRole("navigation").getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")));
  expect(hrefs[0]).toBe("/kg-to-lbs"); expect(hrefs.indexOf("/currency-converter")).toBeGreaterThan(1);
});
