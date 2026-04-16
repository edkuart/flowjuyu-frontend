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
  window.sessionStorage.setItem(GOOGLE_AUTH_INTENT_KEY, intent);
}

export function getGoogleAuthIntent(): GoogleAuthIntent | null {
  if (typeof window === "undefined") return null;

  const value = window.sessionStorage.getItem(GOOGLE_AUTH_INTENT_KEY);
  return value === "login" || value === "register" ? value : null;
}

function clearGoogleAuthIntent(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
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

  if (!intent || intent !== expectedIntent) {
    return null;
  }

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
    logGoogleRedirect("Redirect result did not provide a user", {});
    clearGoogleAuthIntent();
    throw new Error("Google redirect completed without Firebase user.");
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
