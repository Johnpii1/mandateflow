import { useEffect, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "../services/api";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./AuthContext";

const SESSION_TOKEN_KEY = "mandateflow_session_token";

interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

interface MeResponse {
  user: AuthUser;
}

function readSessionToken(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearStoredToken(): void {
  try {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Continue clearing in-memory auth if browser storage is unavailable.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readSessionToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>(() =>
    readSessionToken() ? "loading" : "anonymous",
  );
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiRequest<MeResponse>("/api/v1/auth/me", { token })
      .then(({ user: currentUser }) => {
        if (cancelled) return;
        setUser(currentUser);
        setStatus("authenticated");
        setSessionError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearStoredToken();
          setToken(null);
          setUser(null);
          setStatus("anonymous");
          return;
        }
        setSessionError(
          error instanceof Error
            ? error.message
            : "Unable to validate your session.",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email: string, password: string): Promise<void> => {
    setStatus("loading");
    setSessionError(null);
    try {
      const response = await apiRequest<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: { email, password },
      });
      try {
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, response.token);
      } catch {
        // The token still works for this page session if storage is blocked.
      }
      setToken(response.token);
      setUser(response.user);
      setStatus("authenticated");
    } catch (error) {
      setStatus(token ? "authenticated" : "anonymous");
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> => {
    setStatus("loading");
    setSessionError(null);
    try {
      const response = await apiRequest<LoginResponse>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: { email, password, displayName },
        },
      );
      try {
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, response.token);
      } catch {
        // Keep the session available in memory when browser storage is blocked.
      }
      setToken(response.token);
      setUser(response.user);
      setStatus("authenticated");
    } catch (error) {
      setStatus(token ? "authenticated" : "anonymous");
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    const currentToken = token;
    try {
      if (currentToken) {
        await apiRequest<void>("/api/v1/auth/logout", {
          method: "POST",
          token: currentToken,
        });
      }
    } finally {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setStatus("anonymous");
      setSessionError(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) {
      setStatus("anonymous");
      return;
    }
    setStatus("loading");
    try {
      const response = await apiRequest<MeResponse>("/api/v1/auth/me", {
        token,
      });
      setUser(response.user);
      setStatus("authenticated");
      setSessionError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setStatus("anonymous");
        setSessionError(null);
        return;
      }
      setSessionError(
        error instanceof Error
          ? error.message
          : "Unable to validate your session.",
      );
      setStatus("error");
    }
  };

  const updateProfile = async (
    updates: Partial<{
      email: string;
      displayName: string;
      role: "user" | "admin";
    }>,
  ): Promise<void> => {
    if (!token) {
      setStatus("anonymous");
      return;
    }
    setStatus("loading");
    try {
      await apiRequest<void>("/api/v1/users/me", {
        method: "PATCH",
        token,
        body: updates,
      });
      const refreshed = await apiRequest<MeResponse>("/api/v1/auth/me", {
        token,
      });
      setUser(refreshed.user);
      setStatus("authenticated");
      setSessionError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setStatus("anonymous");
        setSessionError(null);
        return;
      }
      setSessionError(
        error instanceof Error ? error.message : "Unable to update profile",
      );
      setStatus("error");
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    status,
    sessionError,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
