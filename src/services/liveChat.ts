import { apiFetch } from "@/lib/api";
import { getApiUrl } from "@/lib/config";

const API = getApiUrl();

export type LiveChatMessage = {
  id: string;
  seller_id: number;
  user_id: number;
  buyer_name: string;
  message: string;
  created_at: string;
  sender_role?: "buyer" | "seller";
  status?: "visible" | "hidden" | "deleted";
  updated_at?: string;
};

export type LiveChatPublicPayload = {
  data: LiveChatMessage[];
  meta: {
    slow_mode_seconds: number;
    pinned_message: string | null;
  };
};

export async function fetchPublicLiveChatMessages(sellerId: number) {
  const res = await fetch(`${API}/api/public/live-chat/${sellerId}/messages`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo cargar el chat");
  }

  const json = (await res.json().catch(() => null)) as LiveChatPublicPayload | null;

  return {
    data: Array.isArray(json?.data) ? json!.data : [],
    meta: {
      slow_mode_seconds: Number(json?.meta?.slow_mode_seconds ?? 0) || 0,
      pinned_message:
        typeof json?.meta?.pinned_message === "string"
          ? json.meta.pinned_message.trim() || null
          : null,
    },
  };
}

export async function fetchSellerLiveChatMessages() {
  const res = await apiFetch("/api/seller/live-chat/messages", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("No se pudo cargar la bandeja del chat");
  }

  const json = (await res.json().catch(() => null)) as {
    data?: LiveChatMessage[];
  } | null;

  return Array.isArray(json?.data) ? json!.data : [];
}

export async function updateSellerLiveChatMessageStatus(
  messageId: string,
  status: "visible" | "hidden" | "deleted",
) {
  const res = await apiFetch(`/api/seller/live-chat/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
    data?: LiveChatMessage;
  } | null;

  if (!res.ok || !json?.data) {
    throw new Error(json?.message || "No se pudo actualizar el mensaje");
  }

  return json.data;
}

export async function fetchSellerLiveChatSettings() {
  const res = await apiFetch("/api/seller/live-chat/settings", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("No se pudo cargar la configuración del chat");
  }

  const json = (await res.json().catch(() => null)) as {
    data?: {
      slow_mode_seconds?: number;
      pinned_message?: string | null;
    };
  } | null;

  return {
    slow_mode_seconds: Number(json?.data?.slow_mode_seconds ?? 0) || 0,
    pinned_message:
      typeof json?.data?.pinned_message === "string"
        ? json.data.pinned_message.trim() || null
        : null,
  };
}

export async function updateSellerLiveChatSettings(
  slowModeSeconds: number,
  pinnedMessage: string | null,
) {
  const res = await apiFetch("/api/seller/live-chat/settings", {
    method: "PATCH",
    body: JSON.stringify({
      slow_mode_seconds: slowModeSeconds,
      pinned_message: pinnedMessage,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
    data?: {
      slow_mode_seconds?: number;
      pinned_message?: string | null;
    };
  } | null;

  if (!res.ok || !json?.data) {
    throw new Error(json?.message || "No se pudo guardar el slow mode");
  }

  return {
    slow_mode_seconds: Number(json.data.slow_mode_seconds ?? 0) || 0,
    pinned_message:
      typeof json.data.pinned_message === "string"
        ? json.data.pinned_message.trim() || null
        : null,
  };
}

export async function createSellerLiveChatMessage(message: string) {
  const res = await apiFetch("/api/seller/live-chat/messages", {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
    data?: LiveChatMessage;
  } | null;

  if (!res.ok || !json?.data) {
    throw new Error(json?.message || "No se pudo enviar la respuesta");
  }

  return json.data;
}
