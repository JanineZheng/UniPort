import { unitsFor } from "../core/units";
import type { Category } from "../core/units";
import type { Locale } from "../config/markets";
export default function UnitSelect({
  category,
  value,
  onChange,
  label,
  locale,
}: {
  category: Category;
  value: string;
  onChange: (value: string) => void;
  label: string;
  locale: Locale;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {unitsFor(category).map((u) => (
          <option key={u.id} value={u.id}>
            {u[locale]} · {u.symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
