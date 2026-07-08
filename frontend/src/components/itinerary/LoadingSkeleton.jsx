// components/itinerary/LoadingSkeleton.jsx
import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Finding hidden gems...",
  "Planning the best route...",
  "Checking local attractions...",
  "Optimizing travel time...",
  "Creating unforgettable experiences...",
];

export default function LoadingSkeleton({ destination }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Real generations (esp. Pro tier / multi-day trips) have measured up to
  // ~53s in production. Past 20s, surface an explicit reassurance so a long
  // wait reads as "still working" rather than "stuck" — the goal is to
  // avoid the person manually bailing out and retrying, which wastes a
  // limited Pro-tier use on a request that may well have already succeeded.
  useEffect(() => {
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--color-primary)] animate-spin"
            style={{ animationDuration: "2.5s" }}
          >
            <path
              d="M12 2l1.6 5.8L19 4l-3 5.4L22 12l-6 2.6L19 20l-5.4-3L12 22l-1.6-5.8L5 20l3-5.4L2 12l6-2.6L5 4l5.4 3z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-headings)] mb-2">
          Crafting your {destination ? `${destination} ` : ""}itinerary
        </h2>
        <p
          className="font-body text-slate-500 transition-opacity duration-1000"
          key={messageIndex}
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
        {elapsed >= 20 && (
          <p className="font-body text-xs text-slate-400 mt-3">
            Still working — richer itineraries can take a little over a minute.
            No need to retry, this is normal.
          </p>
        )}
      </div>

      {/* Skeleton hero */}
      <div className="skeleton-shimmer h-72 rounded-3xl mb-8" />

      {/* Skeleton stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-20 rounded-2xl" />
        ))}
      </div>

      {/* Skeleton day cards */}
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
