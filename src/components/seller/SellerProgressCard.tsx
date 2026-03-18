"use client"

import Link from "next/link"
import {
  CheckCircle2,
  Circle,
  UserCheck,
  ShieldCheck,
  Package,
  Sparkles,
  ArrowRight,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

import {
  getSellerProgress,
  type EstadoValidacion,
  type SellerPerfil,
  type SellerProgressStep,
} from "@/lib/sellerProgress"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type { EstadoValidacion } // re-export for consumers

export interface SellerProgressCardProps {
  estadoValidacion: EstadoValidacion
  productos: { activo?: boolean }[]
  perfil: SellerPerfil | null
}

/* ──────────────────────────────────────────
   STEP → ICON MAP
────────────────────────────────────────── */

const STEP_ICONS: Record<string, React.ReactNode> = {
  account: <Sparkles  className="w-4 h-4" />,
  profile: <UserCheck className="w-4 h-4" />,
  product: <Package   className="w-4 h-4" />,
  kyc:     <ShieldCheck className="w-4 h-4" />,
}

/* ──────────────────────────────────────────
   PROGRESS BAR
────────────────────────────────────────── */

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct === 100 ? "bg-emerald-500" :
    pct >= 75   ? "bg-[#0F3D3A]"  :
    pct >= 50   ? "bg-amber-500"   :
                  "bg-neutral-400"

  return (
    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────
   STEP ROW
────────────────────────────────────────── */

function StepRow({ step, isNext }: { step: SellerProgressStep; isNext: boolean }) {
  const icon = STEP_ICONS[step.key] ?? null

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all group ${
        step.done
          ? "opacity-60"
          : isNext
          ? "bg-[#0F3D3A]/5 border border-[#0F3D3A]/20 hover:border-[#0F3D3A]/40"
          : "hover:bg-neutral-50"
      }`}
    >
      {/* Status circle */}
      {step.done ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <Circle
          className={`w-5 h-5 flex-shrink-0 ${
            isNext ? "text-[#0F3D3A]" : "text-neutral-300"
          }`}
        />
      )}

      {/* Step icon */}
      <span
        className={`flex-shrink-0 ${
          step.done ? "text-neutral-300" : isNext ? "text-[#0F3D3A]" : "text-neutral-400"
        }`}
      >
        {icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-none ${
            step.done
              ? "text-neutral-400 line-through"
              : isNext
              ? "text-[#0F3D3A]"
              : "text-neutral-600"
          }`}
        >
          {step.label}
        </p>
        {!step.done && (
          <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
            {step.description}
          </p>
        )}
      </div>

      {/* "Siguiente" badge + chevron */}
      {isNext && !step.done && (
        <>
          <span className="hidden sm:inline-flex text-[10px] font-bold bg-[#0F3D3A] text-white px-2 py-0.5 rounded-full flex-shrink-0">
            Siguiente
          </span>
          <ChevronRight className="w-4 h-4 text-[#0F3D3A]/50 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </div>
  )

  /* Only the active "next" step is clickable */
  if (!step.done && isNext && step.href !== "#") {
    return (
      <Link href={step.href} className="block">
        {inner}
      </Link>
    )
  }

  return <div>{inner}</div>
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

export function SellerProgressCard({
  estadoValidacion,
  productos,
  perfil,
}: SellerProgressCardProps) {
  const { steps, percentage, nextAction, nextHref } = getSellerProgress({
    estadoValidacion,
    productos,
    perfil,
  })

  const completedCount = steps.filter(s => s.done).length

  /* Hide when fully activated */
  if (percentage === 100) return null

  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">

      {/* ── Top accent: live gradient fill ── */}
      <div
        className="h-1 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, #0F3D3A ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />

      <div className="p-5 space-y-5">

        {/* ── HEADER ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-800 leading-tight">
                Activa tu tienda
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {completedCount} de {steps.length} pasos completados
              </p>
            </div>
            <span
              className={`text-2xl font-black tabular-nums ${
                percentage === 100 ? "text-emerald-500" :
                percentage >= 50   ? "text-[#0F3D3A]"  :
                                     "text-neutral-500"
              }`}
            >
              {percentage}%
            </span>
          </div>

          <ProgressBar pct={percentage} />
        </div>

        {/* ── REJECTED VERIFICATION WARNING ── */}
        {estadoValidacion === "rechazado" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium leading-snug">
              Tu verificación fue rechazada. Por favor sube tus documentos nuevamente.
            </p>
          </div>
        )}

        {/* ── STEP LIST ── */}
        <div className="space-y-0.5">
          {steps.map((step, i) => {
            const isNext = !step.done && steps.slice(0, i).every(s => s.done)
            return <StepRow key={step.key} step={step} isNext={isNext} />
          })}
        </div>

        {/* ── NEXT STEP CTA ── */}
        {nextAction && nextHref && (
          <Link href={nextHref}>
            <div className="flex items-center gap-3 bg-[#0F3D3A] text-white rounded-xl px-4 py-3 hover:bg-[#0C2F2C] transition-colors group cursor-pointer">
              <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-none opacity-75">
                  Próximo paso recomendado
                </p>
                <p className="text-sm font-bold mt-0.5 leading-snug">
                  {nextAction}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        )}

      </div>
    </div>
  )
}
