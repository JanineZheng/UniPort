import { unit } from "./units.ts";

export type Fraction = { n: bigint; d: bigint };
const fraction = (n: bigint, d = 1n): Fraction => ({ n, d });
export function decimal(value: string): Fraction {
  const input = value.trim();
  if (
    input.length > 100 ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d{1,2})?$/i.test(input)
  )
    throw new Error("number");
  const [mantissa, exponent = "0"] = input.toLowerCase().split("e");
  const exp = Number(exponent);
  if (Math.abs(exp) > 30) throw new Error("range");
  const digits = mantissa.replace(".", "");
  const scale = (mantissa.split(".")[1]?.length ?? 0) - exp;
  return scale >= 0
    ? fraction(BigInt(digits), 10n ** BigInt(scale))
    : fraction(BigInt(digits) * 10n ** BigInt(-scale));
}
const add = (a: Fraction, b: Fraction) =>
  fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
const divide = (a: Fraction, b: Fraction) => {
  if (b.n === 0n) throw new Error("zero");
  return fraction(a.n * b.d, a.d * b.n);
};
export function convert(value: string, fromId: string, toId: string): Fraction {
  const from = unit(fromId),
    to = unit(toId);
  if (from.category !== to.category) throw new Error("category");
  const input = decimal(value);
  if (from.category !== "temperature") {
    if (input.n < 0n) throw new Error("negative");
    return divide(mul(input, decimal(from.factor)), decimal(to.factor));
  }
  const kelvin =
    fromId === "k"
      ? input
      : fromId === "c"
        ? add(input, decimal("273.15"))
        : add(
            mul(add(input, decimal("-32")), fraction(5n, 9n)),
            decimal("273.15"),
          );
  if (kelvin.n < 0n) throw new Error("absoluteZero");
  return toId === "k"
    ? kelvin
    : toId === "c"
      ? add(kelvin, decimal("-273.15"))
      : add(
          mul(add(kelvin, decimal("-273.15")), fraction(9n, 5n)),
          decimal("32"),
        );
}
// Half away from zero; round only at the presentation boundary. Preserve tiny nonzero values.
export function format(value: Fraction, places = 2): string {
  if (!Number.isInteger(places) || places < 0 || places > 12)
    throw new Error("precision");
  const negative = value.n < 0n !== value.d < 0n;
  const n = value.n < 0n ? -value.n : value.n,
    d = value.d < 0n ? -value.d : value.d;
  if (d === 0n) throw new Error("zero");
  let digits = places;
  if (n > 0n && n * 10n ** BigInt(digits) * 2n < d) {
    while (n * 10n ** BigInt(digits) < d && digits < 140) digits++;
    digits += Math.max(1, places - 1);
  }
  const scale = 10n ** BigInt(digits);
  const scaled = (n * scale * 2n + d) / (d * 2n);
  const whole = scaled / scale;
  const tail = (scaled % scale)
    .toString()
    .padStart(digits, "0")
    .replace(/0+$/, "");
  return `${negative && scaled !== 0n ? "-" : ""}${whole}${tail ? `.${tail}` : ""}`;
}
