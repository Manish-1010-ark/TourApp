// components/itinerary/TravelTips.jsx
import { TipIcon } from "./icons";
import { getField, isEmptyValue } from "./utils";

export default function TravelTips({ source }) {
  const tips = getField(source, "travel_tips", "tips");
  if (isEmptyValue(tips)) return null;

  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">
        Travel Tips
      </div>
      <div className="flex flex-col gap-2.5">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <span className="text-[var(--color-primary)] mt-0.5 shrink-0">
              <TipIcon className="w-4 h-4" />
            </span>
            <span className="text-sm font-body text-slate-600 leading-snug">
              {typeof tip === "string" ? tip : getField(tip, "text", "tip")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
