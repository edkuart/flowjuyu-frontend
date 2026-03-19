"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/config";

// ─────────────────────────────────────────────────────────────
// Canonical role type — matches backend ENUM exactly.
// Never use "vendedor", "comprador", or any Spanish alias.
// ─────────────────────────────────────────────────────────────

export type Role = "buyer" | "seller" | "admin" | "support";

// ─────────────────────────────────────────────────────────────
// Canonical User type — matches the backend auth DTO exactly:
//   { id, name, email, role }
// No index signature, no optional Spanish fields.
// ─────────────────────────────────────────────────────────────

export interface User {
  id:    number;
  name:  string;
  email: string;
  role:  Role;
}

// ─────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────

interface AuthContextProps {
  user:            User | null;
  token:           string | null;
  ready:           boolean;
  isAuthenticated: boolean;
  login:           (user: User, token: string) => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// Guard — returns true only if the parsed object looks like a
// valid canonical User (post-Phase 1 shape). Rejects legacy
// objects that still have nombre/correo/rol fields so that
// stale localStorage sessions are cleared automatically on
// the first load after this deployment.
// ─────────────────────────────────────────────────────────────

function isValidUser(obj: unknown): obj is User {
  if (!obj || typeof obj !== "object") return false;
  const u = obj as Record<string, unknown>;
  return (
    typeof u.id    === "number" &&
    typeof u.name  === "string" &&
    typeof u.email === "string" &&
    typeof u.role  === "string" &&
    ["buyer", "seller", "admin", "support"].includes(u.role as string)
  );
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user,  setUser]  = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ── Initial hydration ──────────────────────────────────────────────────────
  // Restore session from localStorage on mount.
  // Rejects any stored user that doesn't match the canonical shape
  // (e.g. legacy sessions with nombre/correo/rol).
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed: unknown = JSON.parse(storedUser);

        if (isValidUser(parsed)) {
          setUser(parsed);
          setToken(storedToken);
        } else {
          // Legacy session — clear silently, user will be prompted to log in
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setReady(true);
    }
  }, []);

  // ── Refresh sync ───────────────────────────────────────────────────────────
  // refreshSession() (src/lib/refreshSession.ts) updates localStorage and then
  // dispatches the "auth:changed" event. This listener re-reads localStorage so
  // that in-memory React state stays in sync without any circular import between
  // the fetch layer and this context.
  useEffect(() => {
    function handleAuthChanged() {
      const storedToken   = localStorage.getItem("token");
      const storedUserRaw = localStorage.getItem("user");

      if (storedToken && storedUserRaw) {
        try {
          const parsed: unknown = JSON.parse(storedUserRaw);
          if (isValidUser(parsed)) {
            setToken(storedToken);
            setUser(parsed);
            return;
          }
        } catch {
          // malformed JSON — fall through to clear
        }
      }

      // localStorage was cleared (logout or refresh failure)
      setToken(null);
      setUser(null);
    }

    window.addEventListener("auth:changed", handleAuthChanged);
    return () => window.removeEventListener("auth:changed", handleAuthChanged);
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user",  JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // ── logout ─────────────────────────────────────────────────────────────────
  // 1. Clear local state immediately (synchronous — no flicker)
  // 2. Fire-and-forget backend call to clear the HttpOnly refresh cookie
  // 3. Redirect to /login
  //
  // The backend call is non-blocking: if the network is down, local state is
  // already cleared and the user is still redirected. The refresh cookie will
  // be rejected by the server on next use because the session is gone.

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Clear HttpOnly fj_rt cookie — fire and forget, non-fatal on failure
    fetch(`${getApiUrl()}/api/logout`, {
      method:      "POST",
      credentials: "include",
    }).catch(() => {});

    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
