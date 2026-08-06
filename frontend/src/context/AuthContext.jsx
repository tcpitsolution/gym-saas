import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext();

function parseToken(token) {
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

const INACTIVITY_LIMIT = 60 * 1000; // 1 minute

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [features, setFeatures] = useState({});
  const payload = parseToken(token);
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setFeatures({});
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [logout]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Fetch features from /auth/me whenever token changes
  useEffect(() => {
    if (!token || payload.role === "superadmin") return;
    api.get("/auth/me").then((res) => setFeatures(res.data.features || {})).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, resetTimer]);

  return (
    <AuthContext.Provider value={{ token, login, logout, role: payload.role, userId: payload.userId, gymId: payload.gymId, ownerName: payload.ownerName, gymName: payload.gymName, features }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
