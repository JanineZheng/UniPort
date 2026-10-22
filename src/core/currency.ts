// Phase 2 contract only. No provider, fabricated rate, API key or browser network request.
export type FxQuote = {
  base: string;
  quote: string;
  rate: string;
  asOf: string;
  source: string;
};
export interface FxProvider {
  getQuote(base: string, quote: string, signal?: AbortSignal): Promise<FxQuote>;
}
export const fxStatus = "not-connected" as const;
