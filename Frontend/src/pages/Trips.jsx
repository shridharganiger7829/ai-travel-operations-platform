import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Sparkles,
  Compass,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import { tripAPI } from "../services/api";

export default function Trips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripAPI.getAll();
      setTrips(data || []);
    } catch (err) {
      console.error("Failed to load trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip and its itinerary?")) return;
    try {
      await tripAPI.delete(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete trip.");
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.destination || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (t.status || "planning").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="My Trips" />

        <main style={{ padding: "32px 36px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
                My Trips ({trips.length})
              </h1>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Manage your itineraries, bookings, and travel timelines.
              </p>
            </div>

            <button
              onClick={() => navigate("/trips/create")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                color: "#ffffff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(91, 77, 247, 0.3)",
              }}
            >
              <Plus size={18} />
              Create Trip
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            {/* Search input */}
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <Search
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
              />
              <input
                type="text"
                placeholder="Search by destination or trip title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Status Tabs */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#e5e7eb",
                padding: "4px",
                borderRadius: "10px",
              }}
            >
              {[
                { id: "all", label: "All" },
                { id: "planning", label: "Planning" },
                { id: "active", label: "Active" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: statusFilter === tab.id ? "#ffffff" : "transparent",
                    color: statusFilter === tab.id ? "#5b4df7" : "#4b5563",
                    boxShadow: statusFilter === tab.id ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of trips */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Sparkles size={30} className="spin-slow" color="#5b4df7" />
              <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "60px 24px",
                textAlign: "center",
                border: "1px dashed #d1d5db",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#f5f3ff",
                  color: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Compass size={30} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>
                {searchTerm || statusFilter !== "all" ? "No matching trips found" : "No trips created yet"}
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>
                {searchTerm || statusFilter !== "all"
                  ? "Try clearing your search query or changing filters."
                  : "Let TripAI craft an unforgettable itinerary for you today."}
              </p>
              <button
                onClick={() => navigate("/trips/create")}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Plan a New Trip
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
