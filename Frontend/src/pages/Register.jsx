import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Plane,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { formatApiError } from "../services/api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
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

    // Client-side quick checks
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(trimmedName, trimmedEmail, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      const friendlyError = formatApiError(
        error,
        "Registration failed. Please verify your details."
      );
      setErrorMessage(friendlyError);
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
            <span>Start Your Journey</span>
          </div>

          <h1 className="auth-hero-title">
            Plan unforgettable journeys with <span>AI precision.</span>
          </h1>

          <p className="auth-hero-subtitle">
            Create your free account to unlock instant day-by-day itineraries, curated stays,
            seamless activity bookings, and smart travel document extraction.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Hyper-personalized Itineraries
                <span>Crafted around your exact budget, schedule, and interests</span>
              </p>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Direct Lodging & Tour Bookings
                <span>Keep all confirmations and reservations synchronized</span>
              </p>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <p>
                Natural Language Co-pilot
                <span>Simply ask to add activities, swap days, or tweak timings</span>
              </p>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="auth-itinerary-preview">
            <div className="auth-preview-icon">
              <MapPin size={24} />
            </div>
            <div className="auth-preview-details">
              <h4>Tokyo & Kyoto Highlights</h4>
              <p>7 Days • Cultural & Culinary Discovery</p>
            </div>
            <span className="auth-preview-tag">AI Generated</span>
          </div>
        </section>

        {/* Right Form Card */}
        <div className="auth-card-wrapper">
          <section className="auth-form-card">
            <div className="auth-card-top">
              <h2>Create your account</h2>
              <p>Get started with TripAI in seconds. No credit card required.</p>
            </div>

            {errorMessage && (
              <div className="auth-alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Account created successfully! Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-name">
                  Full Name
                </label>
                <div className="auth-input-container">
                  <User size={19} className="auth-input-icon" />
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Alex Rivera"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label" htmlFor="register-email">
                  Email Address
                </label>
                <div className="auth-input-container">
                  <Mail size={19} className="auth-input-icon" />
                  <input
                    id="register-email"
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
                <label className="auth-label" htmlFor="register-password">
                  Password
                </label>
                <div className="auth-input-container">
                  <Lock size={19} className="auth-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Sparkles size={18} className="spin-slow" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
