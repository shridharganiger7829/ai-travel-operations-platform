import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plane,
  Sparkles,
  Check,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { formatApiError } from "../services/api";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrorMessage(
        formatApiError(error, "Invalid email or password. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background blobs */}
      <div className="auth-bg-decor">
        <div className="auth-bg-blob-1"></div>
        <div className="auth-bg-blob-2"></div>
      </div>

      {/* Header */}
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon">
            <Plane size={22} />
          </div>
          <span>
            Trip<span>AI</span>
          </span>
        </Link>

        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Layout */}
      <main className="auth-main-layout">
        {/* Left Hero Showcase */}
        <section className="auth-hero-showcase">
          <div className="auth-badge">
            <Sparkles size={15} />
            <span>AI Travel Intelligence</span>
          </div>

          <h1 className="auth-hero-title">
            Welcome back to your <span>travel command center.</span>
          </h1>

          <p className="auth-hero-subtitle">
            Log in to manage your personalized day-by-day itineraries, track reservations,
            and collaborate with your AI Travel Co-pilot.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Real-time AI Schedule Optimizer
                <span>Instant itinerary adjustments based on budget and timing</span>
              </p>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Hotels & Activities Hub
                <span>Verified boutique accommodations and scheduled excursions</span>
              </p>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Smart Travel Document Vault
                <span>Secure storage with automatic flight and hotel extraction</span>
              </p>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="auth-itinerary-preview">
            <div className="auth-preview-icon">
              <MapPin size={24} />
            </div>
            <div className="auth-preview-details">
              <h4>Amalfi Coast & Capri Adventure</h4>
              <p>5 Days • 12 Activities • Balanced Pace</p>
            </div>
            <span className="auth-preview-tag">Confirmed</span>
          </div>
        </section>

        {/* Right Form Card */}
        <div className="auth-card-wrapper">
          <section className="auth-form-card">
            <div className="auth-card-top">
              <h2>Sign in to your account</h2>
              <p>Enter your email and password to access your trips and bookings.</p>
            </div>

            {errorMessage && (
              <div className="auth-alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="auth-input-container">
                  <Mail size={19} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "9px" }}>
                  <label className="auth-label" htmlFor="login-password" style={{ margin: 0 }}>
                    Password
                  </label>
                </div>
                <div className="auth-input-container">
                  <Lock size={19} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Sparkles size={18} className="spin-slow" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <p>
                Don't have an account yet?{" "}
                <Link to="/register">Create free account</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
