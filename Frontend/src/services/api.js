import axios from "axios";

// Primary API Base URL (FastAPI)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tripai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/api/auth/login") && !url.includes("/api/auth/register")) {
        console.warn("Session expired or unauthorized. Clearing credentials.");
        localStorage.removeItem("tripai_token");
        localStorage.removeItem("tripai_user");
      }
    }
    return Promise.reject(error);
  }
);

// Safe helper to extract clean, friendly error messages from API responses
export const formatApiError = (error, fallbackMessage = "An error occurred.") => {
  if (!error) return fallbackMessage;

  // FastAPI detail field
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // Pydantic 422 validation errors: [{ msg, loc, type }]
      return detail.map((item) => item.msg || JSON.stringify(item)).join(". ");
    }
    return JSON.stringify(detail);
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Network / server connection error
  if (error.message === "Network Error" || error.code === "ERR_NETWORK" || !error.response) {
    return "Cannot connect to server. Please verify the backend is running on port 8000.";
  }

  return error.message || fallbackMessage;
};

// Auth endpoints
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

// Trips endpoints
export const tripAPI = {
  getAll: async () => {
    const response = await api.get("/api/trips");
    return response.data;
  },
  getById: async (tripId) => {
    const response = await api.get(`/api/trips/${tripId}`);
    return response.data;
  },
  create: async (tripData) => {
    const response = await api.post("/api/trips", tripData);
    return response.data;
  },
  delete: async (tripId) => {
    const response = await api.delete(`/api/trips/${tripId}`);
    return response.data;
  },
  getItinerary: async (tripId) => {
    const response = await api.get(`/api/trips/${tripId}/itinerary`);
    return response.data;
  },
  getFullItinerary: async (tripId) => {
    try {
      const response = await api.get(`/api/trips/${tripId}/full-itinerary`);
      return response.data;
    } catch {
      const response = await api.get(`/api/trips/${tripId}/itinerary`);
      return response.data.map((day) => ({ ...day, activities: [] }));
    }
  },
  createDay: async (tripId, dayData) => {
    const response = await api.post(`/api/trips/${tripId}/itinerary`, dayData);
    return response.data;
  },
  addActivityToDay: async (dayId, activityData) => {
    const response = await api.post(`/api/itinerary/${dayId}/activities`, activityData);
    return response.data;
  },
};

// AI endpoints
export const aiAPI = {
  generateItinerary: async (promptData) => {
    const response = await api.post("/api/ai/generate-itinerary", promptData);
    return response.data;
  },
  modifyItinerary: async (tripId, instruction) => {
    const response = await api.post("/api/ai/modify-itinerary", {
      trip_id: tripId,
      instruction,
    });
    return response.data;
  },
};

// Destinations endpoints
export const destinationAPI = {
  getAll: async () => {
    const response = await api.get("/api/destinations");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/destinations/${id}`);
    return response.data;
  },
  search: async (params) => {
    const response = await api.get("/api/destinations/search", { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/destinations", data);
    return response.data;
  },
};

// Hotels endpoints
export const hotelAPI = {
  getAll: async () => {
    const response = await api.get("/api/hotels");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/hotels/${id}`);
    return response.data;
  },
  search: async (params) => {
    const response = await api.get("/api/hotels/search", { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/hotels", data);
    return response.data;
  },
};

// Activities endpoints
export const activityAPI = {
  getAll: async () => {
    const response = await api.get("/api/activities");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/activities/${id}`);
    return response.data;
  },
  search: async (params) => {
    const response = await api.get("/api/activities/search", { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/activities", data);
    return response.data;
  },
};

// Bookings endpoints
export const bookingAPI = {
  getAll: async () => {
    const response = await api.get("/api/bookings");
    return response.data;
  },
  getByTrip: async (tripId) => {
    const response = await api.get(`/api/trips/${tripId}/bookings`);
    return response.data;
  },
  createForTrip: async (tripId, bookingData) => {
    const response = await api.post(`/api/trips/${tripId}/bookings`, bookingData);
    return response.data;
  },
  create: async (bookingData) => {
    const response = await api.post("/api/bookings", bookingData);
    return response.data;
  },
  updateStatus: async (bookingId, status) => {
    const response = await api.patch(`/api/bookings/${bookingId}/status?status=${status}`);
    return response.data;
  },
  confirm: async (bookingId) => {
    const response = await api.patch(`/api/bookings/${bookingId}/confirm`);
    return response.data;
  },
  cancel: async (bookingId) => {
    const response = await api.patch(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

// Documents endpoints
export const documentAPI = {
  upload: async (tripId, documentType, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/api/trips/${tripId}/documents?document_type=${documentType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  getByTrip: async (tripId) => {
    try {
      const response = await api.get(`/api/trips/${tripId}/documents`);
      return response.data;
    } catch {
      return [];
    }
  },
};

// Notifications endpoints
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get("/api/notifications");
    return response.data;
  },
  markRead: async (notificationId) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },
};

// Admin endpoints
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get("/api/admin/dashboard");
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
  },
  getTrips: async () => {
    const response = await api.get("/api/admin/trips");
    return response.data;
  },
  getBookings: async () => {
    const response = await api.get("/api/admin/bookings");
    return response.data;
  },
  getHotels: async () => {
    const response = await api.get("/api/admin/hotels");
    return response.data;
  },
  getActivities: async () => {
    const response = await api.get("/api/admin/activities");
    return response.data;
  },
};

export default api;
