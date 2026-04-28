"use client";

import Link from "next/link";
import { ExternalLink, Menu, Plus, Sparkles, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { SellerActionButton, SellerPill } from "@/components/seller/ui/SellerPrimitives";
import { fetchAiCreditsBalance } from "@/services/aiCredits";

type Props = {
  businessName?: string;
  status?: "activo" | "revision" | "inactivo" | "suspendido";
  storeHref?: string;
  onOpenSidebar?: () => void;
  currentSection?: string;
  currentDescription?: string;
};

export default function SellerTopbar({
  businessName = "Mi negocio",
  status = "activo",
  storeHref = "/",
  onOpenSidebar,
  currentSection = "Resumen",
  currentDescription = "Tu espacio central de operacion.",
}: Props) {
  const [aiBalance, setAiBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchAiCreditsBalance()
      .then(setAiBalance)
      .catch(() => {});
  }, []);

  const statusTone =
    status === "activo"
      ? "success"
      : status === "revision"
        ? "warning"
        : status === "suspendido"
          ? "danger"
          : "neutral";

  return (
    <div className="border-b border-[var(--seller-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(252,251,248,0.92))] px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--seller-radius-xl)] border border-[var(--seller-line-strong)] bg-white/86 px-3 text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]"
            aria-label="Abrir navegación"
          >
            <Menu className="h-5 w-5" />
            <span className="hidden text-sm font-medium lg:inline">Navegación</span>
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--seller-radius-xl)] border border-[var(--seller-line)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] text-[var(--seller-accent)]">
            <Store className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--seller-faint-text)]">
              Espacio Seller
            </p>
            <h1 className="text-lg font-semibold text-[var(--seller-ink)]">
              {businessName}
            </h1>
            <p className="text-sm text-[var(--seller-muted)]">
              <span className="font-medium text-[var(--seller-ink)]">{currentSection}</span>
              {" · "}
              {currentDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {aiBalance !== null && (
            <Link
              href="/seller/ai-credits"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--seller-line-strong)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] px-3 py-2 text-sm font-semibold text-[var(--seller-accent)] transition hover:bg-[color:color-mix(in_srgb,var(--seller-accent)_12%,white)]"
              title="Créditos IA disponibles"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {aiBalance} cr
            </Link>
          )}
          <SellerPill tone={statusTone as "success" | "warning" | "danger" | "neutral"}>
            Negocio {status}
          </SellerPill>
          <Link
            href={storeHref}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--seller-line-strong)] px-3 py-2 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
          >
            <ExternalLink className="w-4 h-4" />
            Ver tienda pública
          </Link>
          <Link href="/seller/products/new">
            <SellerActionButton className="px-3 py-2 text-sm">
              <Plus className="w-4 h-4" />
              Nuevo producto
            </SellerActionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
