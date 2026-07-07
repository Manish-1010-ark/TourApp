// components/trip-preparation/TripSummary.jsx

const MODE_LABELS = { flight: "Flight", train: "Train", bus: "Bus", car: "Car" };

function Row({ label, value, placeholder = "—" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-body uppercase tracking-wide text-slate-400 pt-0.5">{label}</span>
      <span className="text-sm font-body font-semibold text-[var(--color-headings)] text-right">
        {value ?? <span className="text-slate-300 font-normal">{placeholder}</span>}
      </span>
    </div>
  );
}

export default function TripSummary({ sourceCity, destCity, days, validationResult, preferredMode }) {
  return (
    <div className="card-elevation p-6 sticky top-6">
      <div className="font-display text-lg font-bold text-[var(--color-headings)] mb-1">Trip Summary</div>
      <div className="text-xs font-body text-slate-500 mb-4">Updates as you go</div>

      <Row label="From" value={sourceCity ? sourceCity.name : null} />
      <Row label="To" value={destCity ? destCity.name : null} />
      <Row label="Duration" value={`${days} ${days === 1 ? "day" : "days"}`} />
      <Row label="Distance" value={validationResult ? `${validationResult.distance_km} km` : null} />
      <Row label="Travel Mode" value={preferredMode ? MODE_LABELS[preferredMode] : null} placeholder="Not selected yet" />
      <Row
        label="Status"
        value={
          validationResult ? (
            <span className={validationResult.feasible ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}>
              {validationResult.feasible ? "Feasible" : "Needs review"}
            </span>
          ) : null
        }
        placeholder="Pending"
      />
    </div>
  );
}
