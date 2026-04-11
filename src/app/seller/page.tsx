/**
 * src/app/seller/page.tsx — Seller onboarding router
 *
 * Server component. Runs on the edge/server before any client JS executes.
 *
 * Flow:
 *   1. Read fj_rt cookie (set by the backend on login).
 *   2. Call GET /api/seller/entry-point — validates cookie, returns routing fields.
 *   3. If onboarding is still open, send the seller to /seller/onboarding.
 *      Otherwise compute the destination via getSellerEntryPoint().
 *   4. Server-side redirect — zero client JS, no useEffect loops.
 *
 * Fallbacks:
 *   - No cookie           → middleware already blocked; this branch is unreachable
 *                           in normal operation, but we redirect to /login safely.
 *   - Backend unreachable → redirect to /seller/dashboard (fail open, same as
 *                           middleware strategy).
 *   - 404 (no profile)    → getSellerEntryPoint(null) → /welcome.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSellerEntryPoint,
  type SellerEntryPerfil,
} from "@/lib/sellerRouting";
import {
  isSellerOnboardingComplete,
  type SellerOnboardingState,
} from "@/lib/sellerOnboarding";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800";

export default async function SellerIndexPage() {
  const cookieStore = cookies();
  const fj_rt = cookieStore.get("fj_rt")?.value;

  console.log("[seller-entry] hasCookie:", !!fj_rt);

  // No refresh cookie — session is gone; send to login.
  if (!fj_rt) {
    redirect("/login");
  }

  let perfil: SellerEntryPerfil | null = null;
  let onboardingState: SellerOnboardingState | null = null;

  try {
    const commonOptions = {
      headers: { Cookie: `fj_rt=${fj_rt}` },
      cache: "no-store" as const,
    };

    const [entryRes, onboardingRes] = await Promise.all([
      fetch(`${API_URL}/api/seller/entry-point`, commonOptions),
      fetch(`${API_URL}/api/seller/onboarding/status`, commonOptions).catch(
        () => null,
      ),
    ]);

    console.log("[seller-entry] response status:", entryRes.status);

    if (entryRes.ok) {
      const data = await entryRes.json();
      console.log("[seller-entry] payload:", JSON.stringify(data, null, 2));
      perfil = data.perfil ?? null;
    } else {
      const errText = await entryRes.text().catch(() => "(unreadable)");
      console.log("[seller-entry] non-ok response body:", errText);
    }

    if (onboardingRes?.ok) {
      const onboardingData = await onboardingRes.json();
      onboardingState = onboardingData?.onboarding_state ?? null;
    }
    // 401 / 403 → perfil stays null → /welcome (or /login handled above)
    // 404       → perfil stays null → /welcome via getSellerEntryPoint
  } catch (err) {
    // Backend unreachable — fail open, send to dashboard.
    // AuthGuard remains active client-side as a second layer.
    console.log("[seller-entry] fetch error:", err);
    redirect("/seller/dashboard");
  }

  const destination =
    onboardingState && !isSellerOnboardingComplete(onboardingState)
      ? "/seller/onboarding"
      : getSellerEntryPoint(perfil);
  console.log("[seller-entry] destination:", destination);

  redirect(destination);
}
