import { markets, market } from "../config/markets.ts";
import { unitsFor } from "./units.ts";
import type { Category } from "./units.ts";
import type { Locale } from "../config/markets.ts";
export type Pair = { from: string; to: string };
export type Preferences = {
  version: 1;
  locale: Locale;
  source: string;
  target: string;
  favorites: string[];
  pairs: Record<Category, Pair>;
  sourceZone: string;
  targetZone: string;
  precision: number;
};
export const key = "unitport.preferences.v1";
export function defaultPreferences(): Preferences {
  return {
    version: 1,
    locale: "en",
    source: "CN",
    target: "US",
    favorites: ["US", "GB", "JP"],
    pairs: recommendedPairs("CN", "US"),
    sourceZone: "Asia/Shanghai",
    targetZone: "America/Los_Angeles",
    precision: 2,
  };
}
export function recommendedPairs(
  source: string,
  target: string,
): Record<Category, Pair> {
  return Object.fromEntries(
    (["length", "weight", "volume", "temperature"] as Category[]).map((c) => [
      c,
      {
        from: market(source).recommended[c],
        to: market(target).recommended[c],
      },
    ]),
  ) as Record<Category, Pair>;
}
export function parsePreferences(raw: string | null): Preferences {
  const defaults = defaultPreferences();
  if (!raw) return defaults;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return defaults;
    const known = (code: unknown): code is string =>
      typeof code === "string" && markets.some((m) => m.code === code);
    const source = known(data.source) ? data.source : defaults.source;
    const target = known(data.target) ? data.target : defaults.target;
    const pairs = recommendedPairs(source, target);
    for (const category of Object.keys(pairs) as Category[]) {
      const candidate = data.pairs?.[category];
      if (
        candidate &&
        unitsFor(category).some((u) => u.id === candidate.from) &&
        unitsFor(category).some((u) => u.id === candidate.to)
      )
        pairs[category] = { from: candidate.from, to: candidate.to };
    }
    const validZone = (code: string, zone: unknown) =>
      typeof zone === "string" &&
      market(code).cities.some((c) => c.zone === zone);
    return {
      version: 1,
      locale: data.locale === "en" ? "en" : "zh",
      source,
      target,
      pairs,
      favorites: Array.isArray(data.favorites)
        ? [...new Set<string>(data.favorites.filter(known))].slice(0, 12)
        : defaults.favorites,
      sourceZone: validZone(source, data.sourceZone)
        ? data.sourceZone
        : market(source).cities[0].zone,
      targetZone: validZone(target, data.targetZone)
        ? data.targetZone
        : market(target).cities[0].zone,
      precision: [2, 4, 6].includes(data.precision) ? data.precision : 2,
    };
  } catch {
    return defaults;
  }
}
export function readPreferences(): {
  preferences: Preferences;
  available: boolean;
} {
  try {
    return {
      preferences: parsePreferences(localStorage.getItem(key)),
      available: true,
    };
  } catch {
    return { preferences: defaultPreferences(), available: false };
  }
}
