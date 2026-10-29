import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Bell, Sparkles, User, LogOut, Check, CheckCircle2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { notificationAPI } from "../services/api";

export default function Navbar({ isAppView = false, pageTitle = "" }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Backend might not have notifications table ready yet or no notifs
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (isAppView) {
    return (
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e9eaf0",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 700, margin: 0, color: "#111827" }}>
            {pageTitle || "TripAI Workspace"}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
          <button
            onClick={() => navigate("/trips/create")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
              color: "#fff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(91, 77, 247, 0.25)",
            }}
          >
            <Sparkles size={16} />
            AI Trip Planner
          </button>

          {/* Notifications button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                position: "relative",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#4b5563",
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    border: "2px solid #fff",
                  }}
                />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "48px",
                  width: "320px",
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  border: "1px solid #e5e7eb",
                  padding: "16px",
                  zIndex: 100,
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>Notifications</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{unreadCount} unread</span>
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", margin: "20px 0" }}>
                    No notifications right now.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          backgroundColor: n.is_read ? "#f9fafb" : "#f5f3ff",
                          border: `1px solid ${n.is_read ? "#f3f4f6" : "#ddd6fe"}`,
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <strong style={{ color: "#1f2937", fontSize: "13px" }}>{n.title}</strong>
                          {!n.is_read && (
                            <button
                              onClick={(e) => handleMarkRead(n.id, e)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#7c3aed",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User badge */}
          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#e0e7ff",
                color: "#4338ca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", lineHeight: 1.2 }}>
                {user?.name || "Traveler"}
              </span>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                {user?.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public view navbar (for Home page)
  return (
    <header className="home-navbar">
      <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="logo-icon">
          <Plane size={19} />
        </div>
        <span>
          Trip<span>AI</span>
        </span>
      </Link>

      <nav className="nav-links">
        <a href="#discover">Discover</a>
        <a href="#features">Features</a>
        <a href="#destinations">Destinations</a>
        <a href="#how-it-works">How it works</a>
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <button
            className="nav-start-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="nav-start-btn"
              onClick={() => navigate("/register")}
            >
              Start Planning
            </button>
          </>
        )}
      </div>
    </header>
  );
}
