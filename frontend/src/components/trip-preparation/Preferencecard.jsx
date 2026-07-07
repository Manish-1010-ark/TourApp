// components/trip-preparation/PreferenceCard.jsx

/**
 * PreferenceCard — generic selectable card used for both the Pace and
 * Budget sections of TripConfiguration. Deliberately generic (icon +
 * title + description + optional meta line) so both sections share one
 * visual language instead of hand-rolled radio buttons.
 *
 * Mirrors the selection styling already established by TravelModeCard
 * in the previous step, so the two pages feel like one product.
 */
export default function PreferenceCard({ icon, title, description, meta, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 w-full ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-bg-secondary)] shadow-[0_8px_24px_rgba(14,165,233,0.18)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5"
      }`}
    >
      {isSelected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <div className="text-2xl mb-2 leading-none">{icon}</div>

      <div className="font-display font-bold text-base text-[var(--color-headings)]">{title}</div>
      <div className="text-xs font-body text-slate-500 mt-1 leading-snug">{description}</div>

      {meta && (
        <div className="mt-3 text-[11px] font-semibold font-body text-slate-500">
          {meta}
        </div>
      )}
    </button>
  );
}