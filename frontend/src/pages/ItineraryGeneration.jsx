import { useState, useEffect } from "react";

/**
 * Module 6: AI Itinerary Generation
 *
 * Renders AI-generated itinerary with clear day-level structure
 * and activity blocks following backend schema v2.0
 */
export default function ItineraryGeneration() {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // ============================================================================
  // LOAD CONFIGURATION FROM PREVIOUS MODULE
  // ============================================================================
  useEffect(() => {
    const stored = sessionStorage.getItem("tripConfiguration");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfiguration(parsed);
        console.log("✅ Configuration loaded from sessionStorage");
      } catch (err) {
        console.error("❌ Failed to parse configuration:", err);
      }
    } else {
      console.warn("⚠️ No configuration found in sessionStorage");
    }
  }, []);

  // ============================================================================
  // GENERATE ITINERARY
  // ============================================================================
  const handleGenerateItinerary = async () => {
    if (!configuration) return;

    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to generate itinerary");
      }

      const data = await response.json();
      setItinerary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HELPER: Get period icon
  // ============================================================================
  const getPeriodIcon = (period) => {
    const icons = {
      morning: "🌅",
      afternoon: "☀️",
      evening: "🌆",
    };
    return icons[period] || "📍";
  };

  // ============================================================================
  // HELPER: Get activity type badge
  // ============================================================================
  const getActivityBadge = (type) => {
    const styles = {
      relaxation: "bg-blue-100 text-blue-800 border-blue-200",
      food: "bg-orange-100 text-orange-800 border-orange-200",
      sightseeing: "bg-purple-100 text-purple-800 border-purple-200",
      culture: "bg-green-100 text-green-800 border-green-200",
      photography: "bg-pink-100 text-pink-800 border-pink-200",
      beach: "bg-cyan-100 text-cyan-800 border-cyan-200",
      adventure: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // ============================================================================
  // RENDER: MISSING CONFIGURATION
  // ============================================================================
  if (!configuration) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-red-300 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Missing Configuration
                </h2>
                <p className="text-gray-600 mb-4">
                  No trip configuration found. Please complete the configuration
                  step first.
                </p>
                <button
                  onClick={() => (window.location.href = "/trip-configuration")}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  ← Return to Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ====================================================================== */}
        {/* HEADER */}
        {/* ====================================================================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Itinerary Generation
          </h1>
          <p className="text-gray-600">
            Generate a personalized day-by-day travel itinerary
          </p>
        </div>

        {/* ====================================================================== */}
        {/* CONFIGURATION SUMMARY */}
        {/* ====================================================================== */}
        {!itinerary && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Your Trip Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-blue-200 bg-blue-50 rounded p-4">
                <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                  Route
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {configuration.trip_summary.source} →{" "}
                  {configuration.trip_summary.destination}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {configuration.trip_summary.days} days •{" "}
                  {configuration.trip_summary.travel_mode}
                </div>
              </div>

              <div className="border border-green-200 bg-green-50 rounded p-4">
                <div className="text-xs font-semibold text-green-700 uppercase mb-1">
                  Pace & Budget
                </div>
                <div className="text-sm font-bold text-gray-900 capitalize">
                  {configuration.constraints.pace} Pace
                </div>
                <div className="text-xs text-gray-600 mt-1 capitalize">
                  {configuration.constraints.budget} •{" "}
                  {configuration.constraints.places_per_day} places/day
                </div>
              </div>

              <div className="border border-orange-200 bg-orange-50 rounded p-4">
                <div className="text-xs font-semibold text-orange-700 uppercase mb-1">
                  Interests
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {configuration.interests.length} Selected
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {configuration.interests.slice(0, 2).join(", ")}
                  {configuration.interests.length > 2 &&
                    ` +${configuration.interests.length - 2}`}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateItinerary}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "✨ Generate My Itinerary"}
            </button>
          </div>
        )}

        {/* ====================================================================== */}
        {/* LOADING STATE */}
        {/* ====================================================================== */}
        {loading && (
          <div className="bg-white border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Generating Your Itinerary
            </h3>
            <p className="text-gray-600">
              AI is crafting your {configuration.trip_summary.days}-day
              itinerary for {configuration.trip_summary.destination}...
            </p>
            <p className="text-sm text-gray-500 mt-4">
              This may take 10-30 seconds
            </p>
          </div>
        )}

        {/* ====================================================================== */}
        {/* ERROR STATE */}
        {/* ====================================================================== */}
        {error && (
          <div className="bg-white border border-red-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">❌</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Generation Failed
                </h3>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleGenerateItinerary}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* ITINERARY DISPLAY */}
        {/* ====================================================================== */}
        {itinerary && (
          <div className="space-y-6">
            {/* Trip Header */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {itinerary.destination} - {itinerary.days} Days
                  </h2>
                  <p className="text-gray-600 mt-1 capitalize">
                    {itinerary.overall_style.pace} pace •{" "}
                    {itinerary.overall_style.budget} budget
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {configuration.interests.slice(0, 6).map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm"
                >
                  {showRawJson ? "Hide" : "Show"} Raw JSON
                </button>

                <button
                  onClick={handleGenerateItinerary}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm"
                >
                  🔄 Regenerate
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(itinerary, null, 2)
                    );
                    alert("Itinerary JSON copied!");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm"
                >
                  📋 Copy JSON
                </button>
              </div>
            </div>

            {/* Raw JSON View */}
            {showRawJson && (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm">
                    Raw JSON Response
                  </h3>
                  <button
                    onClick={() => setShowRawJson(false)}
                    className="text-gray-400 hover:text-white text-lg"
                  >
                    ✕
                  </button>
                </div>
                <pre className="text-green-400 text-xs font-mono overflow-auto max-h-96">
                  {JSON.stringify(itinerary, null, 2)}
                </pre>
              </div>
            )}

            {/* ================================================================== */}
            {/* DAY-BY-DAY ITINERARY */}
            {/* ================================================================== */}
            {itinerary.itinerary.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="bg-white border border-gray-300 rounded-lg overflow-hidden"
              >
                {/* DAY HEADER - PROMINENT */}
                <div className="bg-gray-800 text-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-gray-800">
                        {day.day}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {day.day_theme}
                      </h3>
                      <p className="text-gray-300 text-sm">{day.day_summary}</p>
                    </div>
                  </div>
                </div>

                {/* ACTIVITY BLOCKS */}
                <div className="divide-y divide-gray-200">
                  {day.blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="p-6">
                      {/* BLOCK HEADER - PERIOD + TIME + ACTIVITY TYPE */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-3xl flex-shrink-0">
                          {getPeriodIcon(block.period)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {block.period}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 font-medium">
                              {block.time_window}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getActivityBadge(
                                block.activity_type
                              )}`}
                            >
                              {block.activity_type}
                            </span>
                          </div>

                          {/* ACTIVITY TITLE */}
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {block.title}
                          </h4>

                          {/* DESCRIPTION */}
                          <p className="text-gray-700 leading-relaxed">
                            {block.description}
                          </p>
                        </div>
                      </div>

                      {/* OPTIONAL FIELDS - GRID LAYOUT */}
                      <div className="grid grid-cols-1 gap-3 mt-4 ml-16">
                        {/* MEAL INFO */}
                        {block.meal && block.meal.meal_type !== "none" && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">🍽️</span>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-orange-900 uppercase mb-1">
                                  {block.meal.meal_type}
                                </div>
                                <p className="text-sm text-orange-800 capitalize">
                                  {block.meal.cuisine_type} •{" "}
                                  {block.meal.dining_style}
                                  {block.meal.veg_friendly &&
                                    " • 🌱 Veg-friendly"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* LOGISTICS HINT */}
                        {block.logistics_hint && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">💡</span>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-blue-900 uppercase mb-1">
                                  Logistics
                                </div>
                                <p className="text-sm text-blue-800">
                                  {block.logistics_hint}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PHOTOGRAPHY NOTE */}
                        {block.photography_note &&
                          block.photography_note !== "None." && (
                            <div className="bg-purple-50 border border-purple-200 rounded p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-lg">📸</span>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-purple-900 uppercase mb-1">
                                    Photography Tip
                                  </div>
                                  <p className="text-sm text-purple-800">
                                    {block.photography_note}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* FOOTER */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                Your itinerary is ready. Generate another version or return to
                configuration.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleGenerateItinerary}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
                >
                  🔄 Generate Another
                </button>
                <button
                  onClick={() => (window.location.href = "/trip-configuration")}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded"
                >
                  ← Back to Config
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
