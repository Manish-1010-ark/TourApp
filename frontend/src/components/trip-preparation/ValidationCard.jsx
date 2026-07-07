// components/trip-preparation/ValidationCard.jsx

function estimateTravelTime(distanceKm) {
  // Presentational-only estimate (rough average speed), not used for any
  // validation logic — the actual feasibility numbers all come from the
  // backend's validationResult untouched.
  const hours = distanceKm / 55;
  if (hours < 1) return "under an hour";
  const rounded = Math.round(hours);
  return `~${rounded} hr${rounded === 1 ? "" : "s"}`;
}

export default function ValidationCard({ validationResult, days }) {
  const { feasible, distance_km, minimum_days, reason } = validationResult;

  return (
    <div
      className={`rounded-3xl p-6 border-2 animate-fade-in-up ${
        feasible ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              feasible ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"
            }`}
          >
            {feasible ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-display text-xl font-bold text-[var(--color-headings)]">
              {feasible ? "Route Available" : "Route Not Recommended"}
            </div>
            <div className="text-sm font-body text-slate-500">
              {feasible ? "Your trip looks good to go" : "Your timeline may be too tight"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/70 rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">{distance_km} km</div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">Distance</div>
        </div>
        <div className="bg-white/70 rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">{estimateTravelTime(distance_km)}</div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">Est. Travel</div>
        </div>
        <div className="bg-white/70 rounded-2xl p-3 text-center">
          <div className="font-body text-lg font-bold text-[var(--color-headings)]">{minimum_days}d</div>
          <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">Min. Recommended</div>
        </div>
      </div>

      {reason && (
        <div className="mt-4 flex items-start gap-2 text-sm font-body text-orange-800">
          <span className="mt-0.5">💡</span>
          <span>{reason}</span>
        </div>
      )}

      {feasible && (
        <div className="mt-4 text-sm font-body text-emerald-800">
          Planning {days} {days === 1 ? "day" : "days"} — choose a travel mode below to continue.
        </div>
      )}
    </div>
  );
}
