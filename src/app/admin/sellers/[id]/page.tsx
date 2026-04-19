"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import SellerKYCPanel from "@/components/admin/SellerKYCPanel"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${API_URL}${url}`
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuditEvent {
  id: number
  action: string
  comment: string | null
  performed_by: number
  created_at: string
  metadata?: Record<string, unknown>
}

interface TimelineItem {
  type: "registration" | "audit" | "product_activity"
  label: string
  date: string
  comment?: string | null
}

interface Insight {
  type: string
  message: string
  severity: "info" | "warning" | "critical"
}

interface Alert {
  type: string
  message: string
  level: "info" | "warning" | "critical"
}

interface SellerDetail {
  id: number
  user_id: number
  nombre_comercio: string
  descripcion: string | null
  estado_validacion: string
  estado_admin: string
  observaciones: string | null
  createdAt: string
  dpi: string | null
  foto_dpi_frente: string | null
  foto_dpi_reverso: string | null
  selfie_con_dpi: string | null
  logo: string | null
  departamento: string | null
  municipio: string | null
  telefono: string | null
  notas_internas?: string | null
  plan?: string
  plan_activo?: boolean
  missing_documents?: boolean
  user: {
    nombre: string
    correo: string
    telefono?: string | null
  }
  kyc_checklist: {
    dpi_legible?:     boolean
    selfie_coincide?: boolean
    datos_coinciden?: boolean
  } | null
  kyc_score:  number
  kyc_riesgo: "bajo" | "medio" | "alto"
  // Structured (new)
  risk?: {
    score: number
    level: "low" | "medium" | "high"
    flags: string[]
  }
  metrics?: {
    products_total: number
    products_active: number
    total_views: number
    conversion_rate: number
    engagement_score: number
    days_since_last_product: number | null
  }
  insights?: Insight[]
  alerts?: Alert[]
  kyc_summary?: {
    provider?: string | null
    provider_status?: string | null
    decision_reason?: string | null
    verified_at?: string | null
    review_reasons?: string[]
    missing_capabilities?: string[]
  }
  identity_verification?: {
    provider?: string | null
    provider_status?: string | null
    decision_reason?: string | null
    verified_at?: string | null
    extracted_name_match?: boolean | null
    extracted_dpi_match?: boolean | null
    face_match?: boolean | null
    diagnostics?: string[]
    review_reasons?: string[]
    missing_capabilities?: string[]
    document_assessment?: {
      frontLooksLikeId?: boolean | null
      backLooksLikeId?: boolean | null
      likelyDocumentType?: string | null
      confidence?: number | null
      reason?: string | null
    } | null
  }
  kyc_debug?: {
    diagnostics?: string[]
    review_reasons?: string[]
    missing_capabilities?: string[]
    document_assessment?: {
      frontLooksLikeId?: boolean | null
      backLooksLikeId?: boolean | null
      likelyDocumentType?: string | null
      confidence?: number | null
      reason?: string | null
    } | null
  }
  tickets?: {
    open_count: number
    last_ticket_date: string | null
  }
  custom_data?: {
    categorias: string[]
    regiones: string[]
    telas: string[]
  }
  // Legacy flat fields
  total_produtos?:    number
  total_productos?:   number
  productos_activos?: number
  total_views?:       number
  conversion_rate?:   number
  risk_flags?:        string[]
  value_score?:       number
  audit_log: AuditEvent[]
  timeline?: TimelineItem[]
}

// ── KYC helpers ────────────────────────────────────────────────────────────────

const CHECKLIST_KEYS = ["dpi_legible", "selfie_coincide", "datos_coinciden"] as const

function deriveKycScore(s: SellerDetail): { score: number; fromChecklist: boolean } {
  const cl = s.kyc_checklist
  if (!cl) return { score: s.kyc_score ?? 0, fromChecklist: false }
  const passed = CHECKLIST_KEYS.filter((k) => (cl as Record<string, boolean | undefined>)[k] === true).length
  return { score: Math.round((passed / CHECKLIST_KEYS.length) * 100), fromChecklist: true }
}

function deriveKycRiesgo(score: number): "bajo" | "medio" | "alto" {
  if (score >= 80) return "bajo"
  if (score >= 50) return "medio"
  return "alto"
}

// ── Seller Value Score ─────────────────────────────────────────────────────────

function computeSellerScore(s: SellerDetail): number {
  if (s.estado_admin === "eliminado") return 0
  if (s.value_score !== undefined) return s.value_score
  const { score: kycScore } = deriveKycScore(s)
  const kycRiesgo = deriveKycRiesgo(kycScore)
  let score = 100
  if (s.estado_validacion === "rechazado") score -= 40
  else if (s.estado_validacion === "pendiente") score -= 25
  if (s.estado_admin === "suspendido") score -= 30
  else if (s.estado_admin === "inactivo") score -= 15
  if (kycRiesgo === "alto")  score -= 10
  else if (kycRiesgo === "medio") score -= 5
  if (kycScore < 60 && s.estado_validacion !== "rechazado") score -= 10
  return Math.max(0, Math.min(100, score))
}

function scoreBand(score: number): "critical" | "review" | "healthy" {
  if (score < 50) return "critical"
  if (score < 75) return "review"
  return "healthy"
}

// ── Classification ─────────────────────────────────────────────────────────────

type ClassificationResult = { label: string; description: string; badge: string }

function getClassification(s: SellerDetail): ClassificationResult {
  if (s.estado_admin === "eliminado") {
    return {
      label: "Eliminated",
      description: "This seller account has been permanently eliminated from the marketplace.",
      badge: "bg-gray-700 text-gray-100 border-0",
    }
  }

  const flags  = s.risk?.flags ?? s.risk_flags ?? []
  const vScore = computeSellerScore(s)
  const active = s.metrics?.products_active ?? s.productos_activos ?? 0

  if (s.estado_admin === "suspendido" || s.estado_validacion === "rechazado" || flags.length > 0) {
    return {
      label: "Risk Seller",
      description: flags.length > 0
        ? `${flags.length} risk flag${flags.length > 1 ? "s" : ""} detected — requires urgent review.`
        : "Suspended or rejected — requires intervention.",
      badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
    }
  }
  if (s.estado_admin === "inactivo" || active === 0) {
    return {
      label: "Inactive Seller",
      description: "Not currently active in the marketplace.",
      badge: "bg-gray-100 text-gray-600 border-0",
    }
  }
  if (vScore >= 75 && s.estado_validacion === "aprobado" && active >= 2) {
    return {
      label: "Top Seller",
      description: "High-performing seller with strong KYC, activity, and buyer engagement.",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0",
    }
  }
  if (s.estado_validacion === "aprobado") {
    return {
      label: "Growth Seller",
      description: "Approved and operating — continuing to build marketplace presence.",
      badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0",
    }
  }
  return {
    label: "Under Review",
    description: "Pending validation or insufficient activity history.",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0",
  }
}

// ── AI Recommendations ─────────────────────────────────────────────────────────

type Recommendation = { icon: string; priority: "high" | "medium" | "low"; text: string }

function getRecommendations(s: SellerDetail): Recommendation[] {
  if (s.estado_admin === "eliminado") {
    return [{ icon: "🗑️", priority: "high", text: "This seller has been permanently eliminated. No further actions are available." }]
  }
  const recs: Recommendation[] = []
  const flags    = s.risk?.flags ?? s.risk_flags ?? []
  const views    = s.metrics?.total_views  ?? s.total_views  ?? 0
  const active   = s.metrics?.products_active ?? s.productos_activos ?? 0
  const convRate = s.metrics?.conversion_rate  ?? s.conversion_rate  ?? 0
  const { score: kycScore } = deriveKycScore(s)
  const kycRiesgo = deriveKycRiesgo(kycScore)

  if (flags.includes("duplicate_dpi")) {
    recs.push({ icon: "🔴", priority: "high", text: "Duplicate DPI detected. This seller shares an identity document with another account — investigate for fraud before any approval." })
  }
  if (flags.includes("shared_phone")) {
    recs.push({ icon: "📱", priority: "high", text: "Shared phone number detected. Multiple accounts may be linked — review for coordinated fraud." })
  }
  if (flags.includes("suspicious_documents")) {
    recs.push({ icon: "📄", priority: "high", text: "Document images match another seller's files. Possible document reuse — do not approve until resolved." })
  }
  if (s.estado_validacion === "rechazado") {
    recs.push({ icon: "🚨", priority: "high", text: "KYC was rejected. Contact the seller to address compliance issues before any re-application." })
  }
  if (s.estado_admin === "suspendido") {
    recs.push({ icon: "⛔", priority: "high", text: "Seller is suspended. Resolve the underlying issue and reactivate when compliance is confirmed." })
  }
  if (s.estado_validacion === "pendiente") {
    recs.push({ icon: "⏳", priority: "high", text: "KYC validation is pending. Complete document review in the panel below to unblock this seller." })
  }
  if (kycRiesgo === "alto") {
    recs.push({ icon: "⚠️", priority: "high", text: "High KYC risk score. Cross-check submitted documents carefully before approving." })
  }
  if (active === 0 && s.estado_admin === "activo") {
    recs.push({ icon: "📦", priority: "medium", text: "Approved seller with no active products. Prompt them to list products to start generating revenue." })
  }
  if (views === 0 && s.estado_admin === "activo") {
    recs.push({ icon: "👁", priority: "medium", text: "No buyer engagement recorded yet. This seller may need visibility support or product listing help." })
  }
  if (s.estado_admin === "inactivo") {
    recs.push({ icon: "💤", priority: "medium", text: "Seller is inactive. Reach out to understand if they intend to continue and if reactivation support is needed." })
  }
  if (convRate > 50 && views > 5) {
    recs.push({ icon: "🔥", priority: "low", text: `Excellent engagement: ${convRate}% buyer conversion rate. Consider featuring this seller on the marketplace.` })
  }
  if (kycScore < 80 && s.estado_validacion === "pendiente") {
    recs.push({ icon: "📋", priority: "medium", text: `KYC score is ${kycScore}% — below the 80% approval threshold. Request corrections from the seller.` })
  }
  if (!s.logo) {
    recs.push({ icon: "🖼", priority: "low", text: "No store logo uploaded. Encourage the seller to add branding to improve marketplace trust." })
  }
  if (!s.descripcion) {
    recs.push({ icon: "📝", priority: "low", text: "Store description is missing. A complete profile improves buyer confidence." })
  }
  if (recs.length === 0) {
    recs.push({ icon: "✅", priority: "low", text: "Seller appears healthy. No immediate action required." })
  }
  return recs
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function kycBadgeClass(s: string) {
  switch (s) {
    case "aprobado":  return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "rechazado": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    default:          return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
  }
}

function adminBadgeClass(s: string) {
  switch (s) {
    case "activo":     return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "suspendido": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    case "eliminado":  return "bg-gray-700 text-gray-100 border-0"
    default:           return "bg-gray-100 text-gray-600 border-0"
  }
}

const PRIORITY_STYLE: Record<"high" | "medium" | "low", string> = {
  high:   "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  medium: "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20",
  low:    "border-l-green-400 bg-green-50 dark:bg-green-950/20",
}

const INSIGHT_STYLE: Record<"info" | "warning" | "critical", string> = {
  info:     "border-l-blue-400 bg-blue-50 dark:bg-blue-950/20",
  warning:  "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20",
  critical: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
}

const INSIGHT_ICON: Record<"info" | "warning" | "critical", string> = {
  info: "💡", warning: "⚠️", critical: "🚨",
}

const ALERT_STYLE: Record<"info" | "warning" | "critical", string> = {
  info:     "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20",
  warning:  "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20",
  critical: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
}

const AUDIT_LABELS: Record<string, { label: string; color: string }> = {
  KYC_REVIEW_UPDATED:       { label: "KYC updated",            color: "border-blue-500" },
  KYC_APPROVED:             { label: "KYC approved",           color: "border-green-500" },
  KYC_REJECTED:             { label: "KYC rejected",           color: "border-red-500" },
  KYC_AUTO_FLAGGED:         { label: "KYC auto-flagged",       color: "border-orange-500" },
  KYC_AUTO_REJECTED:        { label: "KYC auto-rejected",      color: "border-red-500" },
  KYC_AUTOMATION_RERUN:     { label: "KYC automation re-run",  color: "border-sky-500" },
  KYC_DOCUMENTS_REQUESTED:  { label: "Documents requested",    color: "border-yellow-500" },
  SELLER_SUSPENDED:         { label: "Seller suspended",       color: "border-red-500" },
  SELLER_REACTIVATED:       { label: "Seller reactivated",     color: "border-green-500" },
  SELLER_FLAGGED_MANUALLY:  { label: "Flagged for review",     color: "border-orange-500" },
  SELLER_ELIMINATED:        { label: "Seller eliminated",      color: "border-gray-500" },
}

const RISK_FLAG_LABELS: Record<string, { label: string; description: string }> = {
  duplicate_dpi:        { label: "Duplicate DPI",         description: "Another seller is registered with the same DPI number." },
  shared_phone:         { label: "Shared Phone",           description: "Another seller has the same phone number registered." },
  suspicious_documents: { label: "Suspicious Documents",   description: "Document images match another seller's uploaded files." },
  document_not_dpi:     { label: "Not A DPI",              description: "Automatic verification indicates that the uploaded files likely are not a DPI document." },
  document_type_unconfirmed: { label: "Document Unconfirmed", description: "Automatic verification could not confirm that the uploaded files are really DPI images." },
}

const TIMELINE_ICON: Record<string, string> = {
  registration:     "🟢",
  product_activity: "📦",
  audit:            "🔵",
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreGauge({ score, label }: { score: number; label?: string }) {
  const band = scoreBand(score)
  const { barColor, textColor, bandLabel } = band === "critical"
    ? { barColor: "bg-red-500",    textColor: "text-red-600 dark:text-red-400",       bandLabel: "Critical" }
    : band === "review"
    ? { barColor: "bg-yellow-400", textColor: "text-yellow-600 dark:text-yellow-400", bandLabel: "Needs Review" }
    : { barColor: "bg-green-500",  textColor: "text-green-600 dark:text-green-400",   bandLabel: "Healthy" }

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">{label ?? "Seller Value Score"}</h2>
          <p className="text-xs text-muted-foreground">Combined KYC, activity, and engagement</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          band === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
          band === "review"   ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        }`}>{bandLabel}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className={`text-4xl font-bold tabular-nums ${textColor}`}>{score}</span>
          <span className="text-xs text-muted-foreground mb-1">/ 100</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
          <span>0</span>
          <span className="text-yellow-600">50 review</span>
          <span className="text-green-600">75 healthy</span>
          <span>100</span>
        </div>
      </div>
    </div>
  )
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null
  const criticalCount = alerts.filter((a) => a.level === "critical").length
  const headerStyle = criticalCount > 0
    ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
    : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"

  return (
    <div className={`border rounded-xl overflow-hidden ${ALERT_STYLE[criticalCount > 0 ? "critical" : "warning"]}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${headerStyle}`}>
        <div>
          <h2 className="font-semibold text-sm text-foreground">System Alerts</h2>
          <p className="text-xs text-muted-foreground">{alerts.length} alert{alerts.length > 1 ? "s" : ""} require attention</p>
        </div>
        {criticalCount > 0 && (
          <span className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2.5 py-1 rounded-full">
            {criticalCount} critical
          </span>
        )}
      </div>
      <ul className="divide-y">
        {alerts.map((alert, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${alert.level === "critical" ? "bg-red-500" : "bg-orange-400"}`} />
            <p className="text-sm">{alert.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AutomatedVerificationPanel({ seller }: { seller: SellerDetail }) {
  const verification = seller.identity_verification
  const debug = seller.kyc_debug
  const summary = seller.kyc_summary

  if (!verification && !debug && !summary) return null

  const reviewReasons = verification?.review_reasons ?? summary?.review_reasons ?? debug?.review_reasons ?? []
  const missingCapabilities = verification?.missing_capabilities ?? summary?.missing_capabilities ?? debug?.missing_capabilities ?? []
  const diagnostics = verification?.diagnostics ?? debug?.diagnostics ?? []
  const documentAssessment = verification?.document_assessment ?? debug?.document_assessment ?? null

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Automated Verification</h2>
          <p className="text-xs text-muted-foreground">Provider decision, document assessment, and automation diagnostics</p>
        </div>
        <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 border-0">
          {verification?.provider_status ?? summary?.provider_status ?? "unknown"}
        </Badge>
      </div>
      <div className="p-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {[
            ["Provider", verification?.provider ?? summary?.provider ?? "—"],
            ["Decision reason", verification?.decision_reason ?? summary?.decision_reason ?? "—"],
            ["Verified at", verification?.verified_at ? new Date(verification.verified_at).toLocaleString() : "—"],
            ["Name match", verification?.extracted_name_match == null ? "—" : verification.extracted_name_match ? "Yes" : "No"],
            ["DPI match", verification?.extracted_dpi_match == null ? "—" : verification.extracted_dpi_match ? "Yes" : "No"],
            ["Face match", verification?.face_match == null ? "—" : verification.face_match ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4 text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-right font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Review reasons</p>
            {reviewReasons.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {reviewReasons.map((reason) => (
                  <span key={reason} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-950/20 dark:text-red-300">
                    {reason}
                  </span>
                ))}
              </div>
            ) : <p className="text-xs">—</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Missing capabilities</p>
            {missingCapabilities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingCapabilities.map((item) => (
                  <span key={item} className="rounded-full bg-yellow-50 px-2.5 py-1 text-[11px] font-medium text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-300">
                    {item}
                  </span>
                ))}
              </div>
            ) : <p className="text-xs">None</p>}
          </div>
        </div>
      </div>
      {(documentAssessment || diagnostics.length > 0) && (
        <div className="border-t px-4 py-4 space-y-3">
          {documentAssessment && (
            <div className="grid gap-2 md:grid-cols-2 text-xs">
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Front looks like ID</span><span className="font-medium">{String(documentAssessment.frontLooksLikeId ?? "—")}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Back looks like ID</span><span className="font-medium">{String(documentAssessment.backLooksLikeId ?? "—")}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Likely document</span><span className="font-medium">{documentAssessment.likelyDocumentType ?? "—"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Confidence</span><span className="font-medium">{documentAssessment.confidence != null ? `${Math.round(documentAssessment.confidence * 100)}%` : "—"}</span></div>
              <div className="md:col-span-2 flex justify-between gap-4"><span className="text-muted-foreground">Reason</span><span className="text-right font-medium">{documentAssessment.reason ?? "—"}</span></div>
            </div>
          )}
          {diagnostics.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Diagnostics</p>
              <ul className="space-y-1">
                {diagnostics.map((line) => (
                  <li key={line} className="font-mono text-xs text-muted-foreground">{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RiskFlagsPanel({ flags, riskScore, riskLevel }: { flags: string[]; riskScore?: number; riskLevel?: string }) {
  if (!flags.length) return null
  const levelBadge =
    riskLevel === "high"   ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
    riskLevel === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                             "bg-gray-100 text-gray-600"

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden bg-red-50 dark:bg-red-950/20">
      <div className="px-4 py-3 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm text-red-800 dark:text-red-300">Risk Flags</h2>
          <p className="text-xs text-red-600 dark:text-red-400">Automated signals requiring manual investigation</p>
        </div>
        <div className="flex items-center gap-2">
          {riskScore !== undefined && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${levelBadge}`}>
              Risk score: {riskScore}
            </span>
          )}
          <span className="text-xs font-bold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full">
            {flags.length} flag{flags.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <ul className="divide-y divide-red-200 dark:divide-red-800/50">
        {flags.map((flag) => {
          const info = RISK_FLAG_LABELS[flag] ?? { label: flag, description: "Unknown risk signal." }
          return (
            <li key={flag} className="flex items-start gap-3 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{info.label}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{info.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Seller Insights</h2>
          <p className="text-xs text-muted-foreground">Data-driven signals from seller activity and behavior</p>
        </div>
        <span className="text-xs text-muted-foreground">{insights.length} insight{insights.length > 1 ? "s" : ""}</span>
      </div>
      <ul className="divide-y">
        {insights.map((insight, i) => (
          <li key={i} className={`flex items-start gap-3 px-4 py-3 border-l-4 ${INSIGHT_STYLE[insight.severity]}`}>
            <span className="text-base leading-none shrink-0 mt-0.5">{INSIGHT_ICON[insight.severity]}</span>
            <p className="text-sm">{insight.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CustomDataPanel({ customData }: { customData: SellerDetail["custom_data"] }) {
  if (!customData) return null
  const hasData = customData.categorias.length > 0 || customData.regiones.length > 0 || customData.telas.length > 0
  if (!hasData) return null

  const groups = [
    { label: "Custom Categories", items: customData.categorias, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    { label: "Regions",           items: customData.regiones,   color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { label: "Materials / Telas", items: customData.telas,      color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  ]

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Custom Data Intelligence</h2>
        <p className="text-xs text-muted-foreground">Detected from product listings — powers marketplace insights</p>
      </div>
      <div className="p-4 space-y-4">
        {groups.filter((g) => g.items.length > 0).map((group) => (
          <div key={group.label}>
            <p className="text-xs text-muted-foreground mb-2">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span key={item} className={`text-xs font-medium px-2.5 py-1 rounded-full ${group.color}`}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TicketSummaryBlock({
  tickets,
  sellerId,
  onViewTickets,
}: {
  tickets: SellerDetail["tickets"]
  sellerId: number
  onViewTickets: () => void
}) {
  if (!tickets) return null
  const hasOpen = tickets.open_count > 0

  return (
    <div className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${
      hasOpen ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20" : "bg-card"
    }`}>
      <div>
        <p className="text-sm font-medium">Support Tickets</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasOpen
            ? `${tickets.open_count} open ticket${tickets.open_count > 1 ? "s" : ""}${tickets.last_ticket_date ? ` · Last: ${new Date(tickets.last_ticket_date).toLocaleDateString()}` : ""}`
            : "No open tickets"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onViewTickets}>
        View Tickets
      </Button>
    </div>
  )
}

function PerformancePanel({ seller }: { seller: SellerDetail }) {
  const { score: kycPct, fromChecklist } = deriveKycScore(seller)
  const kycRiesgo  = fromChecklist ? deriveKycRiesgo(kycPct) : (seller.kyc_riesgo ?? "alto")
  const riskColor  = kycRiesgo === "alto"  ? "text-red-600 dark:text-red-400" :
                     kycRiesgo === "medio" ? "text-yellow-600 dark:text-yellow-400" :
                                            "text-green-600 dark:text-green-400"
  const cl         = seller.kyc_checklist
  const checkPassed    = cl ? CHECKLIST_KEYS.filter((k) => cl[k] === true).length : 0
  const checkReviewed  = !!cl

  const active    = seller.metrics?.products_active  ?? seller.productos_activos ?? 0
  const total     = seller.metrics?.products_total   ?? seller.total_productos   ?? 0
  const views     = seller.metrics?.total_views      ?? seller.total_views       ?? 0
  const convRate  = seller.metrics?.conversion_rate  ?? seller.conversion_rate   ?? 0
  const engage    = seller.metrics?.engagement_score ?? 0
  const daysInact = seller.metrics?.days_since_last_product ?? null
  const riskScore = seller.risk?.score

  const items = [
    {
      label: "KYC Score",
      value: `${kycPct}%`,
      sub:   kycPct >= 80 ? "Meets approval threshold" : kycPct >= 50 ? "Below threshold" : "Insufficient",
      dot:   kycPct >= 80 ? "bg-green-500" : kycPct >= 50 ? "bg-yellow-400" : "bg-red-500",
    },
    {
      label: "KYC Risk Level",
      value: kycRiesgo,
      sub:   kycRiesgo === "alto" ? "High — manual review required" : kycRiesgo === "medio" ? "Medium — review carefully" : "Low",
      dot:   kycRiesgo === "alto" ? "bg-red-500" : kycRiesgo === "medio" ? "bg-yellow-400" : "bg-green-500",
      colored: true, color: riskColor,
    },
    {
      label: "Checklist",
      value: checkReviewed ? `${checkPassed} / ${CHECKLIST_KEYS.length}` : "Not started",
      sub:   checkReviewed ? `${Math.round((checkPassed / CHECKLIST_KEYS.length) * 100)}% passed` : "Admin review pending",
      dot:   checkPassed === CHECKLIST_KEYS.length ? "bg-green-500" : checkPassed > 0 ? "bg-yellow-400" : "bg-muted-foreground/30",
    },
    {
      label: "Risk Score",
      value: riskScore !== undefined ? `${riskScore} / 100` : "—",
      sub:   seller.risk?.level ? `Level: ${seller.risk.level}` : "Not computed",
      dot:   riskScore !== undefined
        ? riskScore >= 60 ? "bg-red-500" : riskScore >= 30 ? "bg-yellow-400" : "bg-green-500"
        : "bg-muted-foreground/30",
    },
    {
      label: "Products",
      value: `${active} active / ${total} total`,
      sub:   total === 0 ? "No products listed" : `${Math.round((active / total) * 100)}% active rate`,
      dot:   active > 0 ? "bg-blue-400" : "bg-muted-foreground/30",
    },
    {
      label: "Buyer Engagement",
      value: `${views} contacts`,
      sub:   views === 0 ? "No contacts recorded" : `${convRate}% conversion rate`,
      dot:   views > 10 ? "bg-green-500" : views > 0 ? "bg-yellow-400" : "bg-muted-foreground/30",
    },
    {
      label: "Engagement Score",
      value: `${engage} / 100`,
      sub:   engage >= 70 ? "High engagement" : engage >= 40 ? "Moderate" : "Low engagement",
      dot:   engage >= 70 ? "bg-green-500" : engage >= 40 ? "bg-yellow-400" : "bg-muted-foreground/30",
    },
    {
      label: "Last Product Listed",
      value: daysInact !== null ? `${daysInact} days ago` : "No products yet",
      sub:   daysInact !== null ? daysInact > 30 ? "Seller may be inactive" : "Recently active" : "—",
      dot:   daysInact !== null ? daysInact > 30 ? "bg-orange-400" : "bg-green-500" : "bg-muted-foreground/30",
    },
    {
      label: "Location",
      value: seller.departamento && seller.municipio ? `${seller.departamento} / ${seller.municipio}` : "Not provided",
      sub:   "Declared business location",
      dot:   seller.departamento ? "bg-blue-400" : "bg-muted-foreground/30",
    },
  ]

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Performance</h2>
        <p className="text-xs text-muted-foreground">KYC, activity, risk, and engagement metrics</p>
      </div>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 px-4 py-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-sm font-medium ${"colored" in item && item.colored ? item.color : ""}`}>{item.value}</p>
            </div>
            <p className="text-xs text-muted-foreground text-right shrink-0 max-w-[140px]">{item.sub}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SellerTimeline({ timeline, createdAt }: { timeline?: TimelineItem[]; createdAt: string }) {
  const items: TimelineItem[] = timeline?.length
    ? timeline
    : [{ type: "registration", label: "Seller registered", date: createdAt }]

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Seller Timeline</h2>
        <p className="text-xs text-muted-foreground">{items.length} event{items.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="p-4">
        <ol className="relative border-l border-border ml-3 space-y-4">
          {items.map((item, i) => {
            const ev = AUDIT_LABELS[item.label]
            const displayLabel = ev?.label ?? item.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            const icon = TIMELINE_ICON[item.type] ?? "⚪"
            return (
              <li key={i} className="ml-4">
                <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 text-xs">{icon}</span>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{displayLabel}</p>
                    {item.comment && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">"{item.comment}"</p>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {new Date(item.date).toLocaleDateString()}
                  </time>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminSellerDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [seller,     setSeller]     = useState<SellerDetail | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rerunLoading, setRerunLoading] = useState(false)
  const [comment,    setComment]    = useState("")
  const [action,     setAction]     = useState<"reject" | "suspend" | "request-info" | "flag" | "eliminate" | null>(null)

  async function fetchDetail() {
    try {
      setLoading(true)
      const res = await authFetch(`${API_URL}/api/admin/sellers/${id}`)
      if (!res.ok) { toast.error("Error loading seller"); return }
      const data = await res.json()
      setSeller(data.data)
    } catch (err) {
      console.error(err)
      toast.error("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(endpoint: string, body?: Record<string, unknown>) {
    try {
      setProcessing(endpoint)
      const res = await authFetch(`${API_URL}/api/admin/sellers/${id}/${endpoint}`, {
        method: "PATCH",
        body:   body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message ?? "An error occurred")
        return
      }
      const labels: Record<string, string> = {
        approve:            "Seller approved",
        reject:             "Seller rejected",
        suspend:            "Seller suspended",
        reactivate:         "Seller reactivated",
        "request-documents": "Document request sent",
        flag:               "Seller flagged for review",
        eliminate:          "Seller eliminated",
      }
      toast.success(labels[endpoint] ?? "Action executed")
      setComment("")
      setAction(null)
      fetchDetail()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setProcessing(null)
    }
  }

  async function rerunKycAutomation() {
    if (!confirm("Re-run automatic KYC verification for this seller?")) return
    try {
      setRerunLoading(true)
      const res = await authFetch(`${API_URL}/api/admin/sellers/${id}/kyc-rerun`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message ?? "Could not re-run automation")
        return
      }
      toast.success("Automatic KYC re-run completed")
      await fetchDetail()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setRerunLoading(false)
    }
  }

  useEffect(() => { if (id) fetchDetail() }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-xl bg-muted animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        <p className="text-sm text-muted-foreground">Seller not found or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.push("/admin/sellers")}>Back to Sellers</Button>
      </div>
    )
  }

  const score           = computeSellerScore(seller)
  const classification  = getClassification(seller)
  const recommendations = getRecommendations(seller)
  const flags           = seller.risk?.flags ?? seller.risk_flags ?? []
  const riskScore       = seller.risk?.score
  const riskLevel       = seller.risk?.level
  const alerts          = seller.alerts ?? []
  const insights        = seller.insights ?? []

  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/sellers")}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← Back to Sellers
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{seller.nombre_comercio}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {seller.user.nombre} — {seller.user.correo}
          </p>
          {seller.plan && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Plan: <span className="font-medium capitalize">{seller.plan}</span>
              {seller.plan_activo ? " · Active" : " · Inactive"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={kycBadgeClass(seller.estado_validacion)}>KYC: {seller.estado_validacion}</Badge>
          <Badge className={adminBadgeClass(seller.estado_admin)}>{seller.estado_admin}</Badge>
          <Badge className={classification.badge}>{classification.label}</Badge>
          {flags.length > 0 && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
              {flags.length} risk flag{flags.length > 1 ? "s" : ""}
            </Badge>
          )}
          {seller.missing_documents && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0">
              Docs missing
            </Badge>
          )}
        </div>
      </div>

      {/* ── ELIMINATION BANNER ──────────────────────────────────────────────── */}
      {seller.estado_admin === "eliminado" && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-gray-900/60 p-4">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">This seller has been permanently eliminated.</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">All products deactivated. Login blocked. No further governance actions are available.</p>
          </div>
        </div>
      )}

      {/* ── SUSPENSION BANNER ───────────────────────────────────────────────── */}
      {seller.estado_admin === "suspendido" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            This seller is suspended and not visible in the marketplace.
          </p>
        </div>
      )}

      {/* ── ALERTS ──────────────────────────────────────────────────────────── */}
      {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

      {/* ── RISK FLAGS ──────────────────────────────────────────────────────── */}
      {flags.length > 0 && <RiskFlagsPanel flags={flags} riskScore={riskScore} riskLevel={riskLevel} />}

      {/* ── SCORE + PERFORMANCE ─────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScoreGauge score={score} />
        <PerformancePanel seller={seller} />
      </div>

      {/* ── INSIGHTS ────────────────────────────────────────────────────────── */}
      {insights.length > 0 && <InsightsPanel insights={insights} />}

      <AutomatedVerificationPanel seller={seller} />

      {/* ── AI RECOMMENDATIONS ──────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Derived from seller signals, risk flags, and activity</p>
          </div>
          <span className="text-xs text-muted-foreground">{recommendations.length} insight{recommendations.length !== 1 ? "s" : ""}</span>
        </div>
        <ul className="divide-y">
          {recommendations.map((rec, i) => (
            <li key={i} className={`flex items-start gap-3 px-4 py-3 border-l-4 ${PRIORITY_STYLE[rec.priority]}`}>
              <span className="text-lg leading-none shrink-0 mt-0.5">{rec.icon}</span>
              <p className="text-sm">{rec.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── TICKET SUMMARY ──────────────────────────────────────────────────── */}
      <TicketSummaryBlock
        tickets={seller.tickets}
        sellerId={seller.user_id}
        onViewTickets={() => router.push(`/admin/tickets?user_id=${seller.user_id}`)}
      />

      {/* ── CUSTOM DATA INTELLIGENCE ────────────────────────────────────────── */}
      <CustomDataPanel customData={seller.custom_data} />

      {/* ── SELLER INFO + CLASSIFICATION ────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Store Info</h2>
          </div>
          <ul className="divide-y">
            {[
              ["Description",    seller.descripcion || "No description"],
              ["Observations",   seller.observaciones || "—"],
              ["DPI",            seller.dpi || "Not provided"],
              ["Phone",          seller.user.telefono || seller.telefono || "Not provided"],
              ["Location",       seller.departamento && seller.municipio ? `${seller.departamento} / ${seller.municipio}` : "Not provided"],
              ["Listed since",   new Date(seller.createdAt).toLocaleDateString()],
              ["Internal notes", seller.notas_internas || "—"],
            ].map(([label, value]) => (
              <li key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span className="text-sm text-right">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Classification</h2>
          </div>
          <div className="p-4 space-y-3">
            <Badge className={`text-sm px-3 py-1 ${classification.badge}`}>{classification.label}</Badge>
            <p className="text-sm text-muted-foreground">{classification.description}</p>
            <div className="pt-2 space-y-1.5">
              {[
                ["Value score",     `${score} / 100`],
                ["KYC score",       `${deriveKycScore(seller).score}%`],
                ["Risk level",      deriveKycRiesgo(deriveKycScore(seller).score)],
                ["Risk score",      riskScore !== undefined ? `${riskScore} / 100` : "—"],
                ["Active products", `${seller.metrics?.products_active ?? seller.productos_activos ?? 0}`],
                ["Buyer contacts",  `${seller.metrics?.total_views ?? seller.total_views ?? 0}`],
                ["Conversion rate", `${seller.metrics?.conversion_rate ?? seller.conversion_rate ?? 0}%`],
                ["Engagement",      `${seller.metrics?.engagement_score ?? 0} / 100`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SELLER TIMELINE ─────────────────────────────────────────────────── */}
      <SellerTimeline timeline={seller.timeline} createdAt={seller.createdAt} />

      {/* ── KYC DOCUMENTS ───────────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">KYC Documents</h2>
            <p className="text-xs text-muted-foreground">Legal identity and verification materials</p>
          </div>
          {seller.missing_documents && (
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
              Documents incomplete
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {[
            { label: "Logo",            url: seller.logo,            required: false },
            { label: "DPI Front",       url: seller.foto_dpi_frente, required: true  },
            { label: "DPI Back",        url: seller.foto_dpi_reverso, required: true  },
            { label: "Selfie with DPI", url: seller.selfie_con_dpi,  required: true  },
          ].map((doc) => (
            <div key={doc.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{doc.label}</p>
                {doc.required && !doc.url && (
                  <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">Missing</span>
                )}
              </div>
              {doc.url ? (
                <a href={resolveImageUrl(doc.url) ?? "#"} target="_blank" rel="noopener noreferrer">
                  <img
                    src={resolveImageUrl(doc.url) ?? ""}
                    alt={doc.label}
                    className="w-full h-36 object-cover rounded-lg border hover:opacity-90 transition"
                  />
                </a>
              ) : (
                <div className={`w-full h-36 flex flex-col items-center justify-center gap-2 rounded-lg border text-xs text-muted-foreground ${
                  doc.required ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" : "bg-muted"
                }`}>
                  <span className="text-2xl opacity-30">{doc.required ? "⚠️" : "🖼️"}</span>
                  <span>{doc.required ? "Required — not uploaded" : "Not available"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── KYC REVIEW PANEL ────────────────────────────────────────────────── */}
      <SellerKYCPanel
        sellerId={seller.id}
        initialChecklist={seller.kyc_checklist}
        automationBlocked={(seller.risk?.flags ?? seller.risk_flags ?? []).includes("document_not_dpi")}
        automationReason={seller.identity_verification?.decision_reason ?? seller.observaciones}
        automationReviewReasons={seller.identity_verification?.review_reasons ?? seller.kyc_debug?.review_reasons ?? []}
        onRerunAutomation={rerunKycAutomation}
        rerunLoading={rerunLoading}
        onUpdated={fetchDetail}
      />

      {/* ── GOVERNANCE ──────────────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30">
          <h2 className="font-semibold text-sm">Governance Actions</h2>
          <p className="text-xs text-muted-foreground">Actions that affect this seller's validation and marketplace access.</p>
        </div>
        <div className="p-4 space-y-4">

          {seller.estado_admin === "eliminado" ? (
            <p className="text-sm text-muted-foreground italic">No governance actions available — this seller has been eliminated.</p>
          ) : (
            <>
              <div className="flex gap-3 flex-wrap">
                {seller.estado_validacion !== "rechazado" && (
                  <>
                    {["pendiente", "en_revision"].includes(seller.estado_validacion) && (
                      <>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={processing === "approve"}
                          onClick={() => {
                            const kycScore = deriveKycScore(seller).score
                            if (kycScore < 80) { toast.error(`Cannot approve — KYC score is ${kycScore}% (minimum 80%)`); return }
                            if (flags.length > 0) { toast.error("Cannot approve — active risk flags must be resolved first"); return }
                            if (!confirm("Approve this seller?")) return
                            handleAction("approve")
                          }}
                        >
                          {processing === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={processing === "reject"}
                          onClick={() => setAction("reject")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {seller.estado_admin === "activo" && (
                      <Button
                        variant="destructive"
                        disabled={processing === "suspend"}
                        onClick={() => setAction("suspend")}
                      >
                        {processing === "suspend" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suspend"}
                      </Button>
                    )}
                    {seller.estado_admin === "suspendido" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={processing === "reactivate"}
                        onClick={() => { if (!confirm("Reactivate this seller?")) return; handleAction("reactivate") }}
                      >
                        {processing === "reactivate" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reactivate"}
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  disabled={processing === "request-documents"}
                  onClick={() => setAction("request-info")}
                >
                  {processing === "request-documents" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request More Info"}
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950/20"
                  disabled={processing === "flag"}
                  onClick={() => setAction("flag")}
                >
                  {processing === "flag" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Flag for Review"}
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900/30">
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Danger Zone</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Permanent, irreversible action. Cannot be undone.</p>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-500 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800"
                  disabled={processing === "eliminate" || action === "eliminate"}
                  onClick={() => setAction("eliminate")}
                >
                  Eliminate Seller
                </Button>
              </div>
            </>
          )}

          {action !== null && (
            <div className="space-y-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {action === "reject"       ? "Rejection reason (required)" :
                 action === "suspend"      ? "Suspension reason (required)" :
                 action === "request-info" ? "Describe what documents or info is needed" :
                 action === "eliminate"    ? "Elimination reason (required — permanent, irreversible)" :
                                            "Flag reason (required)"}
              </p>
              {action === "eliminate" && (
                <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 rounded-lg p-3">
                  ⚠️ This will permanently eliminate the seller account. All products will be deactivated and login will be blocked. This action cannot be undone.
                </p>
              )}
              <textarea
                placeholder="Enter a mandatory comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  variant={action === "flag" || action === "request-info" ? "outline" : "destructive"}
                  disabled={!comment.trim() || !!processing}
                  onClick={() => {
                    if (!confirm("Confirm this action?")) return
                    if (action === "reject")       handleAction("reject",            { comment })
                    if (action === "suspend")      handleAction("suspend",           { comment })
                    if (action === "request-info") handleAction("request-documents", { comment })
                    if (action === "flag")         handleAction("flag",              { reason: comment, comment })
                    if (action === "eliminate")    handleAction("eliminate",         { reason: comment })
                  }}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm action"}
                </Button>
                <Button variant="outline" onClick={() => { setAction(null); setComment("") }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AUDIT LOG ───────────────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30">
          <h2 className="font-semibold text-sm">Audit History</h2>
          <p className="text-xs text-muted-foreground">{seller.audit_log?.length ?? 0} recorded event{(seller.audit_log?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
        {!seller.audit_log || seller.audit_log.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
            No events recorded yet.
          </div>
        ) : (
          <div className="divide-y">
            {seller.audit_log.map((event) => {
              const ev   = AUDIT_LABELS[event.action] ?? { label: event.action, color: "border-muted-foreground/40" }
              const meta = event.metadata as Record<string, Record<string, unknown>> | undefined
              return (
                <div key={event.id} className={`border-l-4 ${ev.color} pl-4 py-3 mx-4 my-1`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{ev.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                  {meta?.after?.kyc_score !== undefined && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Score: {String(meta.after.kyc_score)}% — Risk: {String(meta.after.kyc_riesgo)}
                    </p>
                  )}
                  {event.comment && (
                    <p className="text-sm mt-1.5 text-foreground/80">{event.comment}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
