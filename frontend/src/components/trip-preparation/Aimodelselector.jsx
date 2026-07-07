// components/trip-preparation/AIModelSelector.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Model catalogue — the ONLY place a new model needs to be added.
 * `value` must exactly match what the backend's /api/trip/configure
 * endpoint expects for `ai_model` (contract unchanged).
 */
export const AI_MODELS = [
  {
    value: "gemini-flash-latest",
    label: "Gemini Flash",
    tier: "Standard",
    description: "Unlimited uses · reliable performance",
  },
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    tier: "Premium",
    description: "Limited uses per session · enhanced quality",
  },
];

export default function AIModelSelector({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = AI_MODELS.find((m) => m.value === value) ?? AI_MODELS[0];

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 bg-white text-left transition-colors ${
          isOpen
            ? "border-[var(--color-primary)]"
            : "border-slate-200 hover:border-slate-300"
        } disabled:opacity-50`}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-semibold font-body text-sm text-[var(--color-headings)] truncate">
              {current.label}
            </span>
            <span
              className={`text-[10px] font-bold font-body uppercase tracking-wide px-2 py-0.5 rounded-full ${
                current.tier === "Premium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {current.tier}
            </span>
          </span>
          <span className="block text-xs font-body text-slate-500 mt-0.5 truncate">
            {current.description}
          </span>
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] overflow-hidden animate-pop-in"
        >
          {AI_MODELS.map((model) => (
            <li
              key={model.value}
              role="option"
              aria-selected={model.value === value}
            >
              <button
                type="button"
                onClick={() => {
                  onChange(model.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-50 last:border-b-0 ${
                  model.value === value
                    ? "bg-[var(--color-bg-secondary)]"
                    : "hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-semibold font-body text-sm text-[var(--color-headings)]">
                    {model.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-body uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      model.tier === "Premium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {model.tier}
                  </span>
                </span>
                <span className="block text-xs font-body text-slate-500 mt-0.5">
                  {model.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
