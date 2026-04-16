import {
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

  if (!intent || intent !== expectedIntent) {
    return null;
  }

  const result = await getRedirectResult(auth);

  if (!result?.user) {
    clearGoogleAuthIntent();
    return null;
  }

  const id_token = await result.user.getIdToken();
  const exchange = await exchangeGoogleIdToken(id_token);

  clearGoogleAuthIntent();
  return exchange;
}
