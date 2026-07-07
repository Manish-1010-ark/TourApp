// components/trip-preparation/StepProgress.jsx

/**
 * StepProgress — horizontal step indicator.
 * Reusable across trip-planner pages: pass `steps` (labels) and
 * `currentStep` (1-indexed).
 */
export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full max-w-2xl mx-auto mb-2" role="list" aria-label="Trip planning progress">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2" role="listitem" aria-current={isActive ? "step" : undefined}>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-body transition-all duration-300 ${
                  isComplete
                    ? "bg-[var(--color-success)] text-white"
                    : isActive
                    ? "bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(14,165,233,0.35)] scale-110"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isComplete ? "✓" : stepNum}
              </div>
              <span
                className={`text-xs font-semibold font-body text-center whitespace-nowrap transition-colors ${
                  isActive ? "text-[var(--color-headings)]" : isComplete ? "text-[var(--color-success)]" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>

            {stepNum < steps.length && (
              <div className="flex-1 h-[2px] mx-2 -mt-6 rounded-full overflow-hidden bg-slate-200">
                <div
                  className="h-full bg-[var(--color-success)] transition-all duration-500 ease-out"
                  style={{ width: isComplete ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
