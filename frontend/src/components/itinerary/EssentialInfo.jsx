// components/itinerary/EssentialInfo.jsx
import { getField, isEmptyValue, humanizeKey } from "./utils";

const FIELD_ORDER = [
  ["emergency_number", "police_number"],
  ["hospital", "nearest_hospital"],
  ["police", "police_station"],
  ["tourist_helpline"],
  ["transport_info", "transportation"],
  ["atm_availability"],
  ["mobile_network"],
];

export default function EssentialInfo({ source }) {
  const essential = getField(source, "essential_information", "essential_info");
  if (isEmptyValue(essential)) return null;

  const rows = FIELD_ORDER.map((aliases) => ({
    key: aliases[0],
    value: getField(essential, ...aliases),
  })).filter((r) => !isEmptyValue(r.value));

  // Anything present but not in the known list above still renders, so
  // no field the backend adds later gets silently dropped.
  const knownKeys = new Set(FIELD_ORDER.flat());
  const extraRows = Object.entries(essential)
    .filter(([key, value]) => !knownKeys.has(key) && !isEmptyValue(value))
    .map(([key, value]) => ({ key, value }));

  const allRows = [...rows, ...extraRows];
  if (allRows.length === 0) return null;

  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">Essential Information</div>
      <div className="grid gap-2.5">
        {allRows.map(({ key, value }) => (
          <div key={key} className="flex items-start justify-between gap-3 text-sm font-body">
            <span className="text-slate-500">{humanizeKey(key)}</span>
            <span className="font-semibold text-[var(--color-headings)] text-right">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}