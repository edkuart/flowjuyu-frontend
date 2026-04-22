import { apiFetch } from "@/lib/api";
import type { LivePlatform } from "@/lib/liveExternal";

type LiveResponse = {
  success?: boolean;
  is_live?: boolean;
  live_started_at?: string | null;
  message?: string;
};

type LiveConfigResponse = {
  success?: boolean;
  message?: string;
  data?: {
    live_message?: string | null;
    live_featured_product_ids?: string[] | null;
    live_current_product_id?: string | null;
    live_external_url?: string | null;
    live_platform?: LivePlatform | null;
    live_collection_id?: number | null;
  };
};

async function postLive(path: "/api/seller/live/start" | "/api/seller/live/end") {
  const res = await apiFetch(path, { method: "POST" });
  const json: LiveResponse = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "No se pudo actualizar el estado en vivo");
  }

  return {
    isLive: Boolean(json.is_live),
    liveStartedAt:
      typeof json.live_started_at === "string"
        ? json.live_started_at
        : null,
  };
}

export function startSellerLive() {
  return postLive("/api/seller/live/start");
}

export function endSellerLive() {
  return postLive("/api/seller/live/end");
}

export async function updateSellerLiveConfig(input: {
  live_message?: string | null;
  live_featured_product_ids?: string[] | null;
  live_collection_id?: number | null;
}) {
  const res = await apiFetch("/api/seller/live/config", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  const json: LiveConfigResponse = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "No se pudo guardar la configuración del live");
  }

  return {
    liveMessage: json.data?.live_message ?? null,
    liveFeaturedProductIds: json.data?.live_featured_product_ids ?? [],
    liveCollectionId:
      Number.isInteger(Number(json.data?.live_collection_id)) &&
      Number(json.data?.live_collection_id) > 0
        ? Number(json.data?.live_collection_id)
        : null,
  };
}

export async function updateSellerLiveExternal(input: {
  live_external_url?: string | null;
  live_platform?: LivePlatform | null;
}) {
  const res = await apiFetch("/api/seller/live/external", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  const json: LiveConfigResponse = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "No se pudo guardar la transmisión externa");
  }

  return {
    liveExternalUrl: json.data?.live_external_url ?? null,
    livePlatform: json.data?.live_platform ?? null,
  };
}

export async function updateSellerLiveCurrentProduct(product_id: string | null) {
  const res = await apiFetch("/api/seller/live/current-product", {
    method: "PATCH",
    body: JSON.stringify({ product_id }),
  });

  const json: LiveConfigResponse = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "No se pudo guardar el producto actual del live");
  }

  return {
    liveCurrentProductId: json.data?.live_current_product_id ?? null,
  };
}
