import type { ReactNode } from "react";
type IconName =
  | "length"
  | "weight"
  | "volume"
  | "temperature"
  | "time"
  | "specs"
  | "currency"
  | "globe"
  | "copy"
  | "swap"
  | "arrow";
const paths: Record<IconName, ReactNode> = {
  length: (
    <>
      <path d="m4 9 5-5 11 11-5 5Z" />
      <path d="m8 8 2 2m1-5 2 2m-2 5 2 2m1-5 2 2" />
    </>
  ),
  weight: (
    <>
      <path d="M7 8h10l3 12H4Z" />
      <circle cx="12" cy="5" r="3" />
      <path d="M9 15h6" />
    </>
  ),
  volume: (
    <>
      <path d="M7 3h10m-8 0v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3M7 15h10" />
    </>
  ),
  temperature: (
    <>
      <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0ZM12 9v9m6-12h3m-3 4h2" />
    </>
  ),
  time: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  specs: (
    <>
      <path d="m12 3 9 5-9 5-9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" />
    </>
  ),
  currency: (
    <>
      <path d="M12 2v20m5-15c0-4-10-4-10 1s10 3 10 8-10 5-10 1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </>
  ),
  swap: <path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
};
export default function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
