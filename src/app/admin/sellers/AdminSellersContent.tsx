"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Seller {
  id: number
  user_id: number
  nombre_comercio: string
  estado_validacion: string
  estado_admin: string
  createdAt: string
  user?: {
    id: number
    nombre: string
    correo: string
  }
}

type SmartFilter =
  | "all"
  | "pending_kyc"
  | "high_risk"
  | "inactive"
  | "suspended"
  | "eliminated"
  | "healthy"

// ── Score system ───────────────────────────────────────────────────────────────

function computeSellerScore(s: Seller): number {
  if (s.estado_admin === "eliminado") return 0
  let score = 100
  if (s.estado_validacion === "rechazado") score -= 40
  else if (s.estado_validacion === "pendiente") score -= 25
  if (s.estado_admin === "suspendido") score -= 30
  else if (s.estado_admin === "inactivo") score -= 15
  return Math.max(0, Math.min(100, score))
}

function scoreBand(score: number): "critical" | "review" | "healthy" {
  if (score < 60) return "critical"
  if (score < 80) return "review"
  return "healthy"
}

// ── Insight tags ───────────────────────────────────────────────────────────────

type Insight = { icon: string; label: string }

function getInsights(s: Seller): Insight[] {
  const tags: Insight[] = []
  if (s.estado_admin === "eliminado")                          { tags.push({ icon: "🗑️", label: "Eliminated" }); return tags }
  if (s.estado_validacion === "rechazado")                     tags.push({ icon: "🚨", label: "KYC rejected" })
  if (s.estado_admin === "suspendido")                         tags.push({ icon: "⛔", label: "Suspended" })
  if (s.estado_validacion === "pendiente")                     tags.push({ icon: "⚠️", label: "KYC pending" })
  if (s.estado_admin === "inactivo")                           tags.push({ icon: "💤", label: "Inactive" })
  if (tags.length === 0 && s.estado_validacion === "aprobado") tags.push({ icon: "✅", label: "Healthy" })
  if (tags.length === 0)                                       tags.push({ icon: "🔍", label: "Unverified" })
  return tags
}

// ── Smart filter logic ─────────────────────────────────────────────────────────

function applySmartFilter(sellers: Seller[], filter: SmartFilter): Seller[] {
  // "eliminated" is the only filter that shows eliminated sellers.
  // All other filters — including "all" — exclude them.
  if (filter === "eliminated") return sellers.filter(s => s.estado_admin === "eliminado")
  const active = sellers.filter(s => s.estado_admin !== "eliminado")
  switch (filter) {
    case "pending_kyc": return active.filter(s => s.estado_validacion === "pendiente")
    case "high_risk":   return active.filter(s => s.estado_validacion === "rechazado")
    case "inactive":    return active.filter(s => s.estado_admin === "inactivo")
    case "suspended":   return active.filter(s => s.estado_admin === "suspendido")
    case "healthy":     return active.filter(s => computeSellerScore(s) >= 80)
    default:            return active
  }
}

const FILTER_LABELS: Record<SmartFilter, string> = {
  all:         "All",
  pending_kyc: "⚠️ Pending KYC",
  high_risk:   "🚨 High Risk",
  inactive:    "💤 Inactive",
  suspended:   "⛔ Suspended",
  healthy:     "✅ Healthy",
  eliminated:  "🗑️ Eliminated",
}

// ── Score bar ──────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const band = scoreBand(score)
  const color =
    band === "critical" ? "bg-red-500" :
    band === "review"   ? "bg-yellow-400" :
                          "bg-green-500"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
    </div>
  )
}

// ── Priority overview ──────────────────────────────────────────────────────────

function PriorityOverview({ sellers }: { sellers: Seller[] }) {
  const critical = sellers.filter((s: Seller) => scoreBand(computeSellerScore(s)) === "critical").length
  const review   = sellers.filter((s: Seller) => scoreBand(computeSellerScore(s)) === "review").length
  const healthy  = sellers.filter((s: Seller) => scoreBand(computeSellerScore(s)) === "healthy").length

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="border rounded-xl p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 space-y-1">
        <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">Critical</p>
        <p className="text-3xl font-bold text-red-700 dark:text-red-400">{critical}</p>
        <p className="text-xs text-muted-foreground">Rejected KYC, suspended or high-risk</p>
      </div>
      <div className="border rounded-xl p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 space-y-1">
        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">Needs Review</p>
        <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{review}</p>
        <p className="text-xs text-muted-foreground">Pending KYC or low score</p>
      </div>
      <div className="border rounded-xl p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 space-y-1">
        <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Healthy</p>
        <p className="text-3xl font-bold text-green-700 dark:text-green-400">{healthy}</p>
        <p className="text-xs text-muted-foreground">
          {sellers.length > 0 ? `${Math.round((healthy / sellers.length) * 100)}% of sellers` : "No sellers"}
        </p>
      </div>
    </div>
  )
}

// ── Badge helpers ──────────────────────────────────────────────────────────────

function kycBadgeClass(status: string) {
  switch (status) {
    case "aprobado":  return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "rechazado": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    case "pendiente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
    default:          return "bg-gray-100 text-gray-600 border-0"
  }
}

function adminBadgeClass(status: string) {
  switch (status) {
    case "activo":     return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "suspendido": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    case "inactivo":   return "bg-gray-100 text-gray-600 border-0"
    default:           return "bg-gray-100 text-gray-600 border-0"
  }
}

function kycLabel(s: string) {
  switch (s) {
    case "aprobado":  return "Approved"
    case "rechazado": return "Rejected"
    case "pendiente": return "Pending"
    default:          return s
  }
}

function adminLabel(s: string) {
  switch (s) {
    case "activo":     return "Active"
    case "suspendido": return "Suspended"
    case "inactivo":   return "Inactive"
    default:           return s
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminSellersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sellers,   setSellers]   = useState<Seller[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [filter,    setFilter]    = useState<SmartFilter>(
    searchParams.get("kyc") === "pendiente" ? "pending_kyc" : "all"
  )
  const [actioning, setActioning] = useState<number | null>(null)

  async function fetchSellers() {
    setLoading(true)
    setError(false)
    try {
      const res = await authFetch(`${API_URL}/api/admin/sellers`)
      if (!res.ok) { setError(true); return }
      const json = await res.json()
      setSellers(json.data ?? json ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(seller: Seller, endpoint: string, comment?: string) {
    setActioning(seller.id)
    try {
      const res = await authFetch(`${API_URL}/api/admin/sellers/${seller.user_id}/${endpoint}`, {
        method: "PATCH",
        body:   comment ? JSON.stringify({ comment }) : undefined,
      })
      if (!res.ok) { toast.error("Action failed"); return }
      const labels: Record<string, string> = {
        approve:    "Seller approved",
        suspend:    "Seller suspended",
        reactivate: "Seller reactivated",
      }
      toast.success(labels[endpoint] ?? "Done")
      await fetchSellers()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setActioning(null)
    }
  }

  useEffect(() => { fetchSellers() }, [])

  const filterCounts = useMemo<Partial<Record<SmartFilter, number>>>(() => ({
    pending_kyc: sellers.filter((s: Seller) => s.estado_admin !== "eliminado" && s.estado_validacion === "pendiente").length,
    high_risk:   sellers.filter((s: Seller) => s.estado_admin !== "eliminado" && s.estado_validacion === "rechazado").length,
    inactive:    sellers.filter((s: Seller) => s.estado_admin === "inactivo").length,
    suspended:   sellers.filter((s: Seller) => s.estado_admin === "suspendido").length,
    healthy:     sellers.filter((s: Seller) => s.estado_admin !== "eliminado" && computeSellerScore(s) >= 80).length,
    eliminated:  sellers.filter((s: Seller) => s.estado_admin === "eliminado").length,
  }), [sellers])

  const displayed = useMemo(
    () => applySmartFilter(sellers, filter).sort((a, b) => computeSellerScore(a) - computeSellerScore(b)),
    [sellers, filter],
  )

  if (loading) return <div className="space-y-4 p-1"><PageSkeleton /></div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        <p className="text-sm text-muted-foreground">Could not load sellers. The API may be unavailable.</p>
        <button onClick={fetchSellers} className="text-xs px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Governance and risk scoring for {sellers.length} registered sellers.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last refreshed</p>
          <p className="text-xs font-medium">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* ── PRIORITY OVERVIEW ───────────────────────────────────────────────── */}
      <PriorityOverview sellers={sellers} />

      {/* ── SMART FILTER BAR ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as SmartFilter[]).map((f) => {
          const count  = f === "all" ? sellers.length : filterCounts[f]
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                ${active
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                }`}
            >
              {FILTER_LABELS[f]}
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-1 rounded-full ${active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────────── */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <p className="text-sm font-semibold">
            {filter === "all" ? "All Sellers" : FILTER_LABELS[filter]}
          </p>
          <span className="text-xs text-muted-foreground">{displayed.length} result{displayed.length !== 1 ? "s" : ""}</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Insights</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No sellers match this filter.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((seller) => {
                const score         = computeSellerScore(seller)
                const insights      = getInsights(seller)
                const busy          = actioning === seller.id
                const canApprove    = seller.estado_validacion === "pendiente"
                const canSuspend    = seller.estado_admin === "activo"
                const canReactivate = seller.estado_admin === "suspendido"

                return (
                  <TableRow key={seller.id} className="hover:bg-muted/30">

                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/sellers/${seller.user_id}`}
                        className="hover:underline"
                      >
                        {seller.nombre_comercio}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {seller.user?.correo ?? <span className="italic text-xs">No contact</span>}
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs ${kycBadgeClass(seller.estado_validacion)}`}>
                        {kycLabel(seller.estado_validacion)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs ${adminBadgeClass(seller.estado_admin)}`}>
                        {adminLabel(seller.estado_admin)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <ScoreBar score={score} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {insights.map((ins, i) => (
                          <span key={i} title={ins.label} className="text-base leading-none">
                            {ins.icon}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        {canApprove && (
                          <button
                            disabled={busy}
                            onClick={() => handleAction(seller, "approve")}
                            className="text-xs px-2.5 py-1 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50 transition-colors"
                          >
                            {busy ? "…" : "Approve"}
                          </button>
                        )}
                        {canSuspend && (
                          <button
                            disabled={busy}
                            onClick={() => handleAction(seller, "suspend", "Suspended via list view")}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-colors"
                          >
                            {busy ? "…" : "Suspend"}
                          </button>
                        )}
                        {canReactivate && (
                          <button
                            disabled={busy}
                            onClick={() => handleAction(seller, "reactivate")}
                            className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 disabled:opacity-50 transition-colors"
                          >
                            {busy ? "…" : "Reactivate"}
                          </button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => router.push(`/admin/sellers/${seller.user_id}`)}
                        >
                          Detail
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
