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
  completionLabel?: string
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
  completionLabel,
  saveLabel = "Guardar",
  defaultExpanded = true,
  priority: _priority = "high",
  children,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const isThisSection = sectionState.status === "saving"
  const isBlocked     = isSaving && !isThisSection
  const isSuccess     = sectionState.status === "success"
  const isError       = sectionState.status === "error"

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#0f2e22]/8 bg-white shadow-[0_8px_28px_-18px_rgba(15,46,34,0.16)] transition-shadow duration-300 hover:shadow-[0_14px_38px_-22px_rgba(15,46,34,0.22)]"
      )}
    >
      <div className="h-[2px] bg-gradient-to-r from-[#0f2e22]/72 via-[#0f2e22]/18 to-transparent" />

      {/* ── Collapsible header ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-b border-[#0f2e22]/6 px-5 py-4 text-left transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f2e22]/30",
          "bg-white hover:bg-[#f7f6f2]"
        )}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold leading-none tracking-tight text-[#14231c]">
            {title}
          </h2>
          {description && expanded && (
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
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
          {!expanded && !isSuccess && !isError && !isThisSection && completionLabel && (
            <span
              className={cn(
                "text-[10px] font-medium",
                completionLabel === "Completo" ? "text-emerald-600" : "text-neutral-300"
              )}
            >
              {completionLabel}
            </span>
          )}
          {!expanded && !isSuccess && !isError && !isThisSection && !completionLabel && (
            <span className="text-[10px] font-medium text-neutral-300">
              Pendiente
            </span>
          )}
          {!expanded && isThisSection && (
            <Loader2 className="h-3 w-3 animate-spin text-neutral-300" />
          )}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-neutral-400 transition-transform duration-300 ease-out",
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
          <div className="space-y-3 px-5 py-5">

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
