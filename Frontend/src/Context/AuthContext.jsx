import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("tripai_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("tripai_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate or refresh user session on startup
  const checkAuth = useCallback(async () => {
    const currentToken = localStorage.getItem("tripai_token");
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUser(userData);
      localStorage.setItem("tripai_user", JSON.stringify(userData));
    } catch (err) {
      console.warn("Failed to verify user session:", err?.response?.data?.detail || err.message);
      // Only clear if 401 or invalid token
      if (err?.response?.status === 401) {
        localStorage.removeItem("tripai_token");
        localStorage.removeItem("tripai_user");
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login({
        email: email.trim(),
        password: password,
      });

      if (!data.access_token) {
        throw new Error("Missing access token in server response");
      }

      localStorage.setItem("tripai_token", data.access_token);
      localStorage.setItem("tripai_user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const data = await authAPI.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("tripai_token");
    localStorage.removeItem("tripai_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    register,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
