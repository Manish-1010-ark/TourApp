// components/itinerary/ErrorState.jsx

const ERROR_PRESETS = {
  network: {
    icon: "📡",
    title: "Can't reach the server",
    message: "Check your connection and make sure the backend is running, then try again.",
  },
  backend: {
    icon: "⚠️",
    title: "Something went wrong on our end",
    message: "The server ran into an issue generating your itinerary.",
  },
  timeout: {
    icon: "⏱️",
    title: "That's taking longer than expected",
    message: "Itinerary generation timed out. Please try again.",
  },
  empty: {
    icon: "🗺️",
    title: "No itinerary came back",
    message: "The response was empty. Let's give it another shot.",
  },
  malformed: {
    icon: "🧩",
    title: "The response looked incomplete",
    message: "We couldn't make sense of the itinerary data returned. Please try regenerating.",
  },
  generic: {
    icon: "❌",
    title: "Generation failed",
    message: "We couldn't generate your itinerary.",
  },
};

/**
 * ErrorState — classifies `error` into one of the presets above (falls
 * back to "generic") so the failure always reads as a calm, on-brand
 * message rather than a raw exception string, and always offers Retry.
 */
export default function ErrorState({ kind = "generic", detail, onRetry }) {
  const preset = ERROR_PRESETS[kind] ?? ERROR_PRESETS.generic;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in-up">
      <div className="text-5xl mb-4">{preset.icon}</div>
      <h2 className="font-display text-2xl font-bold text-[var(--color-headings)] mb-2">{preset.title}</h2>
      <p className="font-body text-slate-500 mb-1">{preset.message}</p>
      {detail && <p className="font-body text-xs text-slate-400 mb-6">{detail}</p>}
      <button onClick={onRetry} className="btn-primary mt-5 px-6">
        Try Again
      </button>
    </div>
  );
}