import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Plane,
  CalendarDays,
  Plus,
  Hotel,
  Sparkles,
  Wallet,
  ArrowRight,
  Compass,
} from "lucide-react";

import { useAuth } from "../Context/AuthContext";
import { tripAPI, bookingAPI } from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsData, bookingsData] = await Promise.allSettled([
        tripAPI.getAll(),
        bookingAPI.getAll(),
      ]);

      if (tripsData.status === "fulfilled") {
        setTrips(tripsData.value || []);
      }
      if (bookingsData.status === "fulfilled") {
        setBookings(bookingsData.value || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
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
      console.error("Error deleting trip:", err);
      alert("Failed to delete trip");
    }
  };

  // Calculations
  const totalTrips = trips.length;
  const today = new Date().toISOString().split("T")[0];
  const upcomingTrips = trips.filter((t) => t.start_date >= today).length;
  const totalBookings = bookings.length;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Dashboard Overview" />

        <main className="dashboard-main" style={{ padding: "32px 36px" }}>
          {/* HEADER */}
          <header className="dashboard-header" style={{ marginBottom: "32px" }}>
            <div>
              <p className="dashboard-small-title">YOUR TRAVEL COMMAND CENTER</p>
              <h1>
                Welcome back, <span>{user?.name || "Traveler"}</span> 👋
              </h1>
              <p>Plan smarter. Explore further. Let TripAI handle every detail of your journey.</p>
            </div>

            <button className="create-trip-button" onClick={() => navigate("/trips/create")}>
              <Plus size={19} />
              Create Trip
            </button>
          </header>

          {/* AI HERO CARD */}
          <section className="ai-dashboard-card" style={{ marginBottom: "32px" }}>
            <div className="ai-card-content">
              <div className="ai-icon">
                <Sparkles size={25} />
              </div>

              <div>
                <p className="ai-label">TRIPAI INTELLIGENCE</p>
                <h2>Your next adventure is waiting.</h2>
                <p>
                  Tell TripAI where you want to go and we'll automatically generate a customized
                  day-by-day itinerary with verified activities, hotels, and schedule matching your
                  budget and style.
                </p>

                <button onClick={() => navigate("/trips/create")}>
                  <Sparkles size={17} />
                  Plan Trip with AI
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="dashboard-stats" style={{ marginBottom: "36px" }}>
            <div className="stat-card">
              <div className="stat-icon">
                <Plane size={21} />
              </div>
              <div>
                <span>Total Trips</span>
                <strong>{totalTrips}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CalendarDays size={21} />
              </div>
              <div>
                <span>Upcoming</span>
                <strong>{upcomingTrips}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Hotel size={21} />
              </div>
              <div>
                <span>Active Bookings</span>
                <strong>{totalBookings}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Wallet size={21} />
              </div>
              <div>
                <span>Total Budget</span>
                <strong>${totalBudget.toLocaleString()}</strong>
              </div>
            </div>
          </section>

          {/* RECENT TRIPS SECTION */}
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#111827" }}>
                  Recent Trips
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                  Your active and upcoming travel plans
                </p>
              </div>

              {trips.length > 0 && (
                <button
                  onClick={() => navigate("/trips")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5b4df7",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  View All Trips <ArrowRight size={16} />
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <Sparkles size={24} className="spin-slow" style={{ color: "#5b4df7" }} />
                <p style={{ marginTop: "12px", fontSize: "14px" }}>Loading your trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "48px 24px",
                  textAlign: "center",
                  border: "1px dashed #d1d5db",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#f5f3ff",
                    color: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Compass size={28} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>
                  No trips planned yet
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", maxWidth: "420px", margin: "0 auto 20px" }}>
                  Start by letting TripAI create a custom itinerary for your dream destination in seconds.
                </p>
                <button
                  onClick={() => navigate("/trips/create")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Sparkles size={16} />
                  Plan Your First Trip
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {trips.slice(0, 3).map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
