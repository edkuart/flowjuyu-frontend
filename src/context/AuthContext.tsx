"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { signOut as firebaseSignOut } from "firebase/auth";

import { invalidateCache } from "@/lib/api";
import { getApiUrl } from "@/lib/config";
import { auth as firebaseAuth } from "@/lib/firebase";
import { cancelRefresh } from "@/lib/refreshSession";
import type {
  ConsentPolicyInfo,
  ConsentStatus,
  ConsentType,
} from "@/lib/consent";

type UserRole = "buyer" | "seller" | "admin" | "support";
export type Role = UserRole;

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AccessSnapshot {
  gates: {
    session: "ok" | "required";
    role: "ok" | "required";
    consent: "ok" | "required";
  };
  consent: {
    needsAcceptance: boolean;
    missing: ConsentType[];
    currentVersion: ConsentPolicyInfo | null;
    acceptedVersion: ConsentPolicyInfo | null;
    reason: string | null;
  };
  allowedDestination: string | null;
  policies: Record<ConsentType, ConsentPolicyInfo | null>;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  access: AccessSnapshot | null;
  consent: ConsentStatus | null;
  consentReady: boolean;
  needsConsent: boolean;
  ready: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string, payload?: unknown) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<User | null>;
}

interface ParsedAuthSnapshot {
  authenticated: boolean;
  user: User | null;
  access: AccessSnapshot | null;
  consent: ConsentStatus | null;
  needsConsent: boolean;
}

interface AuthChangedDetail {
  session?: unknown | null;
  token?: string | null;
  cleared?: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const POLICY_TYPES: ConsentType[] = ["terms", "privacy"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidRole(role: unknown): role is UserRole {
  return (
    role === "buyer" ||
    role === "seller" ||
    role === "admin" ||
    role === "support"
  );
}

function isValidUser(value: unknown): value is User {
  if (!isRecord(value)) return false;

  const { id, name, email, role } = value;
  const hasValidId = typeof id === "string" || typeof id === "number";

  return (
    hasValidId &&
    typeof name === "string" &&
    typeof email === "string" &&
    isValidRole(role)
  );
}

function normalizeMissing(value: unknown): ConsentType[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is ConsentType => item === "terms" || item === "privacy",
  );
}

function toPolicyInfo(value: unknown): ConsentPolicyInfo | null {
  if (!isRecord(value)) return null;

  const version =
    typeof value.version === "string"
      ? value.version
      : typeof value.versionCode === "string"
        ? value.versionCode
        : null;

  const url = typeof value.url === "string" ? value.url : null;
  const label =
    typeof value.label === "string"
      ? value.label
      : typeof value.versionLabel === "string"
        ? value.versionLabel
        : version;

  if (!version && !url && !label) {
    return null;
  }

  return {
    version,
    url,
    label,
  };
}

function getPolicyRecord(
  value: unknown,
): Record<ConsentType, ConsentPolicyInfo | null> {
  if (!isRecord(value)) {
    return {
      terms: null,
      privacy: null,
    };
  }

  return {
    terms: toPolicyInfo(value.terms),
    privacy: toPolicyInfo(value.privacy),
  };
}

function buildAccessFromModernContract(
  payload: Record<string, unknown>,
): AccessSnapshot | null {
  const rawAccess = payload.access;
  if (!isRecord(rawAccess)) return null;

  const rawGates = isRecord(rawAccess.gates) ? rawAccess.gates : {};
  const rawConsent = isRecord(rawAccess.consent) ? rawAccess.consent : {};
  const currentVersion = toPolicyInfo(rawConsent.currentVersion);
  const acceptedVersion = toPolicyInfo(rawConsent.acceptedVersion);
  const missing = normalizeMissing(rawConsent.missing);
  const needsAcceptance =
    typeof rawConsent.needsAcceptance === "boolean"
      ? rawConsent.needsAcceptance
      : rawGates.consent === "required" || missing.length > 0;

  const policies: Record<ConsentType, ConsentPolicyInfo | null> = {
    terms:
      currentVersion &&
      (missing.includes("terms") ||
        !missing.length ||
        !missing.includes("privacy"))
        ? currentVersion
        : null,
    privacy:
      currentVersion &&
      (missing.includes("privacy") ||
        !missing.length ||
        !missing.includes("terms"))
        ? currentVersion
        : null,
  };

  return {
    gates: {
      session: rawGates.session === "ok" ? "ok" : "required",
      role: rawGates.role === "ok" ? "ok" : "required",
      consent: needsAcceptance ? "required" : "ok",
    },
    consent: {
      needsAcceptance,
      missing,
      currentVersion,
      acceptedVersion,
      reason: typeof rawConsent.reason === "string" ? rawConsent.reason : null,
    },
    allowedDestination:
      typeof rawAccess.allowedDestination === "string"
        ? rawAccess.allowedDestination
        : null,
    policies,
  };
}

function buildAccessFromBackendSnapshot(
  payload: Record<string, unknown>,
): AccessSnapshot | null {
  const rawConsent = payload.consent;
  if (!isRecord(rawConsent)) return null;

  const missing = normalizeMissing(rawConsent.missingPolicies);
  const needsAcceptance =
    typeof rawConsent.needsConsent === "boolean"
      ? rawConsent.needsConsent
      : missing.length > 0;
  const policies = getPolicyRecord(rawConsent.activeVersions);
  const currentVersion = policies.terms ?? policies.privacy;

  return {
    gates: {
      session: "ok",
      role: "ok",
      consent: needsAcceptance ? "required" : "ok",
    },
    consent: {
      needsAcceptance,
      missing,
      currentVersion,
      acceptedVersion: null,
      reason:
        typeof rawConsent.reason === "string"
          ? rawConsent.reason
          : needsAcceptance
            ? "Consentimiento pendiente"
            : null,
    },
    allowedDestination:
      typeof payload.allowedDestination === "string"
        ? payload.allowedDestination
        : null,
    policies,
  };
}

function buildAccessFromLegacyHints(
  payload: Record<string, unknown>,
): AccessSnapshot | null {
  if (typeof payload.needsConsent !== "boolean") {
    return null;
  }

  const needsAcceptance = payload.needsConsent;
  const currentVersion =
    typeof payload.currentVersion === "string"
      ? {
          version: payload.currentVersion,
          url: null,
          label: payload.currentVersion,
        }
      : null;

  return {
    gates: {
      session: "ok",
      role: "ok",
      consent: needsAcceptance ? "required" : "ok",
    },
    consent: {
      needsAcceptance,
      missing: needsAcceptance ? [...POLICY_TYPES] : [],
      currentVersion,
      acceptedVersion: null,
      reason: needsAcceptance ? "Consentimiento pendiente" : null,
    },
    allowedDestination: null,
    policies: {
      terms: currentVersion,
      privacy: currentVersion,
    },
  };
}

function buildConsentStatus(access: AccessSnapshot | null): ConsentStatus | null {
  if (!access) return null;

  const currentVersion =
    access.consent.currentVersion?.version ??
    access.policies.terms?.version ??
    access.policies.privacy?.version ??
    null;

  return {
    compliant: !access.consent.needsAcceptance,
    needsConsent: access.consent.needsAcceptance,
    termsAccepted: !access.consent.missing.includes("terms"),
    privacyAccepted: !access.consent.missing.includes("privacy"),
    missingConsents: access.consent.missing,
    currentVersion,
    policies: access.policies,
  };
}

function parseAuthSnapshot(
  payload: unknown,
  fallbackUser?: User | null,
): ParsedAuthSnapshot {
  if (!isRecord(payload)) {
    return {
      authenticated: false,
      user: fallbackUser ?? null,
      access: null,
      consent: null,
      needsConsent: false,
    };
  }

  const user = isValidUser(payload.user) ? payload.user : fallbackUser ?? null;
  const access =
    buildAccessFromModernContract(payload) ??
    buildAccessFromBackendSnapshot(payload) ??
    buildAccessFromLegacyHints(payload);
  const consent = buildConsentStatus(access);
  const authenticated =
    typeof payload.authenticated === "boolean" ? payload.authenticated : !!user;
  const needsConsent =
    access?.consent.needsAcceptance ??
    consent?.needsConsent ??
    (typeof payload.needsConsent === "boolean" ? payload.needsConsent : false);

  return {
    authenticated,
    user: authenticated ? user : null,
    access,
    consent,
    needsConsent,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [access, setAccess] = useState<AccessSnapshot | null>(null);
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const isMounted = useRef(true);
  // Prevents auth:changed events and applyAuthSnapshot from restoring session
  // during the brief window between logout() and the hard page reload.
  const loggingOutRef = useRef(false);

  const clearStoredAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Also clear any pending Google auth intent so the LoginForm Firebase
    // listener does not auto-login after the user explicitly logs out.
    localStorage.removeItem("google_auth_intent");
  }, []);

  const applyAuthSnapshot = useCallback(
    (snapshot: ParsedAuthSnapshot, nextToken?: string | null) => {
      if (!isMounted.current) return;
      // If logout is in progress, silently drop any positive auth restoration.
      // This prevents in-flight refreshSession() calls from undoing the logout.
      if (loggingOutRef.current && snapshot.authenticated) return;

      if (!snapshot.authenticated || !snapshot.user) {
        clearStoredAuth();
        setUser(null);
        setToken(null);
        setAccess(null);
        setConsent(null);
        setNeedsConsent(false);
        setReady(true);
        return;
      }

      const resolvedToken =
        nextToken ??
        (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(snapshot.user));
        if (resolvedToken) {
          localStorage.setItem("token", resolvedToken);
        }
      }

      setUser(snapshot.user);
      setToken(resolvedToken);
      setAccess(snapshot.access);
      setConsent(snapshot.consent);
      setNeedsConsent(snapshot.needsConsent);
      setReady(true);
    },
    [clearStoredAuth],
  );

  const refreshAuth = useCallback(async (): Promise<User | null> => {
    if (isMounted.current) {
      setReady(false);
    }

    try {
      invalidateCache("/api/session");

      const response = await fetch(`${getApiUrl()}/api/session`, {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        applyAuthSnapshot({
          authenticated: false,
          user: null,
          access: null,
          consent: null,
          needsConsent: false,
        });
        return null;
      }

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      const snapshot = parseAuthSnapshot(payload);
      applyAuthSnapshot(snapshot);
      return snapshot.user;
    } catch (error) {
      console.error("refreshAuth error:", error);
      applyAuthSnapshot({
        authenticated: false,
        user: null,
        access: null,
        consent: null,
        needsConsent: false,
      });
      return null;
    }
  }, [applyAuthSnapshot]);

  const login = useCallback(
    (userData: User, authToken: string, payload?: unknown) => {
      const snapshot = parseAuthSnapshot(payload ?? { user: userData }, userData);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", authToken);
      }

      applyAuthSnapshot(
        {
          ...snapshot,
          authenticated: true,
          user: snapshot.user ?? userData,
        },
        authToken,
      );
    },
    [applyAuthSnapshot],
  );

  const logout = useCallback(async () => {
    // Set the flag FIRST — any auth:changed events or applyAuthSnapshot calls
    // with authenticated:true that arrive during this async sequence are dropped.
    loggingOutRef.current = true;
    // Abort any in-flight POST /api/refresh immediately. Without this, the
    // browser can receive a new fj_rt Set-Cookie AFTER our logout clears it,
    // leaving a valid cookie that the Next.js middleware will accept and
    // redirect the user back to their dashboard.
    cancelRefresh();

    try {
      // Sign out from Firebase and the backend in parallel.
      // Firebase signOut clears its session so onAuthStateChanged won't
      // auto-login the user when LoginForm remounts on /login.
      await Promise.allSettled([
        firebaseSignOut(firebaseAuth),
        fetch(`${getApiUrl()}/api/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      clearStoredAuth();
      invalidateCache("/api/session");
      applyAuthSnapshot({
        authenticated: false,
        user: null,
        access: null,
        consent: null,
        needsConsent: false,
      });

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  }, [applyAuthSnapshot, clearStoredAuth]);

  useEffect(() => {
    isMounted.current = true;
    void refreshAuth();

    return () => {
      isMounted.current = false;
    };
  }, [refreshAuth]);

  useEffect(() => {
    function handleAuthChanged(event: Event) {
      // Ignore all auth events while logout is in progress to prevent
      // in-flight refreshSession() calls from restoring the session.
      if (loggingOutRef.current) return;

      const customEvent = event as CustomEvent<AuthChangedDetail>;
      const detail = customEvent.detail;

      if (detail?.cleared || detail?.session === null) {
        applyAuthSnapshot({
          authenticated: false,
          user: null,
          access: null,
          consent: null,
          needsConsent: false,
        });
        return;
      }

      if (detail?.session) {
        const snapshot = parseAuthSnapshot(detail.session);
        applyAuthSnapshot(snapshot, detail.token ?? null);
        return;
      }

      void refreshAuth();
    }

    window.addEventListener("auth:changed", handleAuthChanged as EventListener);
    return () =>
      window.removeEventListener(
        "auth:changed",
        handleAuthChanged as EventListener,
      );
  }, [applyAuthSnapshot, refreshAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      access,
      consent,
      consentReady: ready,
      needsConsent,
      ready,
      isAuthenticated: !!user,
      login,
      logout,
      refreshAuth,
    }),
    [access, consent, login, logout, needsConsent, ready, refreshAuth, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
