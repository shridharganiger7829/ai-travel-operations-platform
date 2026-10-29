import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plane,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
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
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrorMessage(
        error.response?.data?.detail || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-glow glow-one"></div>
        <div className="auth-glow glow-two"></div>
      </div>

      {/* Navbar */}
      <header className="auth-navbar">
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            <Plane size={20} />
          </div>
          <span>TripAI</span>
        </Link>

        <Link to="/" className="back-home">
          Back to website
          <ArrowRight size={17} />
        </Link>
      </header>

      {/* Main */}
      <main className="auth-container">
        {/* Visual Showcase */}
        <section className="auth-visual">
          <div className="visual-badge">
            <Sparkles size={16} />
            <span>AI Itinerary Generator</span>
          </div>

          <h2>
            Explore the world with an AI travel companion built just for you.
          </h2>

          <p>
            Instant itineraries, verified hotel bookings, travel document processing, and real-time smart modifications.
          </p>

          <div className="visual-card">
            <div className="visual-avatar">AI</div>
            <div className="visual-content">
              <strong>Your Parisian Adventure</strong>
              <span>5 Days • Louvre, Eiffel Tower, Montmartre</span>
            </div>
          </div>
        </section>

        {/* Form Card */}
        <section className="auth-card">
          <div className="card-header">
            <h3>Welcome back</h3>
            <p>Log in to access your planned trips and reservations.</p>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-box">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="traveler@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="input-box">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account yet?{" "}
              <Link to="/register">Create free account</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
