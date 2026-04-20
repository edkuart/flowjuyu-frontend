import { apiFetch } from "@/lib/api";

type LiveResponse = {
  success?: boolean;
  is_live?: boolean;
  message?: string;
};

type LiveConfigResponse = {
  success?: boolean;
  message?: string;
  data?: {
    live_message?: string | null;
    live_featured_product_ids?: string[] | null;
    live_current_product_id?: string | null;
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
