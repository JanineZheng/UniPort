import { decimal, format } from "./convert.ts";

export const FX_SOURCE = "Frankfurter";
export const FX_SOURCE_URL = "https://frankfurter.dev/";
export const FX_REFRESH_MS = 15 * 60_000;
export const FX_CHECK_TTL_MS = 30 * 60_000;
export type FxQuote = {
  base: string;
  quote: string;
  rate: string;
  asOf: string;
  fetchedAt: number;
  providers: string[];
};
export function parseQuote(data: unknown, base: string, quote: string, now: number): FxQuote {
  if (!Array.isArray(data) || data.length !== 1) throw new Error("invalid");
  const row = data[0];
  if (!row || row.base !== base || row.quote !== quote ||
      typeof row.rate !== "number" || !Number.isFinite(row.rate) || row.rate <= 0 ||
      typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error("invalid");
  const date = Date.parse(`${row.date}T00:00:00Z`);
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== row.date ||
      row.date > new Date(now).toISOString().slice(0, 10)) throw new Error("invalid");
  return { base, quote, rate: String(row.rate), asOf: row.date, fetchedAt: now,
    providers: Array.isArray(row.providers) ? row.providers.flatMap((p: unknown) => typeof p === "string" ? [p] : p && typeof p === "object" && "key" in p && typeof p.key === "string" ? [p.key] : []) : [] };
}
export function isFxStale(quote: FxQuote, now: number): boolean {
  const today = Date.parse(`${new Date(now).toISOString().slice(0, 10)}T00:00:00Z`);
  return today - Date.parse(`${quote.asOf}T00:00:00Z`) > 3 * 86_400_000 ||
    now - quote.fetchedAt >= FX_CHECK_TTL_MS || now < quote.fetchedAt;
}
export async function fetchQuote(base: string, quote: string, signal: AbortSignal): Promise<FxQuote> {
  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote) || base === quote) throw new Error("invalid");
  const url = `https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quote}&expand=providers`;
  const response = await fetch(url, { signal, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw new Error(response.status === 404 || response.status === 422 ? "unavailable" : "request");
  return parseQuote(await response.json(), base, quote, Date.now());
}
export function convertCurrency(amount: string, rate: string, precision: number): string {
  const a = decimal(amount), r = decimal(rate);
  if (a.n < 0n) throw new Error("negative");
  return format({ n: a.n * r.n, d: a.d * r.d }, precision);
}
