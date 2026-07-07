// components/itinerary/HeroBanner.jsx
import { RouteIcon, CalendarIcon, RupeeIcon } from "./icons";

const MODE_LABELS = { flight: "Flight", train: "Train", bus: "Bus", car: "Car" };
const MODE_ICONS = { flight: "✈️", train: "🚆", bus: "🚌", car: "🚗" };

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs sm:text-sm font-semibold font-body px-3 py-1.5 rounded-full">
      {children}
    </span>
  );
}

/**
 * HeroBanner — a destination-agnostic gradient + skyline illustration
 * stands in for a real cover photo ("destination image placeholder for
 * now"), so it works for any destination without hotlinking an image
 * that may not match. A glass card overlays the title, subtitle and
 * quick badges.
 */
export default function HeroBanner({ destination, days, source, travelMode, budgetLabel, styleLabel, groupType }) {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-6">
      {/* Placeholder cover art */}
      <div
        className="h-64 sm:h-80 md:h-96 w-full relative"
        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 45%, #f59e0b 100%)" }}
      >
        <svg className="absolute bottom-0 left-0 w-full h-2/3 opacity-25" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0 200 L0 120 L120 40 L220 120 L320 60 L420 130 L520 30 L620 110 L720 70 L800 120 L800 200 Z" fill="white" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-30" viewBox="0 0 800 140" preserveAspectRatio="none">
          <path d="M0 140 L0 90 L150 20 L300 90 L450 40 L600 100 L800 50 L800 140 Z" fill="white" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      {/* Glass card */}
      <div className="absolute inset-x-4 sm:inset-x-8 bottom-4 sm:bottom-8">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-5 sm:p-7 max-w-2xl">
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
            {days} {days === 1 ? "Day" : "Days"} in {destination}
          </h1>
          <p className="text-white/90 font-body text-sm sm:text-base mb-4 max-w-lg">
            A thoughtfully planned journey covering the best attractions, local experiences and hidden gems.
          </p>

          <div className="flex flex-wrap gap-2">
            {source && (
              <Badge>
                <RouteIcon className="w-3.5 h-3.5" /> {source} → {destination}
              </Badge>
            )}
            {travelMode && (
              <Badge>
                {MODE_ICONS[travelMode] ?? "🧭"} {MODE_LABELS[travelMode] ?? travelMode}
              </Badge>
            )}
            <Badge>
              <CalendarIcon className="w-3.5 h-3.5" /> {days} {days === 1 ? "Day" : "Days"}
            </Badge>
            {budgetLabel && (
              <Badge>
                <RupeeIcon className="w-3.5 h-3.5" /> {budgetLabel}
              </Badge>
            )}
            {styleLabel && <Badge>⭐ {styleLabel}</Badge>}
            {groupType && <Badge>👨‍👩‍👧 {groupType}</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}