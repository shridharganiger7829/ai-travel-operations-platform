import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Hotel,
  Compass,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DestinationCard from "../components/DestinationCard";
import {
  destinationAPI,
  hotelAPI,
  activityAPI,
  tripAPI,
  bookingAPI,
} from "../services/api";

export default function Explore() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("destinations"); // 'destinations' | 'hotels' | 'activities'
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search queries
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingItem, setBookingItem] = useState(null); // { type, item }
  const [selectedTripId, setSelectedTripId] = useState("");
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadTabData(activeTab);
    loadUserTrips();
  }, [activeTab]);

  const loadUserTrips = async () => {
    try {
      const trips = await tripAPI.getAll();
      setUserTrips(trips || []);
      if (trips && trips.length > 0) {
        setSelectedTripId(trips[0].id);
      }
    } catch {}
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "destinations") {
        const data = await destinationAPI.getAll();
        setDestinations(data || []);
      } else if (tab === "hotels") {
        const data = await hotelAPI.getAll();
        setHotels(data || []);
      } else if (tab === "activities") {
        const data = await activityAPI.getAll();
        setActivities(data || []);
      }
    } catch (err) {
      console.error("Error loading explore data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (activeTab === "destinations") {
        const data = await destinationAPI.search({ name: query });
        setDestinations(data || []);
      } else if (activeTab === "hotels") {
        const params = { location: query || "a" };
        if (maxPrice) params.max_price = Number(maxPrice);
        if (minRating) params.min_rating = Number(minRating);
        const data = await hotelAPI.search(params);
        setHotels(data || []);
      } else if (activeTab === "activities") {
        const params = { location: query || "a" };
        if (maxPrice) params.max_price = Number(maxPrice);
        const data = await activityAPI.search(params);
        setActivities(data || []);
      }
    } catch (err) {
      console.error(err);
      loadTabData(activeTab);
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (item, type) => {
    setBookingItem({ item, type });
    setShowBookModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      alert("Please select a trip to associate this booking with, or create a trip first.");
      return;
    }

    try {
      const amount =
        bookingItem.type === "hotel"
          ? bookingItem.item.price_per_night
          : bookingItem.item.price;

      await bookingAPI.createForTrip(selectedTripId, {
        booking_type: bookingItem.type,
        reference_id: bookingItem.item.id,
        booking_date: bookingDate,
        amount: Number(amount),
      });

      alert("Booking reserved successfully!");
      setShowBookModal(false);
      navigate(`/trips/${selectedTripId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Booking failed.");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle="Explore & Book" />

        <main style={{ padding: "32px 36px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
              Explore Worldwide Travel
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Search verified destinations, curated boutique hotels, and popular local activities.
            </p>
          </div>

          {/* Navigation Category Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#e5e7eb",
              padding: "4px",
              borderRadius: "12px",
              marginBottom: "24px",
              width: "fit-content",
            }}
          >
            {[
              { id: "destinations", label: "Destinations", icon: MapPin },
              { id: "hotels", label: "Hotels & Stays", icon: Hotel },
              { id: "activities", label: "Activities & Tours", icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#5b4df7" : "#4b5563",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "32px",
              flexWrap: "wrap",
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid #e9eaf0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <Search
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
              />
              <input
                type="text"
                placeholder={
                  activeTab === "destinations"
                    ? "Search destinations by name or country..."
                    : activeTab === "hotels"
                    ? "Search hotels by city / location..."
                    : "Search activities by location..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 42px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {activeTab === "hotels" && (
              <>
                <input
                  type="number"
                  placeholder="Max $/night"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: "120px", padding: "11px 12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px" }}
                />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  style={{ padding: "11px 12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px" }}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </>
            )}

            {activeTab === "activities" && (
              <input
                type="number"
                placeholder="Max price ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: "130px", padding: "11px 12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px" }}
              />
            )}

            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>

          {/* RESULTS CONTENT */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Sparkles size={28} className="spin-slow" color="#5b4df7" />
              <p style={{ marginTop: "12px", color: "#6b7280" }}>Loading results...</p>
            </div>
          ) : (
            <div>
              {/* DESTINATIONS TAB */}
              {activeTab === "destinations" && (
                destinations.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>No destinations found.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {destinations.map((dest) => (
                      <DestinationCard key={dest.id} destination={dest} />
                    ))}
                  </div>
                )
              )}

              {/* HOTELS TAB */}
              {activeTab === "hotels" && (
                hotels.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>No hotels found for this query.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {hotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid #e9eaf0",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ height: "160px", backgroundColor: "#e0e7ff", position: "relative" }}>
                          <img
                            src={
                              hotel.image_url ||
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={hotel.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              backgroundColor: "rgba(17,24,39,0.8)",
                              backdropFilter: "blur(4px)",
                              color: "#fbbf24",
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Star size={13} fill="#fbbf24" /> {hotel.rating || 4.5}
                          </div>
                        </div>

                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6366f1", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                              <MapPin size={13} /> {hotel.location}
                            </div>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                              {hotel.name}
                            </h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.4 }}>
                              {hotel.description}
                            </p>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" }}>
                            <div>
                              <span style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                                ${hotel.price_per_night}
                              </span>
                              <span style={{ fontSize: "12px", color: "#6b7280" }}> / night</span>
                            </div>

                            <button
                              onClick={() => openBookingModal(hotel, "hotel")}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Book Stay
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ACTIVITIES TAB */}
              {activeTab === "activities" && (
                activities.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>No activities found.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid #e9eaf0",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ padding: "22px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6366f1", fontSize: "12px", fontWeight: 700 }}>
                                <MapPin size={13} /> {act.location}
                              </div>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "3px 8px", borderRadius: "6px" }}>
                                <Clock size={12} /> {act.duration_hours}h
                              </span>
                            </div>

                            <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                              {act.name}
                            </h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.4 }}>
                              {act.description}
                            </p>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" }}>
                            <div>
                              <span style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                                ${act.price}
                              </span>
                              <span style={{ fontSize: "12px", color: "#6b7280" }}> / person</span>
                            </div>

                            <button
                              onClick={() => openBookingModal(act, "activity")}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#f5f3ff",
                                color: "#5b4df7",
                                border: "1px solid #ddd6fe",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Book Activity
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* BOOKING MODAL */}
          {showBookModal && bookingItem && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "28px",
                  width: "100%",
                  maxWidth: "460px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>
                  Book {bookingItem.item.name}
                </h3>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6b7280" }}>
                  Select the trip you want to attach this booking to.
                </p>

                <form onSubmit={handleConfirmBooking}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Select Trip
                    </label>
                    {userTrips.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#ef4444" }}>
                        You don't have any trips yet. Please create a trip first!
                      </p>
                    ) : (
                      <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      >
                        {userTrips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.destination})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Booking Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "24px", padding: "14px", backgroundColor: "#f9fafb", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span>Estimated Price:</span>
                      <strong>
                        $
                        {bookingItem.type === "hotel"
                          ? bookingItem.item.price_per_night
                          : bookingItem.item.price}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowBookModal(false)}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={userTrips.length === 0}
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#5b4df7", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Confirm Reservation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
