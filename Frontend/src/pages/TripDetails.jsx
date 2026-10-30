import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Sparkles,
  Plus,
  FileText,
  Hotel,
  Upload,
  Send,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  tripAPI,
  aiAPI,
  bookingAPI,
  documentAPI,
  activityAPI,
} from "../services/api";

export default function TripDetails() {
  const { id } = useParams();
  const tripId = Number(id);
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("itinerary"); // 'itinerary' | 'ai' | 'bookings' | 'documents'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI Modification assistant state
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiModifying, setAiModifying] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Travel Co-pilot. Tell me what changes you'd like to make — for example: 'Add an evening river cruise on Day 2' or 'Remove museum visit from Day 1'.",
    },
  ]);

  // Modals state
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    price: 30,
    duration_hours: 2,
    start_time: "10:00 AM",
    end_time: "12:00 PM",
    notes: "",
  });

  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDay, setNewDay] = useState({
    day_number: 1,
    title: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    booking_type: "hotel",
    reference_id: 1,
    booking_date: new Date().toISOString().split("T")[0],
    amount: 150,
  });

  // Document upload state
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState("flight_ticket");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Booking-specific document upload state
  const [uploadModalBooking, setUploadModalBooking] = useState(null);
  const [bookingDocFile, setBookingDocFile] = useState(null);
  const [uploadingBookingDoc, setUploadingBookingDoc] = useState(false);

  // Accordion state for itinerary days
  const [expandedDays, setExpandedDays] = useState({});

  const loadAllTripData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tripData, fullItinerary, bookingsData, docsData] = await Promise.all([
        tripAPI.getById(tripId),
        tripAPI.getFullItinerary(tripId),
        bookingAPI.getByTrip(tripId).catch(() => []),
        documentAPI.getByTrip(tripId).catch(() => []),
      ]);

      setTrip(tripData);
      setItinerary(fullItinerary || []);
      setBookings(bookingsData || []);
      setDocuments(docsData || []);

      // Expand all days by default
      const exp = {};
      (fullItinerary || []).forEach((d) => {
        exp[d.id] = true;
      });
      setExpandedDays(exp);

      // Pre-set next day number
      const nextDayNum = (fullItinerary || []).length + 1;
      setNewDay((prev) => ({ ...prev, day_number: nextDayNum }));
    } catch (err) {
      console.error("Failed to load trip:", err);
      setError("Unable to load trip details. The trip may not exist.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadAllTripData();
  }, [loadAllTripData]);

  const toggleDayExpand = (dayId) => {
    setExpandedDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // AI Modify Handler
  const handleAiModify = async (e) => {
    e.preventDefault();
    if (!aiInstruction.trim() || aiModifying) return;

    const userPrompt = aiInstruction.trim();
    setAiInstruction("");
    setAiModifying(true);

    setAiMessages((prev) => [...prev, { sender: "user", text: userPrompt }]);

    try {
      const result = await aiAPI.modifyItinerary(tripId, userPrompt);

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            result.message ||
            `Successfully applied modification (${result.action || "updated"}) to Day ${result.day || ""}.`,
        },
      ]);

      // Refresh itinerary live
      const freshItinerary = await tripAPI.getFullItinerary(tripId);
      setItinerary(freshItinerary || []);
    } catch (err) {
      console.error("AI Modify error:", err);
      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            err.response?.data?.detail ||
            "Sorry, I couldn't process that modification. Please try phrasing it like: 'Add visit to Eiffel Tower on day 2'.",
        },
      ]);
    } finally {
      setAiModifying(false);
    }
  };

  // Add Activity Handler
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedDayId || !newActivity.name.trim()) return;

    try {
      // 1. Create activity in database
      const createdActivity = await activityAPI.create({
        name: newActivity.name.trim(),
        location: trip.destination,
        description: newActivity.description.trim() || newActivity.name,
        price: Number(newActivity.price),
        duration_hours: Number(newActivity.duration_hours),
        image_url: null,
      });

      // 2. Link activity to itinerary day
      await tripAPI.addActivityToDay(selectedDayId, {
        activity_id: createdActivity.id,
        start_time: newActivity.start_time,
        end_time: newActivity.end_time,
        notes: newActivity.notes || newActivity.description,
      });

      setShowAddActivityModal(false);
      setNewActivity({
        name: "",
        description: "",
        price: 30,
        duration_hours: 2,
        start_time: "10:00 AM",
        end_time: "12:00 PM",
        notes: "",
      });

      // Refresh itinerary
      const freshItinerary = await tripAPI.getFullItinerary(tripId);
      setItinerary(freshItinerary || []);
    } catch (err) {
      console.error("Add activity error:", err);
      alert("Failed to add activity.");
    }
  };

  // Add Day Handler
  const handleAddDay = async (e) => {
    e.preventDefault();
    try {
      await tripAPI.createDay(tripId, {
        day_number: Number(newDay.day_number),
        date: newDay.date,
        title: newDay.title.trim() || `Day ${newDay.day_number}`,
        notes: newDay.notes.trim() || null,
      });

      setShowAddDayModal(false);
      setNewDay({
        day_number: itinerary.length + 2,
        title: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });

      const freshItinerary = await tripAPI.getFullItinerary(tripId);
      setItinerary(freshItinerary || []);
    } catch (err) {
      console.error("Add day error:", err);
      alert("Failed to add day.");
    }
  };

  // Document Upload Handler
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile) {
      alert("Please select a file to upload.");
      return;
    }

    setUploadingDoc(true);
    try {
      const res = await documentAPI.upload(tripId, docType, docFile);
      alert(res.message || "Document uploaded successfully!");
      setDocFile(null);

      // Refresh documents
      const docs = await documentAPI.getByTrip(tripId);
      setDocuments(docs || []);
    } catch (err) {
      console.error("Doc upload error:", err);
      alert("Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Booking Create Handler
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.createForTrip(tripId, {
        booking_type: newBooking.booking_type,
        reference_id: Number(newBooking.reference_id),
        booking_date: newBooking.booking_date,
        amount: Number(newBooking.amount),
      });

      setShowAddBookingModal(false);
      const bList = await bookingAPI.getByTrip(tripId);
      setBookings(bList || []);
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.detail || "Failed to create booking.");
    }
  };

  // Booking Status Handler
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  // Upload Voucher & Confirm Booking Handler
  const handleUploadBookingDoc = async (e) => {
    e.preventDefault();
    if (!bookingDocFile || !uploadModalBooking) {
      alert("Please select a file to upload.");
      return;
    }

    setUploadingBookingDoc(true);
    try {
      const docType =
        uploadModalBooking.booking_type === "hotel"
          ? "hotel_confirmation"
          : "flight_ticket";

      await documentAPI.upload(tripId, docType, bookingDocFile);
      await bookingAPI.updateStatus(uploadModalBooking.id, "confirmed");

      alert("Voucher uploaded and reservation confirmed successfully!");
      setUploadModalBooking(null);
      setBookingDocFile(null);
      loadAllTripData();
    } catch (err) {
      console.error("Booking doc upload error:", err);
      alert("Failed to upload voucher.");
    } finally {
      setUploadingBookingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={32} className="spin-slow" color="#5b4df7" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div style={{ flex: 1, padding: "40px", textAlign: "center" }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 16px" }} />
          <h2>Trip Not Found</h2>
          <p style={{ color: "#6b7280" }}>{error}</p>
          <button
            onClick={() => navigate("/trips")}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#5b4df7",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        <Navbar isAppView={true} pageTitle={trip.title} />

        <main style={{ padding: "32px 36px", maxWidth: "1140px", margin: "0 auto", width: "100%" }}>
          {/* Back Button */}
          <button
            onClick={() => navigate("/trips")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "18px",
            }}
          >
            <ArrowLeft size={16} /> Back to My Trips
          </button>

          {/* TRIP HERO BANNER */}
          <section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #e9eaf0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6366f1", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
                  <MapPin size={17} />
                  <span>{trip.destination}</span>
                </div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 12px 0" }}>
                  {trip.title}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "14px", color: "#4b5563" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={16} color="#9ca3af" />
                    <span>
                      {trip.start_date} to {trip.end_date}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Wallet size={16} color="#9ca3af" />
                    <span>Budget: ${Number(trip.budget || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={16} color="#9ca3af" />
                    <span>{itinerary.length} Itinerary Days</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    backgroundColor: "#f5f3ff",
                    color: "#6366f1",
                    border: "1px solid #ddd6fe",
                    textTransform: "capitalize",
                  }}
                >
                  {trip.status || "Planning"}
                </span>

                <button
                  onClick={() => setShowAddDayModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} />
                  Add Day
                </button>
              </div>
            </div>
          </section>

          {/* NAVIGATION TABS */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: "28px",
            }}
          >
            {[
              { id: "itinerary", label: "Day-by-Day Itinerary", count: itinerary.length },
              { id: "ai", label: "AI Co-pilot Assistant", icon: Sparkles },
              { id: "bookings", label: "Bookings", count: bookings.length },
              { id: "documents", label: "Travel Documents", count: documents.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderBottom: `3px solid ${isActive ? "#5b4df7" : "transparent"}`,
                    backgroundColor: "transparent",
                    color: isActive ? "#5b4df7" : "#6b7280",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {Icon && <Icon size={16} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: "10px",
                        backgroundColor: isActive ? "#f5f3ff" : "#f3f4f6",
                        color: isActive ? "#5b4df7" : "#6b7280",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ITINERARY DAY-BY-DAY */}
          {activeTab === "itinerary" && (
            <div>
              {itinerary.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "48px 24px",
                    textAlign: "center",
                    border: "1px dashed #d1d5db",
                  }}
                >
                  <Sparkles size={36} color="#6366f1" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>
                    No itinerary days yet
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>
                    Generate full activities with AI or add days manually.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button
                      onClick={() => setActiveTab("ai")}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Use AI Assistant
                    </button>
                    <button
                      onClick={() => setShowAddDayModal(true)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Add Day 1
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {itinerary.map((day) => {
                    const isExpanded = expandedDays[day.id];
                    const acts = day.activities || [];

                    return (
                      <div
                        key={day.id}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "16px",
                          border: "1px solid #e9eaf0",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Day Header Bar */}
                        <div
                          onClick={() => toggleDayExpand(day.id)}
                          style={{
                            padding: "18px 24px",
                            backgroundColor: isExpanded ? "#fbfbfe" : "#ffffff",
                            borderBottom: isExpanded ? "1px solid #e9eaf0" : "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#5b4df7",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "15px",
                              }}
                            >
                              D{day.day_number}
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                                {day.title}
                              </h3>
                              <span style={{ fontSize: "13px", color: "#6b7280" }}>{day.date}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>
                              {acts.length} {acts.length === 1 ? "activity" : "activities"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDayId(day.id);
                                setShowAddActivityModal(true);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid #ddd6fe",
                                backgroundColor: "#f5f3ff",
                                color: "#5b4df7",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={14} /> Add Activity
                            </button>
                            {isExpanded ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                          </div>
                        </div>

                        {/* Activities List */}
                        {isExpanded && (
                          <div style={{ padding: "20px 24px" }}>
                            {day.notes && (
                              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
                                Note: {day.notes}
                              </p>
                            )}

                            {acts.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af", fontSize: "13px" }}>
                                No activities listed for this day. Click "+ Add Activity" or ask the AI Co-pilot to add one!
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {acts.map((act) => (
                                  <div
                                    key={act.id || act.activity_id}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      padding: "16px",
                                      borderRadius: "12px",
                                      border: "1px solid #f3f4f6",
                                      backgroundColor: "#fafafa",
                                    }}
                                  >
                                    <div>
                                      <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>
                                        {act.name}
                                      </h4>
                                      <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.4 }}>
                                        {act.notes || act.description}
                                      </p>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", minWidth: "120px" }}>
                                      {act.price !== undefined && (
                                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#059669" }}>
                                          ${act.price}
                                        </span>
                                      )}
                                      <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#6b7280" }}>
                                        {act.duration_hours && (
                                          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                            <Clock size={12} /> {act.duration_hours}h
                                          </span>
                                        )}
                                        {act.start_time && <span>{act.start_time}</span>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI CO-PILOT ASSISTANT */}
          {activeTab === "ai" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "28px",
                border: "1px solid #e9eaf0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#5b4df7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    AI Itinerary Assistant
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    Prompt modifications to dynamically update days, activities, and timings.
                  </p>
                </div>
              </div>

              {/* Chat history */}
              <div
                style={{
                  minHeight: "260px",
                  maxHeight: "420px",
                  overflowY: "auto",
                  backgroundColor: "#f9fafb",
                  borderRadius: "14px",
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                {aiMessages.map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        backgroundColor: isUser ? "#5b4df7" : "#ffffff",
                        color: isUser ? "#ffffff" : "#1f2937",
                        padding: "12px 18px",
                        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        border: isUser ? "none" : "1px solid #e5e7eb",
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                })}

                {aiModifying && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#ffffff",
                      color: "#6b7280",
                      padding: "12px 18px",
                      borderRadius: "16px 16px 16px 4px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Sparkles size={16} className="spin-slow" color="#5b4df7" />
                    TripAI is updating your itinerary...
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAiModify} style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="e.g. Add wine tasting tour on day 3, or remove scuba diving from day 1..."
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  disabled={aiModifying}
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={aiModifying || !aiInstruction.trim()}
                  style={{
                    padding: "14px 22px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: aiModifying || !aiInstruction.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === "bookings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    Trip Bookings
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                    Accommodations and activities booked for this travel plan
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBookingModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} /> New Booking
                </button>
              </div>

              {/* Informative Guidance Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                <FileText size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Tip for Confirmation:</strong> You can click <strong>"Upload Voucher to Confirm"</strong> on any pending reservation below to upload your booking PDF or hotel voucher. It will be analyzed by AI and archived under the <strong>Travel Documents</strong> tab!
                </span>
              </div>

              {bookings.length === 0 ? (
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px 24px", textAlign: "center", border: "1px dashed #d1d5db" }}>
                  <Hotel size={36} color="#6366f1" style={{ margin: "0 auto 12px" }} />
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700 }}>No bookings made yet</h4>
                  <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>
                    Book hotels and activities to keep all reservations organized.
                  </p>
                  <button
                    onClick={() => setShowAddBookingModal(true)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #5b4df7", backgroundColor: "#f5f3ff", color: "#5b4df7", fontWeight: 600, cursor: "pointer" }}
                  >
                    Add First Booking
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "18px 24px",
                        border: "1px solid #e9eaf0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            backgroundColor: b.booking_type === "hotel" ? "#eff6ff" : "#f5f3ff",
                            color: b.booking_type === "hotel" ? "#2563eb" : "#7c3aed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Hotel size={20} />
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>
                            {b.booking_type} Reservation #{b.reference_id}
                          </h4>
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            Date: {b.booking_date} • Amount: ${b.amount}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor:
                              b.status === "confirmed" ? "#ecfdf5" : b.status === "cancelled" ? "#fef2f2" : "#fefce8",
                            color:
                              b.status === "confirmed" ? "#059669" : b.status === "cancelled" ? "#dc2626" : "#d97706",
                            textTransform: "capitalize",
                          }}
                        >
                          {b.status}
                        </span>

                        {b.status === "pending" && (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button
                              onClick={() => setUploadModalBooking(b)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid #c7d2fe",
                                backgroundColor: "#eef2ff",
                                color: "#4f46e5",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              title="Upload confirmation voucher PDF or screenshot"
                            >
                              <Upload size={13} />
                              Upload Voucher to Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #10b981", backgroundColor: "#ecfdf5", color: "#059669", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, "cancelled")}
                              style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #ef4444", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRAVEL DOCUMENTS */}
          {activeTab === "documents" && (
            <div>
              {/* Upload Card */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #e9eaf0",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                  Upload Travel Document
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>
                  Upload flight tickets, hotel reservations, passports, or visas for AI text extraction & verification.
                </p>

                <form onSubmit={handleDocumentUpload} style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="flight_ticket">Flight Ticket</option>
                    <option value="hotel_confirmation">Hotel Confirmation</option>
                    <option value="passport">Passport</option>
                    <option value="visa">Visa Document</option>
                  </select>

                  <input
                    type="file"
                    required
                    onChange={(e) => setDocFile(e.target.files[0])}
                    style={{ fontSize: "14px" }}
                  />

                  <button
                    type="submit"
                    disabled={uploadingDoc || !docFile}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #5b4df7, #8c6cff)",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: uploadingDoc || !docFile ? "not-allowed" : "pointer",
                    }}
                  >
                    <Upload size={16} />
                    {uploadingDoc ? "Processing Document..." : "Upload Document"}
                  </button>
                </form>
              </div>

              {/* Documents List */}
              <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                Uploaded Documents ({documents.length})
              </h3>

              {documents.length === 0 ? (
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px 24px", textAlign: "center", border: "1px dashed #d1d5db" }}>
                  <FileText size={36} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    No travel documents uploaded for this trip yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        border: "1px solid #e9eaf0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <FileText size={22} color="#5b4df7" />
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                            {doc.file_name}
                          </h4>
                          <span style={{ fontSize: "12px", color: "#6b7280", textTransform: "capitalize" }}>
                            Type: {doc.document_type.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: doc.status === "processed" ? "#ecfdf5" : "#fefce8",
                            color: doc.status === "processed" ? "#059669" : "#d97706",
                            textTransform: "capitalize",
                          }}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODAL: ADD ACTIVITY */}
          {showAddActivityModal && (
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
                  maxWidth: "500px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700 }}>
                  Add Activity to Day
                </h3>
                <form onSubmit={handleAddActivity}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Activity Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scuba diving, Museum tour, Sunset dinner"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Description & Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Details about the activity..."
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newActivity.price}
                        onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        Duration (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={newActivity.duration_hours}
                        onChange={(e) => setNewActivity({ ...newActivity, duration_hours: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        Start Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={newActivity.start_time}
                        onChange={(e) => setNewActivity({ ...newActivity, start_time: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        End Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1:00 PM"
                        value={newActivity.end_time}
                        onChange={(e) => setNewActivity({ ...newActivity, end_time: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddActivityModal(false)}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#5b4df7", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Add Activity
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: ADD DAY */}
          {showAddDayModal && (
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
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700 }}>
                  Add Itinerary Day
                </h3>
                <form onSubmit={handleAddDay}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Day Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newDay.day_number}
                      onChange={(e) => setNewDay({ ...newDay, day_number: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDay.date}
                      onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Day Title / Focus
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coastal Exploration & Sunset Cocktails"
                      value={newDay.title}
                      onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="General tips or schedule notes..."
                      value={newDay.notes}
                      onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddDayModal(false)}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#5b4df7", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Add Day
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: ADD BOOKING */}
          {showAddBookingModal && (
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
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700 }}>
                  Create Booking for Trip
                </h3>
                <form onSubmit={handleCreateBooking}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Booking Type
                    </label>
                    <select
                      value={newBooking.booking_type}
                      onChange={(e) => setNewBooking({ ...newBooking, booking_type: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    >
                      <option value="hotel">Hotel</option>
                      <option value="activity">Activity</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Reference ID (Hotel/Activity ID)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newBooking.reference_id}
                      onChange={(e) => setNewBooking({ ...newBooking, reference_id: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Booking Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newBooking.booking_date}
                      onChange={(e) => setNewBooking({ ...newBooking, booking_date: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      Total Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newBooking.amount}
                      onChange={(e) => setNewBooking({ ...newBooking, amount: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddBookingModal(false)}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#5b4df7", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                    >
                      Save Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: UPLOAD VOUCHER & CONFIRM BOOKING */}
          {uploadModalBooking && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 110,
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "28px",
                  width: "100%",
                  maxWidth: "480px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                      Upload Booking Confirmation
                    </h3>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Reservation #{uploadModalBooking.id} • {uploadModalBooking.booking_type}
                    </span>
                  </div>
                </div>

                <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#4b5563", lineHeight: 1.5 }}>
                  Select your hotel receipt, e-ticket PDF, or booking confirmation screenshot. Our AI will automatically extract reference numbers, guest details, and pricing, and confirm this booking.
                </p>

                <form onSubmit={handleUploadBookingDoc}>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                      Select Confirmation File (PDF, PNG, JPG)
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setBookingDocFile(e.target.files[0])}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px dashed #c7d2fe",
                        backgroundColor: "#fbfbfe",
                        boxSizing: "border-box",
                        fontSize: "13px"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={uploadingBookingDoc}
                      onClick={() => {
                        setUploadModalBooking(null);
                        setBookingDocFile(null);
                      }}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingBookingDoc || !bookingDocFile}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#5b4df7",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: uploadingBookingDoc || !bookingDocFile ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Upload size={15} />
                      {uploadingBookingDoc ? "Uploading & Confirming..." : "Upload & Confirm"}
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
