// src/components/product-edit/SectionCard.tsx
//
// Shared wrapper for every edit section.
// Provides consistent padding, border, save button, and status messages.
// Sections import this to avoid duplicating layout logic.

"use client"

import { CheckCircle2, AlertCircle, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SectionSaveState } from "@/types/product-edit"

interface SectionCardProps {
  title: string
  description?: string
  sectionState: SectionSaveState
  isSaving: boolean           // global lock
  onSave: () => void
  saveLabel?: string
  children: React.ReactNode
}

export function SectionCard({
  title,
  description,
  sectionState,
  isSaving,
  onSave,
  saveLabel = "Guardar",
  children,
}: SectionCardProps) {
  const isThisSection = sectionState.status === "saving"
  const isBlocked = isSaving && !isThisSection
  const isSuccess = sectionState.status === "success"

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <h2 className="font-semibold text-sm text-gray-800 tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Section body */}
      <div className="px-5 py-5 space-y-4">
        <fieldset disabled={isThisSection} className="space-y-4 border-none p-0 m-0">
          {children}
        </fieldset>

        {/* Status messages */}
        {sectionState.status === "error" && sectionState.error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{sectionState.error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Guardado correctamente</span>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-between pt-1">
          {isBlocked && (
            <p className="text-xs text-gray-400 italic">
              Esperando otra operación…
            </p>
          )}
          <div className="ml-auto">
            {isSuccess ? (
              <Button
                onClick={onSave}
                disabled={isSaving}
                size="sm"
                variant="outline"
                className="min-w-[120px] border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all duration-200 animate-in fade-in duration-300"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Guardado
              </Button>
            ) : isThisSection ? (
              <Button
                disabled
                size="sm"
                className="min-w-[120px] bg-[#0f2e22] text-white opacity-90 transition-all duration-150"
              >
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Guardando…
              </Button>
            ) : (
              <Button
                onClick={onSave}
                disabled={isSaving}
                size="sm"
                className="min-w-[120px] bg-[#0f2e22] hover:bg-[#184c37] active:bg-[#0a1f18] text-white transition-colors duration-150"
              >
                {saveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
