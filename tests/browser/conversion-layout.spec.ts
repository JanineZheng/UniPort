import { test, expect } from '@playwright/test';

test('currency direction, nearby result and copy work without stale pair reuse', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('https://api.frankfurter.dev/**', route => {
    const url = new URL(route.request().url());
    const base = url.searchParams.get('base')!;
    const quote = url.searchParams.get('quotes')!;
    return route.fulfill({ json: [{ base, quote, rate: base === 'CNY' ? 0.15 : 6.666666, date: new Date().toISOString().slice(0, 10) }] });
  });
  await page.goto('/currency-converter');
  const result = page.getByTestId('fx-result');
  await expect(result).toHaveText('15 USD');
  const amountRow = await page.locator('.fx-amount-row').boundingBox();
  const resultCard = await page.locator('.fx-result-card').boundingBox();
  expect(resultCard!.y - (amountRow!.y + amountRow!.height)).toBeLessThanOrEqual(24);
  const source = await page.getByLabel('Source currency', { exact: true }).boundingBox();
  const swap = page.getByRole('button', { name: 'Swap currencies' });
  const swapBox = await swap.boundingBox();
  const target = await page.getByLabel('Target currency', { exact: true }).boundingBox();
  expect(swapBox!.x).toBeGreaterThanOrEqual(source!.x + source!.width);
  expect(swapBox!.x + swapBox!.width).toBeLessThanOrEqual(target!.x);
  expect(swapBox!.width).toBeGreaterThanOrEqual(44);
  await swap.click();
  await expect(page.getByLabel('Source currency', { exact: true })).toHaveValue('USD');
  await expect(page.getByLabel('Target currency', { exact: true })).toHaveValue('CNY');
  await expect(result).toHaveText('666.67 CNY');
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('666.67 CNY');
  await page.getByLabel('Amount', { exact: true }).fill('-1');
  await expect(result).toHaveText('—');
  await expect(page.getByRole('button', { name: 'Copy result', exact: true })).toBeDisabled();
});

test('dimensions, specification and city swaps update both sides', async ({ page }) => {
  await page.goto('/dimensions-converter');
  await page.getByRole('button', { name: 'Swap dimension units', exact: true }).click();
  await expect(page.getByLabel('Dimension unit', { exact: true })).toHaveValue('in');
  await expect(page.getByLabel('Result unit', { exact: true })).toHaveValue('cm');
  await expect(page.locator('.shipping-number')).toContainText('64.52 × 129.03 × 193.55');
  await page.goto('/product-specs-converter');
  await page.getByRole('button', { name: 'Swap dimension units', exact: true }).click();
  await page.getByRole('button', { name: 'Swap weight units', exact: true }).click();
  await expect(page.getByLabel('Source dimensions', { exact: true })).toHaveValue('in');
  await expect(page.getByLabel('Target dimensions', { exact: true })).toHaveValue('cm');
  await expect(page.getByLabel('Source weight', { exact: true })).toHaveValue('lb');
  await expect(page.getByLabel('Target weight', { exact: true })).toHaveValue('kg');
  await page.goto('/time-zone-converter');
  const source = await page.getByLabel('Source city', { exact: true }).inputValue();
  const target = await page.getByLabel('Target city', { exact: true }).inputValue();
  await page.getByRole('button', { name: 'Swap cities' }).click();
  await expect(page.getByLabel('Source city', { exact: true })).toHaveValue(target);
  await expect(page.getByLabel('Target city', { exact: true })).toHaveValue(source);
  await expect(page.getByRole('button', { name: 'Copy time in English' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
