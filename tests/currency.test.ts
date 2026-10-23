import test from "node:test";
import assert from "node:assert/strict";
import { parseQuote, isFxStale, convertCurrency, fetchQuote, FX_CHECK_TTL_MS } from "../src/core/currency.ts";
const now = Date.parse("2026-10-23T12:00:00Z");
const row = { date: "2026-10-23", base: "CNY", quote: "USD", rate: 0.14993, providers: [{ key: "ECB", date: "2026-10-22", rate: 0.14983 }] };
test("quote validates pair, date and rate, keeping publication and retrieval dates separate", () => {
  const q = parseQuote([row], "CNY", "USD", now);
  assert.equal(q.asOf, "2026-10-23"); assert.equal(q.fetchedAt, now); assert.deepEqual(q.providers, ["ECB"]);
  for (const patch of [{rate: 0}, {rate: -1}, {rate: Infinity}, {rate: "0.14"}, {base: "EUR"}, {quote: "GBP"}, {date: "2026-02-30"}, {date: "2026-10-24"}, {date: "bad"}]) {
    assert.throws(() => parseQuote([{...row, ...patch}], "CNY", "USD", now), /invalid/);
  }
  for (const data of [null, [], {}, [row,row]]) assert.throws(() => parseQuote(data, "CNY", "USD", now), /invalid/);
});
test("old data stays expired after a successful new retrieval; TTL expires independently", () => {
  const q = parseQuote([row], "CNY", "USD", now);
  assert.equal(isFxStale(q, now), false);
  assert.equal(isFxStale(q, now + FX_CHECK_TTL_MS - 1), false);
  assert.equal(isFxStale(q, now + FX_CHECK_TTL_MS), true);
  assert.equal(isFxStale({...q, asOf: "2026-10-20"}, now), false);
  assert.equal(isFxStale({...q, asOf: "2026-10-19"}, now), true);
  assert.equal(isFxStale(q, now - 1), true);
});
test("currency calculation keeps decimal precision and rejects invalid amounts", () => {
  assert.equal(convertCurrency("100", "0.14993", 2), "14.99");
  assert.equal(convertCurrency("1.005", "1", 2), "1.01");
  assert.equal(convertCurrency("0", "0.14993", 2), "0");
  for (const amount of ["-1", "NaN", "1e31"]) assert.throws(() => convertCurrency(amount, "1", 2));
});
test("HTTP failure never returns a cached quote and requests exclude amounts and credentials", async (t) => {
  const calls: {url: string; options?: RequestInit}[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, options?: RequestInit) => {
    calls.push({url, options}); return new Response("{}", {status: 503});
  });
  await assert.rejects(fetchQuote("CNY", "USD", new AbortController().signal), /request/);
  assert.equal(calls[0].options?.cache, "no-store");
  assert.equal(calls[0].options?.credentials, "omit");
  assert.equal(new URL(calls[0].url).searchParams.has("amount"), false);
});
