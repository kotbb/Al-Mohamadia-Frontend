"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession as persistSession,
} from "./auth-storage";
import { isSuperAdmin as checkIsSuperAdmin } from "./roles";
import type { AuthStatus, AuthTokens, AuthUser } from "./types";
import { loginRequest, logoutRequest } from "@/app/modules/auth/services/auth.service";
import { fetchMe } from "@/app/modules/auth/services/users.service";
import { ApiError } from "@/lib/api/types";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applySession = useCallback((tokens: AuthTokens) => {
    persistSession(tokens);
    setUser(tokens.user);
    setStatus("authenticated");
  }, []);

  const clearLocalSession = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const storedUser = getStoredUser();
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!refreshToken && !accessToken) {
        if (!cancelled) {
          clearLocalSession();
        }
        return;
      }

      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const me = await fetchMe();
        if (cancelled) return;
        const latestAccess = getAccessToken() ?? accessToken;
        const latestRefresh = getRefreshToken() ?? refreshToken;
        setUser(me);
        if (latestAccess && latestRefresh) {
          persistSession({
            accessToken: latestAccess,
            refreshToken: latestRefresh,
            user: me,
          });
        }
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          clearLocalSession();
          return;
        }
        if (storedUser && (accessToken || refreshToken)) {
          setUser(storedUser);
          setStatus("authenticated");
          return;
        }
        clearLocalSession();
      }
    }

    void hydrate();

    function onSessionEvent(event: Event) {
      const detail = (event as CustomEvent<AuthTokens>).detail;
      if (detail?.user) {
        setUser(detail.user);
        setStatus("authenticated");
      }
    }

    window.addEventListener("al-mohamadia-auth-session", onSessionEvent);
    return () => {
      cancelled = true;
      window.removeEventListener("al-mohamadia-auth-session", onSessionEvent);
    };
  }, [clearLocalSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await loginRequest(username, password);
      applySession(tokens);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch {
      // Always clear local session even if logout API fails
    } finally {
      clearLocalSession();
    }
  }, [clearLocalSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isSuperAdmin: checkIsSuperAdmin(user?.role),
      login,
      logout,
      setSession: applySession,
    }),
    [user, status, login, logout, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
