"use client"

import { CheckCircle2, Circle, ArrowRight, Package, ImageIcon, FileText, Zap } from "lucide-react"
import Link from "next/link"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

type Producto = {
  id: string
  nombre: string
  descripcion?: string
  activo: boolean
  imagenes?: string[]
  imagen_url?: string | null
}

interface CheckItem {
  id: string
  label: string
  description: string
  done: boolean
  href: string
  icon: React.ReactNode
}

/* ──────────────────────────────────────────
   PROGRESS RING (SVG)
────────────────────────────────────────── */

function ProgressRing({ pct }: { pct: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width="56" height="56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={pct === 100 ? "#22c55e" : "#f97316"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
    </svg>
  )
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function SellerActivationChecklist({
  productos,
}: {
  productos: Producto[]
}) {
  const hasProducts    = productos.length > 0
  const hasPublished   = productos.some(p => p.activo)
  const hasImages      = productos.some(p => (p.imagenes?.length ?? 0) > 0 || !!p.imagen_url)
  const hasDescription = productos.some(p => (p.descripcion?.trim().length ?? 0) >= 30)

  const firstProductId = productos[0]?.id
  const editHref = firstProductId
    ? `/seller/productos/${firstProductId}/editar`
    : "/seller/products/new"

  const checks: CheckItem[] = [
    {
      id:          "product",
      label:       "Crear tu primer producto",
      description: "Agrega nombre, precio y descripción.",
      done:        hasProducts,
      href:        "/seller/products/new",
      icon:        <Package className="w-4 h-4" />,
    },
    {
      id:          "image",
      label:       "Agregar al menos 1 foto",
      description: "Productos con fotos reciben 3× más visitas.",
      done:        hasImages,
      href:        editHref,
      icon:        <ImageIcon className="w-4 h-4" />,
    },
    {
      id:          "description",
      label:       "Completar la descripción",
      description: "Describe materiales, técnica y qué lo hace especial.",
      done:        hasDescription,
      href:        editHref,
      icon:        <FileText className="w-4 h-4" />,
    },
    {
      id:          "publish",
      label:       "Publicar tu producto",
      description: "Hazlo visible para todos los compradores.",
      done:        hasPublished,
      href:        editHref,
      icon:        <Zap className="w-4 h-4" />,
    },
  ]

  const completedCount = checks.filter(c => c.done).length
  const pct = Math.round((completedCount / checks.length) * 100)

  // Fully activated — hide component
  if (pct === 100) return null

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

      <div className="p-6 space-y-5">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-neutral-800">
              {pct}%
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800 leading-tight">
              Activa tu tienda
            </h2>
            <p className="text-sm text-neutral-400 mt-0.5">
              {completedCount} de {checks.length} pasos completados —{" "}
              {pct < 50
                ? "¡Vamos, ya casi empiezas!"
                : pct < 100
                ? "¡Casi listo, sigue así!"
                : "¡Tienda activada!"}
            </p>
          </div>
        </div>

        {/* CHECKLIST */}
        <div className="space-y-1">
          {checks.map((check, i) => {
            const isNext = !check.done && checks.slice(0, i).every(c => c.done)

            return (
              <Link
                key={check.id}
                href={check.done ? "#" : check.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all group ${
                  check.done
                    ? "cursor-default"
                    : isNext
                    ? "bg-orange-50 border border-orange-200 hover:border-orange-300"
                    : "hover:bg-neutral-50"
                }`}
                onClick={e => check.done && e.preventDefault()}
              >
                {/* Status */}
                {check.done ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle
                    className={`w-5 h-5 flex-shrink-0 ${
                      isNext ? "text-orange-400" : "text-neutral-300"
                    }`}
                  />
                )}

                {/* Icon */}
                <span
                  className={`flex-shrink-0 ${
                    check.done
                      ? "text-neutral-300"
                      : isNext
                      ? "text-orange-500"
                      : "text-neutral-400"
                  }`}
                >
                  {check.icon}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-none ${
                      check.done
                        ? "text-neutral-400 line-through"
                        : isNext
                        ? "text-orange-700"
                        : "text-neutral-600"
                    }`}
                  >
                    {check.label}
                  </p>
                  {!check.done && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {check.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                {!check.done && (
                  <ArrowRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isNext ? "text-orange-400" : "text-neutral-300"
                    }`}
                  />
                )}

                {/* "Siguiente" tag */}
                {isNext && (
                  <span className="hidden sm:inline-flex text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                    Siguiente
                  </span>
                )}
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
