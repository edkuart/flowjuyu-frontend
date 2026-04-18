import {
  GoogleAuthProvider,
  signInWithPopup,
  AuthErrorCodes,
} from "firebase/auth";

import { getApiUrl } from "@/lib/config";
import { auth } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────────────────────

export type GoogleAuthIntent = "login" | "register";

export interface SocialAuthResult {
  res: Response;
  json: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

async function exchangeGoogleIdToken(id_token: string): Promise<SocialAuthResult> {
  const res = await fetch(`${getApiUrl()}/api/auth/social`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", id_token }),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  console.log("[google-auth] backend response", {
    status: res.status,
    ok: res.ok,
    hasToken: Boolean(json.token),
    hasUser: Boolean(json.user),
    isNewUser: Boolean(json.is_new_user),
    message: typeof json.message === "string" ? json.message : null,
  });

  return { res, json };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Open a Google sign-in popup, get a Firebase ID token, and exchange it with
 * the backend. Returns the backend response or throws with a user-visible message.
 *
 * Uses signInWithPopup instead of signInWithRedirect to avoid cross-origin
 * storage restrictions (Chrome third-party cookie phase-out) that cause
 * onAuthStateChanged to fire with null after a redirect.
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  const provider = createGoogleProvider();

  let credential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (err: any) {
    // User closed the popup or popup was blocked — surface a clear message
    if (
      err?.code === AuthErrorCodes.POPUP_CLOSED_BY_USER ||
      err?.code === "auth/popup-closed-by-user" ||
      err?.code === "auth/cancelled-popup-request"
    ) {
      throw new GoogleAuthCancelled();
    }
    if (
      err?.code === AuthErrorCodes.POPUP_BLOCKED ||
      err?.code === "auth/popup-blocked"
    ) {
      throw new GoogleAuthPopupBlocked();
    }
    console.error("[google-auth] signInWithPopup error", err);
    throw new GoogleAuthError(
      err?.message || "Error al abrir el inicio de sesión con Google.",
    );
  }

  console.log("[google-auth] popup completed", {
    uid: credential.user.uid,
    providers: credential.user.providerData.map((p) => p.providerId),
  });

  const idToken = await credential.user.getIdToken();
  console.log("[google-auth] idToken obtained", { length: idToken.length });

  return exchangeGoogleIdToken(idToken);
}

// ── Error types ───────────────────────────────────────────────────────────────

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

export class GoogleAuthCancelled extends GoogleAuthError {
  constructor() {
    super("Inicio de sesión cancelado.");
    this.name = "GoogleAuthCancelled";
  }
}

export class GoogleAuthPopupBlocked extends GoogleAuthError {
  constructor() {
    super(
      "El navegador bloqueó la ventana emergente. Permite popups para este sitio e inténtalo de nuevo.",
    );
    this.name = "GoogleAuthPopupBlocked";
  }
}

// ── Legacy stubs (kept so old imports compile) ────────────────────────────────
// These were part of the signInWithRedirect flow. No longer used.

export function getGoogleAuthIntent(): null {
  return null;
}

export function clearGoogleAuthIntent(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("google_auth_intent");
  }
}
