import { convert, decimal, format } from './convert.ts';
import type { Fraction } from './convert.ts';
const multiply = (a: Fraction, b: Fraction): Fraction => ({ n: a.n * b.n, d: a.d * b.d });
export function boxVolume(values: string[], from: string, quantity: string, precision = 4) {
  if (values.length !== 3) throw new Error('columns');
  const count = decimal(quantity);
  if (count.n <= 0n || count.n % count.d !== 0n) throw new Error('quantity');
  const edges = values.map(value => {
    const edge = convert(value, from, 'm');
    if (edge.n <= 0n) throw new Error('positive');
    return edge;
  });
  const meters = edges.reduce(multiply, count);
  const foot = convert('1', 'ft', 'm');
  const cubicFoot = multiply(multiply(foot, foot), foot);
  return { cbm: format(meters, precision), cuft: format({ n: meters.n * cubicFoot.d, d: meters.d * cubicFoot.n }, precision) };
}
export function parseDimensions(input: string) {
  const match = input.trim().match(/^([\d.]+)\s*[x×*,]\s*([\d.]+)\s*[x×*,]\s*([\d.]+)\s*(cm|mm|in|ft|m)?$/i);
  if (!match) throw new Error('dimensions');
  const values = match.slice(1,4);
  for (const value of values) if (decimal(value).n <= 0n) throw new Error('positive');
  return { values, unit: match[4]?.toLowerCase() };
}
