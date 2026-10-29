import React, { useState, useEffect } from "react";
import {
  Users,
  Map,
  Hotel,
  Compass,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { adminAPI } from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403
          ? "Admin access required. Current user role is not admin."
          : "Failed to load admin stats."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Admin Operations Console" />

        <main style={{ padding: "32px 36px", maxWidth: "1140px", margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0 }}>
                Platform Administration
              </h1>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "2px 0 0 0" }}>
                Global metrics, system entities, and business performance across TripAI.
              </p>
            </div>
          </div>

          {error ? (
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <AlertTriangle size={36} color="#d97706" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: "0 0 8px 0", color: "#92400e" }}>Restricted Access</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#b45309" }}>{error}</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Sparkles size={28} className="spin-slow" color="#5b4df7" />
              <p style={{ marginTop: "12px", color: "#6b7280" }}>Loading operations data...</p>
            </div>
          ) : stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Users</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#111827" }}>
                  {stats.total_users}
                </h2>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Trips Created</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f5f3ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Map size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#111827" }}>
                  {stats.total_trips}
                </h2>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Bookings</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#111827" }}>
                  {stats.total_bookings}
                </h2>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Catalog Hotels</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Hotel size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#111827" }}>
                  {stats.total_hotels}
                </h2>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Catalog Activities</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fce7f3", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Compass size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#111827" }}>
                  {stats.total_activities}
                </h2>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e9eaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Booking Revenue</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0, color: "#059669" }}>
                  ${Number(stats.total_revenue || 0).toLocaleString()}
                </h2>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
