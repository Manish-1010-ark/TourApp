// components/itinerary/utils.js

/**
 * getField — returns the first non-empty value found on `obj` for any of
 * the given key aliases. The backend response schema may evolve or use
 * slightly different naming (e.g. "must_visit_places" vs "must_visit"),
 * so every "optional section" reads through this instead of a single
 * hardcoded key. Never throws — always safe against missing/undefined data.
 */
export function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

export function getField(obj, ...keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    const val = obj[key];
    if (!isEmptyValue(val)) return val;
  }
  return undefined;
}

// Turns "best_time_to_visit" into "Best Time To Visit" for section titles
// generated dynamically from unknown backend keys.
export function humanizeKey(key) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Best-effort currency formatting. Accepts numbers or already-formatted
// strings from the backend (e.g. "₹4,500") and passes strings through
// untouched rather than risk mangling a value it doesn't own.
export function formatCurrency(value) {
  if (typeof value === "number") return `₹${value.toLocaleString("en-IN")}`;
  return value;
}

// Recognised "additional information" sections, each with a list of key
// aliases to check for and a `kind` describing how to render the value.
// Anything the backend sends that ISN'T in this list still gets rendered
// generically (see AdditionalInfoSection's fallback) rather than dropped.
//
// NOTE: "budget_breakdown" intentionally is NOT listed here — it has a
// dedicated BudgetSummaryCard consumer already; including it here caused
// it to render a SECOND time under "Good to Know". It's excluded via
// HANDLED_ELSEWHERE in AdditionalInfoSection.jsx instead.
export const KNOWN_SECTIONS = [
  {
    id: "packing_list",
    keys: ["packing_list", "packing_tips"],
    title: "Packing List",
    icon: "🎒",
    kind: "list",
  },
  {
    id: "safety_tips",
    keys: ["safety_tips"],
    title: "Safety Tips",
    icon: "🛡️",
    kind: "list",
  },
  {
    id: "shopping_suggestions",
    keys: ["shopping_suggestions", "shopping"],
    title: "Shopping Suggestions",
    icon: "🛍️",
    kind: "list",
  },
  {
    id: "best_time_to_visit",
    keys: ["best_time_to_visit"],
    title: "Best Time To Visit",
    icon: "📅",
    kind: "text",
  },
  {
    id: "local_etiquette",
    keys: ["local_etiquette", "etiquette"],
    title: "Local Etiquette",
    icon: "🙏",
    kind: "list",
  },
  {
    id: "photography_tips",
    keys: ["photography_tips"],
    title: "Photography Tips",
    icon: "📸",
    kind: "list",
  },
  {
    id: "emergency_contacts",
    keys: ["emergency_contacts"],
    title: "Emergency Contacts",
    icon: "📞",
    kind: "keyvalue",
  },
  {
    id: "useful_apps",
    keys: ["useful_apps"],
    title: "Useful Apps",
    icon: "📱",
    kind: "list",
  },
  {
    id: "transportation_advice",
    keys: ["transportation_advice", "transport_info", "transportation_info"],
    title: "Transportation Advice",
    icon: "🚕",
    kind: "list",
  },
  {
    id: "hotel_recommendations",
    keys: ["hotel_recommendations", "hotels"],
    title: "Hotel Recommendations",
    icon: "🏨",
    kind: "cards",
  },
  {
    id: "restaurant_recommendations",
    keys: ["restaurant_recommendations", "restaurants"],
    title: "Restaurant Recommendations",
    icon: "🍽️",
    kind: "restaurant_cards",
  },
  {
    id: "nearby_attractions",
    keys: ["nearby_attractions"],
    title: "Nearby Attractions",
    icon: "🗺️",
    kind: "cards",
  },
  {
    id: "hidden_gems",
    keys: ["hidden_gems"],
    title: "Hidden Gems",
    icon: "💎",
    kind: "cards",
  },
];
