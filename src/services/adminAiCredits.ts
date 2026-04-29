import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const BASE = `${API_URL}/api/admin/ai-credits`;

export type AdminAiCreditSummary = {
  activeCredits: number;
  purchasedCredits30d: number;
  consumedCredits30d: number;
  manualGrantCredits30d: number;
  pendingPurchaseRequests: number;
};

export type AdminAiCreditTransaction = {
  id: string;
  seller_id: number;
  seller_email: string | null;
  seller_name: string | null;
  type: string;
  credits: number;
  balance_before: number | null;
  balance_after: number;
  description: string;
  ref_type: string | null;
  ref_id: string | null;
  created_at: string;
};

export type AdminAiCreditSeller = {
  seller_id: number;
  seller_email: string | null;
  seller_name: string | null;
  ai_credits_balance: number;
  estado_admin: string | null;
  estado_validacion: string | null;
};

export type AdminAiCreditPurchaseRequest = {
  id: string;
  seller_id: number;
  package_id: number;
  package_name?: string;
  package_slug?: string;
  seller_email?: string | null;
  nombre_comercio?: string | null;
  credits: number;
  price_gtq: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  provider: string | null;
  payment_note: string | null;
  rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.message || "No se pudo completar la operación");
  }
  return json as T;
}

export async function fetchAdminAiCreditSummary(): Promise<AdminAiCreditSummary> {
  const res = await authFetch(`${BASE}/summary`);
  const json = await readJson<{ summary: AdminAiCreditSummary }>(res);
  return json.summary;
}

export async function fetchAdminAiCreditTransactions(params: {
  search?: string;
  type?: string;
  sellerId?: number;
  limit?: number;
  offset?: number;
}): Promise<{ transactions: AdminAiCreditTransaction[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.type) qs.set("type", params.type);
  if (params.sellerId) qs.set("sellerId", String(params.sellerId));
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));

  const res = await authFetch(`${BASE}/transactions?${qs.toString()}`);
  return readJson<{ transactions: AdminAiCreditTransaction[]; total: number }>(
    res,
  );
}

export async function searchAdminAiCreditSellers(
  search: string,
): Promise<AdminAiCreditSeller[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("limit", "12");
  const res = await authFetch(`${BASE}/sellers?${qs.toString()}`);
  const json = await readJson<{ sellers: AdminAiCreditSeller[] }>(res);
  return json.sellers;
}

export async function grantAdminAiCredits(input: {
  sellerId: number;
  credits: number;
  category: string;
  reason: string;
}): Promise<{ txId: string; balanceAfter: number }> {
  const res = await authFetch(`${BASE}/grants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<{ txId: string; balanceAfter: number }>(res);
}

export async function fetchAdminAiCreditPurchaseRequests(params: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ requests: AdminAiCreditPurchaseRequest[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  const res = await authFetch(`${BASE}/purchase-requests?${qs.toString()}`);
  return readJson<{ requests: AdminAiCreditPurchaseRequest[]; total: number }>(
    res,
  );
}

export async function approveAdminAiCreditRequest(
  requestId: string,
): Promise<void> {
  const res = await authFetch(
    `${BASE}/purchase-requests/${requestId}/approve`,
    {
      method: "POST",
    },
  );
  await readJson(res);
}

export async function rejectAdminAiCreditRequest(
  requestId: string,
  reason: string,
): Promise<void> {
  const res = await authFetch(`${BASE}/purchase-requests/${requestId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  await readJson(res);
}
