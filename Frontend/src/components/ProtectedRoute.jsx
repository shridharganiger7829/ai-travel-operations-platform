import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Sparkles } from "lucide-react";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "14px",
          color: "#5b4df7",
          fontFamily: "inherit",
          backgroundColor: "#f7f8fc",
        }}
      >
        <Sparkles size={36} className="spin-slow" />
        <p style={{ fontWeight: 600, fontSize: "16px", color: "#4a4f63" }}>
          Authenticating TripAI session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
