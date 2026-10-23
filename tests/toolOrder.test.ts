import test from "node:test";
import assert from "node:assert/strict";
import { defaultToolOrder, normalizeToolOrder } from "../src/config/toolOrder.ts";
import { parsePreferences } from "../src/core/preferences.ts";
test("old preferences gain the new default order without losing market choices", () => {
  const p = parsePreferences(JSON.stringify({version: 1, locale: "zh", source: "CN", target: "JP", favorites: ["JP"]}));
  assert.deepEqual(p.toolOrder, defaultToolOrder);
  assert.equal(p.target, "JP"); assert.deepEqual(p.favorites, ["JP"]);
});
test("personal order removes unknown and duplicate tools and appends missing tools", () => {
  const order = normalizeToolOrder(["temperature", "currency", "currency", "unknown", 123]);
  assert.deepEqual(order.slice(0, 2), ["temperature", "currency"]);
  assert.equal(order.length, defaultToolOrder.length);
  assert.deepEqual(new Set(order), new Set(defaultToolOrder));
  const p = parsePreferences(JSON.stringify({version: 1, toolOrder: order}));
  assert.deepEqual(p.toolOrder, order);
  assert.deepEqual(normalizeToolOrder(null), defaultToolOrder);
});
