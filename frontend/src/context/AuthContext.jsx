import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildBasicAuthHeader, setUnauthorizedHandler } from "../services/apiClient";
import { login as loginRequest, register as registerRequest } from "../services/authService";

const STORAGE_KEY = "pillie_auth";
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null);
      setSessionExpiredNotice(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (email, password) => {
    const result = await loginRequest({ email, password });
    const authHeader = buildBasicAuthHeader(email, password);
    setSession({ email: result.email, name: result.name, authHeader });
    setSessionExpiredNotice(false);
    return result;
  };

  const register = async (payload) => {
    const result = await registerRequest(payload);
    const authHeader = buildBasicAuthHeader(payload.email, payload.password);
    setSession({ email: result.email, name: result.name, authHeader });
    setSessionExpiredNotice(false);
    return result;
  };

  const logout = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      user: session ? { email: session.email, name: session.name } : null,
      authHeader: session?.authHeader,
      sessionExpiredNotice,
      clearSessionExpiredNotice: () => setSessionExpiredNotice(false),
      login,
      register,
      logout,
    }),
    [session, sessionExpiredNotice]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
