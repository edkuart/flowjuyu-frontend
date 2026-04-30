"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { SellerProgressCard } from "@/components/seller/SellerProgressCard";
import { MarketingOptInNudge } from "@/components/consent/MarketingOptInNudge";
import type { SellerPerfil } from "@/lib/sellerProgress";
import {
  getSellerOnboardingSummary,
  isSellerOnboardingComplete,
  type SellerOnboardingState,
} from "@/lib/sellerOnboarding";

type SellerProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  activo?: boolean;
  descripcion?: string | null;
  imagenes?: Array<{ url?: string | null }>;
  imagen_url?: string | null;
  internal_code?: string | null;
};

export default function SellerDashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerPerfil | null>(null);
  const [sellerValidation, setSellerValidation] = useState<
    "pendiente" | "en_revision" | "aprobado" | "rechazado" | null
  >(null);
  const [onboardingState, setOnboardingState] =
    useState<SellerOnboardingState | null>(null);
  const [aiBalance, setAiBalance] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [onboardingRes, profileRes, productsRes] = await Promise.all([
          apiFetch("/api/seller/onboarding/status").catch(() => null),
          apiGetVendedorPerfil().catch(() => null),
          apiFetch("/api/seller/products")
            .then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json().catch(() => []);
              return Array.isArray(data) ? data : data.data || [];
            })
            .catch(() => []),
        ]);

        if (onboardingRes?.ok) {
          const onboardingData = await onboardingRes.json();
          setOnboardingState(onboardingData?.onboarding_state ?? null);
        }

        if (profileRes?.ok && profileRes.perfil) {
          setSellerProfile(profileRes.perfil);
          setSellerValidation(
            (profileRes.perfil.estado_validacion as
              | "pendiente"
              | "en_revision"
              | "aprobado"
              | "rechazado"
              | null) ?? null,
          );
        }

        setSellerProducts(productsRes);

        apiFetch("/api/seller/ai-credits/balance")
          .then((r) => r.json())
          .then((d) => setAiBalance(d.balance ?? null))
          .catch(() => {});
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const onboardingSummary = getSellerOnboardingSummary(onboardingState);
  const onboardingIncomplete = !isSellerOnboardingComplete(onboardingState);

  const summaryCards = useMemo(
    () => [
      {
        title: "Onboarding",
        value: onboardingIncomplete ? "Pendiente" : "Listo",
        description: onboardingIncomplete
          ? "La activacion inicial sigue abierta, pero ya no invade otras rutas."
          : "La tienda ya paso la configuracion inicial y puede operar con normalidad.",
        href: "/seller/onboarding",
        cta: onboardingIncomplete ? "Continuar" : "Revisar",
        icon: ClipboardList,
      },
      {
        title: "Catalogo",
        value: `${sellerProducts.length}`,
        description:
          sellerProducts.length === 0
            ? "Todavia no tienes productos. Publica el primero para empezar a generar senales."
            : "Administra tu catalogo y detecta rapido si necesitas reforzar fotos o descripciones.",
        href:
          sellerProducts.length === 0
            ? "/seller/products/new"
            : "/seller/products",
        cta: sellerProducts.length === 0 ? "Crear producto" : "Gestionar",
        icon: Package,
      },
      {
        title: "Mi tienda",
        value: sellerProfile?.nombre_comercio?.trim() ? "Activa" : "Incompleta",
        description: sellerProfile?.nombre_comercio?.trim()
          ? "Tu perfil comercial vive separado del dashboard y mantiene su propia experiencia."
          : "Completa la informacion esencial de tu negocio para inspirar confianza.",
        href: "/seller/my-business",
        cta: "Abrir tienda",
        icon: Store,
      },
      {
        title: "Metricas",
        value: "Ruta propia",
        description:
          "La analitica del seller ahora vive en /seller/metrics y no redirige a onboarding por falta de activacion.",
        href: "/seller/metrics",
        cta: "Ver metricas",
        icon: BarChart3,
      },
      {
        title: "Créditos IA",
        value: aiBalance !== null ? `${aiBalance} cr` : "—",
        description:
          aiBalance !== null && aiBalance < 10
            ? "Saldo bajo. Recarga créditos para usar generación de canvas, captions y más funciones IA."
            : "Usa créditos para generar canvas, captions de producto y otras funciones de IA.",
        href: "/seller/ai-credits",
        cta: aiBalance !== null && aiBalance < 10 ? "Recargar" : "Ver créditos",
        icon: Sparkles,
      },
    ],
    [
      onboardingIncomplete,
      sellerProducts.length,
      sellerProfile?.nombre_comercio,
      aiBalance,
    ],
  );

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-3xl bg-white/70" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="h-48 animate-pulse rounded-3xl bg-white/70" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D3A] via-[#14544f] to-[#1b6b63] p-6 text-white sm:p-8">
              <p className="text-[10px] font-bold tracking-[0.22em] text-white/60 uppercase">
                Seller Dashboard · Flowjuyu
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl sm:leading-tight">
                {sellerProfile?.nombre_comercio?.trim()
                  ? sellerProfile.nombre_comercio
                  : "Tu panel de control"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                Gestiona tu catálogo, revisa métricas y administra tu tienda desde un solo lugar.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={onboardingIncomplete ? "/seller/onboarding" : "/seller/metrics"}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-[#0F3D3A] transition hover:bg-white/90 active:scale-[0.99]"
                >
                  <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#0F3D3A]/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {onboardingIncomplete ? "Continuar activación" : "Abrir métricas"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/seller/my-business"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Ver mi tienda
                </Link>
              </div>
            </div>

            {/* Marketing nudge */}
            <MarketingOptInNudge
              promptKey="seller_marketing_email_dashboard"
              eligible={sellerProducts.length > 0}
              eyebrow="Crecimiento opcional"
              title="Recibe ideas y oportunidades para mover mejor tu tienda"
              description="Activa correos promocionales solo si te aportan valor: lanzamientos, campañas destacadas y consejos concretos para mejorar conversión."
              bullets={[
                "Novedades relevantes del marketplace para sellers activos.",
                "Consejos prácticos cuando Flowjuyu detecta oportunidades de visibilidad.",
                "Promociones o iniciativas que pueden ayudarte a vender más.",
              ]}
              settingsHref="/seller/account"
              surface="seller_dashboard"
            />

            {/* Progress section */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
                  {onboardingSummary.label}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--seller-ink)]">
                  {onboardingSummary.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--seller-muted)]">
                  {onboardingSummary.description}
                </p>
              </div>
              <SellerProgressCard
                estadoValidacion={sellerValidation}
                productos={sellerProducts}
                perfil={sellerProfile}
              />
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
                  Módulos
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--seller-ink)]">
                  Cada experiencia en su propia ruta
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="flex flex-col gap-4 rounded-3xl border border-[var(--seller-line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--seller-accent)]/20 hover:shadow-[0_24px_48px_-28px_rgba(15,61,58,0.2)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--seller-faint-text)] uppercase">
                          {card.title}
                        </p>
                        <h3 className="text-xl font-bold text-[var(--seller-ink)]">
                          {card.value}
                        </h3>
                        <p className="text-xs leading-relaxed text-[var(--seller-muted)]">
                          {card.description}
                        </p>
                      </div>
                      <Link
                        href={card.href}
                        className="flex items-center justify-between rounded-2xl border border-[var(--seller-line-strong)] px-4 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                      >
                        {card.cta}
                        <ArrowRight className="h-4 w-4 text-[var(--seller-muted)]" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status footer */}
            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--seller-line)] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--seller-ink)]">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Estado de acceso seller
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--seller-muted)]">
                  El acceso a módulos se resuelve por rutas dedicadas. Métricas y operación
                  diaria conviven sin interferencias.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/seller/account"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--seller-line-strong)] px-4 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  Cuenta y seguridad
                </Link>
                <Link
                  href="/seller/metrics"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  Ver métricas reales
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
