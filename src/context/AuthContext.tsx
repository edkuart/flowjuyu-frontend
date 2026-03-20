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

function clearLocalStorage() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user,  setUser]  = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ── Session sync on mount ─────────────────────────────────────────────────
  // Uses GET /api/session (validates the HttpOnly fj_rt cookie) as the single
  // source of truth. localStorage is used only for the access token (needed
  // for API calls) and as a fallback when the backend is unreachable.
  //
  // This eliminates "ghost sessions": cleared cookie → frontend sees no user.
  useEffect(() => {
    async function syncSession() {
      try {
        const res = await fetch(`${getApiUrl()}/api/session`, {
          method:      "GET",
          credentials: "include",
          cache:       "no-store",
        });

        if (res.ok) {
          const data = await res.json();

          if (data.ok && isValidUser(data.user)) {
            // Cookie is the source of truth for identity. The user IS
            // authenticated as soon as /api/session confirms it.
            //
            // The access token is a secondary API credential — we read
            // whatever is in localStorage and set it (even if null).
            // If it is missing or expired, api.ts will silently refresh it
            // on the first protected API call via the 401 → refreshSession()
            // → retry cycle. We do NOT call refreshSession() here because a
            // failure there would dispatch auth:changed → handleAuthChanged
            // → setUser(null), destroying the session we just validated.
            setUser(data.user);
            setToken(localStorage.getItem("token")); // null is fine
            // Keep localStorage user in sync with the server-side session.
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("[auth:sync] session restored →", data.user.role, data.user.email);
          } else {
            // Session returned unexpected shape — treat as invalid.
            console.log("[auth:sync] session payload invalid — clearing state");
            clearLocalStorage();
            setUser(null);
            setToken(null);
          }
        } else {
          // 401 / 403 — cookie is absent, expired, or revoked.
          console.log("[auth:sync] /api/session returned", res.status, "— clearing state");
          clearLocalStorage();
          setUser(null);
          setToken(null);
        }
      } catch {
        // Backend unreachable — fall back to localStorage so local dev
        // survives a momentary backend restart.
        try {
          const storedUser  = localStorage.getItem("user");
          const storedToken = localStorage.getItem("token");

          if (storedUser && storedToken) {
            const parsed: unknown = JSON.parse(storedUser);
            if (isValidUser(parsed)) {
              setUser(parsed);
              setToken(storedToken);
            } else {
              clearLocalStorage();
            }
          }
        } catch {
          clearLocalStorage();
        }
      } finally {
        setReady(true);
      }
    }

    syncSession();
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
  // 2. POST /api/logout to clear the HttpOnly fj_rt cookie on the backend
  // 3. Redirect to /login
  //
  // The backend call uses await so the cookie is cleared before the redirect.
  // If the network is down, state is already cleared locally — the stale
  // cookie will be rejected on next use because the session is gone.

  const logout = async () => {
    setUser(null);
    setToken(null);
    clearLocalStorage();

    try {
      await fetch(`${getApiUrl()}/api/logout`, {
        method:      "POST",
        credentials: "include",
      });
    } catch {
      // Non-fatal — local state is already cleared.
    }

    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        // Authentication = confirmed user identity from /api/session.
        // Token is an API credential — its absence does not mean "logged out".
        // api.ts handles the 401 → refresh → retry cycle transparently.
        isAuthenticated: !!user,
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
