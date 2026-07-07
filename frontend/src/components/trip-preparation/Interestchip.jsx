// components/trip-preparation/InterestChip.jsx

// Small, purely cosmetic keyword → emoji map so AI-suggested interests
// (arbitrary strings from the backend) still get a matching icon without
// the backend needing to send one. Falls back to a generic sparkle.
const ICON_RULES = [
  [["nature", "wildlife", "forest", "hill"], "🌿"],
  [["photo"], "📷"],
  [["adventure", "trek", "hik"], "🧗"],
  [["food", "cuisine", "culinary", "street"], "🍜"],
  [["museum", "art", "gallery"], "🏛️"],
  [["shop", "market", "bazaar"], "🛍️"],
  [["night", "club", "bar"], "🌃"],
  [["temple", "spiritual", "religious", "monastery"], "🛕"],
  [["beach", "coast", "sea"], "🏖️"],
  [["history", "heritage", "fort", "palace"], "🏺"],
  [["wellness", "spa", "relax"], "🧘"],
  [["view", "scenic", "landscape", "mountain"], "🏔️"],
];

function getInterestIcon(label) {
  const lower = label.toLowerCase();
  for (const [keywords, icon] of ICON_RULES) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return "✨";
}

/**
 * InterestChip — toggleable pill for AI-suggested interests.
 * Selected chips turn solid blue; unselected stay neutral outline.
 */
export default function InterestChip({ label, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold font-body border-2 transition-all duration-150 animate-pop-in ${
        isSelected
          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)] scale-[1.03]"
          : "bg-white border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      }`}
    >
      <span>{getInterestIcon(label)}</span>
      {label}
    </button>
  );
}
