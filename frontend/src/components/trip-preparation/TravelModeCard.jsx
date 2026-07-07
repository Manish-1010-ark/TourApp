// components/trip-preparation/TravelModeCard.jsx

const MODE_ICONS = {
  flight: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 21l1-6.5-6.5-4 1-2 7 2 3-6c.4-.8 2-.8 2 .3 0 1-1 4.7-1 4.7l4 2v2l-4.5-1L14 18l2 1v1.5l-3-.7-2.5.7V19z"
        fill="currentColor"
      />
    </svg>
  ),
  train: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="13.5" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="1.2" fill="currentColor" />
      <path d="M8 21l1.5-2.5h5L16 21M9 7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  bus: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M8 16v2.5M16 16v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7.5" cy="19" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="19" r="1.3" fill="currentColor" />
    </svg>
  ),
  car: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 16l1.3-4.5A2 2 0 018.2 10h7.6a2 2 0 011.9 1.5L19 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect x="3.5" y="16" width="17" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7.5" cy="20" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="20" r="1.3" fill="currentColor" />
    </svg>
  ),
};

const COMFORT_BY_MODE = {
  flight: "High comfort",
  train: "Good comfort",
  bus: "Basic comfort",
  car: "Flexible comfort",
};

const COST_BY_MODE = {
  flight: "₹₹₹",
  train: "₹₹",
  bus: "₹",
  car: "₹₹",
};

export default function TravelModeCard({ modeKey, label, isRecommended, isSelected, estimatedTime, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-bg-secondary)] shadow-[0_8px_24px_rgba(14,165,233,0.18)]"
          : isRecommended
          ? "border-emerald-200 bg-white hover:border-emerald-300 hover:-translate-y-0.5"
          : "border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5"
      }`}
    >
      {isRecommended && (
        <span className="absolute -top-2.5 right-3 bg-[var(--color-success)] text-white text-[10px] font-bold font-body uppercase tracking-wide px-2 py-1 rounded-full shadow-sm">
          Recommended
        </span>
      )}

      <div className={`mb-2 ${isSelected ? "text-[var(--color-primary)]" : "text-slate-500"}`}>{MODE_ICONS[modeKey]}</div>

      <div className="font-display font-bold text-base text-[var(--color-headings)]">{label}</div>
      <div className="text-xs font-body text-slate-500 mt-1">{estimatedTime}</div>

      <div className="flex items-center justify-between mt-3 text-[11px] font-body text-slate-400">
        <span>{COMFORT_BY_MODE[modeKey]}</span>
        <span className="font-semibold text-slate-500">{COST_BY_MODE[modeKey]}</span>
      </div>
    </button>
  );
}
