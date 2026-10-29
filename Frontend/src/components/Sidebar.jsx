import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Compass,
  Map,
  Hotel,
  Plane,
  User,
  LogOut,
  ShieldAlert,
  Search,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Overview", icon: Compass, path: "/dashboard" },
    { label: "My Trips", icon: Map, path: "/trips" },
    { label: "Explore & Book", icon: Search, path: "/explore" },
    { label: "Bookings", icon: Hotel, path: "/bookings" },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Console", icon: ShieldAlert, path: "/admin" });
  }

  return (
    <aside className="dashboard-sidebar">
      <Link to="/dashboard" className="dashboard-logo" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="dashboard-logo-icon">
          <Plane size={21} />
        </div>
        <span>TripAI</span>
      </Link>

      <nav className="dashboard-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={isActive ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={location.pathname === "/profile" ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          <User size={19} />
          {user?.name ? user.name.split(" ")[0] : "Profile"}
        </button>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}
