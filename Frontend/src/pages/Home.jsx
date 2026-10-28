import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          AI<span>TRAVEL</span>
        </div>

        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#planner">AI Planner</a>
          <a href="#trips">My Trips</a>
        </div>

        <button className="nav-button">
          Start Planning
          <ArrowUpRight size={17} />
        </button>

      </nav>


      {/* HERO */}
      <main className="hero">

        <div className="hero-small">
          <Sparkles size={16} />
          AI-POWERED TRAVEL PLANNING
        </div>

        <h1>
          TRAVEL
          <br />

          <span>WITHOUT</span>

          <br />

          <i>THE GUESSWORK.</i>
        </h1>

        <div className="hero-bottom">

          <p>
            Tell us where you want to go.
            <br />
            We'll build the journey around you.
          </p>

          <button className="hero-button">
            Plan my trip
            <ArrowUpRight size={20} />
          </button>

        </div>

      </main>


      {/* IMAGE SECTION */}
      <section className="hero-image">

        <div className="image-overlay">

          <div>
            <MapPin size={18} />
            Goa, India
          </div>

          <span>
            Explore differently →
          </span>

        </div>

      </section>


      {/* AI PLANNER */}
      <section className="planner" id="planner">

        <div className="section-label">
          01 / AI TRIP PLANNER
        </div>

        <div className="planner-content">

          <h2>
            YOUR TRIP.
            <br />
            <i>YOUR WAY.</i>
          </h2>

          <div className="planner-card">

            <Sparkles size={22} />

            <h3>
              Where should we take you?
            </h3>

            <p>
              Tell our AI about your destination,
              budget, interests and travel style.
            </p>

            <button>
              Create AI itinerary
              <ArrowUpRight size={18} />
            </button>

          </div>

        </div>

      </section>


      {/* EXPLORE */}
      <section className="explore" id="explore">

        <div className="section-label">
          02 / EXPLORE
        </div>

        <h2>
          PLACES WORTH
          <br />
          <i>GETTING LOST IN.</i>
        </h2>

        <div className="destination-grid">

          <div className="destination-card goa">
            <span>01</span>
            <h3>GOA</h3>
            <p>India</p>
          </div>

          <div className="destination-card bali">
            <span>02</span>
            <h3>BALI</h3>
            <p>Indonesia</p>
          </div>

          <div className="destination-card kyoto">
            <span>03</span>
            <h3>KYOTO</h3>
            <p>Japan</p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;