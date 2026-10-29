import React, { useState, useEffect } from "react";
import {
  Hotel,
  Compass,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Sparkles,
  Calendar,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { bookingAPI } from "../services/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getAll();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await bookingAPI.confirm(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking.");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingAPI.cancel(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking.");
    }
  };

  // Stats
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return (b.status || "").toLowerCase() === statusFilter;
  });

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Bookings & Reservations" />

        <main style={{ padding: "32px 36px", maxWidth: "1140px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
              My Bookings ({bookings.length})
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Track hotel reservations, scheduled tours, and pending confirmations.
            </p>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e9eaf0", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f3ff", color: "#5b4df7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Hotel size={22} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Total Bookings</span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: 800, color: "#111827" }}>{bookings.length}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e9eaf0", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Confirmed</span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: 800, color: "#111827" }}>{confirmedCount}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e9eaf0", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fefce8", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Pending</span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: 800, color: "#111827" }}>{pendingCount}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e9eaf0", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={22} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Total Spent</span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: 800, color: "#111827" }}>${totalSpent.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#e5e7eb",
              padding: "4px",
              borderRadius: "10px",
              marginBottom: "24px",
              width: "fit-content",
            }}
          >
            {[
              { id: "all", label: "All Reservations" },
              { id: "pending", label: "Pending" },
              { id: "confirmed", label: "Confirmed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: statusFilter === tab.id ? "#ffffff" : "transparent",
                  color: statusFilter === tab.id ? "#5b4df7" : "#4b5563",
                  boxShadow: statusFilter === tab.id ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Sparkles size={28} className="spin-slow" color="#5b4df7" />
              <p style={{ marginTop: "12px", color: "#6b7280" }}>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "60px 24px",
                textAlign: "center",
                border: "1px dashed #d1d5db",
              }}
            >
              <Hotel size={36} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>
                No bookings found
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Explore destinations and hotels to start booking reservations.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px 26px",
                    border: "1px solid #e9eaf0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: b.booking_type === "hotel" ? "#eff6ff" : "#f5f3ff",
                        color: b.booking_type === "hotel" ? "#2563eb" : "#7c3aed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {b.booking_type === "hotel" ? <Hotel size={24} /> : <Compass size={24} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>
                          {b.booking_type} Reservation #{b.reference_id}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>• Trip ID #{b.trip_id}</span>
                      </div>

                      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#6b7280" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} /> {b.booking_date}
                        </span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>
                          ${b.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span
                      style={{
                        padding: "5px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor:
                          b.status === "confirmed" ? "#ecfdf5" : b.status === "cancelled" ? "#fef2f2" : "#fefce8",
                        color:
                          b.status === "confirmed" ? "#059669" : b.status === "cancelled" ? "#dc2626" : "#d97706",
                        border: `1px solid ${
                          b.status === "confirmed" ? "#a7f3d0" : b.status === "cancelled" ? "#fecaca" : "#fde68a"
                        }`,
                        textTransform: "capitalize",
                      }}
                    >
                      {b.status}
                    </span>

                    {b.status === "pending" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleConfirm(b.id)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#10b981",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(b.id)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "8px",
                            border: "1px solid #ef4444",
                            backgroundColor: "#ffffff",
                            color: "#ef4444",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
