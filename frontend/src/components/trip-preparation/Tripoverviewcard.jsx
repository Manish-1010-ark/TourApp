// components/trip-preparation/TripOverviewCard.jsx

const MODE_LABELS = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  car: "Car",
};
const MODE_ICONS = { flight: "✈️", train: "🚂", bus: "🚌", car: "🚗" };

// Presentational-only estimate (same rough-average-speed heuristic used by
// ValidationCard in the previous step). Not sent to, or trusted from, the
// backend — this step's tripData only carries distance_km/days/travel_mode.
function estimateTravelTime(distanceKm) {
  const hours = distanceKm / 55;
  if (hours < 1) return "under an hour";
  const rounded = Math.round(hours);
  return `~${rounded} hr${rounded === 1 ? "" : "s"}`;
}

// Presentational-only heuristic for a "recommended minimum days" hint.
// The authoritative minimum_days figure already lived in Step 2's
// validationResult; it isn't part of tripData, so this is a lightweight,
// clearly-labelled estimate rather than a re-implementation of backend logic.
function estimateMinimumDays(distanceKm) {
  return Math.max(1, Math.ceil(distanceKm / 300));
}

function tripTypeLabel(days) {
  if (days <= 2) return "Quick Getaway";
  if (days <= 4) return "Weekend Trip";
  if (days <= 7) return "Extended Trip";
  return "Long Vacation";
}

export default function TripOverviewCard({ tripData }) {
  const { source, destination, distance_km, travel_mode, days } = tripData;

  return (
    <div className="card-elevation p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-[var(--color-headings)]">
          Your trip so far
        </h2>
        <span className="text-xs font-bold font-body uppercase tracking-wide text-[var(--color-success)] bg-emerald-50 px-3 py-1 rounded-full">
          ✓ Route confirmed
        </span>
      </div>

      {/* Route line */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold font-body uppercase tracking-wide text-slate-400 mb-1">
            From
          </div>
          <div className="font-display font-bold text-lg text-[var(--color-headings)] truncate">
            📍 {source.name}
          </div>
        </div>

        <svg
          width="40"
          height="14"
          viewBox="0 0 64 16"
          className="text-[var(--color-primary)] opacity-70 shrink-0 mt-4"
        >
          <line
            x1="2"
            y1="8"
            x2="62"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="2" cy="8" r="2.5" fill="currentColor" />
          <path
            d="M56 3l6 5-6 5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="flex-1 min-w-0 text-right">
          <div className="text-[11px] font-bold font-body uppercase tracking-wide text-slate-400 mb-1">
            To
          </div>
          <div className="font-display font-bold text-lg text-[var(--color-headings)] truncate">
            📍 {destination.name}
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">
            {distance_km} km
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Distance
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">
            {MODE_ICONS[travel_mode]} {MODE_LABELS[travel_mode] ?? travel_mode}
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Travel Mode
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">
            {days} {days === 1 ? "day" : "days"}
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Duration
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">
            {estimateTravelTime(distance_km)}
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Est. Travel
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">
            {estimateMinimumDays(distance_km)}d
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Min. Suggested
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 text-center">
          <div className="font-body text-sm font-bold text-[var(--color-headings)] leading-tight">
            {tripTypeLabel(days)}
          </div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
            Trip Type
          </div>
        </div>
      </div>
    </div>
  );
}
