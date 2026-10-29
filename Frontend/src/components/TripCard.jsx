import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Wallet, ArrowRight, Trash2, Sparkles } from "lucide-react";

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
      case "completed":
        return { bg: "#f3f4f6", text: "#4b5563", border: "#e5e7eb" };
      case "planning":
      default:
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
    }
  };

  const statusStyle = getStatusColor(trip.status);

  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const daysCount = () => {
    if (!trip.start_date || !trip.end_date) return null;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} Days` : null;
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e9eaf0",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        transition: "all 0.25s ease",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/trips/${trip.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(91, 77, 247, 0.1)";
        e.currentTarget.style.borderColor = "#c7d2fe";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.03)";
        e.currentTarget.style.borderColor = "#e9eaf0";
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6366f1", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <MapPin size={14} />
            <span>{trip.destination}</span>
          </div>

          <span
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
              textTransform: "capitalize",
            }}
          >
            {trip.status || "Planning"}
          </span>
        </div>

        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 14px 0",
            lineHeight: 1.3,
          }}
        >
          {trip.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#6b7280" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={15} style={{ color: "#9ca3af" }} />
            <span>
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </span>
            {daysCount() && (
              <span style={{ backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, color: "#4b5563" }}>
                {daysCount()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Wallet size={15} style={{ color: "#9ca3af" }} />
            <span>Budget: ${Number(trip.budget || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#5b4df7",
          }}
        >
          View Itinerary <ArrowRight size={14} />
        </span>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip.id);
            }}
            title="Delete Trip"
            style={{
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
