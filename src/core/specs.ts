import { convert, decimal, format } from "./convert.ts";
import { unit } from "./units.ts";
export type SpecUnits = {
  lengthFrom: string;
  lengthTo: string;
  weightFrom: string;
  weightTo: string;
};
export type SpecRow = {
  line: number;
  sku: string;
  text?: string;
  error?: string;
};
// TSV (spreadsheet paste) or simple CSV, optional SKU, no header; deliberately reject quoted CSV.
export function convertSpecs(
  input: string,
  selected: SpecUnits,
  precision = 2,
): SpecRow[] {
  if (input.length > 200000) throw new Error("batchSize");
  const lines = input
    .split(/\r?\n/)
    .map((text, i) => ({ text, line: i + 1 }))
    .filter((r) => r.text.trim());
  if (lines.length > 500) throw new Error("batchSize");
  if (
    unit(selected.lengthFrom).category !== "length" ||
    unit(selected.lengthTo).category !== "length" ||
    unit(selected.weightFrom).category !== "weight" ||
    unit(selected.weightTo).category !== "weight"
  )
    throw new Error("category");
  return lines.map(({ text, line }) => {
    let sku = `Item ${line}`;
    try {
      if (text.includes('"')) throw new Error("columns");
      const fields = text
        .split(text.includes("\t") ? "\t" : ",")
        .map((s) => s.trim());
      if (fields.length === 5) sku = fields.shift() || sku;
      if (fields.length !== 4) throw new Error("columns");
      if (fields.some((s) => decimal(s).n <= 0n)) throw new Error("positive");
      const dimensions = fields
        .slice(0, 3)
        .map((n) =>
          format(convert(n, selected.lengthFrom, selected.lengthTo), precision),
        );
      const weight = format(
        convert(fields[3], selected.weightFrom, selected.weightTo),
        precision,
      );
      return {
        line,
        sku,
        text: `${sku} — Dimensions (L × W × H): ${dimensions.join(" × ")} ${unit(selected.lengthTo).symbol}; Weight: ${weight} ${unit(selected.weightTo).symbol}.`,
      };
    } catch (error) {
      return {
        line,
        sku,
        error: error instanceof Error ? error.message : "number",
      };
    }
  });
}
