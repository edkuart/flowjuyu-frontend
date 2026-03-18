// src/components/seller/SellerNextActionsCard.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Ordered list of up to 3 recommended next actions.

"use client"

import Link from "next/link"
import type { NextAction } from "@/lib/sellerPerformance"

/* ──────────────────────────────────────────
   PRIORITY CONFIG
────────────────────────────────────────── */

const PRIORITY_CONFIG = {
  high:   { dot: "bg-red-400",    num: "text-red-500" },
  medium: { dot: "bg-amber-400",  num: "text-amber-500" },
  low:    { dot: "bg-neutral-300", num: "text-neutral-400" },
} as const

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

interface Props {
  actions: NextAction[]
}

export function SellerNextActionsCard({ actions }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5 flex flex-col gap-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        Próximos pasos
      </p>

      {actions.length === 0 ? (
        <p className="text-sm text-neutral-400 italic">
          Sin acciones pendientes recomendadas.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {actions.map((action, idx) => {
            const cfg = PRIORITY_CONFIG[action.priority]
            return (
              <li key={action.href + idx} className="flex items-start gap-3">
                {/* Number */}
                <span
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border border-neutral-200
                    flex items-center justify-center
                    text-xs font-bold ${cfg.num}
                  `}
                >
                  {idx + 1}
                </span>

                {/* Label + link */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-sm text-neutral-700 font-medium leading-snug">
                    {action.label}
                  </p>
                  <Link href={action.href}>
                    <span
                      className="
                        inline-flex items-center text-xs font-semibold
                        text-[#0F3D3A] hover:underline
                      "
                    >
                      Ir ahora →
                    </span>
                  </Link>
                </div>

                {/* Priority dot */}
                <span className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${cfg.dot}`} />
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
