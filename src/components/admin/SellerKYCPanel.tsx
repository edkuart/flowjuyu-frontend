"use client"

import { useState, useMemo, useEffect } from "react"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Checklist {
  dpi_legible:     boolean
  selfie_coincide: boolean
  datos_coinciden: boolean
}

interface Props {
  sellerId:         number
  initialChecklist?: Partial<Checklist> | null
  automationBlocked?: boolean
  automationReason?: string | null
  automationReviewReasons?: string[]
  onRerunAutomation?: () => Promise<void> | void
  rerunLoading?: boolean
  onUpdated?:       () => void
}

// ── Labels ─────────────────────────────────────────────────────────────────────

const CHECK_LABELS: Record<keyof Checklist, { label: string; description: string }> = {
  dpi_legible:     { label: "DPI legible",            description: "The DPI number is 13 digits and clearly readable" },
  datos_coinciden: { label: "Documents present",      description: "Both DPI sides (front & back) are uploaded" },
  selfie_coincide: { label: "Selfie matches DPI",     description: "Selfie is present and appears to match the DPI holder" },
}

const EMPTY_CHECKLIST: Checklist = {
  dpi_legible:     false,
  selfie_coincide: false,
  datos_coinciden: false,
}

// ── Score helpers ──────────────────────────────────────────────────────────────

function computeScore(checks: Checklist): number {
  const passed = Object.values(checks).filter(Boolean).length
  return Math.round((passed / 3) * 100)
}

function scoreToRiesgo(score: number): "bajo" | "medio" | "alto" {
  if (score >= 80) return "bajo"
  if (score >= 50) return "medio"
  return "alto"
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SellerKYCPanel({
  sellerId,
  initialChecklist,
  automationBlocked = false,
  automationReason = null,
  automationReviewReasons = [],
  onRerunAutomation,
  rerunLoading = false,
  onUpdated,
}: Props) {
  const [checks,  setChecks]  = useState<Checklist>({ ...EMPTY_CHECKLIST, ...initialChecklist })
  const [loading, setLoading] = useState(false)

  // Sync when seller or checklist changes (e.g. after fetchDetail)
  useEffect(() => {
    setChecks({ ...EMPTY_CHECKLIST, ...initialChecklist })
  }, [initialChecklist, sellerId])

  const score  = useMemo(() => computeScore(checks), [checks])
  const riesgo = useMemo(() => scoreToRiesgo(score),  [score])

  const riesgoStyle =
    riesgo === "bajo"  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
    riesgo === "medio" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                         "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"

  const barColor =
    riesgo === "bajo"  ? "bg-green-500" :
    riesgo === "medio" ? "bg-yellow-400" :
                         "bg-red-500"

  const toggle = (key: keyof Checklist) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const saveReview = async () => {
    setLoading(true)
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/admin/sellers/${sellerId}/kyc-review`,
        { method: "PATCH", body: JSON.stringify({ kyc_checklist: checks }) }
      )
      if (!res.ok) throw new Error("Save failed")
      toast.success("KYC review saved")
      onUpdated?.()
    } catch {
      toast.error("Error saving KYC review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card">

      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">KYC Review</h2>
          <p className="text-xs text-muted-foreground">Manual identity verification — tick each item you have confirmed.</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riesgoStyle}`}>
          {riesgo === "bajo" ? "Low risk" : riesgo === "medio" ? "Medium risk" : "High risk"}
        </span>
      </div>

      <div className="p-4 space-y-5">

        {/* Checklist */}
        <ul className="space-y-2">
          {(Object.keys(EMPTY_CHECKLIST) as (keyof Checklist)[]).map((key) => {
            const { label, description } = CHECK_LABELS[key]
            const checked = checks[key]
            return (
              <li key={key}>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${checked
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                    : "border-border bg-background hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(key)}
                    className="mt-0.5 h-4 w-4 accent-green-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${checked ? "text-green-800 dark:text-green-300" : ""}`}>
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </label>
              </li>
            )
          })}
        </ul>

        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">KYC Score</span>
            <span className="font-bold tabular-nums">{score}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="text-yellow-600">50% medium</span>
            <span className="text-green-600">80% approved</span>
            <span>100%</span>
          </div>
        </div>

        {/* Auto-approval note */}
        {score >= 80 && !automationBlocked && (
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            Score meets approval threshold — saving will set this seller as approved.
          </div>
        )}

        {automationBlocked && (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <span className="font-semibold">Automatic verification has blocked approval</span>
            </div>
            <p>{automationReason || "The uploaded KYC images do not appear to be a valid DPI."}</p>
            {automationReviewReasons.length > 0 && (
              <p className="text-[11px] opacity-80">
                Signals: {automationReviewReasons.join(", ")}
              </p>
            )}
          </div>
        )}

        {onRerunAutomation && (
          <button
            onClick={() => void onRerunAutomation()}
            disabled={rerunLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted/40 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {rerunLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {rerunLoading ? "Re-running automation…" : "Re-run KYC Automation"}
          </button>
        )}

        {/* Save button */}
        <button
          onClick={saveReview}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Saving…" : "Save KYC Review"}
        </button>

      </div>
    </div>
  )
}
