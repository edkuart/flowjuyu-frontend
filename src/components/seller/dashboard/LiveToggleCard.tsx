"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Radio, Zap } from "lucide-react";

import { BaseCard } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui/button";
import { endSellerLive, startSellerLive } from "@/services/sellerLive";

type Props = {
  isLive: boolean;
  liveStartedAt?: string | null;
  onStateChange?: (
    newState: boolean,
    meta?: { liveStartedAt: string | null },
  ) => void;
  variant?: "card" | "plain";
};

function formatStartedAt(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getTime() > Date.now() + 60_000) return null;

  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function LiveToggleCard({
  isLive,
  liveStartedAt = null,
  onStateChange,
  variant = "card",
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedLabel = useMemo(
    () => formatStartedAt(liveStartedAt),
    [liveStartedAt],
  );

  async function handleToggle() {
    try {
      setIsLoading(true);
      setError(null);

      if (isLive) {
        const result = await endSellerLive();
        onStateChange?.(false, { liveStartedAt: result.liveStartedAt });
        return;
      }

      const result = await startSellerLive();
      onStateChange?.(true, { liveStartedAt: result.liveStartedAt });
    } catch (err: any) {
      setError(err?.message || "No se pudo cambiar el estado en vivo");
    } finally {
      setIsLoading(false);
    }
  }

  const content = (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              isLive
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "bg-[#0F3D3A]/6 text-[#0F3D3A]/80 ring-1 ring-[#0F3D3A]/10",
            ].join(" ")}
          >
            {isLive ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                En vivo
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5" />
                Estado en vivo
              </>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              {isLive ? "Tu tienda está visible ahora" : "Tu tienda no está en vivo"}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              {isLive
                ? "Estás en vivo. Tus seguidores han sido notificados y tu tienda puede aparecer en el Home."
                : "Activa live para que tu tienda se descubra más fácil mientras muestras productos en tiempo real."}
            </p>
          </div>
        </div>

        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isLive ? "bg-red-50 text-red-600" : "bg-[#0F3D3A]/8 text-[#0F3D3A]",
          ].join(" ")}
        >
          <Zap className="h-5 w-5" />
        </div>
      </div>

      {isLive ? (
        <div className="rounded-xl border border-red-100 bg-white/80 px-4 py-3 text-sm text-neutral-700">
          <p className="font-medium text-neutral-900">Estás en vivo</p>
          <p className="mt-1 text-neutral-600">
            Tus seguidores han sido notificados.
            {startedLabel ? ` Live iniciado el ${startedLabel}.` : ""}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#0F3D3A]/12 bg-[#faf8f4] px-4 py-3 text-sm text-neutral-600">
          Cuando inicies live, podremos marcar tu tienda como activa sin salir del dashboard.
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={[
          "min-h-11 w-full rounded-xl",
          isLive
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-[#0F3D3A] text-white hover:bg-[#0c312f]",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : isLive ? (
          "Finalizar live"
        ) : (
          "Iniciar modo en vivo"
        )}
      </Button>
    </div>
  );

  if (variant === "plain") {
    return content;
  }

  return (
    <BaseCard
      className={[
        "rounded-xl border shadow-sm",
        isLive
          ? "border-red-200 bg-gradient-to-br from-[#fff7f6] via-white to-[#fff2f1]"
          : "border-[#0F3D3A]/10 bg-white",
      ].join(" ")}
      contentClassName="space-y-5"
    >
      {content}
    </BaseCard>
  );
}
