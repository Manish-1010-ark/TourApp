// components/trip-preparation/ConfigurationSummary.jsx
import { AI_MODELS } from "./AIModelSelector";

const MODE_LABELS = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  car: "Car",
};
const PACE_LABELS = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  fast: "Fast-Paced",
};
const BUDGET_LABELS = { basic: "Budget", premium: "Premium", luxury: "Luxury" };

const PREFERENCE_LABELS = {
  avoid_early_mornings: "Avoid early mornings",
  prefer_less_walking: "Prefer less walking",
  family_friendly: "Family friendly",
  vegetarian_friendly: "Vegetarian friendly",
  photography_focus: "Photography focused",
};

function Row({ label, value, placeholder = "—" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-body uppercase tracking-wide text-slate-400 pt-0.5 shrink-0">
        {label}
      </span>
      <span className="text-sm font-body font-semibold text-[var(--color-headings)] text-right">
        {value || (
          <span className="text-slate-300 font-normal">{placeholder}</span>
        )}
      </span>
    </div>
  );
}

/**
 * ConfigurationSummary — sticky sidebar that mirrors TripSummary from the
 * previous step. Doubles as the page's "Final Summary" (Section 7) and
 * hosts the primary "Generate My AI Itinerary" action (Section 8), the
 * same checkout-style pattern used across the flow.
 */
export default function ConfigurationSummary({
  tripData,
  pace,
  budget,
  selectedInterests,
  constraints,
  aiModel,
  onGenerate,
  isGenerating,
  error,
  interestsMissing,
}) {
  const activePreferences = Object.entries(constraints)
    .filter(([, v]) => v)
    .map(([k]) => PREFERENCE_LABELS[k] ?? k);

  const modelLabel =
    AI_MODELS.find((m) => m.value === aiModel)?.label ?? aiModel;

  return (
    <div className="card-elevation p-6 sticky top-6">
      <div className="font-display text-lg font-bold text-[var(--color-headings)] mb-1">
        Trip Summary
      </div>
      <div className="text-xs font-body text-slate-500 mb-4">
        Updates as you configure
      </div>

      <Row label="From" value={tripData.source.name} />
      <Row label="To" value={tripData.destination.name} />
      <Row
        label="Travel Mode"
        value={MODE_LABELS[tripData.travel_mode] ?? tripData.travel_mode}
      />
      <Row label="Distance" value={`${tripData.distance_km} km`} />
      <Row
        label="Days"
        value={`${tripData.days} ${tripData.days === 1 ? "day" : "days"}`}
      />
      <Row label="Pace" value={PACE_LABELS[pace]} />
      <Row label="Budget" value={BUDGET_LABELS[budget]} />
      <Row
        label="Interests"
        value={
          selectedInterests.length
            ? `${selectedInterests.length} selected`
            : null
        }
        placeholder="None yet"
      />
      <Row
        label="Preferences"
        value={activePreferences.length ? activePreferences.join(", ") : null}
        placeholder="None selected"
      />
      <Row label="AI Model" value={modelLabel} />

      {selectedInterests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedInterests.map((i) => (
            <span
              key={i}
              className="text-[11px] font-semibold font-body bg-[var(--color-bg-secondary)] text-[var(--color-primary)] px-2 py-1 rounded-full"
            >
              {i}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="3"
              />
              <path
                d="M21 12a9 9 0 00-9-9"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Generating...
          </>
        ) : (
          "Generate My AI Itinerary →"
        )}
      </button>

      {interestsMissing && (
        <p className="text-xs font-body text-orange-600 mt-2 text-center">
          Select at least one interest below to continue.
        </p>
      )}

      {error && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-2xl text-xs font-body text-orange-800 animate-fade-in-up">
          {error}
        </div>
      )}
    </div>
  );
}
