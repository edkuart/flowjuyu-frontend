"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Circle,
  Package,
  Camera,
  FileText,
  Share2,
  UserCheck,
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
import { hasSellerStoreBeenShared } from "@/lib/sellerEducation"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type { EstadoValidacion } // re-export for consumers

export interface SellerProgressCardProps {
  estadoValidacion: EstadoValidacion
  productos: {
    activo?: boolean
    descripcion?: string | null
    imagenes?: Array<{ url?: string | null }>
    imagen_url?: string | null
  }[]
  perfil: SellerPerfil | null
}

/* ──────────────────────────────────────────
   STEP → ICON MAP
────────────────────────────────────────── */

const STEP_ICONS: Record<string, React.ReactNode> = {
  profile: <UserCheck className="w-4 h-4" />,
  product: <Package   className="w-4 h-4" />,
  photos: <Camera className="w-4 h-4" />,
  description: <FileText className="w-4 h-4" />,
  share: <Share2 className="w-4 h-4" />,
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80">
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
          ? "opacity-65"
          : isNext
          ? "border border-[#0F3D3A]/15 bg-[linear-gradient(180deg,_rgba(15,61,58,0.08),_rgba(15,61,58,0.03))] hover:border-[#0F3D3A]/30"
          : "hover:bg-white/80"
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
  const [storeShared, setStoreShared] = useState(false)

  useEffect(() => {
    setStoreShared(hasSellerStoreBeenShared())
  }, [])

  const { steps, percentage, nextAction, nextHref } = getSellerProgress({
    estadoValidacion,
    productos,
    perfil,
    storeShared,
  })

  const completedCount = steps.filter(s => s.done).length

  /* Hide when fully activated */
  if (percentage === 100) return null

  return (
    <div className="seller-surface-card overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,246,240,0.94))] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)]">

      {/* ── Top accent: live gradient fill ── */}
      <div
        className="h-1.5 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, #0F3D3A ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />

      <div className="space-y-5 p-5">

        {/* ── HEADER ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold leading-tight text-neutral-800">
                Checklist del seller
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                {completedCount} de {steps.length} acciones completadas
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
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f1,_#fffbfb)] px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium leading-snug">
              Tu verificación fue rechazada. Por favor sube tus documentos nuevamente.
            </p>
          </div>
        )}

        {/* ── STEP LIST ── */}
        <div className="space-y-1.5">
          {steps.map((step, i) => {
            const isNext = !step.done && steps.slice(0, i).every(s => s.done)
            return <StepRow key={step.key} step={step} isNext={isNext} />
          })}
        </div>

        {/* ── NEXT STEP CTA ── */}
        {nextAction && nextHref && (
          <Link href={nextHref}>
            <div className="group flex cursor-pointer items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,var(--seller-accent),#164d49)] px-4 py-3 text-white shadow-[0_18px_36px_-24px_rgba(15,61,58,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[var(--seller-accent-strong)]">
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
