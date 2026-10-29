import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Plane,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
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
    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        error.response?.data?.detail || "Registration failed. Please check your details."
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

      <main className="auth-container">
        {/* Visual */}
        <section className="auth-visual">
          <div className="visual-badge">
            <Sparkles size={16} />
            <span>AI Travel Community</span>
          </div>

          <h2>Join travelers planning effortless vacations.</h2>

          <p>
            Create an account to save custom itineraries, manage hotel bookings, upload travel passes, and collaborate with AI.
          </p>

          <div className="visual-card">
            <div className="visual-avatar">✈️</div>
            <div className="visual-content">
              <strong>Personalized Travel Ops</strong>
              <span>Automatic schedule balancing & activity discovery</span>
            </div>
          </div>
        </section>

        {/* Card */}
        <section className="auth-card">
          <div className="card-header">
            <h3>Create your account</h3>
            <p>Start generating intelligent travel itineraries today.</p>
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

          {success && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#059669",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={16} />
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="input-box">
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-box">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-box">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 6 characters"
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
              disabled={loading || success}
            >
              {loading ? "Creating account..." : "Create Account"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
