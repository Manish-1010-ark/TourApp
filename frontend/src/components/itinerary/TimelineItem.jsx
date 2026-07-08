// components/itinerary/TimelineItem.jsx
import {
  ActivityIcon,
  ClockIcon,
  LocationIcon,
  RupeeIcon,
  TipIcon,
} from "./icons";
import { getField, isEmptyValue } from "./utils";
import { getDestinationInfo } from "../../services/destinationService";
import { useState } from "react";
import DestinationModal from "./DestinationModal";

const ACTIVITY_STYLES = {
  food: "bg-orange-50 text-orange-700 border-orange-200",
  sightseeing: "bg-purple-50 text-purple-700 border-purple-200",
  hotel: "bg-slate-100 text-slate-700 border-slate-200",
  travel: "bg-sky-50 text-sky-700 border-sky-200",
  shopping: "bg-pink-50 text-pink-700 border-pink-200",
  nature: "bg-emerald-50 text-emerald-700 border-emerald-200",
  adventure: "bg-red-50 text-red-700 border-red-200",
  culture: "bg-green-50 text-green-700 border-green-200",
  relaxation: "bg-blue-50 text-blue-700 border-blue-200",
  photography: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  beach: "bg-cyan-50 text-cyan-700 border-cyan-200",
  arrival: "bg-amber-50 text-amber-700 border-amber-200",
};

function InfoNote({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold font-body uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className="text-sm font-body text-slate-700 leading-snug">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * TimelineItem — one activity block. Reads every optional field
 * defensively (meal / logistics_hint / photography_note / cost /
 * duration / location) so blocks missing a field simply omit that note
 * instead of rendering "undefined".
 *
 * Also owns the "Explore Destination" flow for outdoor/sightseeing-type
 * blocks: fetches richer place info (photos, description, coordinates)
 * from the backend's /destination/info endpoint and shows it in a modal.
 */
export default function TimelineItem({ block = {}, isLast }) {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(null);

  const meal =
    block.meal?.meal_type && block.meal.meal_type !== "none"
      ? block.meal
      : null;
  const logisticsHint = getField(block, "logistics_hint", "travel_notes");
  const photoNote =
    getField(block, "photography_note") && block.photography_note !== "None."
      ? block.photography_note
      : null;
  const location = getField(block, "location", "place");
  const duration = getField(block, "estimated_duration", "duration");
  const rawCost = getField(block, "estimated_cost", "cost");
  // Backend occasionally sends the string literal "null" instead of JSON
  // null (see day 3's "Leisure & Check-out" block) — treat it as absent,
  // same as photography_note already does for the literal "None."
  const cost =
    rawCost && String(rawCost).trim().toLowerCase() !== "null" ? rawCost : null;
  const tip = getField(block, "important_tip", "tip");
  const optionalLabel = getField(block, "optional_label", "label");
  const style =
    ACTIVITY_STYLES[block.activity_type] ??
    "bg-slate-100 text-slate-600 border-slate-200";

  const handleExploreDestination = async () => {
    try {
      setLoading(true);
      // Prefer place_name, then location, otherwise use title
      const searchQuery =
        block.search_query || block.place_name || location || block.title;

      const data = await getDestinationInfo(searchQuery);
      setDestination(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load destination information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex gap-4">
        {/* Timeline rail */}
        <div className="flex flex-col items-center shrink-0 w-9">
          <div className="w-9 h-9 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shadow-sm">
            <ActivityIcon
              type={block.activity_type}
              className="w-[18px] h-[18px]"
            />
          </div>
          {!isLast && <div className="flex-1 w-[2px] bg-slate-200 my-1" />}
        </div>

        {/* Card */}
        <div className="flex-1 min-w-0 pb-6">
          <div className="card-elevation p-5 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {block.time_window && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold font-body text-slate-500">
                  <ClockIcon className="w-3.5 h-3.5" /> {block.time_window}
                </span>
              )}
              {block.activity_type && (
                <span
                  className={`text-[11px] font-bold font-body uppercase tracking-wide px-2 py-0.5 rounded-full border ${style}`}
                >
                  {block.activity_type}
                </span>
              )}
              {optionalLabel && !isEmptyValue(optionalLabel) && (
                <span className="text-[11px] font-bold font-body uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {optionalLabel}
                </span>
              )}
            </div>

            <h4 className="font-display font-bold text-base sm:text-lg text-[var(--color-headings)] mb-1.5">
              {block.title ?? "Untitled activity"}
            </h4>

            {block.description && (
              <p className="text-sm font-body text-slate-600 leading-relaxed mb-3">
                {block.description}
              </p>
            )}

            {[
              "sightseeing",
              "nature",
              "culture",
              "photography",
              "beach",
              "adventure",
            ].includes(block.activity_type) && (
              <button
                onClick={handleExploreDestination}
                disabled={loading}
                className="mb-3 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold font-body hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {loading ? "Loading..." : "🧭 Explore Destination"}
              </button>
            )}

            {(location || duration || cost) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs font-body text-slate-500">
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <LocationIcon className="w-3.5 h-3.5" /> {location}
                  </span>
                )}
                {duration && (
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" /> {duration}
                  </span>
                )}
                {cost && (
                  <span className="inline-flex items-center gap-1">
                    <RupeeIcon className="w-3.5 h-3.5" /> {cost}
                  </span>
                )}
              </div>
            )}

            {(meal || logisticsHint || photoNote || tip) && (
              <div className="grid gap-2 mt-3">
                {meal && (
                  <InfoNote icon="🍽️" label={meal.meal_type ?? "Meal"}>
                    <span className="capitalize">
                      {meal.cuisine_type ?? "Cuisine not specified"}
                    </span>{" "}
                    ·{" "}
                    <span className="capitalize">
                      {meal.dining_style ?? "Style not specified"}
                    </span>
                    {meal.veg_friendly && " · Veg-friendly"}
                  </InfoNote>
                )}
                {logisticsHint && (
                  <InfoNote
                    icon={<TipIcon className="w-4 h-4" />}
                    label="Logistics"
                  >
                    {logisticsHint}
                  </InfoNote>
                )}
                {photoNote && (
                  <InfoNote icon="📸" label="Photography Tip">
                    {photoNote}
                  </InfoNote>
                )}
                {tip && (
                  <InfoNote icon="💡" label="Good to know">
                    {tip}
                  </InfoNote>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DestinationModal
        destination={destination}
        onClose={() => setDestination(null)}
      />
    </>
  );
}
