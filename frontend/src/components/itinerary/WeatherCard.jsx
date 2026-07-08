// components/itinerary/WeatherCard.jsx

/**
 * The backend sends icon *identifiers* (Material-Symbols-style strings like
 * "partly_sunny", "clear-day", "thunderstorm"), not emoji. Rendering that
 * identifier directly as text (at text-3xl!) was the bug behind the layout
 * blowing up — a 12-character string at 3xl size forced the icon flex item
 * wide, squeezing the description into a sliver and wrapping it one word
 * per line. This map translates known identifiers to real emoji, with a
 * safe fallback for anything unrecognized so a new/unexpected backend value
 * can never do that again.
 */
const WEATHER_ICON_MAP = {
  sunny: "☀️",
  clear: "☀️",
  "clear-day": "☀️",
  "clear-night": "🌙",
  partly_sunny: "🌤️",
  partly_cloudy: "⛅",
  "partly-cloudy-day": "🌤️",
  "partly-cloudy-night": "☁️",
  cloudy: "☁️",
  overcast: "☁️",
  rain: "🌧️",
  showers: "🌦️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "❄️",
  sleet: "🌨️",
  fog: "🌫️",
  mist: "🌫️",
  haze: "🌫️",
  windy: "💨",
};

const DEFAULT_WEATHER_ICON = "🌤️";

function resolveWeatherIcon(icon) {
  if (!icon) return DEFAULT_WEATHER_ICON;

  // Already a short glyph/emoji (emoji are typically 1-4 UTF-16 code units) —
  // render as-is rather than trying to look it up.
  if (icon.length <= 4) return icon;

  const key = String(icon).trim().toLowerCase().replace(/\s+/g, "_");
  return WEATHER_ICON_MAP[key] ?? DEFAULT_WEATHER_ICON;
}

/**
 * WeatherCard — the backend doesn't provide weather data today, so this
 * renders a clearly-labelled placeholder illustration rather than
 * fabricating a forecast. Swaps to real data automatically the moment
 * `weather` is present on the itinerary response.
 */
export default function WeatherCard({ weather }) {
  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">
        Weather Snapshot
      </div>

      {weather ? (
        <div className="flex items-start gap-3">
          {/* shrink-0 is load-bearing: without it, an unexpectedly long
              icon value can still steal width from the text column below. */}
          <div className="text-3xl shrink-0">
            {resolveWeatherIcon(weather.icon)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-lg text-[var(--color-headings)]">
              {weather.temp_min ?? weather.min}° –{" "}
              {weather.temp_max ?? weather.max}°C
            </div>
            <div className="text-xs font-body text-slate-500">
              {weather.summary ?? weather.condition}
            </div>
            {weather.best_time_to_visit && (
              <div className="text-xs font-body text-slate-400 mt-1">
                Best time to visit:{" "}
                <span className="font-semibold text-slate-500">
                  {weather.best_time_to_visit}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className="text-slate-300 shrink-0"
          >
            <circle
              cx="9"
              cy="10"
              r="4"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M9 2v1.5M9 16.5V18M2 10h1.5M14.5 10H16M4.2 4.9l1 1M12.8 4.9l-1 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M9 15a5 5 0 015-5 4 4 0 014 4 3.5 3.5 0 01-3.5 3.5H10a3 3 0 01-1-.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs font-body text-slate-400 leading-relaxed">
            Weather data isn't available yet — check back closer to your travel
            dates.
          </p>
        </div>
      )}
    </div>
  );
}
