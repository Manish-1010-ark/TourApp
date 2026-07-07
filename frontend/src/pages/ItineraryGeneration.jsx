import { useState, useEffect, useRef, useCallback } from "react";
import { useGlobalStyles } from "../hooks/useGlobalStyles";
import ActionBar from "../components/itinerary/ActionBar";
import HeroBanner from "../components/itinerary/HeroBanner";
import TripStats from "../components/itinerary/TripStats";
import DayNavigator from "../components/itinerary/DayNavigator";
import BudgetSummaryCard from "../components/itinerary/BudgetSummaryCard";
import WeatherCard from "../components/itinerary/WeatherCard";
import DayCard from "../components/itinerary/DayCard";
import MustVisitSection from "../components/itinerary/MustVisitSection";
import FoodSection from "../components/itinerary/FoodSection";
import TravelTips from "../components/itinerary/TravelTips";
import EssentialInfo from "../components/itinerary/EssentialInfo";
import AdditionalInfoSection from "../components/itinerary/AdditionalInfoSection";
import LoadingSkeleton from "../components/itinerary/LoadingSkeleton";
import ErrorState from "../components/itinerary/ErrorState.jsx";
import { getField, isEmptyValue } from "../components/itinerary/utils.js";

/**
 * ItineraryGeneration — flagship page rendering the AI-generated
 * itinerary.
 *
 * UNCHANGED from the original implementation (contract-critical, do not
 * edit without checking the backend):
 *  - endpoint: POST http://127.0.0.1:8000/api/itinerary
 *  - request body: the raw `configuration` object, untouched
 *  - response shape consumed: { destination, days, overall_style, itinerary: [...] }
 *  - "Return to Configuration" target: "/trip-configuration"
 *
 * Everything else (loading state, error state, and all rendering below)
 * is new presentation only.
 *
 * ROUTING FIX (see App.jsx / TripConfiguration.jsx): TripConfiguration
 * stores its result under sessionStorage key "configuredTrip" and
 * navigates to "/itinerary-generation" (the route actually registered in
 * App.jsx). This page previously read a different key ("tripConfiguration"),
 * which never matched what TripConfiguration wrote — so this page always
 * fell through to the "No trip configuration found" state even after a
 * successful configure step. The read key below has been updated to
 * "configuredTrip" to match the writer and close that gap.
 */
export default function ItineraryGeneration() {
  useGlobalStyles();

  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { kind, detail }
  const [itinerary, setItinerary] = useState(null);

  const [expandedDay, setExpandedDay] = useState(1);
  const [activeDayInView, setActiveDayInView] = useState(1);
  const dayRefs = useRef({});

  // ============================================================================
  // LOAD CONFIGURATION FROM PREVIOUS MODULE (UNCHANGED)
  // ============================================================================
  useEffect(() => {
    const stored = sessionStorage.getItem("configuredTrip");
    console.log(
      '[ItineraryGeneration] Reading sessionStorage key "configuredTrip":',
      stored ? "found" : "missing",
    );
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("[ItineraryGeneration] Parsed configuration:", parsed);
        setConfiguration(parsed);
      } catch (err) {
        console.error(
          "[ItineraryGeneration] Failed to parse configuration JSON:",
          err,
        );
      }
    } else {
      console.warn(
        '[ItineraryGeneration] No "configuredTrip" entry in sessionStorage — user likely navigated here directly without completing configuration.',
      );
    }
  }, []);

  // ============================================================================
  // GENERATE ITINERARY (endpoint + request body UNCHANGED)
  // ============================================================================
  const handleGenerateItinerary = async () => {
    if (!configuration) return;

    setLoading(true);
    setError(null);
    setItinerary(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    console.log(
      "[ItineraryGeneration] POST /api/itinerary — request body:",
      configuration,
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration),
        signal: controller.signal,
      });

      console.log(
        "[ItineraryGeneration] /api/itinerary response status:",
        response.status,
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("[ItineraryGeneration] Backend returned an error:", {
          status: response.status,
          body: err,
        });
        throw Object.assign(
          new Error(err.detail || "Failed to generate itinerary"),
          { kind: "backend" },
        );
      }

      const data = await response.json();
      console.log(
        "[ItineraryGeneration] Parsed /api/itinerary response:",
        data,
      );

      if (isEmptyValue(data)) {
        console.error("[ItineraryGeneration] Response was empty");
        throw Object.assign(new Error("Empty response"), { kind: "empty" });
      }
      if (!Array.isArray(data.itinerary) || data.itinerary.length === 0) {
        console.error(
          "[ItineraryGeneration] Response missing day-by-day itinerary array:",
          data,
        );
        throw Object.assign(
          new Error("Response missing day-by-day itinerary"),
          { kind: "malformed" },
        );
      }

      setItinerary(data);
      setExpandedDay(data.itinerary[0].day ?? 1);
      setActiveDayInView(data.itinerary[0].day ?? 1);
    } catch (err) {
      if (err.name === "AbortError") {
        console.error(
          "[ItineraryGeneration] Request aborted (timeout after 45s)",
        );
        setError({ kind: "timeout" });
      } else if (err instanceof TypeError) {
        console.error("[ItineraryGeneration] Network error:", err);
        setError({ kind: "network" });
      } else {
        console.error(
          "[ItineraryGeneration] Itinerary generation failed:",
          err,
        );
        setError({
          kind: err.kind || "generic",
          detail: err.kind ? undefined : err.message,
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // ============================================================================
  // SCROLL-SPY: highlight the day nearest the top of the viewport
  // ============================================================================
  useEffect(() => {
    if (!itinerary) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayNum = Number(entry.target.id.replace("day-", ""));
            setActiveDayInView(dayNum);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    Object.values(dayRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [itinerary]);

  const registerDayRef = useCallback(
    (dayNum) => (el) => {
      dayRefs.current[dayNum] = el;
    },
    [],
  );

  const handleSelectDay = (dayNum) => {
    setExpandedDay(dayNum);
    setActiveDayInView(dayNum);
    dayRefs.current[dayNum]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ============================================================================
  // DERIVED, DEFENSIVE DISPLAY VALUES
  // ============================================================================
  const tripSummary = configuration?.trip_summary;
  const overallStyle = itinerary?.overall_style;
  const budgetTier = overallStyle?.budget ?? configuration?.constraints?.budget;
  const paceLabel = overallStyle?.pace ?? configuration?.constraints?.pace;
  const styleLabel = [paceLabel, budgetTier]
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" · ");

  const placesCovered = itinerary
    ? itinerary.itinerary.reduce(
        (sum, day) => sum + (day.blocks?.length ?? 0),
        0,
      )
    : undefined;

  const numericBudget = itinerary
    ? getField(itinerary, "estimated_budget", "total_budget")
    : undefined;
  const budgetBreakdown = itinerary
    ? getField(itinerary, "budget_breakdown", "cost_breakdown")
    : undefined;
  const budgetDisplay =
    numericBudget ??
    (budgetBreakdown
      ? getField(budgetBreakdown, "total", "estimated_total")
      : undefined) ??
    (budgetTier
      ? `${budgetTier.charAt(0).toUpperCase()}${budgetTier.slice(1)} tier`
      : undefined);

  // ============================================================================
  // RENDER: MISSING CONFIGURATION (UNCHANGED navigation target)
  // ============================================================================
  if (!configuration) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-10 px-4"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="card-elevation p-8 max-w-md text-center animate-fade-in-up">
          <div className="text-4xl mb-3">🧭</div>
          <h2 className="font-display text-xl font-bold text-[var(--color-headings)] mb-2">
            No trip configuration found
          </h2>
          <p className="text-sm font-body text-slate-500 mb-6">
            Please complete the configuration step before generating an
            itinerary.
          </p>
          <button
            onClick={() => (window.location.href = "/trip-configuration")}
            className="btn-primary w-full"
          >
            ← Return to Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <ActionBar
        onRegenerate={handleGenerateItinerary}
        isRegenerating={loading && !!itinerary}
      />

      {/* ================================================================== */}
      {/* NOT YET GENERATED — ready-to-generate state */}
      {/* ================================================================== */}
      {!itinerary && !loading && !error && (
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="card-elevation p-8 text-center animate-fade-in-up">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="font-display text-2xl font-bold text-[var(--color-headings)] mb-2">
              Ready to plan {tripSummary?.destination ?? "your trip"}
            </h2>
            <p className="text-sm font-body text-slate-500 mb-6">
              {tripSummary?.days} {tripSummary?.days === 1 ? "day" : "days"} ·{" "}
              {tripSummary?.source} → {tripSummary?.destination}
              {tripSummary?.travel_mode ? ` · ${tripSummary.travel_mode}` : ""}
            </p>
            <button
              onClick={handleGenerateItinerary}
              className="btn-primary w-full sm:w-auto sm:px-10"
            >
              ✨ Generate My Itinerary
            </button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* LOADING */}
      {/* ================================================================== */}
      {loading && <LoadingSkeleton destination={tripSummary?.destination} />}

      {/* ================================================================== */}
      {/* ERROR */}
      {/* ================================================================== */}
      {error && !loading && (
        <ErrorState
          kind={error.kind}
          detail={error.detail}
          onRetry={handleGenerateItinerary}
        />
      )}

      {/* ================================================================== */}
      {/* ITINERARY */}
      {/* ================================================================== */}
      {itinerary && !loading && (
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="pt-6">
            <HeroBanner
              destination={itinerary.destination}
              days={itinerary.days}
              source={tripSummary?.source}
              travelMode={tripSummary?.travel_mode}
              budgetLabel={
                budgetTier
                  ? `${budgetTier.charAt(0).toUpperCase()}${budgetTier.slice(1)} Budget`
                  : undefined
              }
              styleLabel={styleLabel || undefined}
              groupType={getField(configuration, "group_type")}
            />

            <TripStats
              days={itinerary.days}
              placesCovered={placesCovered}
              budgetDisplay={budgetDisplay}
              distanceKm={getField(tripSummary, "distance_km")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-6 items-start">
            {/* LEFT SIDEBAR */}
            <div className="hidden lg:flex flex-col gap-5">
              <DayNavigator
                days={itinerary.itinerary}
                activeDay={activeDayInView}
                onSelectDay={handleSelectDay}
              />
              <BudgetSummaryCard
                budgetTier={budgetTier}
                breakdown={budgetBreakdown}
              />
              <WeatherCard
                weather={getField(itinerary, "weather", "weather_snapshot")}
              />
            </div>

            {/* MAIN TIMELINE */}
            <div className="flex flex-col gap-5">
              {itinerary.itinerary.map((day) => (
                <DayCard
                  key={day.day}
                  day={day}
                  isExpanded={expandedDay === day.day}
                  onToggle={() =>
                    setExpandedDay(expandedDay === day.day ? null : day.day)
                  }
                  registerRef={registerDayRef(day.day)}
                />
              ))}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-5">
              <MustVisitSection source={itinerary} />
              <FoodSection source={itinerary} />
              <TravelTips source={itinerary} />
              <EssentialInfo source={itinerary} />
            </div>
          </div>

          {/* ADDITIONAL INFORMATION — fully dynamic */}
          <AdditionalInfoSection itinerary={itinerary} />

          {/* ACTION FOOTER */}
          <div className="card-elevation p-6 sm:p-8 text-center mt-10">
            <p className="text-sm font-body text-slate-500 mb-4">
              Your itinerary is ready. Generate another version or head back to
              adjust your preferences.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleGenerateItinerary}
                className="btn-primary px-6"
              >
                🔄 Generate Another
              </button>
              <button
                onClick={() => (window.location.href = "/trip-configuration")}
                className="px-6 py-2.5 rounded-2xl text-sm font-semibold font-body text-slate-600 border-2 border-slate-200 hover:border-slate-300 transition-colors"
              >
                ← Back to Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
