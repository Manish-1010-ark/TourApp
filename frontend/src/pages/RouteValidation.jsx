import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Module 2: Route Validation Tab
 *
 * This component validates route feasibility between two cities.
 * It calls the deterministic backend endpoint (no AI).
 */
export default function RouteValidation() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Source city (should come from Module 1's city selector)
  const [source, setSource] = useState(null);

  // Destination city (should come from Module 1's city selector)
  const [destination, setDestination] = useState(null);

  // Trip duration
  const [days, setDays] = useState(3);

  // Validation result
  const [validationResult, setValidationResult] = useState(null);

  // Loading state
  const [isValidating, setIsValidating] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // ============================================================================
  // MOCK CITY DATA (for demonstration)
  // In real implementation, these would come from Module 1's city selector
  // ============================================================================

  const exampleCities = [
    { name: "Delhi", state: "Delhi", lat: 28.7041, lon: 77.1025 },
    { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777 },
    { name: "Bangalore", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
    { name: "Goa", state: "Goa", lat: 15.2993, lon: 74.124 },
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
    { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081 },
  ];

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  const handleValidate = async () => {
    // Input validation
    if (!source || !destination) {
      setError("Please select both source and destination cities");
      return;
    }

    if (source.name === destination.name) {
      setError("Source and destination must be different");
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/route/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: { lat: source.lat, lon: source.lon },
          destination: { lat: destination.lat, lon: destination.lon },
          days: days,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      console.error("Validation error:", err);
      setError(
        "Failed to validate route. Please ensure the backend is running."
      );
    } finally {
      setIsValidating(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🗺️ Route Feasibility Validator
          </h1>
          <p className="text-slate-600">
            Check if your trip is feasible based on distance and duration
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Trip Details
          </h2>

          {/* Source City Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Source City
            </label>
            <select
              value={source?.name || ""}
              onChange={(e) => {
                const city = exampleCities.find(
                  (c) => c.name === e.target.value
                );
                setSource(city || null);
                setValidationResult(null);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select source city</option>
              {exampleCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          {/* Destination City Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination City
            </label>
            <select
              value={destination?.name || ""}
              onChange={(e) => {
                const city = exampleCities.find(
                  (c) => c.name === e.target.value
                );
                setDestination(city || null);
                setValidationResult(null);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select destination city</option>
              {exampleCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          {/* Days Selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trip Duration: {days} days
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setValidationResult(null);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 day</span>
              <span>10 days</span>
            </div>
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            disabled={isValidating || !source || !destination}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <span>🔍</span>
                Validate Route
              </>
            )}
          </button>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Error
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Result */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden"
            >
              {/* Result Header */}
              <div
                className={`px-6 py-4 ${
                  validationResult.feasible
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : "bg-gradient-to-r from-orange-500 to-orange-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">
                    {validationResult.feasible
                      ? "✅ Route Feasible"
                      : "⚠️ Route Not Recommended"}
                  </h3>
                  <span className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {validationResult.distance_km} km
                  </span>
                </div>
              </div>

              {/* Result Details */}
              <div className="p-6 space-y-4">
                {/* Distance Info */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Distance</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {validationResult.distance_km} km
                    </div>
                  </div>
                  <div className="text-4xl">📏</div>
                </div>

                {/* Days Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Your Plan</div>
                    <div className="text-xl font-bold text-blue-800">
                      {days} days
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 mb-1">
                      Recommended
                    </div>
                    <div className="text-xl font-bold text-purple-800">
                      {validationResult.minimum_days} days
                    </div>
                  </div>
                </div>

                {/* Reason (if not feasible) */}
                {validationResult.reason && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <div className="text-sm font-semibold text-orange-800 mb-1">
                          Recommendation
                        </div>
                        <p className="text-sm text-orange-700">
                          {validationResult.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {validationResult.feasible && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <div className="text-sm font-semibold text-green-800 mb-1">
                          Great Choice!
                        </div>
                        <p className="text-sm text-green-700">
                          Your {days}-day trip from {source?.name} to{" "}
                          {destination?.name} is well-paced and realistic. You
                          can proceed to the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {validationResult.feasible ? (
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition">
                      ✅ Proceed to Itinerary
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setDays(validationResult.minimum_days)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition"
                      >
                        Use {validationResult.minimum_days} Days
                      </button>
                      <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition">
                        Adjust Route
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5"
        >
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ How It Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Calculates straight-line distance using coordinates</li>
            <li>
              • Recommends minimum days based on India-specific travel patterns
            </li>
            <li>• Ensures realistic pacing for comfortable travel</li>
            <li>• 100% deterministic (no AI, no external APIs)</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
