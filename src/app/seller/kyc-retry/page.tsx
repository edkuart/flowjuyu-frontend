"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, FileCheck, ChevronRight, LifeBuoy, LogOut,
  ArrowRight, CheckCircle2, Loader2, RefreshCw,
} from "lucide-react";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { useAuth } from "@/context/AuthContext";

const COMMON_REASONS = [
  {
    title: "Información incompleta",
    description: "Faltan datos clave como nombre legal, dirección o documentos de identidad.",
  },
  {
    title: "Documentos ilegibles",
    description: "Las imágenes subidas no tienen suficiente calidad o están cortadas.",
  },
  {
    title: "Datos no coinciden",
    description: "El nombre en el perfil no coincide con los documentos enviados.",
  },
  {
    title: "Actividad no permitida",
    description: "El tipo de productos o actividad descrita no está permitida en la plataforma.",
  },
];

const STEPS_TO_RETRY = [
  "Revisa el correo que recibiste de Flowjuyu — puede incluir el motivo específico.",
  "Actualiza tu información de perfil asegurándote de que todos los campos estén completos.",
  "Si subiste documentos, asegúrate de que sean legibles, en formato JPG/PNG y sin texto cortado.",
  "Contacta a soporte si necesitas aclaración antes de reenviar.",
];

export default function SellerKycRetryPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [businessName, setBusinessName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    apiGetVendedorPerfil()
      .then((res) => {
        if (!res?.ok || !res.perfil) return;
        const perfil = res.perfil;
        setBusinessName(perfil.nombre_comercio ?? "");
        // If status changed (admin re-opened), redirect appropriately
        if (perfil.estado_validacion === "aprobado" && perfil.estado_admin === "activo") {
          router.replace("/seller/dashboard");
        } else if (perfil.estado_validacion !== "rechazado") {
          router.replace("/seller/status");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCheckStatus() {
    setCheckingStatus(true);
    try {
      const res = await apiGetVendedorPerfil();
      if (!res?.ok || !res.perfil) return;
      const perfil = res.perfil;
      if (perfil.estado_validacion === "aprobado" && perfil.estado_admin === "activo") {
        router.replace("/seller/dashboard");
      } else if (perfil.estado_validacion === "pendiente" || (perfil.estado_validacion as string) === "en_revision") {
        router.replace("/seller/status");
      }
    } catch {}
    finally { setCheckingStatus(false); }
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--seller-faint-text)]" />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#f8f5ef] px-4 py-12">
      <div className="w-full max-w-lg space-y-5">

        {/* Header card */}
        <div className="rounded-[28px] border border-red-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(220,38,38,0.12)] space-y-5">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              {businessName && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--seller-faint-text)]">
                  {businessName}
                </p>
              )}
              <h1 className="text-xl font-semibold text-[var(--seller-ink)]">
                Solicitud no aprobada
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--seller-muted)]">
                Tu solicitud para operar en Flowjuyu no pudo ser aprobada en esta revisión. Puedes actualizar tu información y solicitar una nueva revisión.
              </p>
            </div>
          </div>

          {/* Check status button */}
          <button
            onClick={handleCheckStatus}
            disabled={checkingStatus}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--seller-line)] bg-[var(--seller-panel)] py-3 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-white disabled:opacity-60"
          >
            {checkingStatus
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verificando…</>
              : <><RefreshCw className="h-3.5 w-3.5" /> Verificar estado actual</>}
          </button>
        </div>

        {/* Common reasons */}
        <div className="rounded-[24px] border border-[var(--seller-line)] bg-white p-6 shadow-[var(--seller-shadow-panel)]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            Razones frecuentes de rechazo
          </p>
          <div className="space-y-3">
            {COMMON_REASONS.map((r) => (
              <div key={r.title} className="flex gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                  <AlertCircle className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--seller-ink)]">{r.title}</p>
                  <p className="text-xs text-[var(--seller-muted)]">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to do */}
        <div className="rounded-[24px] border border-[var(--seller-line)] bg-white p-6 shadow-[var(--seller-shadow-panel)]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            Pasos para reintentarlo
          </p>
          <div className="space-y-3.5">
            {STEPS_TO_RETRY.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[11px] font-bold text-[var(--seller-accent)]">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-[var(--seller-muted)]">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--seller-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FileCheck className="h-4 w-4" />
              Actualizar mi perfil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-[24px] border border-[var(--seller-line)] bg-white p-6 shadow-[var(--seller-shadow-panel)]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            ¿Qué pasa después de actualizar?
          </p>
          <div className="space-y-3">
            {[
              "Tu información se envía automáticamente para una nueva revisión.",
              "El equipo de Flowjuyu la revisará en 1-3 días hábiles.",
              "Te notificaremos por correo con el resultado.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--seller-accent)]" />
                <p className="text-sm text-[var(--seller-muted)]">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-2">
          <Link
            href="/seller/tickets"
            className="flex items-center justify-between rounded-2xl border border-[var(--seller-line)] bg-white px-5 py-4 transition hover:border-[var(--seller-line-strong)] hover:shadow-sm"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
                <LifeBuoy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--seller-ink)]">Hablar con soporte</p>
                <p className="text-xs text-[var(--seller-muted)]">Aclara el motivo antes de reenviar</p>
              </div>
            </span>
            <ChevronRight className="h-4 w-4 text-[var(--seller-faint-text)]" />
          </Link>

          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--seller-line)] bg-white px-5 py-4 text-sm text-[var(--seller-muted)] transition hover:border-[var(--seller-line-strong)] hover:text-[var(--seller-ink)]"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        <p className="text-center text-[11px] text-[var(--seller-faint-text)]">
          Flowjuyu © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
