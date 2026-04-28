// src/services/aiCredits.ts
//
// API service layer for seller AI credits.
// All functions call authenticated endpoints under /api/seller/ai-credits.

import { apiFetch } from "@/lib/api";

const BASE = "/api/seller/ai-credits";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiCreditTransaction {
  id: string;
  seller_id: number;
  type: "purchase" | "debit" | "refund" | "manual_grant" | "plan_renewal";
  credits: number;
  balance_after: number;
  description: string;
  ref_type: string | null;
  ref_id: string | null;
  created_at: string;
}

export interface AiCreditPackage {
  id: number;
  slug: string;
  name: string;
  credits: number;
  price_gtq: number;
  sort_order: number;
}

export interface AiCreditPurchaseRequest {
  id: string;
  seller_id: number;
  package_id: number;
  credits: number;
  price_gtq: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  payment_note: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  tx_id: string | null;
  created_at: string;
  updated_at: string;
  package_name?: string;
  package_slug?: string;
}

export const AI_CREDIT_COSTS: Record<
  string,
  { label: string; credits: number }
> = {
  content_caption: { label: "Caption de producto", credits: 2 },
  content_description: { label: "Descripción de producto", credits: 2 },
  content_image_prompt: { label: "Brief de fotografía", credits: 2 },
  canvas_ai: { label: "Canvas / Colección con IA", credits: 8 },
  video_10s_kling: { label: "Video 10s (Kling)", credits: 5 },
  video_10s_luma: { label: "Video 10s (Luma Dream)", credits: 10 },
  video_10s_runway: { label: "Video 10s (Runway Premium)", credits: 20 },
};

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function fetchAiCreditsBalance(): Promise<number> {
  const res = await apiFetch(`${BASE}/balance`);
  if (!res.ok) throw new Error("Error cargando saldo de créditos IA");
  const data = await res.json();
  return data.balance as number;
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export async function fetchAiCreditPackages(): Promise<AiCreditPackage[]> {
  const res = await apiFetch(`${BASE}/packages`);
  if (!res.ok) throw new Error("Error cargando paquetes de créditos");
  const data = await res.json();
  return data.packages as AiCreditPackage[];
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchAiCreditTransactions(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ transactions: AiCreditTransaction[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const res = await apiFetch(`${BASE}/transactions?${qs}`);
  if (!res.ok) throw new Error("Error cargando historial de créditos");
  const data = await res.json();
  return { transactions: data.transactions, total: data.total };
}

// ─── Purchase requests ────────────────────────────────────────────────────────

export async function fetchAiCreditPurchaseRequests(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ requests: AiCreditPurchaseRequest[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const res = await apiFetch(`${BASE}/purchase-requests?${qs}`);
  if (!res.ok) throw new Error("Error cargando solicitudes");
  const data = await res.json();
  return { requests: data.requests, total: data.total };
}

export async function createAiCreditPurchaseRequest(body: {
  packageId: number;
  paymentNote?: string;
}): Promise<AiCreditPurchaseRequest> {
  const res = await apiFetch(`${BASE}/purchase-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: body.packageId,
      paymentNote: body.paymentNote,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      ((err as Record<string, unknown>).message as string) ||
        "Error al enviar solicitud",
    );
  }
  const data = await res.json();
  return data.request as AiCreditPurchaseRequest;
}

export async function createAiCreditCheckout(body: {
  packageId: number;
}): Promise<{ url: string; sessionId: string; requestId: string }> {
  const res = await apiFetch(`${BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageId: body.packageId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      ((data as Record<string, unknown>).message as string) ||
        "Error al iniciar el pago",
    );
  }
  return {
    url: (data as Record<string, string>).url,
    sessionId: (data as Record<string, string>).sessionId,
    requestId: (data as Record<string, string>).requestId,
  };
}
