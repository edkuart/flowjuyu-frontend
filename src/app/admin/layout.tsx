"use client"

import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Package,
  Ticket,
  Users,
  Brain,
  LucideIcon,
} from "lucide-react"

import { useAdminStats } from "@/hooks/useAdminStats"
import AuthGuard from "@/components/auth/AuthGuard"
import { PageShell } from "@/components/layout/PageShell"
import { SidebarNavItem } from "@/components/layout/SidebarNavItem"

// ── Nav structure ───────────────────────────────────────────────────────────────

// Only numeric keys from AdminStats can be used as badge counters.
type NumericStatKey = "tickets" | "sellersPendientes" | "leads"

type NavItem = {
  name:   string
  href:   string
  icon:   LucideIcon
  key?:   NumericStatKey
  exact?: boolean
}

type NavGroup = {
  label:   string
  items:   NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/admin",       icon: LayoutDashboard, exact: true },
      { name: "Leads",     href: "/admin/leads",  icon: Users,           key: "leads" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { name: "Sellers",  href: "/admin/sellers",  icon: Store,   key: "sellersPendientes" },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Tickets",  href: "/admin/tickets",  icon: Ticket,  key: "tickets" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { name: "AI Control", href: "/admin/ai", icon: Brain },
    ],
  },
]

// ── Badge color logic ───────────────────────────────────────────────────────────
// tickets:           0 → none | 1-4 → muted | 5-9 → yellow | 10+ → red
// sellersPendientes: 0 → none | 1-2 → muted | 3+  → yellow
// leads:             0 → none | any → muted

function badgeClass(key: string | undefined, count: number): string {
  if (!key || count === 0) return ""

  if (key === "tickets") {
    if (count >= 10) return "bg-red-100 text-red-700"
    if (count >= 5)  return "bg-yellow-100 text-yellow-700"
    return "bg-muted text-muted-foreground"
  }

  if (key === "sellersPendientes") {
    if (count >= 3) return "bg-yellow-100 text-yellow-700"
    return "bg-muted text-muted-foreground"
  }

  return "bg-muted text-muted-foreground"
}

// ── Layout ──────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const stats    = useAdminStats()

  return (
    <AuthGuard allowedRoles={["admin"]}>
    <div className="flex min-h-screen bg-background">

      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-white border-r border-border flex flex-col shrink-0">

        {/* Header */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold">A</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight leading-none">Atlas Control</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Flowjuyu Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>

              {/* Group label */}
              <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {group.label}
              </p>

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/")

                  const count: number = item.key ? (stats[item.key] as number) ?? 0 : 0
                  const badgeCls = badgeClass(item.key, count)

                  return (
                    <SidebarNavItem
                      key={item.name}
                      href={item.href}
                      label={item.name}
                      icon={item.icon}
                      isActive={isActive}
                      badge={
                        count > 0 ? (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${badgeCls}`}>
                            {count > 99 ? "99+" : count}
                          </span>
                        ) : undefined
                      }
                    />
                  )
                })}
              </div>
            </div>
          ))}

        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">v1.0 Demo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" title="Connected" />
        </div>

      </aside>

      {/* ── CONTENT AREA ── */}
      <PageShell>
        {children}
      </PageShell>

    </div>
    </AuthGuard>
  )
}
