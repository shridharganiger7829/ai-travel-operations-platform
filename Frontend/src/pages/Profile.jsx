import React from "react";
import { User, Mail, Shield, Calendar, LogOut, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="User Profile" />

        <main style={{ padding: "32px 36px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
              My Profile
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Your account details and security settings.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "36px",
              border: "1px solid #e9eaf0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 800,
                  boxShadow: "0 8px 20px rgba(91, 77, 247, 0.3)",
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>

              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
                  {user?.name || "Traveler"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      backgroundColor: user?.role === "admin" ? "#fef3c7" : "#ecfdf5",
                      color: user?.role === "admin" ? "#d97706" : "#059669",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {user?.role || "Customer"}
                  </span>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Active Member</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderTop: "1px solid #f3f4f6", paddingTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <User size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>FULL NAME</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 600, color: "#1f2937" }}>
                    {user?.name}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <Mail size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>EMAIL ADDRESS</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 600, color: "#1f2937" }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <Shield size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>ACCOUNT ROLE</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 600, color: "#1f2937", textTransform: "capitalize" }}>
                    {user?.role} Access
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid #f3f4f6" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  border: "1px solid #ef4444",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} />
                Sign Out of TripAI
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
