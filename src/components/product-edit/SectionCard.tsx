// src/components/product-edit/SectionCard.tsx
//
// Shared wrapper for every edit section.
// Collapsible, with a priority system that controls visual weight.
// High-priority sections feel more prominent; low-priority feel secondary.

"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Loader2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SectionSaveState } from "@/types/product-edit"

interface SectionCardProps {
  title: string
  description?: string
  sectionState: SectionSaveState
  isSaving: boolean
  onSave: () => void
  saveLabel?: string
  defaultExpanded?: boolean
  priority?: "high" | "low"
  children: React.ReactNode
}

export function SectionCard({
  title,
  description,
  sectionState,
  isSaving,
  onSave,
  saveLabel = "Guardar",
  defaultExpanded = true,
  priority = "high",
  children,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const isThisSection = sectionState.status === "saving"
  const isBlocked     = isSaving && !isThisSection
  const isSuccess     = sectionState.status === "success"
  const isError       = sectionState.status === "error"
  const isLow         = priority === "low"

  return (
    <section
      className={cn(
        "bg-white rounded-xl overflow-hidden transition-shadow duration-300",
        isLow
          ? "border border-gray-100 shadow-[0_1px_4px_-2px_rgba(0,0,0,0.05)]"
          : "border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.10)]"
      )}
    >
      {/* High-priority accent stripe */}
      {!isLow && (
        <div className="h-[2px] bg-gradient-to-r from-[#0f2e22]/70 via-[#0f2e22]/20 to-transparent" />
      )}

      {/* ── Collapsible header ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "w-full text-left flex items-center justify-between gap-3 px-4 py-3",
          "border-b transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f2e22]/30",
          isLow
            ? "border-gray-100/60 bg-gray-50/30 hover:bg-gray-50/60"
            : "border-gray-100 bg-transparent hover:bg-gray-50/40"
        )}
      >
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              "font-semibold leading-none tracking-tight",
              isLow ? "text-xs text-gray-400" : "text-[13px] text-gray-900"
            )}
          >
            {title}
          </h2>
          {description && expanded && (
            <p
              className={cn(
                "mt-1 leading-relaxed",
                isLow ? "text-[11px] text-gray-300" : "text-xs text-gray-400"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right slot: status indicators + chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!expanded && isSuccess && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 leading-none">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Guardado
            </span>
          )}
          {!expanded && isError && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full px-2 py-0.5 leading-none">
              <AlertCircle className="w-2.5 h-2.5" />
              Error
            </span>
          )}
          {!expanded && !isSuccess && !isError && !isThisSection && (
            <span className="text-[10px] text-gray-300 font-medium">
              Pendiente
            </span>
          )}
          {!expanded && isThisSection && (
            <Loader2 className="w-3 h-3 text-gray-300 animate-spin" />
          )}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-300 ease-out",
              isLow ? "text-gray-300" : "text-gray-400",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* ── Collapsible body ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 space-y-3">

            {/* Fields — disabled while this section is saving */}
            <fieldset disabled={isThisSection} className="space-y-3 border-none p-0 m-0">
              {children}
            </fieldset>

            {/* Error message */}
            {isError && sectionState.error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span className="text-[13px]">{sectionState.error}</span>
              </div>
            )}

            {/* Success message */}
            {isSuccess && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span className="text-[13px] font-medium">Cambios guardados</span>
              </div>
            )}

            {/* Save row */}
            <div className="flex items-center justify-between pt-0.5">
              {isBlocked && (
                <p className="text-[11px] text-gray-300 italic">Esperando…</p>
              )}
              <div className="ml-auto">
                {isSuccess ? (
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    size="sm"
                    variant="outline"
                    className="min-w-[96px] h-8 text-[12px] border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  >
                    <Check className="w-3 h-3 mr-1.5" />
                    Guardado
                  </Button>
                ) : isThisSection ? (
                  <Button
                    disabled
                    size="sm"
                    className="min-w-[96px] h-8 text-[12px] bg-[#0f2e22]/80 text-white cursor-not-allowed"
                  >
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Guardando…
                  </Button>
                ) : (
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    size="sm"
                    className="min-w-[96px] h-8 text-[12px] bg-[#0f2e22] hover:bg-[#184c37] active:bg-[#0a1f18] text-white transition-colors duration-150 shadow-sm"
                  >
                    {saveLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
