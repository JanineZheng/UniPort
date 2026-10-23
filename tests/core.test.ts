import test from "node:test";
import assert from "node:assert/strict";
import { convert, decimal, format } from "../src/core/convert.ts";
import { units } from "../src/core/units.ts";
import { convertSpecs } from "../src/core/specs.ts";
import { resolveLocal, localInput, offsetLabel } from "../src/core/timezone.ts";
import {
  parsePreferences,
  defaultPreferences,
  recommendedPairs,
} from "../src/core/preferences.ts";
import { markets } from "../src/config/markets.ts";

for (const [value, from, to, expected] of [
  ["1", "in", "cm", "2.54"],
  ["1", "ft", "m", "0.3048"],
  ["1", "mi", "m", "1609.344"],
  ["1", "lb", "g", "453.59237"],
  ["1", "oz", "g", "28.349523125"],
  ["16", "oz", "lb", "1"],
  ["1", "us-floz", "ml", "29.5735295625"],
  ["1", "imp-floz", "ml", "28.4130625"],
  ["1", "us-gal", "ml", "3785.411784"],
  ["1", "imp-gal", "ml", "4546.09"],
  ["0", "c", "f", "32"],
  ["212", "f", "c", "100"],
  ["-40", "c", "f", "-40"],
  ["0", "k", "c", "-273.15"],
  ["-459.67", "f", "k", "0"],
])
  test(`${value} ${from} → ${to}`, () =>
    assert.equal(format(convert(value, from, to), 12), expected));

test("all same-category ratios and identity conversions retain exact rational values", () => {
  for (const from of units)
    for (const to of units.filter((u) => u.category === from.category)) {
      const forward = convert("123.456", from.id, to.id);
      // Independently compare to a known baseline ratio, without rounded intermediates.
      if (from.category !== "temperature") {
        const a = decimal(from.factor),
          b = decimal(to.factor),
          v = decimal("123.456");
        assert.equal(forward.n * v.d * a.d * b.n, forward.d * v.n * a.n * b.d);
      }
      const identity = convert("123.456", from.id, from.id);
      assert.equal(identity.n * 1000n, identity.d * 123456n);
    }
});
test("explicitly rejects invalid numbers, negative physical measurements and mismatched quantities", () => {
  for (const s of [
    "",
    "NaN",
    "Infinity",
    "1,000",
    "1 kg",
    "0x10",
    "1e99",
    "1".repeat(101),
  ])
    assert.throws(() => convert(s, "cm", "in"));
  assert.throws(() => convert("-1", "kg", "lb"), /negative/);
  assert.throws(() => convert("1", "oz", "us-floz"), /category/);
  assert.throws(() => convert("1", "unknown", "cm"), /unit/);
  assert.throws(() => convert("-273.15001", "c", "k"), /absoluteZero/);
  assert.throws(() => convert("-0.01", "k", "f"), /absoluteZero/);
});
test("rounds once, handles signed ties, leading decimals, zero and tiny values", () => {
  assert.equal(format(decimal("1.005"), 2), "1.01");
  assert.equal(format(decimal("-1.005"), 2), "-1.01");
  assert.equal(format(decimal("-0"), 2), "0");
  assert.equal(format(decimal(".5"), 2), "0.5");
  assert.equal(format(decimal("1e-8"), 2), "0.00000001");
  assert.equal(format(convert("100", "cm", "in"), 2), "39.37");
  assert.equal(format(convert("0.1", "cm", "mm"), 12), "1");
  assert.throws(() => format(decimal("1"), -1), /precision/);
});
const specUnits = {
  lengthFrom: "cm",
  lengthTo: "in",
  weightFrom: "kg",
  weightTo: "lb",
};
test("spreadsheet TSV and CSV generate English specs, preserving L × W × H order", () => {
  const rows = convertSpecs(
    "SKU-A\t25.4\t50.8\t76.2\t0.45359237\n2.54,5.08,7.62,0.90718474",
    specUnits,
  );
  assert.equal(
    rows[0].text,
    "SKU-A — Dimensions (L × W × H): 10 × 20 × 30 in; Weight: 1 lb.",
  );
  assert.equal(
    rows[1].text,
    "Item 2 — Dimensions (L × W × H): 1 × 2 × 3 in; Weight: 2 lb.",
  );
});
test("batch reports row-level errors without silently dropping invalid records", () => {
  const rows = convertSpecs(
    'ok,1,2,3,4\nzero,0,1,2,3\nbad,1,2\nquote,"1",2,3,4\nnegative,-1,2,3,4',
    specUnits,
  );
  assert.equal(rows.length, 5);
  assert.equal(rows.filter((r) => r.text).length, 1);
  assert.deepEqual(
    rows.slice(1).map((r) => r.error),
    ["positive", "columns", "columns", "positive"],
  );
  assert.equal(convertSpecs("\n\n", specUnits).length, 0);
  assert.throws(
    () => convertSpecs("1,2,3,4\n".repeat(501), specUnits),
    /batchSize/,
  );
  assert.throws(() => convertSpecs("x".repeat(200001), specUnits), /batchSize/);
});
test("NY DST spring gap is rejected and autumn overlap has two distinct instants", () => {
  assert.equal(
    resolveLocal("2026-03-08T02:30", "America/New_York").status,
    "gap",
  );
  const result = resolveLocal("2026-11-01T01:30", "America/New_York");
  assert.equal(result.status, "ambiguous");
  assert.deepEqual(
    result.instants.map((ms) => new Date(ms).toISOString()),
    ["2026-11-01T05:30:00.000Z", "2026-11-01T06:30:00.000Z"],
  );
});
test("Shanghai to LA uses the selected date, with winter and summer offsets", () => {
  for (const [date, expected] of [
    ["2026-01-15T12:00", "2026-01-14T20:00"],
    ["2026-07-15T12:00", "2026-07-14T21:00"],
  ]) {
    const r = resolveLocal(date, "Asia/Shanghai");
    assert.equal(r.status, "valid");
    assert.equal(localInput(r.instants[0], "America/Los_Angeles"), expected);
  }
});
test("non-hour offsets, southern hemisphere DST and no-DST cities", () => {
  const lordHowe = resolveLocal("2026-04-05T01:45", "Australia/Lord_Howe");
  assert.equal(lordHowe.status, "ambiguous");
  assert.equal(lordHowe.instants[1] - lordHowe.instants[0], 1800000);
  assert.equal(
    resolveLocal("2026-10-04T02:15", "Australia/Lord_Howe").status,
    "gap",
  );
  assert.equal(
    offsetLabel(
      resolveLocal("2026-01-15T12:00", "Asia/Kolkata").instants[0],
      "Asia/Kolkata",
    ),
    "GMT+05:30",
  );
  assert.equal(
    resolveLocal("2026-03-08T02:30", "America/Phoenix").status,
    "valid",
  );
  assert.equal(resolveLocal("2011-12-30T12:00", "Pacific/Apia").status, "gap");
});
test("London transitions and invalid calendar dates", () => {
  assert.equal(resolveLocal("2026-03-29T01:30", "Europe/London").status, "gap");
  assert.equal(
    resolveLocal("2026-10-25T01:30", "Europe/London").status,
    "ambiguous",
  );
  for (const input of [
    "",
    "2026-02-30T10:00",
    "2026-13-01T10:00",
    "2026-01-01T24:00",
    "1899-01-01T10:00",
    "2101-01-01T10:00",
  ])
    assert.throws(() => resolveLocal(input, "UTC"), /date/);
});
test("preference parsing recovers from corruption and validates all stored fields", () => {
  assert.deepEqual(parsePreferences("{broken"), defaultPreferences());
  assert.deepEqual(
    parsePreferences(JSON.stringify({ version: 2 })),
    defaultPreferences(),
  );
  const p = parsePreferences(
    JSON.stringify({
      version: 1,
      source: "XX",
      target: "JP",
      favorites: ["JP", "JP", "XX", 123],
      precision: 99,
      locale: "en",
      sourceZone: "xxx",
      targetZone: "UTC",
      pairs: { length: { from: "kg", to: "oz" } },
    }),
  );
  assert.equal(p.source, "CN");
  assert.equal(p.target, "JP");
  assert.equal(p.locale, "en");
  assert.deepEqual(p.favorites, ["JP"]);
  assert.equal(p.precision, 2);
  assert.equal(p.targetZone, "Asia/Tokyo");
  assert.deepEqual(p.pairs.length, { from: "cm", to: "cm" });
  const custom = defaultPreferences();
  custom.pairs.length = { from: "ft", to: "m" };
  custom.favorites = [];
  assert.deepEqual(parsePreferences(JSON.stringify(custom)), custom);
});
test("every market recommendation and IANA city is valid; config never affects conversion", () => {
  for (const m of markets) {
    const pairs = recommendedPairs("CN", m.code);
    for (const category of [
      "length",
      "weight",
      "volume",
      "temperature",
    ] as const)
      assert.ok(
        units.some(
          (u) => u.id === pairs[category].to && u.category === category,
        ),
      );
    for (const city of m.cities)
      assert.equal(resolveLocal("2026-07-15T10:00", city.zone).status, "valid");
  }
});
