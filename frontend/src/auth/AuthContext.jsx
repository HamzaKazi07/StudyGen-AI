import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch, setCsrfToken } from "../lib/api";
import AuthContext from "./context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState("");
  const authVersion = useRef(0);

  const restoreSession = useCallback(async () => {
    const version = ++authVersion.current;
    setLoading(true);
    setRestoreError("");

    try {
      const response = await apiFetch("/api/auth/me", {
        notifyOnUnauthorized: false,
      });
      let data = null;
      if (response.status !== 401) {
        data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to restore your session.");
        }
      }
      if (authVersion.current === version) {
        setCsrfToken(data?.csrf_token || null);
        setUser(data?.user || null);
      }
    } catch {
      if (authVersion.current === version) {
        setCsrfToken(null);
        setUser(null);
        setRestoreError("Unable to verify your session. Check that the API is running.");
      }
    } finally {
      if (authVersion.current === version) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const clearSession = () => {
      authVersion.current += 1;
      setCsrfToken(null);
      setUser(null);
      setLoading(false);
      setRestoreError("");
    };

    window.addEventListener("studygen:unauthorized", clearSession);
    const version = ++authVersion.current;
    apiFetch("/api/auth/me", { notifyOnUnauthorized: false })
      .then(async (response) => {
        if (response.status === 401) {
          return null;
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to restore your session.");
        }
        return data;
      })
      .then((data) => {
        if (authVersion.current === version) {
          setCsrfToken(data?.csrf_token || null);
          setUser(data?.user || null);
          setRestoreError("");
        }
      })
      .catch(() => {
        if (authVersion.current === version) {
          setCsrfToken(null);
          setUser(null);
          setRestoreError("Unable to verify your session. Check that the API is running.");
        }
      })
      .finally(() => {
        if (authVersion.current === version) {
          setLoading(false);
        }
      });

    return () => {
      authVersion.current += 1;
      window.removeEventListener("studygen:unauthorized", clearSession);
    };
  }, [restoreSession]);

  const authenticate = useCallback(async (action, email, password) => {
    const version = ++authVersion.current;
    setLoading(true);
    setRestoreError("");
    try {
      const response = await apiFetch(`/api/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        notifyOnUnauthorized: false,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to authenticate.");
      }
      if (authVersion.current === version) {
        setCsrfToken(data.csrf_token);
        setUser(data.user);
      }
      return data.user;
    } finally {
      if (authVersion.current === version) {
        setLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    authVersion.current += 1;
    const response = await apiFetch("/api/auth/logout", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Unable to sign out.");
    }
    setCsrfToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      restoreError,
      authenticate,
      logout,
      restoreSession,
    }),
    [user, loading, restoreError, authenticate, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
