// components/trip-preparation/DaysSelector.jsx

const MIN_DAYS = 1;
const MAX_DAYS = 10;
const QUICK_PICKS = [3, 4, 5, 7, 10];

export default function DaysSelector({ days, onChange }) {
  const dec = () => onChange(Math.max(MIN_DAYS, days - 1));
  const inc = () => onChange(Math.min(MAX_DAYS, days + 1));

  return (
    <div>
      <label className="block text-xs font-bold font-body uppercase tracking-wide text-slate-500 mb-3">
        Trip Duration
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={dec}
          disabled={days <= MIN_DAYS}
          aria-label="Decrease days"
          className="w-11 h-11 shrink-0 rounded-full border-2 border-slate-200 text-slate-500 text-xl font-bold flex items-center justify-center hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
        >
          &minus;
        </button>

        <div className="flex-1 text-center">
          <div className="font-display text-4xl font-bold text-[var(--color-headings)] leading-none">{days}</div>
          <div className="text-xs font-body text-slate-500 mt-1">{days === 1 ? "day" : "days"}</div>
        </div>

        <button
          type="button"
          onClick={inc}
          disabled={days >= MAX_DAYS}
          aria-label="Increase days"
          className="w-11 h-11 shrink-0 rounded-full border-2 border-slate-200 text-slate-500 text-xl font-bold flex items-center justify-center hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {QUICK_PICKS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold font-body border transition-colors ${
              days === d
                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>
    </div>
  );
}
