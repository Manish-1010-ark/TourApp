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
          <li
            key={idx}
            className="text-sm font-body text-slate-600 flex items-start gap-2 leading-snug"
          >
            <span className="text-[var(--color-primary)] mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            {typeof item === "string"
              ? item
              : getField(item, "text", "name", "title")}
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
          <div
            key={key}
            className="flex items-start justify-between gap-3 text-sm font-body"
          >
            <span className="text-slate-500">{humanizeKey(key)}</span>
            <span className="font-semibold text-[var(--color-headings)] text-right">
              {String(value)}
            </span>
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
          const name =
            typeof item === "string" ? item : getField(item, "name", "title");
          const description =
            typeof item === "string"
              ? null
              : getField(item, "description", "summary");
          return (
            <div
              key={idx}
              className="bg-[var(--color-bg-secondary)] rounded-2xl p-3.5"
            >
              <div className="font-semibold font-body text-sm text-[var(--color-headings)]">
                {name}
              </div>
              {description && (
                <div className="text-xs font-body text-slate-500 mt-1 leading-snug">
                  {description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Like CardsGrid, but surfaces the fields specific to restaurants
// (cuisine, price range, location) that a generic name+description card
// would otherwise discard.
function RestaurantCardsGrid({ title, icon, items }) {
  return (
    <div className="card-elevation p-5 sm:p-6">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      {/* Single column, not sm:grid-cols-2 like CardsGrid — this card
          already sits in a narrow 1/3-width "Good to Know" slot, and
          restaurant tiles carry more text (cuisine, price, location,
          description) than a plain name+description card. Two columns
          here crammed each tile to ~1/6 of the page width. */}
      <div className="grid gap-3">
        {items.map((item, idx) => {
          const name =
            typeof item === "string" ? item : getField(item, "name", "title");
          const description =
            typeof item === "string"
              ? null
              : getField(item, "description", "summary");
          const cuisine =
            typeof item === "string" ? null : getField(item, "cuisine");
          const priceRange =
            typeof item === "string" ? null : getField(item, "price_range");
          const location =
            typeof item === "string" ? null : getField(item, "location");
          return (
            <div
              key={idx}
              className="bg-[var(--color-bg-secondary)] rounded-2xl p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold font-body text-sm text-[var(--color-headings)]">
                  {name}
                </div>
                {priceRange && (
                  <span className="text-[10px] font-bold font-body uppercase tracking-wide px-2 py-0.5 rounded-full bg-white text-slate-500 shrink-0">
                    {priceRange}
                  </span>
                )}
              </div>
              {(cuisine || location) && (
                <div className="text-xs font-body text-slate-500 mt-1 flex flex-wrap gap-x-2">
                  {cuisine && <span>{cuisine}</span>}
                  {cuisine && location && <span>·</span>}
                  {location && <span>{location}</span>}
                </div>
              )}
              {description && (
                <div className="text-xs font-body text-slate-500 mt-1.5 leading-snug">
                  {description}
                </div>
              )}
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
 * formatted cards for packing lists, safety tips, restaurants, etc.),
 * then renders anything else the backend sent at the itinerary's top
 * level that isn't already handled elsewhere on the page — so a
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

    if (section.kind === "list")
      return (
        <ListCard
          key={section.id}
          title={section.title}
          icon={section.icon}
          items={value}
        />
      );
    if (section.kind === "keyvalue")
      return (
        <KeyValueCard
          key={section.id}
          title={section.title}
          icon={section.icon}
          data={value}
        />
      );
    if (section.kind === "text")
      return (
        <TextCard
          key={section.id}
          title={section.title}
          icon={section.icon}
          text={value}
        />
      );
    if (section.kind === "cards")
      return (
        <CardsGrid
          key={section.id}
          title={section.title}
          icon={section.icon}
          items={value}
        />
      );
    if (section.kind === "restaurant_cards")
      return (
        <RestaurantCardsGrid
          key={section.id}
          title={section.title}
          icon={section.icon}
          items={value}
        />
      );
    return null;
  }).filter(Boolean);

  // Fields already rendered elsewhere on the page (hero, stats, sidebars,
  // day content) so they aren't duplicated down here too. budget_breakdown
  // is included here even though it's no longer a KNOWN_SECTION, since
  // BudgetSummaryCard already owns it — without this it would otherwise
  // fall into the generic unknownCards loop below and render a second time.
  const HANDLED_ELSEWHERE = new Set([
    "destination",
    "days",
    "overall_style",
    "itinerary",
    "must_visit_places",
    "must_visit",
    "local_food",
    "food_recommendations",
    "travel_tips",
    "tips",
    "essential_information",
    "essential_info",
    "weather",
    "weather_snapshot",
    "budget_breakdown",
    "cost_breakdown",
    "trip_stats",
    "source",
    "travel_mode",
    "group_type",
    ...knownIds,
  ]);

  const unknownCards = Object.entries(itinerary)
    .filter(
      ([key, value]) => !HANDLED_ELSEWHERE.has(key) && !isEmptyValue(value),
    )
    .map(([key, value]) => {
      if (Array.isArray(value))
        return (
          <ListCard
            key={key}
            title={humanizeKey(key)}
            icon="📌"
            items={value}
          />
        );
      if (typeof value === "object")
        return (
          <KeyValueCard
            key={key}
            title={humanizeKey(key)}
            icon="📌"
            data={value}
          />
        );
      if (typeof value === "string")
        return (
          <TextCard key={key} title={humanizeKey(key)} icon="📌" text={value} />
        );
      return null;
    })
    .filter(Boolean);

  const allCards = [...knownCards, ...unknownCards];
  if (allCards.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--color-headings)] mb-5">
        Good to Know
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {allCards}
      </div>
    </div>
  );
}
