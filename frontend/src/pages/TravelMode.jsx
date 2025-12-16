import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Module 3: Travel Mode & Distance Tab
 * 
 * This component helps users:
 * 1. See recommended travel modes based on distance
 * 2. View estimated travel times for all modes
 * 3. Select a preferred mode and validate its feasibility
 */
export default function TravelMode() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // These would come from Module 2 in real implementation
  const [distance, setDistance] = useState(461); // Mumbai to Goa example
  const [days, setDays] = useState(3);
  
  // User's preferred mode selection
  const [preferredMode, setPreferredMode] = useState(null);
  
  // API response
  const [modeData, setModeData] = useState(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);

  // ============================================================================
  // TRAVEL MODE CONFIG
  // ============================================================================
  
  const TRAVEL_MODES = {
    flight: {
      label: "Flight",
      icon: "✈️",
      color: "blue",
      description: "Fastest option for long distances"
    },
    train: {
      label: "Train",
      icon: "🚂",
      color: "green",
      description: "Scenic and comfortable journey"
    },
    bus: {
      label: "Bus",
      icon: "🚌",
      color: "orange",
      description: "Budget-friendly travel"
    },
    car: {
      label: "Car",
      icon: "🚗",
      color: "purple",
      description: "Flexible and convenient"
    }
  };

  // ============================================================================
  // API CALL
  // ============================================================================
  
  const fetchTravelModes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/travel/modes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance_km: distance,
          days: days,
          preferred_mode: preferredMode
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setModeData(data);
      
    } catch (err) {
      console.error("Travel mode error:", err);
      setError("Failed to fetch travel modes. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on component mount and when inputs change
  useEffect(() => {
    fetchTravelModes();
  }, [distance, days, preferredMode]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const getColorClass = (color, type = "bg") => {
    const colors = {
      blue: type === "bg" ? "bg-blue-500" : type === "border" ? "border-blue-500" : "text-blue-700",
      green: type === "bg" ? "bg-green-500" : type === "border" ? "border-green-500" : "text-green-700",
      orange: type === "bg" ? "bg-orange-500" : type === "border" ? "border-orange-500" : "text-orange-700",
      purple: type === "bg" ? "bg-purple-500" : type === "border" ? "border-purple-500" : "text-purple-700"
    };
    return colors[color] || colors.blue;
  };

  const isRecommended = (mode) => {
    return modeData?.recommended_modes?.includes(mode);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🚗 Travel Mode & Distance
          </h1>
          <p className="text-slate-600">
            Choose your travel mode and see estimated journey times
          </p>
        </motion.div>

        {/* Input Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Trip Configuration
          </h2>

          {/* Distance Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Distance: {distance} km
              <span className="text-xs text-slate-500 ml-2">
                (From Module 2: Route Validation)
              </span>
            </label>
            <input
              type="range"
              min="50"
              max="2500"
              step="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>50 km</span>
              <span>2500 km</span>
            </div>
          </div>

          {/* Days Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trip Duration: {days} days
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 day</span>
              <span>10 days</span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-600">Calculating travel modes...</span>
            </div>
          </div>
        )}

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

        {/* Results Display */}
        {modeData && !isLoading && (
          <>
            {/* Recommended Modes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                ✨ Recommended Travel Modes
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Based on {distance} km distance, these modes are most suitable:
              </p>
              
              <div className="flex flex-wrap gap-3">
                {modeData.recommended_modes.map((mode) => (
                  <div
                    key={mode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${getColorClass(TRAVEL_MODES[mode].color, "bg")} bg-opacity-10 border-2 ${getColorClass(TRAVEL_MODES[mode].color, "border")}`}
                  >
                    <span className="text-2xl">{TRAVEL_MODES[mode].icon}</span>
                    <span className={`font-medium ${getColorClass(TRAVEL_MODES[mode].color, "text")}`}>
                      {TRAVEL_MODES[mode].label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Travel Mode Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Choose Your Travel Mode
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(TRAVEL_MODES).map(([modeKey, modeInfo]) => {
                  const isRec = isRecommended(modeKey);
                  const isSelected = preferredMode === modeKey;
                  
                  return (
                    <motion.button
                      key={modeKey}
                      onClick={() => setPreferredMode(isSelected ? null : modeKey)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-5 rounded-lg border-2 transition text-left ${
                        isSelected
                          ? `${getColorClass(modeInfo.color, "border")} bg-opacity-5 ${getColorClass(modeInfo.color, "bg")}`
                          : isRec
                          ? "border-slate-300 bg-white hover:border-slate-400"
                          : "border-slate-200 bg-slate-50 opacity-75"
                      }`}
                    >
                      {/* Recommended Badge */}
                      {isRec && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ⭐ Recommended
                          </span>
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className={`w-6 h-6 rounded-full ${getColorClass(modeInfo.color, "bg")} flex items-center justify-center`}>
                            <span className="text-white text-sm">✓</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{modeInfo.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            {modeInfo.label}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {modeInfo.description}
                          </p>
                          
                          {/* Estimated Time */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Estimated time:</span>
                            <span className="text-sm font-semibold text-slate-800">
                              {modeData.estimated_times[modeKey]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Validation Warning */}
            <AnimatePresence>
              {preferredMode && !modeData.preferred_mode_valid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5 mb-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        Selected Mode Not Recommended
                      </h3>
                      <p className="text-sm text-orange-800 mb-3">
                        {modeData.preferred_mode_reason}
                      </p>
                      <button
                        onClick={() => setPreferredMode(null)}
                        className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {preferredMode && modeData.preferred_mode_valid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-green-50 border-2 border-green-300 rounded-lg p-5 mb-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">✅</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Great Choice!
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        {TRAVEL_MODES[preferredMode].label} is a suitable travel mode for your {distance}km, {days}-day trip. 
                        Estimated travel time: {modeData.estimated_times[preferredMode]}.
                      </p>
                      <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        Proceed to Budget Estimation
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  📊 Travel Time Comparison
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {Object.entries(TRAVEL_MODES).map(([modeKey, modeInfo]) => (
                    <div
                      key={modeKey}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isRecommended(modeKey) ? "bg-green-50" : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{modeInfo.icon}</span>
                        <span className="font-medium text-slate-800">
                          {modeInfo.label}
                        </span>
                        {isRecommended(modeKey) && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {modeData.estimated_times[modeKey]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5"
        >
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ How Travel Modes Are Recommended
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>0-300 km:</strong> Car, Bus (flexible road travel)</li>
            <li>• <strong>300-700 km:</strong> Train, Bus (comfortable medium distance)</li>
            <li>• <strong>700-1200 km:</strong> Train, Flight (long distance options)</li>
            <li>• <strong>&gt;1200 km:</strong> Flight, Train (cross-country travel)</li>
            <li>• All estimates include realistic buffers for Indian travel conditions</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}