// components/itinerary/ActionBar.jsx
import { useState } from "react";

function ActionButton({ children, onClick, variant = "ghost" }) {
  const base = "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold font-body transition-all duration-150 whitespace-nowrap";
  const styles =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white hover:brightness-105 shadow-[0_4px_14px_rgba(14,165,233,0.28)]"
      : "text-slate-600 hover:bg-slate-100 hover:text-[var(--color-headings)]";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

/**
 * ActionBar — top navigation. Deliberately free of anything technical
 * (no model names, no raw-JSON toggles) — only traveller-facing actions.
 */
export default function ActionBar({ onRegenerate, isRegenerating }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Trip Itinerary", text: "Check out my AI-planned trip!" });
      } catch {
        /* user cancelled share sheet — nothing to do */
      }
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(() => {});
      showToast("Link copied to clipboard");
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="w-9 h-9 shrink-0 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-[var(--color-headings)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-display font-bold text-lg text-[var(--color-headings)] truncate">Traviora</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <ActionButton
            onClick={() => {
              setSaved((s) => !s);
              showToast(saved ? "Removed from saved trips" : "Trip saved");
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
              <path d="M6 4h12v16l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">{saved ? "Saved" : "Save Trip"}</span>
          </ActionButton>

          <ActionButton onClick={handleShare}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="2.3" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="6" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="18" cy="19" r="2.3" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 10.8l8-4.4M8 13.2l8 4.4" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </ActionButton>

          <ActionButton onClick={() => window.print()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V3h12v6M6 18h12v3H6v-3zM4 9h16a1 1 0 011 1v6h-4v-3H7v3H3v-6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Print</span>
          </ActionButton>

          <ActionButton onClick={() => showToast("PDF export is coming soon")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M9 13.5h1.6c1 0 1.6-.6 1.6-1.4S11.6 10.7 10.6 10.7H9v5.6M14 10.7v5.6M17 10.7h-1.5v5.6h1.5a2 2 0 000-5.6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Export PDF</span>
          </ActionButton>

          <ActionButton variant="primary" onClick={onRegenerate}>
            {isRegenerating ? (
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
                <path d="M21 12a9 9 0 00-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 4v5h5M20 20v-5h-5M4.6 15a8 8 0 0014.8 2.5M19.4 9a8 8 0 00-14.8-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="hidden sm:inline">{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
          </ActionButton>
        </div>
      </div>

      {toast && (
        <div className="absolute right-4 top-full mt-2 bg-slate-800 text-white text-xs font-body font-semibold px-3.5 py-2 rounded-xl shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}