// components/trip-preparation/ToggleSwitch.jsx

/**
 * ToggleSwitch — modern pill switch for the "Additional Preferences"
 * section. Purely presentational; parent owns the checked state.
 */
export default function ToggleSwitch({ icon, label, checked, onChange, id }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-colors ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-lg shrink-0">{icon}</span>
        <span className="text-sm font-semibold font-body text-[var(--color-headings)] truncate">
          {label}
        </span>
      </span>

      <span className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`block w-10 h-[22px] rounded-full transition-colors duration-200 ${
            checked ? "bg-[var(--color-primary)]" : "bg-slate-300"
          }`}
        />
        <span
          className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}
