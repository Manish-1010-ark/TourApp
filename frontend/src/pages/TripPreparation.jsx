import { useState, useEffect, useRef } from "react";

/**
 * TripPreparation - Merged component for trip setup pipeline
 * 
 * Data Flow:
 * Step 1 (City Selection) → Step 2 (Route Validation) → Step 3 (Travel Mode)
 * 
 * State flow:
 * - selectedCity (lat/lon) → route validation API
 * - validation result (distance_km) → travel mode API
 * - days input → both validation & travel mode APIs
 */
export default function TripPreparation() {
  // ============================================================================
  // STEP 1: CITY SELECTION STATE
  // ============================================================================
  const [sourceCity, setSourceCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [sourceCityQuery, setSourceCityQuery] = useState("");
  const [destCityQuery, setDestCityQuery] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const sourceDropdownRef = useRef(null);
  const sourceInputRef = useRef(null);
  const destDropdownRef = useRef(null);
  const destInputRef = useRef(null);

  // ============================================================================
  // STEP 2: ROUTE VALIDATION STATE
  // ============================================================================
  const [days, setDays] = useState(3);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // ============================================================================
  // STEP 3: TRAVEL MODE STATE
  // ============================================================================
  const [preferredMode, setPreferredMode] = useState(null);
  const [modeData, setModeData] = useState(null);
  const [isLoadingModes, setIsLoadingModes] = useState(false);
  const [modeError, setModeError] = useState(null);

  // Navigation
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const TRAVEL_MODES = {
    flight: { label: "Flight", icon: "✈️" },
    train: { label: "Train", icon: "🚂" },
    bus: { label: "Bus", icon: "🚌" },
    car: { label: "Car", icon: "🚗" }
  };

  // ============================================================================
  // CITY SEARCH LOGIC (SOURCE)
  // ============================================================================
  useEffect(() => {
    if (sourceCityQuery.length < 2) {
      setSourceSuggestions([]);
      setShowSourceDropdown(false);
      return;
    }

    if (sourceCity && sourceCityQuery === sourceCity.name) {
      setShowSourceDropdown(false);
      return;
    }

    setIsSearchingSource(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/locations/search?q=${encodeURIComponent(sourceCityQuery)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSourceSuggestions(data);
          setShowSourceDropdown(data.length > 0);
        } else {
          setSourceSuggestions([]);
          setShowSourceDropdown(false);
        }
      } catch (err) {
        setSourceSuggestions([]);
        setShowSourceDropdown(false);
      } finally {
        setIsSearchingSource(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [sourceCityQuery, sourceCity]);

  // ============================================================================
  // CITY SEARCH LOGIC (DESTINATION)
  // ============================================================================
  useEffect(() => {
    if (destCityQuery.length < 2) {
      setDestSuggestions([]);
      setShowDestDropdown(false);
      return;
    }

    if (destCity && destCityQuery === destCity.name) {
      setShowDestDropdown(false);
      return;
    }

    setIsSearchingDest(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/locations/search?q=${encodeURIComponent(destCityQuery)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setDestSuggestions(data);
          setShowDestDropdown(data.length > 0);
        } else {
          setDestSuggestions([]);
          setShowDestDropdown(false);
        }
      } catch (err) {
        setDestSuggestions([]);
        setShowDestDropdown(false);
      } finally {
        setIsSearchingDest(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [destCityQuery, destCity]);

  // ============================================================================
  // CLICK OUTSIDE HANDLERS
  // ============================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sourceDropdownRef.current && 
        !sourceDropdownRef.current.contains(event.target) &&
        sourceInputRef.current &&
        !sourceInputRef.current.contains(event.target)
      ) {
        setShowSourceDropdown(false);
      }
      if (
        destDropdownRef.current && 
        !destDropdownRef.current.contains(event.target) &&
        destInputRef.current &&
        !destInputRef.current.contains(event.target)
      ) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // STEP 2: ROUTE VALIDATION LOGIC
  // ============================================================================
  const handleValidateRoute = async () => {
    if (!sourceCity || !destCity) {
      setValidationError("Please select both source and destination cities");
      return;
    }

    if (sourceCity.name === destCity.name) {
      setValidationError("Source and destination must be different");
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);
    setModeData(null); // Reset step 3
    setPreferredMode(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/route/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: { lat: sourceCity.lat, lon: sourceCity.lon },
          destination: { lat: destCity.lat, lon: destCity.lon },
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
      setValidationError("Failed to validate route. Ensure backend is running.");
    } finally {
      setIsValidating(false);
    }
  };

  // ============================================================================
  // STEP 3: TRAVEL MODE LOGIC
  // ============================================================================
  const fetchTravelModes = async () => {
    if (!validationResult) return;

    setIsLoadingModes(true);
    setModeError(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/travel/modes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distance_km: validationResult.distance_km,
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
      setModeError("Failed to fetch travel modes. Ensure backend is running.");
    } finally {
      setIsLoadingModes(false);
    }
  };

  // Auto-fetch travel modes when validation succeeds
  useEffect(() => {
    if (validationResult && validationResult.feasible) {
      fetchTravelModes();
    }
  }, [validationResult, days, preferredMode]);

  // ============================================================================
  // STEP 4: PROCEED TO CONFIGURATION
  // ============================================================================
  const handleProceedToConfiguration = () => {
    // Store trip data in sessionStorage for TripConfiguration page
    const tripData = {
      source: sourceCity,
      destination: destCity,
      distance_km: validationResult.distance_km,
      travel_mode: preferredMode,
      days: days
    };
    
    sessionStorage.setItem('tripData', JSON.stringify(tripData));
    
    // Redirect to configuration page
    window.location.href = '/trip-configuration';
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Trip Preparation Pipeline
          </h1>
          <p className="text-sm text-slate-600">
            Complete each step sequentially to plan your trip
          </p>
        </div>

        {/* ====================================================================== */}
        {/* STEP 1: CITY SELECTION */}
        {/* ====================================================================== */}
        <div className="bg-white border border-slate-200 rounded p-5 mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Step 1: Select Cities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Source City */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source City
              </label>
              <input
                ref={sourceInputRef}
                type="text"
                value={sourceCityQuery}
                onChange={(e) => {
                  setSourceCityQuery(e.target.value);
                  if (sourceCity && e.target.value !== sourceCity.name) {
                    setSourceCity(null);
                  }
                }}
                onFocus={() => {
                  if (sourceSuggestions.length > 0) {
                    setShowSourceDropdown(true);
                  }
                }}
                placeholder="Type to search..."
                className={`w-full px-3 py-2 border rounded text-sm ${
                  sourceCity ? 'border-green-400 bg-green-50' : 'border-slate-300'
                }`}
              />
              
              {/* Source Dropdown */}
              {showSourceDropdown && sourceSuggestions.length > 0 && (
                <div
                  ref={sourceDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto"
                >
                  {sourceSuggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSourceCity(city);
                        setSourceCityQuery(city.name);
                        setShowSourceDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-800">{city.name}</div>
                      <div className="text-xs text-slate-500">{city.state}</div>
                    </button>
                  ))}
                </div>
              )}

              {sourceCity && (
                <div className="mt-1 text-xs text-green-700">
                  ✓ {sourceCity.name}, {sourceCity.state}
                </div>
              )}
            </div>

            {/* Destination City */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destination City
              </label>
              <input
                ref={destInputRef}
                type="text"
                value={destCityQuery}
                onChange={(e) => {
                  setDestCityQuery(e.target.value);
                  if (destCity && e.target.value !== destCity.name) {
                    setDestCity(null);
                  }
                }}
                onFocus={() => {
                  if (destSuggestions.length > 0) {
                    setShowDestDropdown(true);
                  }
                }}
                placeholder="Type to search..."
                className={`w-full px-3 py-2 border rounded text-sm ${
                  destCity ? 'border-green-400 bg-green-50' : 'border-slate-300'
                }`}
              />
              
              {/* Dest Dropdown */}
              {showDestDropdown && destSuggestions.length > 0 && (
                <div
                  ref={destDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto"
                >
                  {destSuggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDestCity(city);
                        setDestCityQuery(city.name);
                        setShowDestDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-800">{city.name}</div>
                      <div className="text-xs text-slate-500">{city.state}</div>
                    </button>
                  ))}
                </div>
              )}

              {destCity && (
                <div className="mt-1 text-xs text-green-700">
                  ✓ {destCity.name}, {destCity.state}
                </div>
              )}
            </div>
          </div>

          {/* Days Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Trip Duration: {days} days
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 day</span>
              <span>10 days</span>
            </div>
          </div>

          <button
            onClick={handleValidateRoute}
            disabled={isValidating || !sourceCity || !destCity}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium py-2 px-4 rounded"
          >
            {isValidating ? "Validating..." : "Validate Route →"}
          </button>

          {validationError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {validationError}
            </div>
          )}
        </div>

        {/* ====================================================================== */}
        {/* STEP 2: ROUTE VALIDATION RESULT */}
        {/* ====================================================================== */}
        {validationResult && (
          <div className="bg-white border border-slate-200 rounded p-5 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Step 2: Route Validation Result
            </h2>

            <div className={`p-4 rounded ${
              validationResult.feasible 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  {validationResult.feasible ? "✅ Route Feasible" : "⚠️ Route Not Recommended"}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {validationResult.distance_km} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="text-sm">
                  <div className="text-slate-600">Your Plan:</div>
                  <div className="font-semibold text-slate-800">{days} days</div>
                </div>
                <div className="text-sm">
                  <div className="text-slate-600">Recommended:</div>
                  <div className="font-semibold text-slate-800">{validationResult.minimum_days} days</div>
                </div>
              </div>

              {validationResult.reason && (
                <div className="text-sm text-orange-700 mt-2">
                  💡 {validationResult.reason}
                </div>
              )}

              {validationResult.feasible && (
                <div className="text-sm text-green-700 mt-2">
                  ✓ Proceed to travel mode selection
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* STEP 3: TRAVEL MODE SELECTION */}
        {/* ====================================================================== */}
        {validationResult && validationResult.feasible && (
          <div className="bg-white border border-slate-200 rounded p-5 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Step 3: Select Travel Mode
            </h2>

            {isLoadingModes && (
              <div className="text-sm text-slate-600 py-4">Loading travel modes...</div>
            )}

            {modeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-3">
                {modeError}
              </div>
            )}

            {modeData && (
              <>
                {/* Recommended Modes */}
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2">
                    Recommended modes for {validationResult.distance_km} km:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modeData.recommended_modes.map((mode) => (
                      <span
                        key={mode}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
                      >
                        {TRAVEL_MODES[mode].icon} {TRAVEL_MODES[mode].label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mode Selection Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {Object.entries(TRAVEL_MODES).map(([modeKey, modeInfo]) => {
                    const isRec = modeData.recommended_modes.includes(modeKey);
                    const isSelected = preferredMode === modeKey;
                    
                    return (
                      <button
                        key={modeKey}
                        onClick={() => setPreferredMode(isSelected ? null : modeKey)}
                        className={`p-3 border rounded text-center text-sm ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isRec
                            ? 'border-green-300 bg-white hover:bg-slate-50'
                            : 'border-slate-200 bg-slate-50 opacity-75'
                        }`}
                      >
                        <div className="text-2xl mb-1">{modeInfo.icon}</div>
                        <div className="font-medium text-slate-800">{modeInfo.label}</div>
                        <div className="text-xs text-slate-600 mt-1">
                          {modeData.estimated_times[modeKey]}
                        </div>
                        {isRec && (
                          <div className="text-xs text-green-700 mt-1">✓ Recommended</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mode Validation Message */}
                {preferredMode && !modeData.preferred_mode_valid && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                    ⚠️ {modeData.preferred_mode_reason}
                  </div>
                )}

                {preferredMode && modeData.preferred_mode_valid && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✅ {TRAVEL_MODES[preferredMode].label} is suitable. Estimated time: {modeData.estimated_times[preferredMode]}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ====================================================================== */}
        {/* STEP 4: PROCEED TO CONFIGURATION */}
        {/* ====================================================================== */}
        {validationResult && validationResult.feasible && modeData && (
          <div className="bg-white border border-slate-200 rounded p-5 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Step 4: Proceed to Configuration
            </h2>

            <p className="text-sm text-slate-600 mb-4">
              Your route is validated and travel mode is selected. Continue to configure your trip preferences and generate the itinerary.
            </p>

            <button
              onClick={handleProceedToConfiguration}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-3 px-4 rounded"
            >
              Continue to Trip Configuration →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}