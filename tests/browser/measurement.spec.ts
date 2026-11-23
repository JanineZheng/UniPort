import { test, expect } from '@playwright/test';

type EventRecord = { event: string; parameters: Record<string, string> };
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { usageEvents?: unknown[] };
    target.usageEvents = [];
    window.addEventListener('uniport:measurement', event => target.usageEvents!.push((event as CustomEvent).detail));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
  });
});
async function events(page: import('@playwright/test').Page): Promise<EventRecord[]> {
  return page.evaluate(() => (window as Window & { usageEvents?: EventRecord[] }).usageEvents || []);
}

for (const tool of [
  { path: '/product-specs-converter', id: 'specs', field: 'Batch input · optional SKU, length, width, height, weight', value: 'PRIVATE-SKU-987,31,22,13,0.7', copy: 'Copy all English specs' },
  { path: '/dimensions-converter', id: 'dimensions', field: 'Length', value: '31', copy: 'Copy result' },
  { path: '/cubic-feet-calculator', id: 'cubic', field: 'Length', value: '31', copy: 'Copy result' },
  { path: '/cm-to-inches', id: 'length', field: 'Enter value', value: '31', copy: 'Copy result' },
]) {
  test(`${tool.id}: default excluded, manual copy qualifies once, payload contains no product data`, async ({ page }) => {
    const external: string[] = [];
    page.on('request', request => { if (/google-analytics|googletagmanager/.test(request.url())) external.push(request.url()); });
    await page.goto(tool.path);
    const button = page.getByRole('button', { name: tool.copy, exact: true });
    await button.click();
    expect((await events(page)).some(e => e.event === 'effective_use')).toBe(false);
    const input = tool.id === 'specs' ? page.getByRole('textbox') : page.getByLabel(tool.field, { exact: true });
    await input.fill(tool.value);
    await button.click(); await button.click();
    await expect.poll(async () => (await events(page)).filter(e => e.event === 'effective_use').length).toBe(1);
    const records = await events(page);
    for (const record of records) {
      expect(Object.keys(record.parameters).sort()).toEqual(['input_origin', 'measurement_version', 'tool_id', 'ui_language']);
      expect(record.parameters.tool_id).toBe(tool.id);
      expect(JSON.stringify(record)).not.toContain('PRIVATE-SKU');
      expect(JSON.stringify(record)).not.toContain(tool.value);
    }
    expect(external).toEqual([]);
  });
}

test('example selection, invalid data and clipboard failure do not qualify', async ({ page }) => {
  await page.goto('/dimensions-converter');
  await page.getByRole('button', { name: '25.4 × 50.8 × 76.2 cm ↗', exact: true }).click();
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  expect((await events(page)).some(e => e.event === 'effective_use')).toBe(false);
  await page.getByLabel('Length', { exact: true }).fill('-1');
  await expect(page.getByRole('button', { name: 'Copy result', exact: true })).toBeDisabled();
  await page.getByLabel('Length', { exact: true }).fill('37');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await expect.poll(async () => (await events(page)).some(e => e.event === 'copy_failure')).toBe(true);
  expect((await events(page)).some(e => e.event === 'effective_use')).toBe(false);
});

test('rapid edits debounce result events; no result event is emitted on initial render', async ({ page }) => {
  await page.goto('/cm-to-inches');
  expect(await events(page)).toEqual([]);
  const input = page.getByLabel('Enter value', { exact: true });
  await input.fill('3'); await input.fill('31'); await input.fill('312');
  await expect.poll(async () => (await events(page)).filter(e => e.event === 'conversion_success').length).toBe(1);
  expect((await events(page)).filter(e => e.event === 'conversion_start')).toHaveLength(1);
  expect((await events(page)).some(e => e.event === 'effective_use')).toBe(false);
});

test('internal test marker suppresses product events', async ({ page }) => {
  await page.goto('/product-specs-converter?unitport_internal=1');
  await page.getByRole('textbox').fill('PRIVATE-SKU,32,23,14,0.8');
  await page.getByRole('button', { name: 'Copy all English specs', exact: true }).click();
  expect(await events(page)).toEqual([]);
});
