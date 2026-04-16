import {
  type User,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";

import { getApiUrl } from "@/lib/config";
import { auth } from "@/lib/firebase";

const GOOGLE_AUTH_INTENT_KEY = "google_auth_intent";

export type GoogleAuthIntent = "login" | "register";

export interface SocialAuthResult {
  res: Response;
  json: Record<string, unknown>;
}

function logGoogleRedirect(message: string, payload?: Record<string, unknown>): void {
  console.log(`[google-auth] ${message}`, payload ?? {});
}

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

function setGoogleAuthIntent(intent: GoogleAuthIntent): void {
  if (typeof window === "undefined") return;
  // localStorage survives cross-origin redirects (Safari clears sessionStorage
  // when the tab navigates through firebaseapp.com during signInWithRedirect)
  window.localStorage.setItem(GOOGLE_AUTH_INTENT_KEY, intent);
}

export function getGoogleAuthIntent(): GoogleAuthIntent | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(GOOGLE_AUTH_INTENT_KEY);
  return value === "login" || value === "register" ? value : null;
}

function clearGoogleAuthIntent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
}

async function exchangeGoogleIdToken(id_token: string): Promise<SocialAuthResult> {
  logGoogleRedirect("Exchanging Firebase idToken with backend", {
    apiUrl: `${getApiUrl()}/api/auth/social`,
    idTokenLength: id_token.length,
    idTokenStart: id_token.slice(0, 12),
    idTokenEnd: id_token.slice(-12),
  });

  const res = await fetch(`${getApiUrl()}/api/auth/social`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "google",
      id_token,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  logGoogleRedirect("Backend social auth response received", {
    status: res.status,
    ok: res.ok,
    hasToken: Boolean(json.token),
    hasUser: Boolean(json.user),
    isNewUser: Boolean(json.is_new_user),
    message: typeof json.message === "string" ? json.message : null,
  });

  return { res, json };
}

export async function startGoogleRedirect(intent: GoogleAuthIntent): Promise<never> {
  setGoogleAuthIntent(intent);
  await signInWithRedirect(auth, createGoogleProvider());
  throw new Error("Google redirect did not leave the page as expected.");
}

export async function consumeGoogleRedirectResult(
  expectedIntent: GoogleAuthIntent,
): Promise<SocialAuthResult | null> {
  const intent = getGoogleAuthIntent();

  logGoogleRedirect("Consuming redirect result", {
    expectedIntent,
    storedIntent: intent,
  });

  // Explicit mismatch: a *different* form's redirect is pending — skip this call
  if (intent !== null && intent !== expectedIntent) {
    logGoogleRedirect("Intent mismatch — skipping", { expectedIntent, storedIntent: intent });
    return null;
  }

  // intent === null means localStorage was cleared (Safari cross-origin wipe) or
  // this is a normal page load. We still call getRedirectResult: Firebase returns
  // null immediately on normal loads, so this is safe and recovers the Safari case.
  const result = await getRedirectResult(auth);
  const user: User | null = result?.user ?? auth.currentUser;

  logGoogleRedirect("Redirect result resolved", {
    hasResult: Boolean(result),
    hasResultUser: Boolean(result?.user),
    hasCurrentUser: Boolean(auth.currentUser),
    userUid: user?.uid ?? null,
    providerCount: user?.providerData.length ?? 0,
  });

  if (!user) {
    clearGoogleAuthIntent();
    if (result !== null) {
      // Firebase returned a credential but no user — unexpected state
      logGoogleRedirect("Redirect result had no user despite non-null result", {});
      throw new Error("Google redirect completed without Firebase user.");
    }
    // No pending redirect — normal page load, nothing to do
    return null;
  }

  const id_token = await user.getIdToken();
  logGoogleRedirect("Firebase idToken obtained", {
    userUid: user.uid,
    idTokenLength: id_token.length,
    idTokenStart: id_token.slice(0, 12),
    idTokenEnd: id_token.slice(-12),
  });

  const exchange = await exchangeGoogleIdToken(id_token);

  clearGoogleAuthIntent();
  return exchange;
}
