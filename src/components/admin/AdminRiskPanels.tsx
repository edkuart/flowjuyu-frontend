"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { normalizeId } from "@/lib/adminHelpers"

// ── Shared types (matching dashboard API shape) ────────────────────────────────

type Product = {
  id:              string
  nombre:          string
  precio:          number
  activo:          boolean
  vendedor_nombre: string
}

type Seller = {
  id:                number
  user_id:           number
  nombre_comercio:   string
  estado_validacion: string
  estado_admin:      string
}

// ── Severity helpers ───────────────────────────────────────────────────────────

function sellerSeverity(s: Seller): "critical" | "warning" | "neutral" {
  if (s.estado_admin === "rechazado" || s.estado_admin === "bloqueado") return "critical"
  if (s.estado_validacion === "pendiente") return "warning"
  return "neutral"
}

function sellerReason(s: Seller): string {
  if (s.estado_admin === "rechazado")  return "Application rejected"
  if (s.estado_admin === "bloqueado")  return "Account blocked"
  if (s.estado_validacion === "pendiente") return "KYC pending review"
  return s.estado_validacion
}

const SEV_DOT: Record<"critical" | "warning" | "neutral", string> = {
  critical: "bg-red-500",
  warning:  "bg-yellow-400",
  neutral:  "bg-muted-foreground/50",
}

const SEV_BADGE: Record<"critical" | "warning" | "neutral", string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
  warning:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0",
  neutral:  "",
}

// ── Products Requiring Attention ───────────────────────────────────────────────

interface ProductPanelProps {
  products: Product[]
}

export function AdminProductAttentionPanel({ products }: ProductPanelProps) {
  // Show inactive products first, then sort by name
  const atRisk = [...products]
    .filter((p) => !p.activo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Products Requiring Attention</h2>
          <p className="text-xs text-muted-foreground">Inactive or hidden from marketplace</p>
        </div>
        {atRisk.length > 0 && (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0 text-xs">
            {atRisk.length} inactive
          </Badge>
        )}
      </div>

      {/* List */}
      <div className="divide-y max-h-72 overflow-y-auto">
        {atRisk.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            All products are active — no attention needed.
          </div>
        ) : (
          atRisk.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-orange-400 mt-1 shrink-0" />
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-sm font-medium hover:underline truncate block"
                  >
                    {p.nombre}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{p.vendedor_nombre || "Unknown seller"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0 text-xs">
                  Inactive
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                  Q {Number(p.precio).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {atRisk.length > 0 && (
        <div className="px-4 py-2.5 border-t bg-muted/10">
          <Link
            href="/admin/products?activo=false"
            className="text-xs text-primary hover:underline font-medium"
          >
            View all inactive products →
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Seller Risk Panel ──────────────────────────────────────────────────────────

interface SellerPanelProps {
  sellers: Seller[]
}

export function AdminSellerRiskPanel({ sellers }: SellerPanelProps) {
  // Show risky sellers: pending KYC, rejected, or blocked
  const atRisk = [...sellers]
    .filter((s) =>
      s.estado_validacion === "pendiente" ||
      s.estado_admin === "rechazado" ||
      s.estado_admin === "bloqueado",
    )
    .sort((a, b) => {
      // Critical first
      const sa = sellerSeverity(a)
      const sb = sellerSeverity(b)
      const order = { critical: 0, warning: 1, neutral: 2 }
      return order[sa] - order[sb]
    })

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Seller Risk Panel</h2>
          <p className="text-xs text-muted-foreground">Pending KYC, rejected, or blocked accounts</p>
        </div>
        {atRisk.length > 0 && (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0 text-xs">
            {atRisk.length} at risk
          </Badge>
        )}
      </div>

      {/* List */}
      <div className="divide-y max-h-72 overflow-y-auto">
        {atRisk.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            No seller risk flags detected.
          </div>
        ) : (
          atRisk.map((s) => {
            const sev = sellerSeverity(s)
            const sid = normalizeId(s)
            return (
              <div key={sid} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${SEV_DOT[sev]}`} />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/sellers/${sid}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {s.nombre_comercio}
                    </Link>
                    <p className="text-xs text-muted-foreground">{sellerReason(s)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sev !== "neutral" && (
                    <Badge className={`text-xs ${SEV_BADGE[sev]}`}>
                      {sev === "critical" ? "Critical" : "Review"}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {atRisk.length > 0 && (
        <div className="px-4 py-2.5 border-t bg-muted/10">
          <Link
            href="/admin/sellers?kyc=pendiente"
            className="text-xs text-primary hover:underline font-medium"
          >
            Review pending sellers →
          </Link>
        </div>
      )}
    </div>
  )
}
