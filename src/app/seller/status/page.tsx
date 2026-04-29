"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock, CheckCircle2, AlertCircle, Shield, RefreshCw,
  LifeBuoy, LogOut, ChevronRight, Loader2,
} from "lucide-react";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { useAuth } from "@/context/AuthContext";

type Estado = "pendiente" | "en_revision" | "aprobado" | "inactivo" | "suspendido" | null;

// Refresca el estado cada 30 segundos para capturar cuando el admin aprueba
const REFRESH_INTERVAL_MS = 30_000;

function StatusIcon({ estado }: { estado: Estado }) {
  if (estado === "suspendido")
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-500">
        <AlertCircle className="h-10 w-10" />
      </div>
    );
  if (estado === "inactivo")
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
        <Shield className="h-10 w-10" />
      </div>
    );
  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-[color:color-mix(in_srgb,var(--seller-accent)_12%,white)] text-[var(--seller-accent)]">
      <Clock className="h-10 w-10" />
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
        <span className="h-2.5 w-2.5 animate-ping rounded-full bg-white opacity-75" />
      </span>
    </div>
  );
}

function StatusTitle({ estado }: { estado: Estado }) {
  if (estado === "suspendido") return "Cuenta suspendida";
  if (estado === "inactivo") return "Cuenta pendiente de activación";
  if (estado === "en_revision") return "Tu solicitud está en revisión";
  return "Revisando tu solicitud";
}

function StatusDescription({ estado }: { estado: Estado }) {
  if (estado === "suspendido")
    return "Tu cuenta fue suspendida por el equipo de Flowjuyu. Contacta a soporte para conocer el motivo y resolver la situación.";
  if (estado === "inactivo")
    return "Tu perfil fue verificado pero el equipo de Flowjuyu aún no ha activado tu cuenta. Te notificaremos en cuanto esté lista.";
  if (estado === "en_revision")
    return "Recibimos tu información y la estamos revisando. Este proceso suele tomar entre 1 y 3 días hábiles.";
  return "Recibimos tu información y la estamos revisando. Este proceso suele tomar entre 1 y 3 días hábiles. Te avisaremos por correo cuando esté aprobada.";
}

const STEPS = [
  { id: "enviado", label: "Información enviada", description: "Recibimos tu perfil y documentos." },
  { id: "revision", label: "En revisión", description: "El equipo de Flowjuyu está verificando tu solicitud." },
  { id: "aprobado", label: "Cuenta activa", description: "Empieza a vender en Flowjuyu." },
];

function ReviewTimeline({ estado }: { estado: Estado }) {
  const currentStep =
    estado === "en_revision" ? 1 :
    estado === "aprobado" ? 2 :
    0;

  return (
    <div className="relative space-y-0">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition
                ${done ? "border-[var(--seller-accent)] bg-[var(--seller-accent)] text-white" :
                  active ? "border-[var(--seller-accent)] bg-white text-[var(--seller-accent)]" :
                  "border-[var(--seller-line)] bg-white text-[var(--seller-faint-text)]"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mt-1 w-0.5 flex-1 ${done ? "bg-[var(--seller-accent)]" : "bg-[var(--seller-line)]"}`}
                  style={{ minHeight: 32 }} />
              )}
            </div>
            <div className="pb-6 pt-1">
              <p className={`text-sm font-semibold ${active ? "text-[var(--seller-ink)]" : done ? "text-[var(--seller-accent)]" : "text-[var(--seller-faint-text)]"}`}>
                {step.label}
                {active && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">En curso</span>}
              </p>
              <p className="mt-0.5 text-xs text-[var(--seller-muted)]">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SellerStatusPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [estado, setEstado] = useState<Estado>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStatus(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await apiGetVendedorPerfil();
      if (!res?.ok || !res.perfil) return;
      const perfil = res.perfil;
      setBusinessName(perfil.nombre_comercio ?? "");
      const ev = perfil.estado_validacion as string;
      const ea = perfil.estado_admin as string;

      if (ea === "suspendido") { setEstado("suspendido"); return; }
      if (ea === "inactivo") { setEstado("inactivo"); return; }
      if (ev === "aprobado" && ea === "activo") {
        router.replace("/seller/dashboard");
        return;
      }
      if (ev === "rechazado") {
        router.replace("/seller/kyc-retry");
        return;
      }
      setEstado(ev === "en_revision" ? "en_revision" : "pendiente");
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(() => loadStatus(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--seller-faint-text)]" />
      </div>
    );

  const isSuspended = estado === "suspendido";
  const isInactive = estado === "inactivo";
  const isInReview = estado === "en_revision" || estado === "pendiente";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f5ef] px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Main card */}
        <div className="rounded-[28px] border border-[var(--seller-line)] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,61,58,0.14)] space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <StatusIcon estado={estado} />
            <div className="space-y-2">
              {businessName && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--seller-faint-text)]">
                  {businessName}
                </p>
              )}
              <h1 className="text-xl font-semibold text-[var(--seller-ink)]">
                {StatusTitle({ estado })}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--seller-muted)]">
                {StatusDescription({ estado })}
              </p>
            </div>
          </div>

          {/* Timeline — only for review/pending states */}
          {isInReview && (
            <div className="border-t border-[var(--seller-line)] pt-5">
              <ReviewTimeline estado={estado} />
            </div>
          )}

          {/* Suspended message */}
          {isSuspended && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Si crees que esto es un error o quieres apelar la suspensión, contacta a nuestro equipo de soporte y menciona el nombre de tu tienda.
            </div>
          )}

          {/* Inactive message */}
          {isInactive && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Tu cuenta está verificada. El equipo de Flowjuyu la activará pronto. Si llevas más de 3 días esperando, contáctanos.
            </div>
          )}

          {/* Auto refresh indicator */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--seller-faint-text)]">
            {refreshing
              ? <><Loader2 className="h-3 w-3 animate-spin" /> Verificando estado…</>
              : <><RefreshCw className="h-3 w-3" /> Se actualiza automáticamente</>}
          </div>
        </div>

        {/* Actions */}
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
                <p className="text-sm font-semibold text-[var(--seller-ink)]">Contactar soporte</p>
                <p className="text-xs text-[var(--seller-muted)]">Respuesta en menos de 24 horas</p>
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
