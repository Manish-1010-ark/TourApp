// components/itinerary/TripStats.jsx
import { CalendarIcon, MapPinsIcon, RupeeIcon, RouteIcon } from "./icons";

function StatCard({ icon, label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="card-elevation p-4 sm:p-5 flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-primary)] flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg font-bold text-[var(--color-headings)] truncate">
          {value}
        </div>
        <div className="text-[11px] font-body uppercase tracking-wide text-slate-500">
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * TripStats — quick-glance numbers under the hero. Each card hides
 * itself (returns null) if the underlying value isn't available, so a
 * response missing distance_km, say, never leaves a blank/broken card.
 */
export default function TripStats({
  days,
  placesCovered,
  budgetDisplay,
  distanceKm,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
      <StatCard
        icon={<CalendarIcon className="w-5 h-5" />}
        label="Days"
        value={days}
      />
      <StatCard
        icon={<MapPinsIcon className="w-5 h-5" />}
        label="Activities Planned"
        value={placesCovered}
      />
      <StatCard
        icon={<RupeeIcon className="w-5 h-5" />}
        label="Estimated Budget"
        value={budgetDisplay}
      />
      <StatCard
        icon={<RouteIcon className="w-5 h-5" />}
        label="Travel Distance"
        value={distanceKm ? `${distanceKm} km` : undefined}
      />
    </div>
  );
}
