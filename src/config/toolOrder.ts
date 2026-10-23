// Prioritize pricing and shipping workflows; category-specific tools come later.
export const defaultToolOrder = [
  "currency", "weight", "dimensions", "cubic", "length", "specs", "time", "volume", "temperature",
] as const;
export type Tool = typeof defaultToolOrder[number];

// Preserve valid personal choices while appending tools introduced in later releases.
export function normalizeToolOrder(value: unknown): Tool[] {
  const known = (id: unknown): id is Tool => typeof id === "string" && defaultToolOrder.some(tool => tool === id);
  const saved = Array.isArray(value) ? value.filter(known) : [];
  return [...new Set([...saved, ...defaultToolOrder])];
}
