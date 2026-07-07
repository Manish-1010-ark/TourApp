// components/itinerary/AdditionalInfoSection.jsx
import { KNOWN_SECTIONS, getField, isEmptyValue, humanizeKey } from "./utils";

function ListCard({ title, icon, items }) {
  return (
    <div className="card-elevation p-5 sm:p-6">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm font-body text-slate-600 flex items-start gap-2 leading-snug">
            <span className="text-[var(--color-primary)] mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            {typeof item === "string" ? item : getField(item, "text", "name", "title")}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyValueCard({ title, icon, data }) {
  const entries = Object.entries(data).filter(([, v]) => !isEmptyValue(v));
  if (entries.length === 0) return null;
  return (
    <div className="card-elevation p-5 sm:p-6">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      <div className="grid gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-3 text-sm font-body">
            <span className="text-slate-500">{humanizeKey(key)}</span>
            <span className="font-semibold text-[var(--color-headings)] text-right">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextCard({ title, icon, text }) {
  return (
    <div className="card-elevation p-5 sm:p-6">
      <div className="font-display font-bold text-[var(--color-headings)] mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      <p className="text-sm font-body text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}

function CardsGrid({ title, icon, items }) {
  return (
    <div className="card-elevation p-5 sm:p-6">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, idx) => {
          const name = typeof item === "string" ? item : getField(item, "name", "title");
          const description = typeof item === "string" ? null : getField(item, "description", "summary");
          return (
            <div key={idx} className="bg-[var(--color-bg-secondary)] rounded-2xl p-3.5">
              <div className="font-semibold font-body text-sm text-[var(--color-headings)]">{name}</div>
              {description && <div className="text-xs font-body text-slate-500 mt-1 leading-snug">{description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * AdditionalInfoSection — "Render these sections ONLY if the backend
 * provides them." Walks the known-section registry first (nicely
 * formatted cards for packing lists, safety tips, budget breakdowns,
 * etc.), then renders anything else the backend sent at the itinerary's
 * top level that isn't already handled elsewhere on the page — so a
 * brand-new field never gets silently dropped, and nothing ever renders
 * an empty box.
 */
export default function AdditionalInfoSection({ itinerary }) {
  if (!itinerary) return null;

  const knownIds = new Set();
  const knownCards = KNOWN_SECTIONS.map((section) => {
    const value = getField(itinerary, ...section.keys);
    if (isEmptyValue(value)) return null;
    section.keys.forEach((k) => knownIds.add(k));

    if (section.kind === "list") return <ListCard key={section.id} title={section.title} icon={section.icon} items={value} />;
    if (section.kind === "keyvalue") return <KeyValueCard key={section.id} title={section.title} icon={section.icon} data={value} />;
    if (section.kind === "text") return <TextCard key={section.id} title={section.title} icon={section.icon} text={value} />;
    if (section.kind === "cards") return <CardsGrid key={section.id} title={section.title} icon={section.icon} items={value} />;
    return null;
  }).filter(Boolean);

  // Fields already rendered elsewhere on the page (hero, stats, sidebars,
  // day content) so they aren't duplicated down here too.
  const HANDLED_ELSEWHERE = new Set([
    "destination", "days", "overall_style", "itinerary",
    "must_visit_places", "must_visit", "local_food", "food_recommendations",
    "travel_tips", "tips", "essential_information", "essential_info",
    "weather", "weather_snapshot", ...knownIds,
  ]);

  const unknownCards = Object.entries(itinerary)
    .filter(([key, value]) => !HANDLED_ELSEWHERE.has(key) && !isEmptyValue(value))
    .map(([key, value]) => {
      if (Array.isArray(value)) return <ListCard key={key} title={humanizeKey(key)} icon="📌" items={value} />;
      if (typeof value === "object") return <KeyValueCard key={key} title={humanizeKey(key)} icon="📌" data={value} />;
      if (typeof value === "string") return <TextCard key={key} title={humanizeKey(key)} icon="📌" text={value} />;
      return null;
    })
    .filter(Boolean);

  const allCards = [...knownCards, ...unknownCards];
  if (allCards.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--color-headings)] mb-5">Good to Know</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">{allCards}</div>
    </div>
  );
}