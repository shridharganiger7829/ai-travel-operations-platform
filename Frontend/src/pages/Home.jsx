import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Plane,
  Hotel,
  CalendarDays,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./Home.css";

const destinations = [
  {
    name: "Goa",
    country: "India",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
  },
];

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleStartPlanning = () => {
    if (isAuthenticated) {
      navigate("/trips/create");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-navbar">
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo-icon">
            <Plane size={19} />
          </div>
          <span>
            Trip<span>AI</span>
          </span>
        </Link>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#destinations">Destinations</a>
          <Link to="/explore">Explore Stays</Link>
          {isAuthenticated && <Link to="/trips">My Trips</Link>}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button className="nav-start-btn" onClick={() => navigate("/dashboard")}>
                Dashboard <ArrowRight size={17} />
              </button>
              <button
                className="login-btn"
                onClick={logout}
                style={{ cursor: "pointer" }}
                title="Log out"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="nav-start-btn" onClick={() => navigate("/register")}>
                Start Planning <ArrowRight size={17} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-background-glow glow-one"></div>
        <div className="hero-background-glow glow-two"></div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="ai-badge">
              <Sparkles size={15} />
              AI-POWERED TRAVEL PLATFORM
            </div>

            <h1>
              Your journey.
              <br />
              <span>Designed by AI.</span>
            </h1>

            <p className="hero-description">
              Plan unforgettable trips in seconds. Tell us where you want
              to go, your interests, and your budget — our AI creates the
              perfect day-by-day itinerary and bookings for you.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn" onClick={handleStartPlanning}>
                Create My Trip
                <ArrowRight size={19} />
              </button>

              <button className="secondary-btn" onClick={() => navigate("/explore")}>
                <WandSparkles size={18} />
                Explore Stays & Tours
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <ShieldCheck size={17} />
                Smart planning
              </div>
              <div className="trust-item">
                <Sparkles size={17} />
                AI personalized
              </div>
              <div className="trust-item">
                <MapPin size={17} />
                Any destination
              </div>
            </div>
          </div>

          {/* HERO IMAGE CARD */}
          <div className="hero-visual">
            <div className="image-glow"></div>
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=90"
                alt="Beautiful travel destination"
              />
              <div className="image-overlay"></div>

              <div className="floating-location-card">
                <div className="location-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <span>AI Recommendation</span>
                  <strong>Amalfi Coast, Italy</strong>
                </div>
              </div>

              <div className="floating-trip-card">
                <div className="trip-card-icon">
                  <Sparkles size={17} />
                </div>
                <div>
                  <strong>Personalized Trip</strong>
                  <span>7 days • Balanced schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK SEARCH */}
        <div className="quick-planner">
          <div className="planner-title">
            <Sparkles size={19} />
            <div>
              <strong>Where should we take you?</strong>
              <span>Let AI build your next adventure.</span>
            </div>
          </div>

          <div
            className="planner-field"
            onClick={handleStartPlanning}
            style={{ cursor: "pointer" }}
          >
            <MapPin size={19} />
            <div>
              <small>Destination</small>
              <span>Any city, beach, or mountain</span>
            </div>
          </div>

          <div
            className="planner-field"
            onClick={handleStartPlanning}
            style={{ cursor: "pointer" }}
          >
            <CalendarDays size={19} />
            <div>
              <small>Travel dates</small>
              <span>Flexible or fixed dates</span>
            </div>
          </div>

          <div
            className="planner-field"
            onClick={handleStartPlanning}
            style={{ cursor: "pointer" }}
          >
            <Hotel size={19} />
            <div>
              <small>Travel style</small>
              <span>Luxury, adventure, or budget</span>
            </div>
          </div>

          <button className="planner-button" onClick={handleStartPlanning}>
            Plan with AI
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <div className="section-label">
            <Sparkles size={15} />
            TRAVEL, REIMAGINED
          </div>
          <h2>
            Everything you need.
            <br />
            <span>One intelligent platform.</span>
          </h2>
          <p>
            From discovering destinations to generating schedules and tracking documents,
            TripAI handles all logistics so you can savor the experience.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card large-card">
            <div className="feature-icon blue-icon">
              <Sparkles />
            </div>
            <h3>AI-Powered Itineraries</h3>
            <p>
              Generate personalized day-by-day travel plans based on
              your interests, budget, and travel style in seconds.
            </p>
            <div className="feature-decoration">
              <div className="mini-day">DAY 01</div>
              <div className="mini-line"></div>
              <div className="mini-place">Historic sights & Sunset harbor dinner</div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple-icon">
              <MapPin />
            </div>
            <h3>Interactive Co-pilot</h3>
            <p>
              Modify itineraries using natural conversation: "Add snorkeling on day 2", or "Remove museum".
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange-icon">
              <Hotel />
            </div>
            <h3>Hotels & Activities</h3>
            <p>
              Browse curated boutique accommodations and tours matched to your trip schedule.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green-icon">
              <ShieldCheck />
            </div>
            <h3>Document Processing</h3>
            <p>
              Securely store passports, visas, and flight tickets with AI data extraction.
            </p>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="destinations-section" id="destinations">
        <div className="destination-heading">
          <div>
            <div className="section-label">
              <MapPin size={15} />
              EXPLORE THE WORLD
            </div>
            <h2>
              Where will you
              <span> go next?</span>
            </h2>
          </div>

          <button className="outline-button" onClick={() => navigate("/explore")}>
            View all destinations
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="destination-grid">
          {destinations.map((destination) => (
            <div
              className="destination-card"
              key={destination.name}
              onClick={() =>
                navigate(`/trips/create?destination=${encodeURIComponent(destination.name)}`)
              }
              style={{ cursor: "pointer" }}
            >
              <img src={destination.image} alt={destination.name} />
              <div className="destination-overlay"></div>
              <div className="destination-info">
                <span>{destination.country}</span>
                <h3>{destination.name}</h3>
                <button>
                  Plan AI Trip
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="cta-glow"></div>
        <Sparkles className="cta-sparkle" size={30} />
        <h2>
          Your next adventure
          <br />
          <span>starts here.</span>
        </h2>
        <p>
          Stop spending days planning. Let TripAI craft your ideal itinerary in seconds.
        </p>

        <button className="cta-button" onClick={handleStartPlanning}>
          Create Your Trip
          <ArrowRight size={19} />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="logo-icon">
            <Plane size={17} />
          </div>
          <span>
            Trip<span>AI</span>
          </span>
        </div>
        <p>Intelligent travel operations platform for modern adventurers.</p>
        <span className="copyright">© 2026 TripAI. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default Home;
