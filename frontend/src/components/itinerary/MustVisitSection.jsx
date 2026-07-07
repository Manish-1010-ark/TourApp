// components/itinerary/MustVisitSection.jsx
import { getField, isEmptyValue } from "./utils";

export default function MustVisitSection({ source }) {
  const places = getField(source, "must_visit_places", "must_visit");
  if (isEmptyValue(places)) return null;

  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">Must Visit Places</div>
      <div className="flex flex-col gap-3">
        {places.map((place, idx) => {
          const name = typeof place === "string" ? place : getField(place, "name", "title");
          const description = typeof place === "string" ? null : getField(place, "description", "summary");
          return (
            <div key={idx} className="flex gap-3 group">
              <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-sky-200 to-amber-100 flex items-center justify-center text-2xl">
                🏔️
              </div>
              <div className="min-w-0">
                <div className="font-semibold font-body text-sm text-[var(--color-headings)] truncate">{name}</div>
                {description && <div className="text-xs font-body text-slate-500 leading-snug line-clamp-2">{description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}