import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Wallet,
  MapPin,
  Check,
  ArrowRight,
  Layers,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { aiAPI, tripAPI } from "../services/api";

const travelStyles = [
  { id: "balanced", label: "Balanced", desc: "Best mix of sightseeing & relaxation" },
  { id: "luxury", label: "Luxury", desc: "Premium stays, fine dining & private tours" },
  { id: "budget", label: "Budget-Friendly", desc: "Smart savings & local hidden gems" },
  { id: "adventurous", label: "Adventurous", desc: "Outdoor activities & thrills" },
  { id: "relaxed", label: "Relaxed", desc: "Slow travel & scenic vibes" },
  { id: "cultural", label: "Cultural", desc: "Museums, historic heritage & art" },
];

const availableInterests = [
  "Beach & Sun",
  "History & Monuments",
  "Local Food & Wine",
  "Nightlife & Clubs",
  "Adventure & Trekking",
  "Art & Museums",
  "Shopping & Markets",
  "Nature & Wildlife",
  "Photography",
  "Wellness & Spa",
];

const popularDestinations = [
  "Paris, France",
  "Goa, India",
  "Bali, Indonesia",
  "Tokyo, Japan",
  "Rome, Italy",
  "New York, USA",
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("ai"); // 'ai' | 'manual'
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  // AI Form state
  const [aiForm, setAiForm] = useState({
    destination: searchParams.get("destination") || "",
    start_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
    budget: 1500,
    travel_style: "balanced",
    interests: ["Local Food & Wine", "History & Monuments"],
  });

  // Manual Form state
  const [manualForm, setManualForm] = useState({
    title: "",
    destination: searchParams.get("destination") || "",
    start_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
    budget: 1200,
  });

  // Rotate loading steps for pleasant AI generation feedback
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analyzing your destination & travel style...",
    "Curating top attractions and hidden gems...",
    "Optimizing day-by-day itinerary schedule...",
    "Finalizing your trip and lodging plans...",
  ];

  const handleInterestToggle = (interest) => {
    setAiForm((prev) => {
      const exists = prev.interests.includes(interest);
      const nextInterests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: nextInterests };
    });
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!aiForm.destination.trim()) {
      setError("Please specify a destination.");
      return;
    }
    if (new Date(aiForm.end_date) < new Date(aiForm.start_date)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    try {
      const result = await aiAPI.generateItinerary({
        destination: aiForm.destination.trim(),
        start_date: aiForm.start_date,
        end_date: aiForm.end_date,
        budget: Number(aiForm.budget),
        interests: aiForm.interests.length > 0 ? aiForm.interests : ["Sightseeing"],
        travel_style: aiForm.travel_style,
      });

      // result contains { message, trip_id, ... }
      const newTripId = result.trip_id || result.id;
      if (newTripId) {
        navigate(`/trips/${newTripId}`);
      } else {
        navigate("/trips");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      setError(
        err.response?.data?.detail ||
          "AI Generation failed. Check if backend AI service is running or try again."
      );
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!manualForm.title.trim() || !manualForm.destination.trim()) {
      setError("Please provide a title and destination.");
      return;
    }
    if (new Date(manualForm.end_date) < new Date(manualForm.start_date)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    try {
      const result = await tripAPI.create({
        title: manualForm.title.trim(),
        destination: manualForm.destination.trim(),
        start_date: manualForm.start_date,
        end_date: manualForm.end_date,
        budget: Number(manualForm.budget),
      });

      navigate(`/trips/${result.id}`);
    } catch (err) {
      console.error("Trip creation error:", err);
      setError(err.response?.data?.detail || "Failed to create trip.");
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Create New Trip" />

        <main style={{ padding: "32px 36px", maxWidth: "920px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
              Plan Your Next Getaway
            </h1>
            <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
              Use AI intelligence to craft an instant itinerary or build your journey step-by-step.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#e5e7eb",
              padding: "4px",
              borderRadius: "12px",
              marginBottom: "32px",
              width: "fit-content",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor: activeTab === "ai" ? "#ffffff" : "transparent",
                color: activeTab === "ai" ? "#5b4df7" : "#4b5563",
                boxShadow: activeTab === "ai" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              <Sparkles size={17} />
              AI Magic Planner
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor: activeTab === "manual" ? "#ffffff" : "transparent",
                color: activeTab === "manual" ? "#5b4df7" : "#4b5563",
                boxShadow: activeTab === "manual" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              <Layers size={17} />
              Custom Manual Plan
            </button>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 18px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                color: "#b91c1c",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* AI PLANNER FORM */}
          {activeTab === "ai" && (
            <form
              onSubmit={handleAiSubmit}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "36px",
                border: "1px solid #e9eaf0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              {/* Destination */}
              <div style={{ marginBottom: "26px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  Where do you want to travel?
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin
                    size={18}
                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barcelona, Spain or Kyoto, Japan"
                    value={aiForm.destination}
                    onChange={(e) => setAiForm({ ...aiForm, destination: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 44px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Popular Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280", alignSelf: "center", marginRight: "4px" }}>
                    Popular:
                  </span>
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setAiForm({ ...aiForm, destination: dest })}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                        fontSize: "12px",
                        color: "#4b5563",
                        cursor: "pointer",
                      }}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Budget Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "26px",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    Start Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar
                      size={18}
                      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                    />
                    <input
                      type="date"
                      required
                      value={aiForm.start_date}
                      onChange={(e) => setAiForm({ ...aiForm, start_date: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 44px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    End Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar
                      size={18}
                      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                    />
                    <input
                      type="date"
                      required
                      value={aiForm.end_date}
                      onChange={(e) => setAiForm({ ...aiForm, end_date: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 44px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    Budget (USD)
                  </label>
                  <div style={{ position: "relative" }}>
                    <Wallet
                      size={18}
                      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                    />
                    <input
                      type="number"
                      min="100"
                      step="50"
                      required
                      value={aiForm.budget}
                      onChange={(e) => setAiForm({ ...aiForm, budget: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 44px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <div style={{ marginBottom: "26px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "12px" }}>
                  Travel Style
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {travelStyles.map((style) => {
                    const isSelected = aiForm.travel_style === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setAiForm({ ...aiForm, travel_style: style.id })}
                        style={{
                          padding: "14px",
                          borderRadius: "12px",
                          border: `2px solid ${isSelected ? "#5b4df7" : "#e5e7eb"}`,
                          backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? "#5b4df7" : "#1f2937" }}>
                            {style.label}
                          </span>
                          {isSelected && <Check size={16} color="#5b4df7" />}
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                          {style.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interests Tags */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "10px" }}>
                  What activities and vibes excite you?
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {availableInterests.map((interest) => {
                    const isSelected = aiForm.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          border: `1px solid ${isSelected ? "#5b4df7" : "#d1d5db"}`,
                          backgroundColor: isSelected ? "#5b4df7" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#4b5563",
                          fontWeight: 600,
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 20px rgba(91, 77, 247, 0.3)",
                }}
              >
                {loading ? (
                  <>
                    <Sparkles size={20} className="spin-slow" />
                    <span>{loadingMessages[loadingStep]}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate AI Itinerary</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MANUAL PLANNER FORM */}
          {activeTab === "manual" && (
            <form
              onSubmit={handleManualSubmit}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "36px",
                border: "1px solid #e9eaf0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  Trip Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer in Southern Italy"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  Destination
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amalfi Coast, Italy"
                  value={manualForm.destination}
                  onChange={(e) => setManualForm({ ...manualForm, destination: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "26px",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.start_date}
                    onChange={(e) => setManualForm({ ...manualForm, start_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.end_date}
                    onChange={(e) => setManualForm({ ...manualForm, end_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={manualForm.budget}
                    onChange={(e) => setManualForm({ ...manualForm, budget: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <Layers size={18} />
                <span>Create Trip & Open Planner</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
