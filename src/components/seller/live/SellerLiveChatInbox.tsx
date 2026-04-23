"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  SendHorizonal,
  Trash2,
} from "lucide-react";

import {
  SellerActionButton,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import { sellerFieldClassName } from "@/components/seller/ui/sellerFormStyles";
import { BaseCard } from "@/components/ui/BaseCard";
import { trackEvent } from "@/lib/analytics";
import {
  createSellerLiveChatMessage,
  fetchSellerLiveChatMessages,
  fetchSellerLiveChatSettings,
  type LiveChatMessage,
  updateSellerLiveChatSettings,
  updateSellerLiveChatMessageStatus,
} from "@/services/liveChat";

type Props = {
  enabled: boolean;
};

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function SellerLiveChatInbox({ enabled }: Props) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState(0);
  const [draftSlowModeSeconds, setDraftSlowModeSeconds] = useState(0);
  const [pinnedMessage, setPinnedMessage] = useState("");
  const [savedPinnedMessage, setSavedPinnedMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!cancelled) setLoading(true);
        const [data, settings] = await Promise.all([
          fetchSellerLiveChatMessages(),
          fetchSellerLiveChatSettings(),
        ]);
        if (!cancelled) {
          setMessages(data);
          setSlowModeSeconds(settings.slow_mode_seconds);
          setDraftSlowModeSeconds(settings.slow_mode_seconds);
          setPinnedMessage(settings.pinned_message ?? "");
          setSavedPinnedMessage(settings.pinned_message ?? "");
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "No se pudo cargar la bandeja");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    const interval = window.setInterval(() => {
      void load();
    }, enabled ? 8000 : 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  const visibleCount = useMemo(
    () => messages.filter((item) => item.status === "visible").length,
    [messages],
  );

  const sellerReplyCount = useMemo(
    () => messages.filter((item) => item.sender_role === "seller").length,
    [messages],
  );

  async function handleModerate(
    messageId: string,
    nextStatus: "visible" | "hidden" | "deleted",
  ) {
    try {
      setBusyId(messageId);
      const updated = await updateSellerLiveChatMessageStatus(
        messageId,
        nextStatus,
      );

      setMessages((current) =>
        current.map((item) => (item.id === messageId ? updated : item)),
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el mensaje");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveSlowMode() {
    try {
      setSavingSettings(true);
      const result = await updateSellerLiveChatSettings(
        draftSlowModeSeconds,
        pinnedMessage.trim() || null,
      );
      setSlowModeSeconds(result.slow_mode_seconds);
      setDraftSlowModeSeconds(result.slow_mode_seconds);
      setPinnedMessage(result.pinned_message ?? "");
      setSavedPinnedMessage(result.pinned_message ?? "");
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el slow mode");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSendReply() {
    const trimmed = replyMessage.trim();
    if (!trimmed) return;

    try {
      setSendingReply(true);
      const created = await createSellerLiveChatMessage(trimmed);
      setMessages((current) => [created, ...current]);
      setReplyMessage("");
      setError(null);
      trackEvent("live_chat_message_sent", {
        sender_role: "seller",
        source: "seller_live_dashboard",
      });
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar la respuesta");
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <BaseCard
      className="rounded-xl border-[var(--seller-line-strong)] bg-white"
      contentClassName="space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Moderación del chat
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Conversación pública del live
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
            Revisa lo que preguntan los compradores, oculta mensajes ruidosos y
            mantén el espacio claro mientras estás en vivo.
          </p>
        </div>

        <div className="inline-flex min-w-[112px] flex-col rounded-2xl border border-[var(--seller-line-strong)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] px-4 py-3 text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-accent)]/70">
            Visibles
          </span>
          <span className="pt-1 text-2xl font-semibold tracking-tight text-[var(--seller-accent)]">
            {visibleCount}
          </span>
        </div>
      </div>

      {!enabled ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-[#fcfbf8] px-4 py-4 text-sm leading-relaxed text-neutral-600">
          La sala no está activa ahora. Aun así puedes revisar mensajes
          recientes antes de tu próxima transmisión.
        </div>
      ) : null}

      <SellerSurfaceCard tone="soft" className="px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900">
              Respuesta oficial del seller
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Envía mensajes visibles para toda la sala con contexto claro,
              stock, tiempos o instrucciones rápidas.
            </p>
          </div>

          <div className="inline-flex min-w-[112px] flex-col rounded-2xl border border-[var(--seller-line-strong)] bg-white px-4 py-3 text-right">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-accent)]/70">
              Respuestas
            </span>
            <span className="pt-1 text-2xl font-semibold tracking-tight text-[var(--seller-accent)]">
              {sellerReplyCount}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <textarea
            value={replyMessage}
            onChange={(event) => setReplyMessage(event.target.value.slice(0, 240))}
            rows={3}
            disabled={!enabled || sendingReply}
            placeholder={
              enabled
                ? "Ej. Estoy mostrando la pieza verde primero. Si te interesa, escríbeme y te comparto medidas."
                : "Activa tu live para responder en tiempo real."
            }
            className={sellerFieldClassName}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-400">
              {240 - replyMessage.length} caracteres disponibles
            </p>

            <SellerActionButton
              type="button"
              onClick={() => void handleSendReply()}
              disabled={!enabled || !replyMessage.trim() || sendingReply}
              className="min-h-11 px-5"
            >
              {sendingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              {sendingReply ? "Enviando…" : "Responder en la sala"}
            </SellerActionButton>
          </div>
        </div>
      </SellerSurfaceCard>

      <SellerSurfaceCard tone="soft" className="px-4 py-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">Slow mode</p>
              <p className="text-sm leading-relaxed text-neutral-600">
                Limita cada cuánto puede volver a escribir una misma persona en el
                chat público.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={draftSlowModeSeconds}
                onChange={(event) =>
                  setDraftSlowModeSeconds(Number(event.target.value))
                }
                className={sellerFieldClassName}
              >
                <option value={0}>Sin slow mode</option>
                <option value={15}>15 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>60 segundos</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-900">
              Mensaje fijado del seller
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Este texto aparecerá arriba del chat público para dar contexto y
              orientar la conversación.
            </p>
            <textarea
              value={pinnedMessage}
              onChange={(event) =>
                setPinnedMessage(event.target.value.slice(0, 240))
              }
              rows={3}
              placeholder="Ej. Estoy mostrando piezas recién terminadas. Pregunta por colores, medidas o disponibilidad."
              className={sellerFieldClassName}
            />
            <p className="text-xs text-neutral-400">
              {240 - pinnedMessage.length} caracteres disponibles
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SellerActionButton
              type="button"
              onClick={() => void handleSaveSlowMode()}
              disabled={
                savingSettings ||
                (draftSlowModeSeconds === slowModeSeconds &&
                  pinnedMessage === savedPinnedMessage)
              }
              className="min-h-11 px-5"
            >
              {savingSettings ? "Guardando…" : "Guardar ajustes del chat"}
            </SellerActionButton>
          </div>
        </div>
      </SellerSurfaceCard>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fcfbf8] px-4 py-4 text-sm text-neutral-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando conversación…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-[#fcfbf8] px-4 py-5 text-sm leading-relaxed text-neutral-600">
          Aún no han llegado mensajes al chat público de esta sala live.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((item) => {
            const isBusy = busyId === item.id;
            const isDeleted = item.status === "deleted";

            return (
              <div
                key={item.id}
                className={[
                  "rounded-2xl border px-4 py-4 transition",
                  item.status === "deleted"
                    ? "border-neutral-200 bg-neutral-50 text-neutral-400"
                    : item.sender_role === "seller"
                      ? "border-[#0F3D3A]/15 bg-[#0F3D3A]/6"
                    : item.status === "hidden"
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-neutral-200 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.buyer_name}
                      </p>
                      {item.sender_role === "seller" ? (
                        <SellerPill tone="default" className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white bg-[var(--seller-accent)] border-[var(--seller-accent)]">
                          Seller
                        </SellerPill>
                      ) : null}
                      <span className="text-xs text-neutral-400">
                        {formatMessageTime(item.created_at)}
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          item.status === "visible"
                            ? "bg-[#0F3D3A]/6 text-[#0F3D3A]"
                            : item.status === "hidden"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-neutral-200 text-neutral-600",
                        ].join(" ")}
                      >
                        {item.status === "visible"
                          ? "Visible"
                          : item.status === "hidden"
                            ? "Oculto"
                            : "Borrado"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-700">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {item.status === "visible" ? (
                      <SellerActionButton
                        type="button"
                        disabled={isBusy || isDeleted}
                        onClick={() => void handleModerate(item.id, "hidden")}
                        tone="neutral"
                        className="min-h-10 px-3 text-sm"
                      >
                        <EyeOff className="h-4 w-4" />
                        Ocultar
                      </SellerActionButton>
                    ) : (
                      <SellerActionButton
                        type="button"
                        disabled={isBusy || isDeleted}
                        onClick={() => void handleModerate(item.id, "visible")}
                        tone="neutral"
                        className="min-h-10 px-3 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Mostrar
                      </SellerActionButton>
                    )}

                    <button
                      type="button"
                      disabled={isBusy || isDeleted}
                      onClick={() => void handleModerate(item.id, "deleted")}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:border-[#b42318]/20 hover:text-[#b42318] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-[#b42318]/10 bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-[#fcfbf8] px-4 py-3 text-sm text-neutral-600">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <p>
              Ocultar saca el mensaje de la sala pública, mostrar lo restaura, y
              borrar lo deja fuera definitivamente para esta conversación.
            </p>
          </div>
        </div>
      )}
    </BaseCard>
  );
}
