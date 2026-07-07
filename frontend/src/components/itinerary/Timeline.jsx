// components/itinerary/icons.jsx

// Small, single-color line-icon set shared across the itinerary page.
// Kept intentionally minimal (one file, one style) so every icon looks
// like it belongs to the same system instead of a grab-bag of emoji.

export function LocationIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-6.5 7-11.5a7 7 0 10-14 0C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RupeeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M7 5h10M7 9h10M7 5c4 0 6 1.3 6 4s-2 4-6 4h-1l7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TipIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.4.3.6.8.6 1.3v.3h5.8v-.3c0-.5.2-1 .6-1.3A6 6 0 0012 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RouteIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 8.2V12a4 4 0 004 4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2.5 2.5" />
    </svg>
  );
}

export function ChevronIcon({ className = "w-4 h-4", open }) {
  return (
    <svg className={`${className} transition-transform duration-300 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MapPinsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 10.5V13a3 3 0 003 3h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Maps a backend `activity_type` string to a small line icon. Falls back
// to a generic pin for any type the backend introduces later.
const ACTIVITY_ICON_PATHS = {
  food: (
    <path d="M6 3v7a3 3 0 003 3v8M6 3v7M9 3v7M12 3v9a3 3 0 003 3v6M15 3c-2 1-2 4-2 6s0 3 2 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sightseeing: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  hotel: (
    <path d="M4 20V6a1 1 0 011-1h6a1 1 0 011 1v14M12 20V10h7a1 1 0 011 1v9M4 20h16M7 8h1M7 11h1M7 14h1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  travel: (
    <path d="M3 12l7-1.5L14 4l2 1-3 6.5 5.5-1 2 1.5-6 3-3 4-1.5-.5 1-4L7 15l-2 1-1-1 1.5-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  ),
  shopping: (
    <path d="M6 8h12l-1 12H7L6 8zM9 8a3 3 0 016 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  nature: (
    <path d="M12 3l4 6h-2.5l3.5 6h-3l2 5H8l2-5H7l3.5-6H8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  ),
  adventure: (
    <path d="M4 20l6-14 2 4 2-4 6 14M8 20l4-9 4 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  culture: (
    <path d="M4 21h16M5 21V10l7-5 7 5v11M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  relaxation: (
    <path d="M4 17c2-4 5-6 8-6s6 2 8 6M6 17a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  ),
  photography: (
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  beach: (
    <path d="M3 21c4-1 6-1 9 0s5 1 9 0M12 3a6 6 0 00-6 9M12 3a6 6 0 016 9M3 15l18-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrival: (
    <path d="M4 20h16M6 20V9l6-5 6 5v11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function ActivityIcon({ type, className = "w-5 h-5" }) {
  const path = ACTIVITY_ICON_PATHS[type] ?? (
    <path d="M12 21s7-6.5 7-11.5a7 7 0 10-14 0C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      {path}
    </svg>
  );
}

// Small dot-marker used for the period column (morning/afternoon/evening) —
// deliberately abstract rather than a literal sun/moon icon set, since the
// backend may send periods beyond those three.
export function PeriodMarker({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}