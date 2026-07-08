import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStyles } from "../hooks/useGlobalStyles";
import TripOverviewCard from "../components/trip-preparation/TripOverviewCard";
import PreferenceCard from "../components/trip-preparation/PreferenceCard";
import InterestChip from "../components/trip-preparation/InterestChip";
import ToggleSwitch from "../components/trip-preparation/ToggleSwitch";
import AIModelSelector from "../components/trip-preparation/AIModelSelector";
import ConfigurationSummary from "../components/trip-preparation/ConfigurationSummary";
import StepProgress from "../components/trip-preparation/StepProgress";

/**
 * TripConfiguration — Step 2 of the trip-planning flow.
 *
 * Data Flow (UNCHANGED):
 * sessionStorage("tripData") → Pace/Budget/Interests/Preferences/Model
 *   → POST /api/trip/configure → sessionStorage("configuredTrip") → /itinerary-generation
 *
 * This is a presentation-only redesign to match TripPreparation.jsx.
 * Every request body, response field, sessionStorage key read, and API
 * endpoint below is functionally identical to the original component —
 * see the inline notes wherever a value is contract-critical.
 *
 * Routing note: navigation to the generated itinerary uses React Router's
 * useNavigate() (not window.location.href), and targets "/itinerary-generation"
 * — the route actually registered in App.jsx. The sessionStorage key written
 * here ("configuredTrip") is unchanged.
 */
export default function TripConfiguration() {
  useGlobalStyles();
  const navigate = useNavigate();

  // ============================================================================
  // TRIP DATA FROM PREVIOUS STEP (UNCHANGED read)
  // ============================================================================
  const [tripData, setTripData] = useState(null);

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
  // CONFIGURATION STATE
  // ============================================================================
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("premium");
  const [suggestedInterests, setSuggestedInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // NOTE: these five keys are the exact optional_constraints fields the
  // backend accepts. The design brief asked for a longer preference list
  // (avoid crowds, senior-friendly, wheelchair accessible, etc.) but adding
  // keys the backend doesn't read would silently do nothing — so only the
  // keys the API contract actually defines are exposed here.
  const [constraints, setConstraints] = useState({
    avoid_early_mornings: false,
    prefer_less_walking: false,
    family_friendly: false,
    vegetarian_friendly: false,
    photography_focus: false,
  });
  const [aiModel, setAiModel] = useState("standard");

  // UI state
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [error, setError] = useState(null);
  const [interestsMissing, setInterestsMissing] = useState(false);

  const PACE_OPTIONS = [
    {
      value: "relaxed",
      icon: "🐢",
      title: "Relaxed",
      description: "Spend more time at each attraction, fewer stops per day.",
    },
    {
      value: "balanced",
      icon: "⚖️",
      title: "Balanced",
      description: "A comfortable mix — 3-4 places a day, moderate starts.",
    },
    {
      value: "fast",
      icon: "⚡",
      title: "Fast-Paced",
      description: "See more, move quickly — 4-5 places a day, early starts.",
    },
  ];

  // Only 3 tiers, matching the backend's budget enum exactly (basic /
  // premium / luxury). Labelled to read naturally in the UI.
  const BUDGET_OPTIONS = [
    {
      value: "basic",
      icon: "💰",
      title: "Budget",
      description: "Popular & free attractions, cost-conscious choices.",
      meta: "₹ · Lean spend",
    },
    {
      value: "premium",
      icon: "💎",
      title: "Premium",
      description: "A balanced mix of paid experiences and popular sights.",
      meta: "₹₹ · Moderate spend",
    },
    {
      value: "luxury",
      icon: "👑",
      title: "Luxury",
      description: "Curated, exclusive experiences without compromise.",
      meta: "₹₹₹ · Top spend",
    },
  ];

  const PREFERENCE_TOGGLES = [
    { key: "avoid_early_mornings", icon: "🌅", label: "Avoid early mornings" },
    { key: "prefer_less_walking", icon: "🚶", label: "Prefer less walking" },
    { key: "vegetarian_friendly", icon: "🥗", label: "Vegetarian friendly" },
    { key: "family_friendly", icon: "👨‍👩‍👧", label: "Family friendly" },
    { key: "photography_focus", icon: "📸", label: "Photography focused" },
  ];

  // ============================================================================
  // INTEREST SUGGESTION (AI-POWERED) — request body UNCHANGED
  // ============================================================================
  const handleSuggestInterests = async () => {
    if (!tripData) return;

    setLoadingInterests(true);
    setInterestsError(null);

    // Client-side timeout so a hung request doesn't spin forever.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Backend error (${response.status})`);
      }

      const data = await response.json();
      setSuggestedInterests(data.interests);
      // Auto-select first 5 for convenience (UNCHANGED behaviour)
      setSelectedInterests(data.interests.slice(0, 5));
      setInterestsMissing(false);
    } catch (err) {
      if (err.name === "AbortError") {
        setInterestsError("That took too long. Please try again.");
      } else if (err instanceof TypeError) {
        setInterestsError(
          "Network error — check your connection and that the backend server is running.",
        );
      } else {
        setInterestsError(err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoadingInterests(false);
    }
  };

  // ============================================================================
  // FINAL CONFIGURATION — endpoint + request body UNCHANGED
  // ============================================================================
  const handleConfigureTrip = async () => {
    if (!tripData) return;

    if (selectedInterests.length === 0) {
      setInterestsMissing(true);
      setError(
        "Please select at least one interest before generating your itinerary.",
      );
      return;
    }
    setInterestsMissing(false);

    setLoadingConfig(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const requestBody = {
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
    };

    console.log(
      "[TripConfiguration] POST /api/trip/configure — request body:",
      requestBody,
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/api/trip/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      console.log(
        "[TripConfiguration] /api/trip/configure response status:",
        response.status,
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("[TripConfiguration] Backend returned an error:", {
          status: response.status,
          body: err,
        });
        throw new Error(err.detail || `Backend error (${response.status})`);
      }

      const data = await response.json();
      console.log(
        "[TripConfiguration] Parsed /api/trip/configure response:",
        data,
      );

      // Store + navigate (UNCHANGED contract: sessionStorage key "configuredTrip").
      // Route target is "/itinerary-generation" — the route actually registered
      // in App.jsx (previously this pointed at "/itinerary", which does not exist
      // as a route and would 404 / render nothing).
      try {
        sessionStorage.setItem("configuredTrip", JSON.stringify(data));
        console.log(
          '[TripConfiguration] Stored response under sessionStorage key "configuredTrip"',
        );
      } catch (storageErr) {
        console.error(
          "[TripConfiguration] Failed to write to sessionStorage:",
          storageErr,
        );
      }

      console.log('[TripConfiguration] Navigating to "/itinerary-generation"');
      navigate("/itinerary-generation");
    } catch (err) {
      if (err.name === "AbortError") {
        console.error(
          "[TripConfiguration] Request aborted (timeout after 20s)",
        );
        setError(
          "Generating your itinerary is taking longer than expected. Please try again.",
        );
      } else if (err instanceof TypeError) {
        console.error("[TripConfiguration] Network error:", err);
        setError(
          "Network error — check your connection and that the backend server is running.",
        );
      } else {
        console.error("[TripConfiguration] Configuration failed:", err);
        setError(err.message);
      }
      setLoadingConfig(false);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  // ============================================================================
  // RENDER: MISSING DATA CHECK
  // ============================================================================
  if (!tripData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-10 px-4"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="card-elevation p-8 max-w-md text-center animate-fade-in-up">
          <div className="text-4xl mb-3">🧭</div>
          <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-2">
            No trip found yet
          </h2>
          <p className="text-sm font-body text-slate-500 mb-6">
            We couldn't find your trip details. Head back and choose your
            destination first.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-primary w-full"
          >
            Start Trip Preparation
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================
  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-headings)] mb-3">
            Configure Your Trip
          </h1>
          <p className="font-body text-base text-slate-500 max-w-xl mx-auto">
            Fine-tune the pace, budget, and interests, and we'll hand it all to
            the AI to build your itinerary.
          </p>
        </div>

        <div className="mb-10">
          <StepProgress
            steps={[
              "Choose Destination",
              "Configure Trip",
              "Generate Itinerary",
            ]}
            currentStep={2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ================================================================== */}
          {/* MAIN COLUMN */}
          {/* ================================================================== */}
          <div className="flex flex-col gap-6">
            {/* SECTION 1: TRIP OVERVIEW */}
            <TripOverviewCard tripData={tripData} />

            {/* SECTION 2: PACE */}
            <div className="card-elevation p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-1">
                Travel pace
              </h2>
              <p className="text-sm font-body text-slate-500 mb-5">
                How much ground do you want to cover each day?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PACE_OPTIONS.map((opt) => (
                  <PreferenceCard
                    key={opt.value}
                    icon={opt.icon}
                    title={opt.title}
                    description={opt.description}
                    isSelected={pace === opt.value}
                    onSelect={() => setPace(opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* SECTION 3: BUDGET */}
            <div className="card-elevation p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-1">
                Budget tier
              </h2>
              <p className="text-sm font-body text-slate-500 mb-5">
                Shapes the style of experiences suggested, not hotel bookings.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <PreferenceCard
                    key={opt.value}
                    icon={opt.icon}
                    title={opt.title}
                    description={opt.description}
                    meta={opt.meta}
                    isSelected={budget === opt.value}
                    onSelect={() => setBudget(opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* SECTION 4: AI INTEREST SUGGESTIONS */}
            <div className="card-elevation p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="font-display text-xl font-bold text-[var(--color-headings)]">
                  Interests
                </h2>
              </div>
              <p className="text-sm font-body text-slate-500 mb-5">
                Let AI suggest interests based on your destination, then pick
                what sounds fun.
              </p>

              <button
                onClick={handleSuggestInterests}
                disabled={loadingInterests}
                className="btn-primary px-5 py-2.5 text-sm mb-5 flex items-center gap-2 w-fit"
              >
                {loadingInterests ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                      />
                      <path
                        d="M21 12a9 9 0 00-9-9"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Thinking of ideas...
                  </>
                ) : (
                  "✨ Suggest Interests"
                )}
              </button>

              {/* Skeleton loader while fetching */}
              {loadingInterests && (
                <div className="flex flex-wrap gap-2">
                  {[90, 120, 100, 130, 80, 110].map((w, i) => (
                    <div
                      key={i}
                      className="skeleton-shimmer h-9 rounded-full"
                      style={{ width: w }}
                    />
                  ))}
                </div>
              )}

              {interestsError && !loadingInterests && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-sm font-body text-orange-800 animate-fade-in-up">
                  {interestsError}
                </div>
              )}

              {suggestedInterests.length > 0 && !loadingInterests && (
                <div className="flex flex-wrap gap-2 animate-fade-in-up">
                  {suggestedInterests.map((interest) => (
                    <InterestChip
                      key={interest}
                      label={interest}
                      isSelected={selectedInterests.includes(interest)}
                      onToggle={() => toggleInterest(interest)}
                    />
                  ))}
                </div>
              )}

              {!loadingInterests &&
                suggestedInterests.length === 0 &&
                !interestsError && (
                  <p className="text-xs font-body text-slate-400">
                    No suggestions yet — click the button above to get started.
                  </p>
                )}
            </div>

            {/* SECTION 5: ADDITIONAL PREFERENCES */}
            <div className="card-elevation p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-1">
                Additional preferences
              </h2>
              <p className="text-sm font-body text-slate-500 mb-5">
                Optional — fine-tune how the AI builds your day plans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREFERENCE_TOGGLES.map(({ key, icon, label }) => (
                  <ToggleSwitch
                    key={key}
                    id={`pref-${key}`}
                    icon={icon}
                    label={label}
                    checked={constraints[key]}
                    onChange={(val) =>
                      setConstraints((prev) => ({ ...prev, [key]: val }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* SECTION 6: AI MODEL */}
            <div className="card-elevation p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-1">
                AI model
              </h2>
              <p className="text-sm font-body text-slate-500 mb-5">
                Which model should write your itinerary?
              </p>

              <div className="max-w-sm">
                <AIModelSelector value={aiModel} onChange={setAiModel} />
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* SIDEBAR: LIVE SUMMARY + GENERATE ACTION */}
          {/* ================================================================== */}
          <ConfigurationSummary
            tripData={tripData}
            pace={pace}
            budget={budget}
            selectedInterests={selectedInterests}
            constraints={constraints}
            aiModel={aiModel}
            onGenerate={handleConfigureTrip}
            isGenerating={loadingConfig}
            error={error}
            interestsMissing={interestsMissing}
          />
        </div>
      </div>
    </div>
  );
}
