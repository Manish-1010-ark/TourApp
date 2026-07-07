import { useState, useEffect } from "react";
import { useGlobalStyles } from "../hooks/useGlobalStyles";
import { useCitySearch } from "../hooks/useCitySearch";
import StepProgress from "../components/trip-preparation/StepProgress";
import DestinationSearchField from "../components/trip-preparation/DestinationSearchField";
import JourneyRoute from "../components/trip-preparation/JourneyRoute";
import DaysSelector from "../components/trip-preparation/DaysSelector";
import ValidationCard from "../components/trip-preparation/ValidationCard";
import TravelModeCard from "../components/trip-preparation/TravelModeCard";
import TripSummary from "../components/trip-preparation/TripSummary";

/**
 * TripPreparation - Merged component for trip setup pipeline
 *
 * Data Flow (UNCHANGED):
 * Step 1 (City Selection) -> Step 2 (Route Validation) -> Step 3 (Travel Mode)
 *
 * State flow (UNCHANGED):
 * - selectedCity (lat/lon) -> route validation API
 * - validation result (distance_km) -> travel mode API
 * - days input -> both validation & travel mode APIs
 *
 * This file only changes presentation. Every API call, request/response
 * shape, sessionStorage key, and navigation target is identical to before.
 */
export default function TripPreparation() {
  useGlobalStyles();

  // ============================================================================
  // STEP 1: CITY SELECTION STATE
  // ============================================================================
  const [sourceCity, setSourceCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [sourceCityQuery, setSourceCityQuery] = useState("");
  const [destCityQuery, setDestCityQuery] = useState("");

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

  const TRAVEL_MODES = {
    flight: { label: "Flight", icon: "✈️" },
    train: { label: "Train", icon: "🚂" },
    bus: { label: "Bus", icon: "🚌" },
    car: { label: "Car", icon: "🚗" },
  };

  // ============================================================================
  // CITY SEARCH (abstracted — see hooks/useCitySearch.js for the swappable
  // provider; the endpoint/params/debounce below are identical to before)
  // ============================================================================
  const {
    suggestions: sourceSuggestions,
    isSearching: isSearchingSource,
    error: sourceSearchError,
  } = useCitySearch(sourceCityQuery, { excludeName: sourceCity?.name });

  const {
    suggestions: destSuggestions,
    isSearching: isSearchingDest,
    error: destSearchError,
  } = useCitySearch(destCityQuery, { excludeName: destCity?.name });

  // ============================================================================
  // STEP 2: ROUTE VALIDATION LOGIC (UNCHANGED)
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
  // STEP 3: TRAVEL MODE LOGIC (UNCHANGED)
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
          preferred_mode: preferredMode,
        }),
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

  // Auto-fetch travel modes when validation succeeds (UNCHANGED)
  useEffect(() => {
    if (validationResult && validationResult.feasible) {
      fetchTravelModes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationResult, days, preferredMode]);

  // ============================================================================
  // STEP 4: PROCEED TO CONFIGURATION (UNCHANGED)
  // ============================================================================
  const handleProceedToConfiguration = () => {
    const tripData = {
      source: sourceCity,
      destination: destCity,
      distance_km: validationResult.distance_km,
      travel_mode: preferredMode,
      days: days,
    };

    sessionStorage.setItem("tripData", JSON.stringify(tripData));
    window.location.href = "/trip-configuration";
  };

  // ============================================================================
  // UI-ONLY: which step to highlight in the progress bar
  // ============================================================================
  let currentStep = 1;
  if (validationResult) currentStep = 2;
  if (validationResult?.feasible && modeData) currentStep = 3;

  const handleSwapCities = () => {
    const prevSource = sourceCity;
    const prevSourceQuery = sourceCityQuery;
    setSourceCity(destCity);
    setSourceCityQuery(destCity ? destCity.name : destCityQuery);
    setDestCity(prevSource);
    setDestCityQuery(prevSource ? prevSource.name : prevSourceQuery);
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* ====================================================================== */}
        {/* HERO */}
        {/* ====================================================================== */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-headings)] mb-3">
            Plan Your Perfect Journey
          </h1>
          <p className="font-body text-base text-slate-500 max-w-xl mx-auto">
            Tell us where you're travelling and we'll build an AI-powered itinerary designed just for you.
          </p>
        </div>

        <div className="mb-10">
          <StepProgress steps={["Choose Destination", "Validate Route", "Select Travel Mode"]} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* ====================================================================== */}
          {/* MAIN COLUMN */}
          {/* ====================================================================== */}
          <div className="flex flex-col gap-6">
            {/* STEP 1: CITY SELECTION */}
            <div className="card-elevation p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-5">Where are you headed?</h2>

              <JourneyRoute source={sourceCity} destination={destCity} onSwap={handleSwapCities}>
                {[
                  <DestinationSearchField
                    key="source"
                    inputId="source-city"
                    label="From"
                    placeholder="Departure city..."
                    query={sourceCityQuery}
                    onQueryChange={(val) => {
                      setSourceCityQuery(val);
                      if (sourceCity && val !== sourceCity.name) setSourceCity(null);
                    }}
                    selected={sourceCity}
                    onSelect={(city) => {
                      setSourceCity(city);
                      setSourceCityQuery(city.name);
                    }}
                    onClear={() => {
                      setSourceCity(null);
                      setSourceCityQuery("");
                    }}
                    suggestions={sourceSuggestions}
                    isSearching={isSearchingSource}
                    searchError={sourceSearchError}
                  />,
                  <DestinationSearchField
                    key="dest"
                    inputId="dest-city"
                    label="To"
                    placeholder="Destination city..."
                    query={destCityQuery}
                    onQueryChange={(val) => {
                      setDestCityQuery(val);
                      if (destCity && val !== destCity.name) setDestCity(null);
                    }}
                    selected={destCity}
                    onSelect={(city) => {
                      setDestCity(city);
                      setDestCityQuery(city.name);
                    }}
                    onClear={() => {
                      setDestCity(null);
                      setDestCityQuery("");
                    }}
                    suggestions={destSuggestions}
                    isSearching={isSearchingDest}
                    searchError={destSearchError}
                  />,
                ]}
              </JourneyRoute>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <DaysSelector days={days} onChange={setDays} />
              </div>

              <button
                onClick={handleValidateRoute}
                disabled={isValidating || !sourceCity || !destCity}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
                      <path d="M21 12a9 9 0 00-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Checking route...
                  </>
                ) : (
                  "Validate Route →"
                )}
              </button>

              {validationError && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-sm font-body text-orange-800 animate-fade-in-up">
                  {validationError}
                </div>
              )}
            </div>

            {/* STEP 2: ROUTE VALIDATION RESULT */}
            {validationResult && <ValidationCard validationResult={validationResult} days={days} />}

            {/* STEP 3: TRAVEL MODE SELECTION */}
            {validationResult && validationResult.feasible && (
              <div className="card-elevation p-6 md:p-8 animate-fade-in-up">
                <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-1">Choose your travel mode</h2>
                <p className="text-sm font-body text-slate-500 mb-5">
                  Best options for a {validationResult.distance_km} km journey
                </p>

                {isLoadingModes && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
                    ))}
                  </div>
                )}

                {modeError && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-sm font-body text-orange-800 mb-4">
                    {modeError}
                  </div>
                )}

                {modeData && !isLoadingModes && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(TRAVEL_MODES).map(([modeKey, modeInfo]) => (
                        <TravelModeCard
                          key={modeKey}
                          modeKey={modeKey}
                          label={modeInfo.label}
                          isRecommended={modeData.recommended_modes.includes(modeKey)}
                          isSelected={preferredMode === modeKey}
                          estimatedTime={modeData.estimated_times[modeKey]}
                          onSelect={() => setPreferredMode(preferredMode === modeKey ? null : modeKey)}
                        />
                      ))}
                    </div>

                    {preferredMode && !modeData.preferred_mode_valid && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-sm font-body text-orange-800 animate-fade-in-up">
                        ⚠️ {modeData.preferred_mode_reason}
                      </div>
                    )}

                    {preferredMode && modeData.preferred_mode_valid && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-body text-emerald-800 animate-fade-in-up">
                        {TRAVEL_MODES[preferredMode].label} is suitable — estimated time:{" "}
                        {modeData.estimated_times[preferredMode]}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* STEP 4: PROCEED TO CONFIGURATION */}
            {validationResult && validationResult.feasible && modeData && (
              <div className="card-elevation p-6 md:p-8 animate-fade-in-up">
                <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-2">Ready for the next step</h2>
                <p className="text-sm font-body text-slate-500 mb-5">
                  Your route is validated. Continue to configure your trip preferences and generate the itinerary.
                </p>

                <button onClick={handleProceedToConfiguration} className="btn-primary w-full">
                  Continue to Trip Configuration →
                </button>
              </div>
            )}
          </div>

          {/* ====================================================================== */}
          {/* SIDEBAR: LIVE SUMMARY */}
          {/* ====================================================================== */}
          <TripSummary
            sourceCity={sourceCity}
            destCity={destCity}
            days={days}
            validationResult={validationResult}
            preferredMode={preferredMode}
          />
        </div>
      </div>
    </div>
  );
}
