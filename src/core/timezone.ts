const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(zone: string) {
  if (!formatters.has(zone))
    formatters.set(
      zone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        calendar: "iso8601",
        numberingSystem: "latn",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }),
    );
  return formatters.get(zone)!;
}
function parts(instant: number, zone: string) {
  return Object.fromEntries(
    formatter(zone)
      .formatToParts(instant)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}
function wallMillis(instant: number, zone: string) {
  const p = parts(instant, zone);
  const date = new Date(0);
  date.setUTCFullYear(p.year, p.month - 1, p.day);
  date.setUTCHours(p.hour, p.minute, p.second, 0);
  return date.getTime();
}
export function localInput(instant: number, zone: string) {
  const p = parts(instant, zone),
    pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
export type TimeResult = {
  status: "valid" | "ambiguous" | "gap";
  instants: number[];
};
// Enumerate real offsets around the requested date, then verify every candidate by round-trip.
// No fixed country offset or assumed one-hour DST transition.
export function resolveLocal(local: string, zone: string): TimeResult {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error("date");
  const naive = Date.parse(`${local}:00Z`);
  const year = Number(local.slice(0, 4));
  if (
    !Number.isFinite(naive) ||
    year < 1900 ||
    year > 2100 ||
    localInput(naive, "UTC") !== local
  )
    throw new Error("date");
  const offsets = new Set<number>();
  for (let h = -48; h <= 48; h += 6) {
    const sample = naive + h * 3600000;
    offsets.add(wallMillis(sample, zone) - sample);
  }
  const instants = [...offsets]
    .map((offset) => naive - offset)
    .filter((t) => localInput(t, zone) === local)
    .sort((a, b) => a - b);
  return {
    status:
      instants.length === 0
        ? "gap"
        : instants.length > 1
          ? "ambiguous"
          : "valid",
    instants,
  };
}
export function describeTime(
  instant: number,
  zone: string,
  locale: "zh" | "en",
) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    timeZone: zone,
    dateStyle: "full",
    timeStyle: "long",
    hourCycle: "h23",
  }).format(instant);
}
export function offsetLabel(instant: number, zone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: zone,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((p) => p.type === "timeZoneName")!.value;
}
