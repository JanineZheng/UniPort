import { test, expect } from '@playwright/test';
test('English-first home, local language preference and no horizontal overflow', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Keep your page. Convert in the side panel.');
  await page.goto('/cm-to-inches');
  await page.getByRole('button',{name:'25.4 cm',exact:true}).click();
  await expect(page.locator('.result-number')).toHaveText('10in');
  await page.getByRole('button',{name:'切换到中文'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Switch to English'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('dimensions paste, validation and copied LWH order', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/dimensions-converter');
  await page.getByLabel('Paste L × W × H (optional unit)').fill('25.4 x 50.8 x 76.2 cm');
  await page.getByRole('button',{name:'Use dimensions',exact:true}).click();
  await expect(page.locator('.shipping-number')).toContainText('10 × 20 × 30');
  await page.getByRole('button',{name:'Copy result',exact:true}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Dimensions (L × W × H): 10 × 20 × 30 in');
  await page.getByLabel('Paste L × W × H (optional unit)').fill('bad dimensions');
  await page.getByRole('button',{name:'Use dimensions',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
test('box quantities calculate exact cubic feet, reject fractional box counts', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/cubic-feet-calculator');
  await expect(page.locator('.shipping-number')).toContainText('6 ft³');
  await page.getByLabel('Identical boxes').fill('1.5');
  await expect(page.getByRole('button',{name:'Copy result',exact:true})).toBeDisabled();
  await page.getByLabel('Identical boxes').fill('4');
  await expect(page.locator('.shipping-number')).toContainText('12 ft³');
  await page.getByLabel('Decimal places',{exact:true}).selectOption('6');
  await page.getByRole('button',{name:'Copy result',exact:true}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('12 ft³ (0.339802 m³) — 4 boxes, 24 × 18 × 12 in each');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('batch invalid rows block copy; complete rows copy English specs', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/product-specs-converter');
  await page.getByRole('textbox').fill('A,25.4,50.8,76.2,0.45359237\nB,0,1,2,3');
  await expect(page.getByRole('button',{name:'Copy all English specs'})).toBeDisabled();
  await page.getByRole('textbox').fill('A,25.4,50.8,76.2,0.45359237');
  await page.getByRole('button',{name:'Copy all English specs'}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('A — Dimensions (L × W × H): 10 × 20 × 30 in; Weight: 1 lb.');
});
test('DST overlap and gap require explicit handling', async ({page}) => {
  await page.goto('/time-zone-converter');
  await page.getByLabel('Your country / region').selectOption('US');
  await page.getByLabel('Source city',{exact:true}).selectOption('America/New_York');
  await page.getByLabel('Local date and time in source city').fill('2026-11-01T01:30');
  await expect(page.getByRole('button',{name:'Copy time in English'})).toBeDisabled();
  await page.getByRole('radio').first().check();
  await expect(page.getByRole('button',{name:'Copy time in English'})).toBeEnabled();
  await page.getByLabel('Local date and time in source city').fill('2026-03-08T02:30');
  await expect(page.getByRole('alert')).toContainText('does not exist');
  await expect(page.getByRole('button',{name:'Copy time in English'})).toBeDisabled();
});
test('blocked local storage still allows conversions', async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}}));
  await page.goto('/');
  await page.locator('.market-settings > summary').click();
  await expect(page.getByText('Preferences are session-only')).toBeVisible();
  await page.getByLabel('Enter value',{exact:true}).fill('2.54');
  await expect(page.locator('.result-number')).toHaveText('1in');
});

