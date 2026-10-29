import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";

export default function DestinationCard({ destination, onSelect }) {
  const navigate = useNavigate();

  const handlePlan = () => {
    if (onSelect) {
      onSelect(destination);
    } else {
      navigate(`/trips/create?destination=${encodeURIComponent(destination.name)}`);
    }
  };

  const defaultImage =
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e9eaf0",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(91, 77, 247, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
        <img
          src={destination.image_url || defaultImage}
          alt={destination.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "12px",
            backgroundColor: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(4px)",
            color: "#ffffff",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <MapPin size={12} />
          {destination.country}
        </div>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            {destination.name}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#6b7280",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {destination.description || "Discover scenic landscapes, vibrant culture, and unforgettable travel experiences."}
          </p>
        </div>

        <div style={{ marginTop: "18px" }}>
          <button
            onClick={handlePlan}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#f5f3ff",
              color: "#6366f1",
              border: "1px solid #ddd6fe",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6366f1";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f3ff";
              e.currentTarget.style.color = "#6366f1";
            }}
          >
            <Sparkles size={15} />
            Plan with AI
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
