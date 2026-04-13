"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getApiUrl } from "@/lib/config";
import {
  fallbackConsentStatus,
  parseConsentHints,
  parseConsentStatus,
  type ConsentStatus,
} from "@/lib/consent";
import { apiFetch, invalidateCache } from "@/lib/api";

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
  consent:         ConsentStatus | null;
  consentReady:    boolean;
  needsConsent:    boolean;
  ready:           boolean;
  isAuthenticated: boolean;
  login:           (user: User, token: string, payload?: unknown) => void;
  logout:          () => void;
  refreshAuth:     () => Promise<void>;
  refreshConsent:  () => Promise<ConsentStatus | null>;
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
  localStorage.removeItem("consent_hint");
}

type ConsentHint = Pick<ConsentStatus, "needsConsent" | "currentVersion">;

function readStoredConsentHint(): ConsentHint | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("consent_hint");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.needsConsent !== "boolean") return null;

    return {
      needsConsent: parsed.needsConsent,
      currentVersion:
        typeof parsed.currentVersion === "string" ? parsed.currentVersion : null,
    };
  } catch {
    return null;
  }
}

function readStoredAuth(): { user: User; token: string } | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) return null;

    const parsed: unknown = JSON.parse(storedUser);
    if (!isValidUser(parsed)) return null;

    return {
      user: parsed,
      token: storedToken,
    };
  } catch {
    return null;
  }
}

function persistConsentHint(hint: ConsentHint | null): void {
  if (typeof window === "undefined") return;

  if (!hint || !hint.needsConsent) {
    localStorage.removeItem("consent_hint");
    return;
  }

  localStorage.setItem("consent_hint", JSON.stringify(hint));
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [consentReady, setConsentReady] = useState(false);
  const [ready, setReady] = useState(false);
  const isMounted = useRef(true);
  const sessionSynced = useRef(false);

  useEffect(() => {
    console.log("[auth-context] provider-state", {
      ready,
      consentReady,
      user,
      tokenPresent: Boolean(token),
      needsConsent: consent?.needsConsent ?? false,
      hasConsent: Boolean(consent),
    });
  }, [consent, consentReady, ready, token, user]);

  const clearAuthState = useCallback(() => {
    clearLocalStorage();
    setUser(null);
    setToken(null);
    setConsent(null);
    setConsentReady(true);
  }, []);

  const confirmSessionStillValid = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${getApiUrl()}/api/session`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const refreshConsent = useCallback(async (): Promise<ConsentStatus | null> => {
    console.log("[auth-context] refreshConsent:start", {
      hasUser: Boolean(user),
      ready,
      consentReady,
      tokenPresent:
        typeof window !== "undefined" ? Boolean(localStorage.getItem("token")) : false,
    });
    setConsentReady(false);

    try {
      console.log("[auth-context] refreshConsent:before-apiFetch", {
        url: `${getApiUrl()}/api/consent/status`,
      });
      const res = await apiFetch("/api/consent/status", {
        method: "GET",
        cache: "no-store",
      });

      console.log("[auth-context] refreshConsent:response", {
        status: res.status,
        ok: res.ok,
      });

      if (res.status === 401 || res.status === 403) {
        const sessionStillValid = await confirmSessionStillValid();
        console.log("[auth-context] refreshConsent:unauthorized", {
          sessionStillValid,
        });
        const storedHint = readStoredConsentHint();

        if (isMounted.current) {
          if (sessionStillValid) {
            if (storedHint?.needsConsent) {
              setConsent(fallbackConsentStatus(storedHint));
            }
            setConsentReady(true);
          } else {
            clearAuthState();
          }
        }

        return null;
      }

      if (!res.ok) {
        const storedHint = readStoredConsentHint();
        if (isMounted.current) {
          if (storedHint?.needsConsent) {
            setConsent(fallbackConsentStatus(storedHint));
          }
          setConsentReady(true);
        }
        return null;
      }

      const json = await res.json().catch(() => null);
      const nextConsent = parseConsentStatus(json);
      console.log("[auth-context] refreshConsent:parsed", {
        json,
        nextConsent,
      });

      if (isMounted.current) {
        setConsent(nextConsent);
        setConsentReady(true);
      }

      persistConsentHint(
        nextConsent
          ? {
              needsConsent: nextConsent.needsConsent,
              currentVersion: nextConsent.currentVersion,
            }
          : null,
      );

      return nextConsent;
    } catch (error) {
      console.log("[auth-context] refreshConsent:error", {
        error,
      });
      const storedHint = readStoredConsentHint();
      if (isMounted.current) {
        if (storedHint?.needsConsent) {
          setConsent(fallbackConsentStatus(storedHint));
        }
        setConsentReady(true);
      }
      return null;
    }
  }, [clearAuthState, confirmSessionStillValid, consentReady, ready, user]);

  const applyConsentState = useCallback(
    (payload?: unknown) => {
      console.log("[auth-context] applyConsentState", {
        payload,
      });
      const parsedConsent = parseConsentStatus(payload);
      if (parsedConsent) {
        console.log("[auth-context] applyConsentState:parsedConsent", {
          parsedConsent,
        });
        setConsent(parsedConsent);
        setConsentReady(true);
        persistConsentHint({
          needsConsent: parsedConsent.needsConsent,
          currentVersion: parsedConsent.currentVersion,
        });
        return;
      }

      const hints = parseConsentHints(payload);
      if (hints) {
        console.log("[auth-context] applyConsentState:hints", {
          hints,
        });
        setConsent(fallbackConsentStatus(hints));
        setConsentReady(true);
        persistConsentHint(hints);
        return;
      }

      const storedHint = readStoredConsentHint();
      if (storedHint?.needsConsent) {
        console.log("[auth-context] applyConsentState:storedHint", {
          storedHint,
        });
        setConsent(fallbackConsentStatus(storedHint));
        setConsentReady(true);
        return;
      }

      console.log("[auth-context] applyConsentState:trigger-refreshConsent");
      setConsent(null);
      void refreshConsent();
    },
    [refreshConsent],
  );

  const refreshAuth = useCallback(async () => {
    console.log("[auth-context] refreshAuth:start", {
      tokenPresent:
        typeof window !== "undefined" ? Boolean(localStorage.getItem("token")) : false,
      storedUserPresent:
        typeof window !== "undefined" ? Boolean(localStorage.getItem("user")) : false,
    });
    try {
      const res = await fetch(`${getApiUrl()}/api/session`, {
        method:      "GET",
        credentials: "include",
        cache:       "no-store",
      });

      console.log("[auth-context] refreshAuth:response", {
        status: res.status,
        ok: res.ok,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[auth-context] refreshAuth:data", {
          data,
          isValidUser: isValidUser(data.user),
        });

        if (data.ok && isValidUser(data.user)) {
          if (!isMounted.current) return;

          console.log("[auth-context] refreshAuth:setUser", {
            user: data.user,
          });
          setUser(data.user);
          setToken(localStorage.getItem("token"));
          localStorage.setItem("user", JSON.stringify(data.user));
          applyConsentState(data);
          return;
        }

        console.log("[auth-context] refreshAuth:invalid-user-shape");
        if (isMounted.current) clearAuthState();
        return;
      }

      if (res.status === 401 || res.status === 403) {
        console.log("[auth-context] refreshAuth:unauthorized");
        if (isMounted.current) clearAuthState();
        return;
      }
    } catch (error) {
      console.log("[auth-context] refreshAuth:error", {
        error,
      });
      if (typeof window === "undefined") return;

      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          const parsed: unknown = JSON.parse(storedUser);
          if (isValidUser(parsed) && isMounted.current) {
            console.log("[auth-context] refreshAuth:fallback-localStorage", {
              user: parsed,
            });
            setUser(parsed);
            setToken(storedToken);
            applyConsentState();
            return;
          }
        }
      } catch {
        // Ignore and fall through to ready state below.
      }
    }

    if (isMounted.current) {
      console.log("[auth-context] refreshAuth:done-without-user");
      setConsentReady(true);
    }
  }, [applyConsentState, clearAuthState]);

  // ── Session sync on mount ─────────────────────────────────────────────────
  // Uses GET /api/session (validates the HttpOnly fj_rt cookie) as the single
  // source of truth. localStorage is used only for the access token (needed
  // for API calls) and as a fallback when the backend is unreachable.
  //
  // This eliminates "ghost sessions": cleared cookie → frontend sees no user.
  //
  // WHY useRef guard:
  //   React 18 StrictMode double-invokes effects in development, which would
  //   fire two concurrent /api/session requests. The second can race or hit
  //   rate limits. The ref ensures exactly one network call regardless of
  //   how many times the effect body runs.
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (ready) return;

    const storedAuth = readStoredAuth();
    if (!storedAuth) return;

    console.log("[auth-context] hydrate-from-localStorage", {
      user: storedAuth.user,
    });
    setUser((currentUser) => currentUser ?? storedAuth.user);
    setToken((currentToken) => currentToken ?? storedAuth.token);
    applyConsentState();
  }, [applyConsentState, ready]);

  useEffect(() => {
    if (sessionSynced.current) return;
    sessionSynced.current = true;

    async function syncSession() {
      try {
        await refreshAuth();
      } catch {
        // refreshAuth already handles fallbacks.
      } finally {
        if (isMounted.current) setReady(true);
      }
    }

    syncSession();
  }, [refreshAuth]);

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
            applyConsentState();
            return;
          }
        } catch {
          // malformed JSON — fall through
        }
      }

      // Only clear React state when BOTH token and user are gone.
      // This means an intentional logout or a confirmed 401/403 refresh failure.
      // A missing token alone (e.g. after a 429 on /api/refresh) must NOT log
      // the user out — the cookie may still be valid.
      if (!storedToken && !storedUserRaw) {
        setToken(null);
        setUser(null);
        setConsent(null);
        setConsentReady(true);
      } else {
        // Partial state (e.g. user present but no token after a 429 refresh).
        // Keep current React state — api.ts will renew the token on next call.
        console.warn("[auth:changed] partial localStorage state — keeping current session");
      }
    }

    window.addEventListener("auth:changed", handleAuthChanged);
    return () => window.removeEventListener("auth:changed", handleAuthChanged);
  }, [applyConsentState]);

  // ── login ──────────────────────────────────────────────────────────────────

  const login = (user: User, token: string, payload?: unknown) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user",  JSON.stringify(user));
    localStorage.setItem("token", token);
    applyConsentState(payload);
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
    const currentToken =
      token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    try {
      await fetch(`${getApiUrl()}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Continue to verification/fallback below.
    }

    let sessionStillValid = await confirmSessionStillValid();

    if (sessionStillValid && currentToken) {
      try {
        await fetch(`${getApiUrl()}/api/logout-all`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch {
        // Ignore and verify again below.
      }

      // Force a final session probe so the backend can reject the old
      // refresh token and clear the fj_rt cookie if token_version changed.
      sessionStillValid = await confirmSessionStillValid();
    }

    setUser(null);
    setToken(null);
    setConsent(null);
    setConsentReady(true);
    clearLocalStorage();
    invalidateCache();

    if (!sessionStillValid) {
      window.location.replace("/login");
      return;
    }

    // Last-resort escape hatch: if the session is still alive, hard-navigate
    // to login with a marker instead of leaving stale local auth visible.
    window.location.replace("/login?logout=retry");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        consent,
        consentReady,
        needsConsent: consent?.needsConsent ?? false,
        ready,
        // Authentication = confirmed user identity from /api/session.
        // Token is an API credential — its absence does not mean "logged out".
        // api.ts handles the 401 → refresh → retry cycle transparently.
        isAuthenticated: !!user,
        login,
        logout,
        refreshAuth,
        refreshConsent,
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
