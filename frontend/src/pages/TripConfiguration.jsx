import { useState, useEffect } from "react";

/**
 * TripConfiguration - Two-section configuration page
 *
 * SECTION 1: Details Verification (must be confirmed before proceeding)
 * SECTION 2: Final Constraints (pace, budget, interests, preferences)
 *
 * Data Flow:
 * sessionStorage (tripData) → Section 1 (verify) → Section 2 (configure) → API
 */
export default function TripConfiguration() {
  // ============================================================================
  // SECTION 1: TRIP DATA FROM PREVIOUS STEPS
  // ============================================================================
  const [tripData, setTripData] = useState(null);
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);

  // Load trip data from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("tripData");
    if (stored) {
      try {
        setTripData(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse trip data:", err);
      }
    }
  }, []);

  // ============================================================================
  // SECTION 2: CONFIGURATION STATE
  // ============================================================================
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("premium");
  const [suggestedInterests, setSuggestedInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [constraints, setConstraints] = useState({
    avoid_early_mornings: false,
    prefer_less_walking: false,
    family_friendly: false,
    vegetarian_friendly: false,
    photography_focus: false,
  });
  const [aiModel, setAiModel] = useState("gemini-flash-latest");

  // UI state
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // ============================================================================
  // INTEREST SUGGESTION (AI-POWERED)
  // ============================================================================
  const handleSuggestInterests = async () => {
    if (!tripData) return;

    setLoadingInterests(true);
    setError(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/interests/suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: tripData.source.name,
            destination: tripData.destination.name,
            travel_mode: tripData.travel_mode,
            days: tripData.days,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to suggest interests");
      }

      const data = await response.json();
      setSuggestedInterests(data.interests);

      // Auto-select first 5 for convenience
      setSelectedInterests(data.interests.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingInterests(false);
    }
  };

  // ============================================================================
  // FINAL CONFIGURATION
  // ============================================================================
  const handleConfigureTrip = async () => {
    if (!tripData) return;

    // Validation
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setLoadingConfig(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/trip/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: tripData.source,
          destination: tripData.destination,
          distance_km: tripData.distance_km,
          travel_mode: tripData.travel_mode,
          days: tripData.days,
          pace: pace,
          budget: budget,
          selected_interests: selectedInterests,
          optional_constraints: constraints,
          ai_model: aiModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to configure trip");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingConfig(false);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // ============================================================================
  // RENDER: MISSING DATA CHECK
  // ============================================================================
  if (!tripData) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-5">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Missing Trip Data
            </h2>
            <p className="text-sm text-red-700 mb-4">
              No trip data found. Please complete the trip preparation steps
              first.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded"
            >
              Return to Trip Preparation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Trip Configuration
          </h1>
          <p className="text-sm text-slate-600">
            Verify your trip details and configure final preferences
          </p>
        </div>

        {/* ====================================================================== */}
        {/* SECTION 1: DETAILS VERIFICATION */}
        {/* ====================================================================== */}
        <div className="bg-white border border-slate-300 rounded p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Section 1: Verify Trip Details
            </h2>
            {detailsConfirmed && (
              <span className="text-sm text-green-700 font-medium">
                ✓ Confirmed
              </span>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Source:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {tripData.source.name}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Destination:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {tripData.destination.name}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Distance:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {tripData.distance_km} km
                </span>
              </div>
              <div>
                <span className="text-slate-600">Travel Mode:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {tripData.travel_mode}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Duration:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {tripData.days} days
                </span>
              </div>
            </div>
          </div>

          {!detailsConfirmed ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Please review the above details carefully. Once confirmed, you
                cannot change them without restarting the trip preparation
                process.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDetailsConfirmed(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded"
                >
                  ✓ Confirm Details
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded"
                >
                  ← Go Back & Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800">
                ✓ Details confirmed. You can now proceed to configure your trip
                preferences below.
              </p>
            </div>
          )}
        </div>

        {/* ====================================================================== */}
        {/* SECTION 2: FINAL CONSTRAINTS (Disabled until Section 1 confirmed) */}
        {/* ====================================================================== */}
        <div
          className={`transition-opacity ${
            !detailsConfirmed ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="bg-white border border-slate-300 rounded p-5 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Section 2: Configure Trip Preferences
            </h2>

            {!detailsConfirmed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please confirm trip details in Section 1 before configuring
                  preferences.
                </p>
              </div>
            )}

            {/* 1. Travel Pace */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                1. Travel Pace
              </label>
              <p className="text-xs text-slate-600 mb-3">
                Determines places per day and start times
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["relaxed", "balanced", "fast"].map((option) => (
                  <label
                    key={option}
                    className={`p-3 border rounded cursor-pointer ${
                      pace === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pace"
                      value={option}
                      checked={pace === option}
                      onChange={(e) => setPace(e.target.value)}
                      disabled={!detailsConfirmed}
                      className="mr-2"
                    />
                    <span className="font-medium text-slate-800">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    <div className="text-xs text-slate-600 mt-1 ml-6">
                      {option === "relaxed" && "1-2 places/day, late starts"}
                      {option === "balanced" && "3-4 places/day, moderate"}
                      {option === "fast" && "4-5 places/day, early starts"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Budget Tier */}
            <div className="mb-5 pb-5 border-b border-slate-200">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                2. Budget Tier
              </label>
              <p className="text-xs text-slate-600 mb-3">
                Affects experience style (not hotel suggestions)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["basic", "premium", "luxury"].map((option) => (
                  <label
                    key={option}
                    className={`p-3 border rounded cursor-pointer ${
                      budget === option
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={option}
                      checked={budget === option}
                      onChange={(e) => setBudget(e.target.value)}
                      disabled={!detailsConfirmed}
                      className="mr-2"
                    />
                    <span className="font-medium text-slate-800">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    <div className="text-xs text-slate-600 mt-1 ml-6">
                      {option === "basic" && "Popular & free attractions"}
                      {option === "premium" && "Balanced experiences"}
                      {option === "luxury" && "Curated & exclusive"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Interests (AI-Suggested) */}
            <div className="mb-5 pb-5 border-b border-slate-200">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                3. Interests
              </label>
              <p className="text-xs text-slate-600 mb-3">
                AI-suggested interests based on your destination
              </p>

              <button
                onClick={handleSuggestInterests}
                disabled={!detailsConfirmed || loadingInterests}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium py-2 px-4 rounded mb-3"
              >
                {loadingInterests ? "Generating..." : "Get AI Suggestions"}
              </button>

              {suggestedInterests.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {suggestedInterests.map((interest) => (
                      <label
                        key={interest}
                        className={`p-2 border rounded cursor-pointer text-sm ${
                          selectedInterests.includes(interest)
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          disabled={!detailsConfirmed}
                          className="mr-2"
                        />
                        {interest}
                      </label>
                    ))}
                  </div>

                  {selectedInterests.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <span className="text-sm font-medium text-orange-900">
                        Selected ({selectedInterests.length}):
                      </span>
                      <span className="text-sm text-orange-800 ml-2">
                        {selectedInterests.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Optional Constraints */}
            <div className="mb-5 pb-5 border-b border-slate-200">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                4. Additional Preferences (Optional)
              </label>
              <p className="text-xs text-slate-600 mb-3">
                Additional preferences for AI generation
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.keys(constraints).map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={constraints[key]}
                      onChange={(e) =>
                        setConstraints((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      disabled={!detailsConfirmed}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700">
                      {key
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. AI Model Selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                5. AI Model
              </label>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                    aiModel === "gemini-flash-latest"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value="gemini-flash-latest"
                    checked={aiModel === "gemini-flash-latest"}
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={!detailsConfirmed}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">
                      Gemini Flash (Standard)
                    </div>
                    <div className="text-xs text-slate-600">
                      Unlimited uses • Reliable performance
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                    aiModel === "gemini-2.5-flash"
                      ? "border-amber-500 bg-amber-50"
                      : "border-amber-200 bg-amber-50 hover:bg-amber-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value="gemini-2.5-flash"
                    checked={aiModel === "gemini-2.5-flash"}
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={!detailsConfirmed}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      Gemini 2.5 Flash (Premium)
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        Premium
                      </span>
                    </div>
                    <div className="text-xs text-amber-700">
                      ⚠️ Limited uses per session • Enhanced quality
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfigureTrip}
              disabled={
                !detailsConfirmed ||
                loadingConfig ||
                selectedInterests.length === 0
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-4 rounded"
            >
              {loadingConfig
                ? "Processing Configuration..."
                : "Finalize Configuration"}
            </button>

            {selectedInterests.length === 0 && detailsConfirmed && (
              <p className="text-xs text-red-600 mt-2 text-center">
                Please generate and select at least one interest before
                finalizing
              </p>
            )}
          </div>
        </div>

        {/* ====================================================================== */}
        {/* ERROR DISPLAY */}
        {/* ====================================================================== */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Error
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* RESULT DISPLAY */}
        {/* ====================================================================== */}
        {result && (
          <div className="bg-white border border-slate-300 rounded p-5">
            <h2 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Configuration Complete
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Your trip configuration is ready for AI itinerary generation
            </p>

            {/* Summary Cards */}
            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Trip Summary
                </h3>
                <pre className="text-xs text-blue-800 overflow-auto">
                  {JSON.stringify(result.trip_summary, null, 2)}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  Constraints
                </h3>
                <pre className="text-xs text-green-800 overflow-auto">
                  {JSON.stringify(result.constraints, null, 2)}
                </pre>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <h3 className="text-sm font-semibold text-orange-900 mb-2">
                  Selected Interests ({result.interests.length})
                </h3>
                <p className="text-sm text-orange-800">
                  {result.interests.join(", ")}
                </p>
              </div>

              {Object.values(result.optional_constraints).some((v) => v) && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">
                    Additional Preferences
                  </h3>
                  <pre className="text-xs text-purple-800 overflow-auto">
                    {JSON.stringify(result.optional_constraints, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Full JSON (Collapsible) */}
            <details className="bg-slate-50 border border-slate-200 rounded p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-800">
                View Full JSON Response
              </summary>
              <pre className="text-xs text-slate-700 mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            {/* Next Step Button */}
            <button
              onClick={() => {
                // Store configuration in sessionStorage (persists across navigation)
                sessionStorage.setItem(
                  "tripConfiguration",
                  JSON.stringify(result)
                );

                // Navigate to itinerary generation
                window.location.href = "/itinerary-generation";
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 px-4 rounded mt-4"
            >
              Generate Itinerary →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
