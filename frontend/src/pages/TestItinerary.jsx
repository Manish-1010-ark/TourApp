import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestItinerary() {
  // ============================================================================
  // MODULE 1: LOCATION STATE
  // ============================================================================
  // Why object instead of string?
  // - We need lat/lon for future route feasibility (Module 2)
  // - We need state for better UX display
  // - This enforces that user MUST select from dropdown (no free text)
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Refs for click-outside detection
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // ============================================================================
  // EXISTING STATE (preserved from original)
  // ============================================================================
  const [interests, setInterests] = useState([]);
  const [model, setModel] = useState("flash");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ step: 0, message: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const interestOptions = [
    { id: "beaches", label: "Beaches", icon: "🏖️" },
    { id: "local_food", label: "Local Food", icon: "🍛" },
    { id: "nightlife", label: "Nightlife", icon: "🌃" },
    { id: "culture", label: "Culture", icon: "🛕" },
    { id: "nature", label: "Nature", icon: "🌿" }
  ];

  const progressSteps = [
    "Validating inputs",
    "Generating itinerary",
    "Structuring response"
  ];

  // ============================================================================
  // MODULE 1: CITY SEARCH LOGIC
  // ============================================================================
  
  /**
   * Debounced city search
   * Why debounce? Prevents excessive API calls as user types
   * Why 400ms? Good balance between responsiveness and API efficiency
   */
  useEffect(() => {
    // Don't search if:
    // - Query is empty
    // - Query is too short (backend rejects < 2 chars anyway)
    // - User has already selected a city and hasn't changed the input
    if (citySearchQuery.length < 2) {
      setCitySuggestions([]);
      setShowDropdown(false);
      return;
    }

    // If user has selected a city and the query matches, don't search again
    if (selectedCity && citySearchQuery === selectedCity.name) {
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/locations/search?q=${encodeURIComponent(citySearchQuery)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setCitySuggestions(data);
          setShowDropdown(data.length > 0);
        } else {
          console.warn("Location search failed:", response.status);
          setCitySuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Location search error:", err);
        setCitySuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [citySearchQuery, selectedCity]);

  /**
   * Handle city selection from dropdown
   * Why clear search query? So user sees the selected city name clearly
   */
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCitySearchQuery(city.name); // Show selected city in input
    setShowDropdown(false);
    setError(null); // Clear any validation errors
  };

  /**
   * Handle input change
   * If user modifies the input after selecting, clear the selection
   * Why? Ensures selectedCity is always in sync with what's displayed
   */
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCitySearchQuery(value);
    
    // If user changes input after selecting a city, clear the selection
    if (selectedCity && value !== selectedCity.name) {
      setSelectedCity(null);
    }
  };

  /**
   * Click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // EXISTING LOGIC (preserved)
  // ============================================================================
  
  const toggleInterest = (id) => {
    setInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const simulateProgress = async () => {
    for (let i = 0; i < progressSteps.length; i++) {
      setProgress({ step: i, message: progressSteps[i] });
      await new Promise(resolve => setTimeout(resolve, i === 1 ? 1500 : 600));
    }
  };

  const handleGenerate = async () => {
    // ========================================================================
    // MODULE 1: CITY VALIDATION (NEW)
    // ========================================================================
    // Why enforce city selection?
    // - Prevents invalid destinations (typos, villages, regions)
    // - Ensures we have lat/lon for future route feasibility
    // - Maintains data quality for AI itinerary generation
    if (!selectedCity) {
      setError("Please select a valid city from the dropdown");
      return;
    }

    // ========================================================================
    // EXISTING VALIDATION (preserved)
    // ========================================================================
    if (interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ step: 0, message: progressSteps[0] });

    try {
      const progressPromise = simulateProgress();
      
      // ======================================================================
      // INTEGRATION WITH EXISTING BACKEND
      // ======================================================================
      // We send selectedCity.name to maintain backward compatibility
      // Future: Backend will use lat/lon for route feasibility (Module 2)
      const response = await fetch("http://127.0.0.1:8000/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: selectedCity.name, // Send city name (backward compatible)
          interests: interests,
          model: model
        })
      });

      await progressPromise;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("API Error:", err);
      
      if (err.message.includes("HTTP 400")) {
        setError("Invalid request. Please check your inputs.");
      } else if (err.message.includes("HTTP 429")) {
        setError("Premium model limit reached. Please use the standard model.");
      } else if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to backend. Please ensure the server is running on http://127.0.0.1:8000");
      } else {
        setError("Failed to generate itinerary. Please try again.");
      }
    } finally {
      setLoading(false);
      setProgress({ step: 0, message: "" });
    }
  };

  const getTimeIcon = (time) => {
    const icons = { morning: "🌅", afternoon: "☀️", evening: "🌆" };
    return icons[time] || "📍";
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
            AI Itinerary Test Console
          </h1>
          <p className="text-slate-600">
            Template-driven Gemini itinerary generation
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Configuration
          </h2>

          {/* ================================================================ */}
          {/* MODULE 1: CITY AUTOCOMPLETE (REPLACES FREE TEXT INPUT) */}
          {/* ================================================================ */}
          <div className="mb-5 relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination City
              <span className="text-xs text-slate-500 ml-2">
                (Search Indian cities only)
              </span>
            </label>
            
            {/* Autocomplete Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={citySearchQuery}
                onChange={handleCityInputChange}
                onFocus={() => {
                  if (citySuggestions.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Type to search cities (e.g., Mumbai, Goa, Kolkata)..."
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  selectedCity 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-slate-300'
                }`}
              />
              
              {/* Loading / Check Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : selectedCity ? (
                  <span className="text-green-600 text-xl">✓</span>
                ) : (
                  <span className="text-slate-400">🔍</span>
                )}
              </div>
            </div>

            {/* Selected City Badge */}
            {selectedCity && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">
                  ✓ {selectedCity.name}, {selectedCity.state}
                </span>
                <button
                  onClick={() => {
                    setSelectedCity(null);
                    setCitySearchQuery("");
                    setError(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Dropdown Suggestions */}
            <AnimatePresence>
              {showDropdown && citySuggestions.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                  {citySuggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-800">
                        {city.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {city.state}, India
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results Message */}
            {!isSearching && citySearchQuery.length >= 2 && citySuggestions.length === 0 && !selectedCity && (
              <p className="mt-2 text-sm text-slate-500">
                No cities found. Try a different search term.
              </p>
            )}
          </div>

          {/* ================================================================ */}
          {/* EXISTING INPUTS (preserved) */}
          {/* ================================================================ */}

          {/* Interests */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Interests
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(option.id)}
                    onChange={() => toggleInterest(option.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Model Selection
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="radio"
                  name="model"
                  value="flash"
                  checked={model === "flash"}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">
                    gemini-flash-latest
                  </div>
                  <div className="text-xs text-slate-500">
                    Standard model (unlimited)
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-amber-200 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                <input
                  type="radio"
                  name="model"
                  value="flash_plus"
                  checked={model === "flash_plus"}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-4 h-4 text-amber-600 focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    gemini-2.5-flash
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  </div>
                  <div className="text-xs text-amber-700">
                    ⚠️ Limited uses per session
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span>🚀</span>
                Generate Itinerary
              </>
            )}
          </button>
        </motion.div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 overflow-hidden"
            >
              <div className="space-y-4">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        progress.step > index
                          ? "bg-green-500 text-white"
                          : progress.step === index
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {progress.step > index ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium ${
                          progress.step >= index ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {step}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Generated Itinerary
                </h2>
                <span className="text-sm text-slate-600">
                  {result.destination} • {result.days} days
                </span>
              </div>

              <div className="space-y-4">
                {result.itinerary.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                      <h3 className="text-white font-semibold">
                        Day {day.day}
                      </h3>
                    </div>

                    {/* Time Blocks */}
                    <div className="divide-y divide-slate-100">
                      {["morning", "afternoon", "evening"].map((timeOfDay) => {
                        const block = day[timeOfDay];
                        return (
                          <div key={timeOfDay} className="p-5 hover:bg-slate-50 transition">
                            <div className="flex items-start gap-4">
                              <span className="text-3xl flex-shrink-0">
                                {getTimeIcon(timeOfDay)}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-800">
                                    {block.title}
                                  </h4>
                                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                                    {timeOfDay}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {block.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}