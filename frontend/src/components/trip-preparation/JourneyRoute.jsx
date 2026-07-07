// components/trip-preparation/JourneyRoute.jsx
import { useState } from "react";
import DestinationSearchField from "./DestinationSearchField";

function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 7h11l-3-3M17 17H6l3 3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * JourneyRoute — FROM / TO fields joined by an animated flight-path line,
 * with a swap control between them. This is the page's signature moment:
 * a single deliberate piece of motion rather than effects scattered
 * throughout the page.
 */
export default function JourneyRoute({ source, destination, onSwap, children }) {
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = () => {
    setIsSwapping(true);
    onSwap();
    setTimeout(() => setIsSwapping(false), 400);
  };

  // children is a render-prop pair: [sourceField, destField] — this keeps
  // all the state/handlers in the parent (TripPreparation.jsx) untouched,
  // this component only owns layout + the swap animation.
  const [sourceField, destField] = children;

  return (
    <div className="relative">
      <div className="hidden md:flex items-end gap-4">
        <div className="flex-1">{sourceField}</div>

        <div className="flex flex-col items-center justify-center pb-4 shrink-0">
          <svg width="64" height="16" viewBox="0 0 64 16" className="text-[var(--color-primary)] opacity-70 mb-1">
            <line x1="2" y1="8" x2="62" y2="8" stroke="currentColor" strokeWidth="2" className="route-path" />
            <circle cx="2" cy="8" r="2.5" fill="currentColor" />
            <path d="M56 3l6 5-6 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap source and destination"
            className={`w-10 h-10 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shadow-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors ${
              isSwapping ? "swap-button-active" : ""
            }`}
          >
            <SwapIcon />
          </button>
        </div>

        <div className="flex-1">{destField}</div>
      </div>

      {/* Mobile: stacked, with a vertical swap affordance */}
      <div className="flex md:hidden flex-col gap-3">
        <div>{sourceField}</div>

        <div className="flex items-center gap-3 pl-1">
          <svg width="16" height="40" viewBox="0 0 16 40" className="text-[var(--color-primary)] opacity-70">
            <line x1="8" y1="2" x2="8" y2="38" stroke="currentColor" strokeWidth="2" className="route-path" />
          </svg>
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap source and destination"
            className={`w-9 h-9 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shadow-sm active:bg-[var(--color-primary)] active:text-white transition-colors ${
              isSwapping ? "swap-button-active" : ""
            }`}
          >
            <SwapIcon />
          </button>
          <span className="text-xs font-body text-slate-400">swap</span>
        </div>

        <div>{destField}</div>
      </div>
    </div>
  );
}
