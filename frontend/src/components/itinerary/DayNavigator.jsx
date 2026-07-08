// components/itinerary/DayNavigator.jsx

/**
 * DayNavigator — fixed to the left edge of the viewport (not the grid
 * column), so it stays put regardless of scroll position instead of
 * scrolling away with the rest of the sidebar. Deliberately minimal:
 * just the day number in a circle, filled when it's the active day.
 * Hidden below `lg` since there's no spare margin for a floating rail
 * once the layout collapses to a single column.
 */
export default function DayNavigator({ days, activeDay, onSelectDay }) {
  return (
    <nav
      className="hidden lg:flex flex-col gap-2 fixed left-4 top-1/2 -translate-y-1/2 z-20"
      aria-label="Day navigation"
    >
      {days.map((day) => {
        const active = activeDay === day.day;
        return (
          <button
            key={day.day}
            type="button"
            onClick={() => onSelectDay(day.day)}
            aria-current={active ? "true" : undefined}
            aria-label={`Day ${day.day}`}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold font-body transition-all duration-150 ${
              active
                ? "bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(14,165,233,0.35)] scale-110"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-[var(--color-headings)]"
            }`}
          >
            {day.day}
          </button>
        );
      })}
    </nav>
  );
}
