import { useState } from "react";

/**
 * Module 5: Trip Configuration & Confirmation (Test Component)
 * 
 * MINIMAL FUNCTIONAL UI - NO STYLING POLISH
 * This component tests the backend constraint finalizer.
 */
export default function TripConfiguration() {
  // ============================================================================
  // STATE (Pre-filled with Module 1-3 output for testing)
  // ============================================================================
  
  // Mock data from previous modules (in real app, these come from props/context)
  const [tripData] = useState({
    source: { name: "Mumbai" },
    destination: { name: "Goa" },
    distance_km: 461,
    travel_mode: "train",
    days: 3
  });

  // Module 5 specific state
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("premium");
  const [suggestedInterests, setSuggestedInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [constraints, setConstraints] = useState({
    avoid_early_mornings: false,
    prefer_less_walking: false,
    family_friendly: false,
    vegetarian_friendly: false,
    photography_focus: false
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
    setLoadingInterests(true);
    setError(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/interests/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: tripData.source.name,
          destination: tripData.destination.name,
          travel_mode: tripData.travel_mode,
          days: tripData.days
        })
      });

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
          ai_model: aiModel
        })
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
  // INTEREST TOGGLE
  // ============================================================================
  
  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Module 5: Trip Configuration</h1>
      <p style={{ color: "#666" }}>Finalize constraints before AI generation</p>

      {/* ====================================================================== */}
      {/* READ-ONLY TRIP SUMMARY (From Modules 1-3) */}
      {/* ====================================================================== */}
      <div style={{ 
        background: "#f5f5f5", 
        padding: "15px", 
        marginTop: "20px",
        border: "1px solid #ddd" 
      }}>
        <h3>Trip Summary (Read-Only)</h3>
        <p><strong>Route:</strong> {tripData.source.name} → {tripData.destination.name}</p>
        <p><strong>Distance:</strong> {tripData.distance_km} km</p>
        <p><strong>Travel Mode:</strong> {tripData.travel_mode}</p>
        <p><strong>Duration:</strong> {tripData.days} days</p>
      </div>

      {/* ====================================================================== */}
      {/* PACE SELECTION */}
      {/* ====================================================================== */}
      <div style={{ marginTop: "30px" }}>
        <h3>1. Travel Pace</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Determines places per day and start times
        </p>
        
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          {["relaxed", "balanced", "fast"].map(option => (
            <label key={option} style={{ 
              padding: "10px 15px", 
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              background: pace === option ? "#e3f2fd" : "white"
            }}>
              <input
                type="radio"
                name="pace"
                value={option}
                checked={pace === option}
                onChange={(e) => setPace(e.target.value)}
              />
              {" " + option.charAt(0).toUpperCase() + option.slice(1)}
              <div style={{ fontSize: "12px", color: "#666" }}>
                {option === "relaxed" && "1-2 places/day, late starts"}
                {option === "balanced" && "3-4 places/day, moderate"}
                {option === "fast" && "4-5 places/day, early starts"}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* BUDGET SELECTION */}
      {/* ====================================================================== */}
      <div style={{ marginTop: "30px" }}>
        <h3>2. Budget Tier</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Affects experience style (not hotel suggestions)
        </p>
        
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          {["basic", "premium", "luxury"].map(option => (
            <label key={option} style={{ 
              padding: "10px 15px", 
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              background: budget === option ? "#e8f5e9" : "white"
            }}>
              <input
                type="radio"
                name="budget"
                value={option}
                checked={budget === option}
                onChange={(e) => setBudget(e.target.value)}
              />
              {" " + option.charAt(0).toUpperCase() + option.slice(1)}
              <div style={{ fontSize: "12px", color: "#666" }}>
                {option === "basic" && "Popular & free attractions"}
                {option === "premium" && "Balanced experiences"}
                {option === "luxury" && "Curated & exclusive"}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* INTERESTS (AI-SUGGESTED) */}
      {/* ====================================================================== */}
      <div style={{ marginTop: "30px" }}>
        <h3>3. Interests</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          AI-suggested interests based on destination
        </p>
        
        <button
          onClick={handleSuggestInterests}
          disabled={loadingInterests}
          style={{
            padding: "10px 20px",
            background: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loadingInterests ? "not-allowed" : "pointer",
            marginTop: "10px"
          }}
        >
          {loadingInterests ? "Generating..." : "Get AI Suggestions"}
        </button>

        {/* Suggested Interests Grid */}
        {suggestedInterests.length > 0 && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginTop: "15px"
          }}>
            {suggestedInterests.map(interest => (
              <label key={interest} style={{ 
                padding: "10px", 
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                background: selectedInterests.includes(interest) ? "#fff3e0" : "white"
              }}>
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                />
                {" " + interest}
              </label>
            ))}
          </div>
        )}

        {selectedInterests.length > 0 && (
          <div style={{ 
            marginTop: "10px", 
            padding: "10px", 
            background: "#fff3e0",
            borderRadius: "4px"
          }}>
            <strong>Selected:</strong> {selectedInterests.join(", ")}
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* OPTIONAL CONSTRAINTS */}
      {/* ====================================================================== */}
      <div style={{ marginTop: "30px" }}>
        <h3>4. Optional Constraints</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Additional preferences for AI generation
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "10px" }}>
          {Object.keys(constraints).map(key => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={constraints[key]}
                onChange={(e) => setConstraints(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
              />
              <span>{key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* AI MODEL SELECTION */}
      {/* ====================================================================== */}
      <div style={{ marginTop: "30px" }}>
        <h3>5. AI Model</h3>
        
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <label style={{ 
            padding: "10px 15px", 
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            background: aiModel === "gemini-flash-latest" ? "#e3f2fd" : "white"
          }}>
            <input
              type="radio"
              name="model"
              value="gemini-flash-latest"
              checked={aiModel === "gemini-flash-latest"}
              onChange={(e) => setAiModel(e.target.value)}
            />
            {" Gemini Flash (Standard)"}
          </label>
          
          <label style={{ 
            padding: "10px 15px", 
            border: "1px solid #ff9800",
            borderRadius: "4px",
            cursor: "pointer",
            background: aiModel === "gemini-2.5-flash" ? "#fff3e0" : "white"
          }}>
            <input
              type="radio"
              name="model"
              value="gemini-2.5-flash"
              checked={aiModel === "gemini-2.5-flash"}
              onChange={(e) => setAiModel(e.target.value)}
            />
            {" Gemini 2.5 Flash (Premium)"}
          </label>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* CONFIGURE BUTTON */}
      {/* ====================================================================== */}
      <button
        onClick={handleConfigureTrip}
        disabled={loadingConfig || selectedInterests.length === 0}
        style={{
          width: "100%",
          padding: "15px",
          background: selectedInterests.length === 0 ? "#ccc" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: selectedInterests.length === 0 ? "not-allowed" : "pointer",
          marginTop: "30px"
        }}
      >
        {loadingConfig ? "Processing..." : "Finalize Configuration"}
      </button>

      {/* ====================================================================== */}
      {/* ERROR DISPLAY */}
      {/* ====================================================================== */}
      {error && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          background: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "4px",
          color: "#c62828"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ====================================================================== */}
      {/* RESULT DISPLAY (JSON) */}
      {/* ====================================================================== */}
      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>✅ Configuration Complete</h2>
          <p style={{ color: "#666" }}>
            This object is ready for Module 6 (AI Itinerary Generation)
          </p>
          
          {/* Trip Summary */}
          <div style={{ 
            background: "#e3f2fd", 
            padding: "15px", 
            marginTop: "15px",
            borderRadius: "4px"
          }}>
            <h3>Trip Summary</h3>
            <pre style={{ fontSize: "13px", margin: 0 }}>
              {JSON.stringify(result.trip_summary, null, 2)}
            </pre>
          </div>

          {/* Constraints */}
          <div style={{ 
            background: "#e8f5e9", 
            padding: "15px", 
            marginTop: "15px",
            borderRadius: "4px"
          }}>
            <h3>Constraints</h3>
            <pre style={{ fontSize: "13px", margin: 0 }}>
              {JSON.stringify(result.constraints, null, 2)}
            </pre>
          </div>

          {/* Interests */}
          <div style={{ 
            background: "#fff3e0", 
            padding: "15px", 
            marginTop: "15px",
            borderRadius: "4px"
          }}>
            <h3>Selected Interests</h3>
            <p>{result.interests.join(", ")}</p>
          </div>

          {/* Optional Constraints */}
          <div style={{ 
            background: "#f3e5f5", 
            padding: "15px", 
            marginTop: "15px",
            borderRadius: "4px"
          }}>
            <h3>Optional Constraints</h3>
            <pre style={{ fontSize: "13px", margin: 0 }}>
              {JSON.stringify(result.optional_constraints, null, 2)}
            </pre>
          </div>

          {/* Full JSON */}
          <details style={{ marginTop: "15px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              View Full JSON Response
            </summary>
            <pre style={{ 
              background: "#f5f5f5", 
              padding: "15px", 
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto"
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}