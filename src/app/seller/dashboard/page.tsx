"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Package,
  ShieldCheck,
  Store,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { SellerProgressCard } from "@/components/seller/SellerProgressCard";
import { BaseCard } from "@/components/ui/BaseCard";
import { BaseSection } from "@/components/ui/BaseSection";
import { BaseSectionHeading } from "@/components/ui/BaseSectionHeading";
import { Button } from "@/components/ui/button";
import type { SellerPerfil } from "@/lib/sellerProgress";
import {
  getSellerOnboardingSummary,
  isSellerOnboardingComplete,
  type SellerOnboardingState,
} from "@/lib/sellerOnboarding";

type SellerProduct = {
  activo?: boolean;
  descripcion?: string | null;
  imagenes?: Array<{ url?: string | null }>;
  imagen_url?: string | null;
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
    ],
    [
      onboardingIncomplete,
      sellerProducts.length,
      sellerProfile?.nombre_comercio,
    ],
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 bg-[#f6f1e8] px-4 py-8">
      {loading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-[28px] bg-white/70" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-3xl bg-white/70"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <BaseSection>
            <BaseCard
              className="border border-[#0F3D3A]/10 bg-gradient-to-br from-[#0F3D3A] via-[#14544f] to-[#1b6b63] text-white"
              contentClassName="space-y-5"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                  Seller dashboard
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Un home limpio para operar tu negocio
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-white/80">
                  Desde aqui puedes continuar onboarding cuando aplique, revisar
                  metricas en su propio modulo y entrar a las vistas operativas
                  sin mezclar responsabilidades.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={
                    onboardingIncomplete
                      ? "/seller/onboarding"
                      : "/seller/metrics"
                  }
                >
                  <Button className="min-h-10 bg-white text-[#0F3D3A] hover:bg-neutral-100">
                    {onboardingIncomplete
                      ? "Continuar activacion"
                      : "Abrir metricas"}
                  </Button>
                </Link>
                <Link href="/seller/my-business">
                  <Button
                    variant="outline"
                    className="min-h-10 border-white/30 bg-white/10 text-white hover:bg-white/15"
                  >
                    Ver mi tienda
                  </Button>
                </Link>
              </div>
            </BaseCard>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow={onboardingSummary.label}
              title={onboardingSummary.title}
              description={onboardingSummary.description}
            />
            <div className="space-y-4">
              <SellerProgressCard
                estadoValidacion={sellerValidation}
                productos={sellerProducts}
                perfil={sellerProfile}
              />
            </div>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Modulos"
              title="Cada experiencia en su propia ruta"
              description="Onboarding, metricas y operacion diaria conviven sin secuestrarse entre si."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <BaseCard
                    key={card.title}
                    hover
                    contentClassName="flex h-full flex-col gap-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
                      <Icon className="h-5 w-5 text-[#0F3D3A]" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
                        {card.title}
                      </p>
                      <h2 className="text-2xl font-semibold text-neutral-900">
                        {card.value}
                      </h2>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {card.description}
                      </p>
                    </div>
                    <div className="pt-1">
                      <Link href={card.href}>
                        <Button
                          variant="outline"
                          className="min-h-10 w-full justify-between"
                        >
                          {card.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </BaseCard>
                );
              })}
            </div>
          </BaseSection>

          <BaseSection>
            <BaseCard contentClassName="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Estado de acceso seller
                </div>
                <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
                  El onboarding se decide por estado explicito y el acceso a
                  modulos se resuelve por rutas dedicadas. Entrar a metricas ya
                  no dispara redirecciones silenciosas.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/seller/account">
                  <Button variant="outline" className="min-h-10 px-4">
                    Cuenta y seguridad
                  </Button>
                </Link>
                <Link href="/seller/metrics">
                  <Button className="min-h-10 px-4">Ver metricas reales</Button>
                </Link>
              </div>
            </BaseCard>
          </BaseSection>
        </>
      )}
    </main>
  );
}
