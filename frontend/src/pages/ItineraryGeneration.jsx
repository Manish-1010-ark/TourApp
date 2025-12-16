import { useState } from "react";

/**
 * Module 6: AI Itinerary Generation (Test Component)
 * 
 * MINIMAL UI - JSON RENDERING ONLY
 * Tests the backend itinerary generation endpoint
 */
export default function ItineraryGeneration() {
  // Mock data from Module 5 (pre-filled for testing)
  const [config] = useState({
    trip_summary: {
      source: "Mumbai",
      destination: "Goa",
      distance_km: 461,
      travel_mode: "train",
      days: 4
    },
    constraints: {
      pace: "balanced",
      places_per_day: 3,
      start_time: "moderate",
      budget: "premium",
      experience_style: "balanced",
      comfort_level: "comfortable"
    },
    interests: [
      "Beaches",
      "Local food",
      "Nightlife",
      "Water sports",
      "Heritage sites",
      "Photography",
      "Scenic views"
    ],
    optional_constraints: {
      avoid_early_mornings: false,
      prefer_less_walking: true,
      family_friendly: true,
      vegetarian_friendly: false,
      photography_focus: false
    },
    ai_model: "gemini-flash-latest"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);

  // ============================================================================
  // GENERATE ITINERARY
  // ============================================================================
  
  const handleGenerateItinerary = async () => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
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
  // RENDER
  // ============================================================================
  
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Module 6: AI Itinerary Generation</h1>
      <p style={{ color: "#666" }}>Final module - generates detailed itinerary from Module 5 config</p>

      {/* ====================================================================== */}
      {/* INPUT CONFIGURATION (READ-ONLY) */}
      {/* ====================================================================== */}
      <div style={{ 
        background: "#f5f5f5", 
        padding: "15px", 
        marginTop: "20px",
        border: "1px solid #ddd",
        borderRadius: "4px"
      }}>
        <h3>Input Configuration (From Module 5)</h3>
        
        <div style={{ marginTop: "10px" }}>
          <strong>Trip:</strong> {config.trip_summary.source} → {config.trip_summary.destination} 
          ({config.trip_summary.days} days, {config.trip_summary.travel_mode})
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <strong>Pace:</strong> {config.constraints.pace} 
          ({config.constraints.places_per_day} places/day, {config.constraints.start_time} starts)
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <strong>Budget:</strong> {config.constraints.budget} 
          ({config.constraints.experience_style}, {config.constraints.comfort_level} comfort)
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <strong>Interests:</strong> {config.interests.join(", ")}
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <strong>AI Model:</strong> {config.ai_model}
        </div>

        <details style={{ marginTop: "10px" }}>
          <summary style={{ cursor: "pointer", color: "#1976d2" }}>
            View Full JSON Input
          </summary>
          <pre style={{ 
            background: "white", 
            padding: "10px", 
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
            marginTop: "10px"
          }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </div>

      {/* ====================================================================== */}
      {/* GENERATE BUTTON */}
      {/* ====================================================================== */}
      <button
        onClick={handleGenerateItinerary}
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          background: loading ? "#ccc" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "20px"
        }}
      >
        {loading ? "🤖 Generating Itinerary with AI..." : "✨ Generate Itinerary"}
      </button>

      {loading && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          background: "#e3f2fd",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0 }}>⏳ AI is generating your personalized itinerary...</p>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
            This may take 10-30 seconds depending on trip complexity
          </p>
        </div>
      )}

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
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* ====================================================================== */}
      {/* ITINERARY DISPLAY */}
      {/* ====================================================================== */}
      {itinerary && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ color: "#4caf50" }}>✅ Itinerary Generated Successfully!</h2>
          
          {/* Summary */}
          <div style={{ 
            background: "#e8f5e9", 
            padding: "15px", 
            marginTop: "15px",
            borderRadius: "4px"
          }}>
            <h3>📍 {itinerary.destination} - {itinerary.days} Days</h3>
          </div>

          {/* Daily Itinerary */}
          {itinerary.itinerary.map((day) => (
            <div 
              key={day.day}
              style={{ 
                background: "white", 
                padding: "20px", 
                marginTop: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            >
              <h3 style={{ 
                color: "#1976d2",
                borderBottom: "2px solid #1976d2",
                paddingBottom: "10px"
              }}>
                Day {day.day}
              </h3>

              {/* Morning */}
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ color: "#ff9800", marginBottom: "5px" }}>
                  🌅 Morning: {day.morning.title}
                </h4>
                <p style={{ 
                  marginLeft: "20px", 
                  color: "#333",
                  lineHeight: "1.6"
                }}>
                  {day.morning.description}
                </p>
              </div>

              {/* Afternoon */}
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ color: "#ff9800", marginBottom: "5px" }}>
                  ☀️ Afternoon: {day.afternoon.title}
                </h4>
                <p style={{ 
                  marginLeft: "20px", 
                  color: "#333",
                  lineHeight: "1.6"
                }}>
                  {day.afternoon.description}
                </p>
              </div>

              {/* Evening */}
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ color: "#ff9800", marginBottom: "5px" }}>
                  🌆 Evening: {day.evening.title}
                </h4>
                <p style={{ 
                  marginLeft: "20px", 
                  color: "#333",
                  lineHeight: "1.6"
                }}>
                  {day.evening.description}
                </p>
              </div>
            </div>
          ))}

          {/* Full JSON */}
          <details style={{ marginTop: "20px" }}>
            <summary style={{ 
              cursor: "pointer", 
              fontWeight: "bold",
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "4px"
            }}>
              📄 View Full JSON Response
            </summary>
            <pre style={{ 
              background: "#f5f5f5", 
              padding: "15px", 
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
              marginTop: "10px"
            }}>
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </details>

          {/* Action Buttons */}
          <div style={{ 
            marginTop: "20px",
            display: "flex",
            gap: "10px"
          }}>
            <button
              onClick={handleGenerateItinerary}
              style={{
                padding: "10px 20px",
                background: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              🔄 Regenerate
            </button>
            
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(itinerary, null, 2);
                navigator.clipboard.writeText(jsonStr);
                alert("Itinerary JSON copied to clipboard!");
              }}
              style={{
                padding: "10px 20px",
                background: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              📋 Copy JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}