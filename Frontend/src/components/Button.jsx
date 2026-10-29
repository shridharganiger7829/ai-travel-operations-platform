import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    opacity: disabled || loading ? 0.65 : 1,
    textDecoration: "none",
  };

  const sizes = {
    sm: { padding: "7px 12px", fontSize: "13px" },
    md: { padding: "10px 18px", fontSize: "14px" },
    lg: { padding: "13px 24px", fontSize: "16px" },
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(91, 77, 247, 0.25)",
    },
    secondary: {
      background: "#f0effe",
      color: "#5b4df7",
    },
    outline: {
      background: "transparent",
      color: "#374151",
      border: "1px solid #d1d5db",
    },
    danger: {
      background: "#ef4444",
      color: "#ffffff",
    },
    ghost: {
      background: "transparent",
      color: "#6b7280",
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...sizes[size],
        ...variants[variant],
      }}
      className={`app-button ${className}`}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      ) : (
        Icon && <Icon size={size === "sm" ? 15 : 18} />
      )}
      {children}
      {!loading && IconRight && <IconRight size={size === "sm" ? 15 : 18} />}
    </button>
  );
}
