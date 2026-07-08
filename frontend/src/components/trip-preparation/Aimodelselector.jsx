// components/trip-preparation/AIModelSelector.jsx

/**
 * Tier catalogue — the ONLY place a tier needs to be added or changed.
 * `value` is a semantic key ("standard" / "pro") sent as `ai_model` to
 * the backend's /api/itinerary endpoint. The backend's MODEL_MAP resolves
 * it to the actual Gemini model — users never see a model name or
 * version number, only the tier.
 */
export const AI_MODELS = [
  {
    value: "standard",
    label: "Standard",
    tagline: "Fast & reliable",
    description: "Great for most trips. Unlimited generations.",
    icon: "⚡",
  },
  {
    value: "pro",
    label: "Pro",
    tagline: "Deeper, richer detail",
    description:
      "More thoughtful recommendations for complex trips. Limited uses per session.",
    icon: "✨",
  },
];

/**
 * Small pill shown top-right of a card. `tone` picks the color scheme so
 * "unlimited" reads as a positive/green state, "remaining" as a neutral
 * amber countdown, and "exhausted" as a clear stop state.
 */
function UsageBadge({ tone, children }) {
  const styles = {
    unlimited: "bg-emerald-50 text-emerald-700",
    remaining: "bg-amber-50 text-amber-700",
    exhausted: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`text-[11px] font-bold font-body uppercase tracking-wide px-2.5 py-1 rounded-full ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * AIModelSelector — purely presentational, like the rest of this form
 * step: `value`/`onChange`/`disabled` come from the parent, and so does
 * `proUsage`. This component never fetches usage data itself; the parent
 * owns that (see GET /api/usage in usage_routes.py) so a single source of
 * truth stays in one place and this stays easy to test in isolation.
 *
 * proUsage: { remaining: number, limit: number } | null
 *   - null / undefined -> no badge shown yet (e.g. still loading)
 *   - remaining > 0    -> amber "{remaining} LEFT" pill
 *   - remaining <= 0   -> slate "LIMIT REACHED" pill, and the Pro option
 *                          is force-disabled even if the parent's
 *                          `disabled` prop is false
 */
export default function AIModelSelector({
  value,
  onChange,
  disabled,
  proUsage,
}) {
  const current = value ?? AI_MODELS[0].value;
  const proExhausted = !!proUsage && proUsage.remaining <= 0;

  return (
    <div
      role="radiogroup"
      aria-label="Itinerary generation quality"
      className="grid grid-cols-2 gap-3 w-full"
    >
      {AI_MODELS.map((option) => {
        const selected = option.value === current;
        const isPro = option.value === "pro";
        const optionDisabled = disabled || (isPro && proExhausted);

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={optionDisabled}
            onClick={() => onChange(option.value)}
            className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              selected
                ? "border-[var(--color-primary)] bg-[var(--color-bg-secondary)] shadow-[0_4px_14px_rgba(14,165,233,0.18)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {selected && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}

            <div className="flex items-center justify-between mb-2 pr-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg shrink-0">
                {option.icon}
              </div>

              {!isPro && <UsageBadge tone="unlimited">Unlimited</UsageBadge>}
              {isPro && proUsage && (
                <UsageBadge tone={proExhausted ? "exhausted" : "remaining"}>
                  {proExhausted
                    ? "Limit reached"
                    : `${proUsage.remaining} left`}
                </UsageBadge>
              )}
            </div>

            <div className="font-display font-bold text-sm text-[var(--color-headings)] mb-0.5">
              {option.label}
            </div>
            <div className="text-xs font-semibold font-body text-[var(--color-primary)] mb-1.5">
              {option.tagline}
            </div>
            <div className="text-xs font-body text-slate-500 leading-snug">
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
