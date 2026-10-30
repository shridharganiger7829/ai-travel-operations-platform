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
  Search,
  RefreshCw,
  Database,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  Filter,
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

  // Tab & Live PostgreSQL Data State
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'trips' | 'bookings' | 'hotels' | 'activities'
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminStats();
    loadTabData("users");
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

  const loadTabData = async (tab) => {
    setActiveTab(tab);
    setTableLoading(true);
    setSearchQuery("");
    try {
      let data = [];
      if (tab === "users") data = await adminAPI.getUsers();
      else if (tab === "trips") data = await adminAPI.getTrips();
      else if (tab === "bookings") data = await adminAPI.getBookings();
      else if (tab === "hotels") data = await adminAPI.getHotels();
      else if (tab === "activities") data = await adminAPI.getActivities();
      setTableData(data || []);
    } catch (err) {
      console.error(`Failed to load ${tab} data:`, err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAdminStats(), loadTabData(activeTab)]);
    setRefreshing(false);
  };

  // Filter table data by search query
  const filteredData = tableData.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  const cards = [
    {
      key: "users",
      label: "Total Users",
      count: stats?.total_users ?? 0,
      icon: Users,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      badge: "PostgreSQL: users",
    },
    {
      key: "trips",
      label: "Total Trips Created",
      count: stats?.total_trips ?? 0,
      icon: Map,
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      badge: "PostgreSQL: trips",
    },
    {
      key: "bookings",
      label: "Total Bookings",
      count: stats?.total_bookings ?? 0,
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      badge: "PostgreSQL: bookings",
    },
    {
      key: "hotels",
      label: "Catalog Hotels",
      count: stats?.total_hotels ?? 0,
      icon: Hotel,
      color: "#d97706",
      bgColor: "#fef3c7",
      badge: "PostgreSQL: hotels",
    },
    {
      key: "activities",
      label: "Catalog Activities",
      count: stats?.total_activities ?? 0,
      icon: Compass,
      color: "#ec4899",
      bgColor: "#fce7f3",
      badge: "PostgreSQL: activities",
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Admin Operations Console" />

        <main style={{ padding: "32px 36px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                  Platform Administration
                </h1>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "3px 0 0 0" }}>
                  Direct PostgreSQL inspection for users, trips, reservations, and inventory.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
              }}
            >
              <RefreshCw size={16} className={refreshing ? "spin-slow" : ""} />
              {refreshing ? "Syncing..." : "Refresh Live Data"}
            </button>
          </div>

          {error ? (
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "16px",
                padding: "36px",
                textAlign: "center",
              }}
            >
              <AlertTriangle size={40} color="#d97706" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: "0 0 8px 0", color: "#92400e", fontSize: "18px" }}>Restricted Access</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#b45309" }}>{error}</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Sparkles size={32} className="spin-slow" color="#5b4df7" />
              <p style={{ marginTop: "14px", color: "#6b7280", fontSize: "15px" }}>Connecting to PostgreSQL & loading platform metrics...</p>
            </div>
          ) : stats && (
            <>
              {/* Top Metrics Cards - Clickable Tabs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginBottom: "32px",
                }}
              >
                {cards.map((card) => {
                  const Icon = card.icon;
                  const isActive = activeTab === card.key;
                  return (
                    <div
                      key={card.key}
                      onClick={() => loadTabData(card.key)}
                      style={{
                        backgroundColor: isActive ? "#faf5ff" : "#ffffff",
                        padding: "20px 22px",
                        borderRadius: "16px",
                        border: isActive ? `2px solid #7c3aed` : "1px solid #e5e7eb",
                        boxShadow: isActive
                          ? "0 8px 24px rgba(124, 58, 237, 0.12)"
                          : "0 2px 8px rgba(0,0,0,0.03)",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isActive ? "translateY(-2px)" : "none",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: isActive ? "#6d28d9" : "#4b5563" }}>
                          {card.label}
                        </span>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            backgroundColor: card.bgColor,
                            color: card.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={19} />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <h2 style={{ fontSize: "30px", fontWeight: 800, margin: 0, color: "#111827" }}>
                          {card.count}
                        </h2>
                        {isActive && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", backgroundColor: "#ede9fe", padding: "2px 8px", borderRadius: "10px" }}>
                            Viewing Records ↓
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                          {card.badge}
                        </span>
                        <span style={{ fontSize: "12px", color: isActive ? "#7c3aed" : "#9ca3af", fontWeight: 600, display: "flex", alignItems: "center" }}>
                          Inspect <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Total Revenue Summary Card */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "20px 22px",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#4b5563" }}>
                      Total Booking Revenue
                    </span>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#d1fae5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={19} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: "30px", fontWeight: 800, margin: 0, color: "#059669" }}>
                    ${Number(stats.total_revenue || 0).toLocaleString()}
                  </h2>
                  <div style={{ marginTop: "12px", fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                    PostgreSQL: sum(amount)
                  </div>
                </div>
              </div>

              {/* Live PostgreSQL Records Section */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Table Header Bar */}
                <div
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    backgroundColor: "#fcfcfd",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Database size={16} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#111827" }}>
                          {activeTab === "users" && "PostgreSQL Users Table"}
                          {activeTab === "trips" && "PostgreSQL Trips Table"}
                          {activeTab === "bookings" && "PostgreSQL Bookings Table"}
                          {activeTab === "hotels" && "PostgreSQL Hotels Catalog"}
                          {activeTab === "activities" && "PostgreSQL Activities Catalog"}
                        </h2>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                          }}
                        >
                          {tableData.length} records
                        </span>
                      </div>
                      <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                        Live query executed on database table: <code style={{ backgroundColor: "#f3f4f6", padding: "1px 5px", borderRadius: "4px", color: "#7c3aed" }}>{activeTab === "users" ? "users" : activeTab === "trips" ? "trips" : activeTab === "bookings" ? "bookings" : activeTab === "hotels" ? "hotels" : "activities"}</code>
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: "relative", minWidth: "260px" }}>
                    <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder={`Search in ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 36px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "13px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                      }}
                    />
                  </div>
                </div>

                {/* Table Content */}
                {tableLoading ? (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Sparkles size={26} className="spin-slow" color="#7c3aed" />
                    <p style={{ marginTop: "10px", color: "#6b7280", fontSize: "14px" }}>Fetching live data from PostgreSQL...</p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Filter size={32} color="#9ca3af" style={{ margin: "0 auto 10px" }} />
                    <h4 style={{ margin: "0 0 4px 0", color: "#374151", fontSize: "16px" }}>No matching records found</h4>
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
                      {searchQuery ? `No results match "${searchQuery}"` : "This PostgreSQL table currently has no records."}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {activeTab === "users" && (
                            <>
                              <th style={{ padding: "14px 20px" }}>User ID</th>
                              <th style={{ padding: "14px 20px" }}>Full Name</th>
                              <th style={{ padding: "14px 20px" }}>Email</th>
                              <th style={{ padding: "14px 20px" }}>Role</th>
                              <th style={{ padding: "14px 20px" }}>Trips</th>
                              <th style={{ padding: "14px 20px" }}>Bookings</th>
                              <th style={{ padding: "14px 20px" }}>Registered On</th>
                            </>
                          )}
                          {activeTab === "trips" && (
                            <>
                              <th style={{ padding: "14px 20px" }}>Trip ID</th>
                              <th style={{ padding: "14px 20px" }}>Trip Title</th>
                              <th style={{ padding: "14px 20px" }}>Destination</th>
                              <th style={{ padding: "14px 20px" }}>Dates</th>
                              <th style={{ padding: "14px 20px" }}>Budget</th>
                              <th style={{ padding: "14px 20px" }}>Status</th>
                              <th style={{ padding: "14px 20px" }}>Created By</th>
                              <th style={{ padding: "14px 20px" }}>Bookings</th>
                            </>
                          )}
                          {activeTab === "bookings" && (
                            <>
                              <th style={{ padding: "14px 20px" }}>Booking ID</th>
                              <th style={{ padding: "14px 20px" }}>Type</th>
                              <th style={{ padding: "14px 20px" }}>Reserved Item</th>
                              <th style={{ padding: "14px 20px" }}>Customer</th>
                              <th style={{ padding: "14px 20px" }}>Trip</th>
                              <th style={{ padding: "14px 20px" }}>Booking Date</th>
                              <th style={{ padding: "14px 20px" }}>Amount</th>
                              <th style={{ padding: "14px 20px" }}>Status</th>
                            </>
                          )}
                          {activeTab === "hotels" && (
                            <>
                              <th style={{ padding: "14px 20px" }}>Hotel ID</th>
                              <th style={{ padding: "14px 20px" }}>Hotel Name</th>
                              <th style={{ padding: "14px 20px" }}>Location</th>
                              <th style={{ padding: "14px 20px" }}>Price / Night</th>
                              <th style={{ padding: "14px 20px" }}>Rating</th>
                              <th style={{ padding: "14px 20px" }}>Description</th>
                            </>
                          )}
                          {activeTab === "activities" && (
                            <>
                              <th style={{ padding: "14px 20px" }}>Activity ID</th>
                              <th style={{ padding: "14px 20px" }}>Activity Name</th>
                              <th style={{ padding: "14px 20px" }}>Location</th>
                              <th style={{ padding: "14px 20px" }}>Price</th>
                              <th style={{ padding: "14px 20px" }}>Duration</th>
                              <th style={{ padding: "14px 20px" }}>Description</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((row, idx) => (
                          <tr
                            key={row.id || idx}
                            style={{
                              borderBottom: "1px solid #f3f4f6",
                              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfcfd",
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            {/* USERS ROW */}
                            {activeTab === "users" && (
                              <>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#6b7280" }}>
                                  #{row.id}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>
                                      {row.name ? row.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    {row.name}
                                  </div>
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.email}
                                </td>
                                <td style={{ padding: "14px 20px" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "4px 10px",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      backgroundColor:
                                        row.role === "admin"
                                          ? "#fef3c7"
                                          : row.role === "travel_agent"
                                          ? "#ede9fe"
                                          : "#f3f4f6",
                                      color:
                                        row.role === "admin"
                                          ? "#b45309"
                                          : row.role === "travel_agent"
                                          ? "#6d28d9"
                                          : "#4b5563",
                                    }}
                                  >
                                    {row.role}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 20px", color: "#374151", fontWeight: 600 }}>
                                  {row.total_trips ?? 0}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#374151", fontWeight: 600 }}>
                                  {row.total_bookings ?? 0}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "12px" }}>
                                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                                </td>
                              </>
                            )}

                            {/* TRIPS ROW */}
                            {activeTab === "trips" && (
                              <>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#6b7280" }}>
                                  #{row.id}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                                  {row.title}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.destination}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "12px" }}>
                                  {row.start_date} &rarr; {row.end_date}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#059669" }}>
                                  ${Number(row.budget || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: "14px 20px" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      textTransform: "capitalize",
                                      backgroundColor:
                                        row.status === "confirmed"
                                          ? "#d1fae5"
                                          : row.status === "completed"
                                          ? "#eff6ff"
                                          : "#fef3c7",
                                      color:
                                        row.status === "confirmed"
                                          ? "#065f46"
                                          : row.status === "completed"
                                          ? "#1e40af"
                                          : "#92400e",
                                    }}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 20px", color: "#374151" }}>
                                  <div style={{ fontWeight: 600 }}>{row.user_name}</div>
                                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{row.user_email}</div>
                                </td>
                                <td style={{ padding: "14px 20px", color: "#374151", fontWeight: 600 }}>
                                  {row.bookings_count ?? 0}
                                </td>
                              </>
                            )}

                            {/* BOOKINGS ROW */}
                            {activeTab === "bookings" && (
                              <>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#6b7280" }}>
                                  #{row.id}
                                </td>
                                <td style={{ padding: "14px 20px" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      backgroundColor: row.booking_type === "hotel" ? "#fef3c7" : "#ecfdf5",
                                      color: row.booking_type === "hotel" ? "#d97706" : "#059669",
                                    }}
                                  >
                                    {row.booking_type}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                                  {row.item_name}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#374151" }}>
                                  <div style={{ fontWeight: 600 }}>{row.user_name}</div>
                                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{row.user_email}</div>
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.trip_title}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "12px" }}>
                                  {row.booking_date}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 800, color: "#059669" }}>
                                  ${Number(row.amount || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: "14px 20px" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      textTransform: "capitalize",
                                      backgroundColor:
                                        row.status === "confirmed"
                                          ? "#d1fae5"
                                          : row.status === "cancelled"
                                          ? "#fee2e2"
                                          : "#fef3c7",
                                      color:
                                        row.status === "confirmed"
                                          ? "#065f46"
                                          : row.status === "cancelled"
                                          ? "#991b1b"
                                          : "#92400e",
                                    }}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                              </>
                            )}

                            {/* HOTELS ROW */}
                            {activeTab === "hotels" && (
                              <>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#6b7280" }}>
                                  #{row.id}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                                  {row.name}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.location}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#059669" }}>
                                  ${Number(row.price_per_night || 0).toLocaleString()} / night
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#d97706" }}>
                                  ⭐ {row.rating || "N/A"}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "12px", maxWidth: "340px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {row.description || "—"}
                                </td>
                              </>
                            )}

                            {/* ACTIVITIES ROW */}
                            {activeTab === "activities" && (
                              <>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#6b7280" }}>
                                  #{row.id}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#111827" }}>
                                  {row.name}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.location}
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 700, color: "#059669" }}>
                                  ${Number(row.price || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                  {row.duration_hours} hrs
                                </td>
                                <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "12px", maxWidth: "340px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {row.description || "—"}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Footer */}
                <div
                  style={{
                    padding: "14px 24px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  <span>
                    Showing <strong>{filteredData.length}</strong> of <strong>{tableData.length}</strong> records in {activeTab}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                    Connected to PostgreSQL Database
                  </span>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
