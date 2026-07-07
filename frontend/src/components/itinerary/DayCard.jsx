// components/itinerary/DayCard.jsx
import { ChevronIcon } from "./icons";
import TimelineItem from "./TimelineItem";
import Highlights from "./Highlights";

/**
 * DayCard — collapsible per-day section. Only the expanded day's
 * timeline is actually rendered (collapsed days mount nothing beneath
 * the header), which keeps 15+ day itineraries smooth since inactive
 * days carry near-zero render cost.
 */
export default function DayCard({ day, isExpanded, onToggle, registerRef }) {
  // Defensive: backend guarantees `blocks` on a day, but never assume —
  // a day with no activities should render an empty state, not crash.
  const blocks = day?.blocks ?? [];

  return (
    <div
      id={`day-${day.day}`}
      ref={registerRef}
      className="card-elevation overflow-hidden scroll-mt-24"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-display font-bold text-lg">
          {day.day}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--color-headings)]">
              Day {day.day}
            </h3>
            {day.day_theme && (
              <span className="text-[11px] font-bold font-body uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-primary)]">
                {day.day_theme}
              </span>
            )}
          </div>
          {day.day_summary && (
            <p className="text-sm font-body text-slate-500 truncate">
              {day.day_summary}
            </p>
          )}
        </div>

        <ChevronIcon
          className="w-5 h-5 text-slate-400 shrink-0"
          open={isExpanded}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <div className="px-5 sm:px-6 pb-2 pt-2 animate-fade-in-up">
              {blocks.length > 0 ? (
                blocks.map((block, index) => (
                  <TimelineItem
                    key={block?.id ?? `${day?.day ?? "day"}-${index}`}
                    block={block}
                    isLast={index === blocks.length - 1}
                  />
                ))
              ) : (
                <p className="text-sm font-body text-slate-400 py-4 text-center">
                  No activities scheduled for this day.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && <Highlights day={day} />}
    </div>
  );
}
