// components/itinerary/Highlights.jsx
import { getField, isEmptyValue } from "./utils";

/**
 * Highlights — chip row at the bottom of a day. Only renders when the
 * backend actually sends a highlights-like field on the day object;
 * otherwise this returns null so no empty strip appears.
 */
export default function Highlights({ day }) {
  const highlights = getField(day, "highlights", "day_highlights", "tags");
  if (isEmptyValue(highlights)) return null;

  return (
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
      <div className="flex flex-wrap gap-2">
        {highlights.map((h, idx) => (
          <span
            key={idx}
            className="text-xs font-semibold font-body bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full"
          >
            ✨ {h}
          </span>
        ))}
      </div>
    </div>
  );
}
