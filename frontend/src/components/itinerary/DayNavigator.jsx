// components/itinerary/DayNavigator.jsx

/**
 * DayNavigator — sticky list of days. Clicking a day smoothly scrolls to
 * it and expands it (single-expand accordion, owned by the parent page).
 * `activeDay` (which day is currently in view) is tracked by the parent
 * via IntersectionObserver and passed down purely for highlighting.
 */
export default function DayNavigator({ days, activeDay, onSelectDay }) {
  return (
    <nav className="card-elevation p-4 sticky top-20" aria-label="Day navigation">
      <div className="text-xs font-bold font-body uppercase tracking-wide text-slate-400 px-2 mb-2">Days</div>
      <ul className="flex flex-col gap-1">
        {days.map((day) => (
          <li key={day.day}>
            <button
              type="button"
              onClick={() => onSelectDay(day.day)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold font-body transition-colors flex items-center gap-2.5 ${
                activeDay === day.day
                  ? "bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeDay === day.day ? "bg-white/25" : "bg-slate-100 text-slate-500"
                }`}
              >
                {day.day}
              </span>
              <span className="truncate">Day {day.day}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}