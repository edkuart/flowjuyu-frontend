"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, SendHorizonal } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { getApiUrl } from "@/lib/config";
import {
  fetchPublicLiveChatMessages,
  type LiveChatMessage,
} from "@/services/liveChat";

type Props = {
  sellerId: number;
  quickQuestions?: string[];
  onFallbackQuestion?: (question?: string) => void;
};

const API = getApiUrl();
const MESSAGE_MAX = 240;

function mergeMessages(
  current: LiveChatMessage[],
  incoming: LiveChatMessage[],
): LiveChatMessage[] {
  const map = new Map<string, LiveChatMessage>();

  for (const item of current) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);

  return Array.from(map.values()).sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
  );
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-GT", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getMessageCardClass(item: LiveChatMessage, isOwn: boolean) {
  if (item.sender_role === "seller") {
    return "border-[#0F3D3A]/12 bg-[#0F3D3A]/6";
  }

  if (isOwn) {
    return "border-[#0F3D3A]/12 bg-[#0F3D3A]/5";
  }

  return "border-neutral-200 bg-white";
}

export default function PublicLiveChat({
  sellerId,
  quickQuestions = [],
  onFallbackQuestion,
}: Props) {
  const { user, ready } = useAuth();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slowModeSeconds, setSlowModeSeconds] = useState(0);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [nextAllowedAt, setNextAllowedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const canWrite = user?.role === "buyer";
  const remaining = MESSAGE_MAX - message.length;
  const emptyState =
    "Sé la primera persona en preguntar por esta pieza o pedir más detalles.";
  const cooldownRemainingSeconds = nextAllowedAt
    ? Math.max(0, Math.ceil((nextAllowedAt - now) / 1000))
    : 0;

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await fetchPublicLiveChatMessages(sellerId);
      setMessages(payload.data);
      setSlowModeSeconds(payload.meta.slow_mode_seconds);
      setPinnedMessage(payload.meta.pinned_message);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar el chat");
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    trackEvent("live_chat_opened", {
      seller_id: sellerId,
      source: "store_live",
    });
  }, [sellerId]);

  useEffect(() => {
    if (!nextAllowedAt) return;
    if (Date.now() >= nextAllowedAt) {
      setNextAllowedAt(null);
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [nextAllowedAt]);

  useEffect(() => {
    if (!API) return;

    const source = new EventSource(
      `${API}/api/public/live-chat/${sellerId}/stream`,
      { withCredentials: true },
    );

    const onMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as LiveChatMessage;
        setMessages((current) => mergeMessages(current, [payload]));
      } catch {
        // Ignore malformed SSE frames.
      }
    };

    const onError = () => {
      source.close();
      window.setTimeout(() => {
        void fetchMessages();
      }, 1200);
    };

    source.addEventListener("live-chat-message", onMessage as EventListener);
    source.addEventListener("error", onError as EventListener);

    return () => {
      source.removeEventListener(
        "live-chat-message",
        onMessage as EventListener,
      );
      source.removeEventListener("error", onError as EventListener);
      source.close();
    };
  }, [fetchMessages, sellerId]);

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed || !canWrite || cooldownRemainingSeconds > 0) return;

    try {
      setIsSending(true);
      setError(null);

      const res = await apiFetch("/api/live-chat/messages", {
        method: "POST",
        body: JSON.stringify({
          seller_id: sellerId,
          message: trimmed,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (json?.retry_after_seconds) {
          setNextAllowedAt(Date.now() + Number(json.retry_after_seconds) * 1000);
        }
        throw new Error(json?.message || "No se pudo enviar el mensaje");
      }

      if (json?.data) {
        setMessages((current) => mergeMessages(current, [json.data]));
      }
      if (slowModeSeconds > 0) {
        setNextAllowedAt(Date.now() + slowModeSeconds * 1000);
      }
      trackEvent("live_chat_message_sent", {
        seller_id: sellerId,
        sender_role: "buyer",
        source: "store_live",
      });
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  }

  const helperText = useMemo(() => {
    if (!ready) return "Estamos verificando tu sesión…";
    if (canWrite) return "Tu mensaje aparecerá para todas las personas que estén viendo esta sala.";
    if (!user) return "Puedes leer el chat libremente. Inicia sesión como comprador para participar.";
    return "Solo compradores autenticados pueden escribir en este chat.";
  }, [canWrite, ready, user]);

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Chat en vivo
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            Conversación pública
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Dudas rápidas, disponibilidad y contexto de lo que se está mostrando ahora.
          </p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0F3D3A]/6 text-[#0F3D3A]">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      {quickQuestions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => {
                trackEvent("live_chat_quick_question_click", {
                  seller_id: sellerId,
                  question,
                  source: "store_live",
                });

                if (canWrite) {
                  setMessage(question);
                  return;
                }

                onFallbackQuestion?.(question);
              }}
              className="rounded-full border border-neutral-200 bg-[#fcfbf8] px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
            >
              {question}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 rounded-[24px] border border-neutral-100 bg-[#faf8f4]">
        {pinnedMessage ? (
          <div className="border-b border-neutral-100 bg-[#fff8ef] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b45309]">
              Mensaje del taller
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {pinnedMessage}
            </p>
          </div>
        ) : null}
        <div className="max-h-[320px] space-y-3 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <p className="text-sm text-neutral-500">Cargando conversación…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm leading-relaxed text-neutral-500">
              {emptyState}
            </p>
          ) : (
            messages.map((item) => {
              const isOwn = user && String(user.id) === String(item.user_id);

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-2xl border px-3 py-3",
                    getMessageCardClass(item, Boolean(isOwn)),
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.buyer_name}
                      </p>
                      {item.sender_role === "seller" ? (
                        <span className="rounded-full bg-[#0F3D3A] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                          Respuesta oficial
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {formatMessageTime(item.created_at)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {item.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-neutral-100 px-4 py-4">
          <p className="text-xs leading-relaxed text-neutral-500">
            {helperText}
          </p>
          {slowModeSeconds > 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Slow mode activo: puedes enviar un mensaje cada {slowModeSeconds}s.
            </p>
          ) : null}
          {cooldownRemainingSeconds > 0 ? (
            <p className="mt-2 text-xs font-medium text-[#b42318]">
              Espera {cooldownRemainingSeconds}s antes de volver a escribir.
            </p>
          ) : null}

          <div className="mt-3 space-y-3">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value.slice(0, MESSAGE_MAX))
              }
              rows={3}
              disabled={!canWrite || isSending || cooldownRemainingSeconds > 0}
              placeholder={
                canWrite
                  ? "Escribe una pregunta corta sobre la pieza o el live…"
                  : "Inicia sesión como comprador para participar en el chat."
              }
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#0F3D3A]/30 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-400">
                {remaining} caracteres disponibles
              </p>

              {canWrite ? (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={
                    !message.trim() || isSending || cooldownRemainingSeconds > 0
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#0F3D3A] px-5 text-sm font-semibold text-white transition hover:bg-[#0c312f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizonal className="h-4 w-4" />
                  {isSending
                    ? "Enviando…"
                    : cooldownRemainingSeconds > 0
                      ? `Espera ${cooldownRemainingSeconds}s`
                      : "Enviar mensaje"}
                </button>
              ) : !user ? (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                >
                  Inicia sesión para comentar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onFallbackQuestion?.()}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                >
                  Preguntar por WhatsApp
                </button>
              )}
            </div>

            {error ? (
              <p className="text-sm text-[#b42318]">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
