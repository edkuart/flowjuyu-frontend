"use client"

import Link from "next/link"
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
// tickets:           0 → none | 1-4 → gray | 5-9 → yellow | 10+ → red
// sellersPendientes: 0 → none | 1-2 → gray | 3+  → yellow
// leads:             0 → none | any → gray

function badgeClass(key: string | undefined, count: number): string {
  if (!key || count === 0) return ""

  if (key === "tickets") {
    if (count >= 10) return "bg-red-100 text-red-700"
    if (count >= 5)  return "bg-yellow-100 text-yellow-700"
    return "bg-gray-100 text-gray-600"
  }

  if (key === "sellersPendientes") {
    if (count >= 3) return "bg-yellow-100 text-yellow-700"
    return "bg-gray-100 text-gray-600"
  }

  return "bg-gray-100 text-gray-600"
}

// ── Layout ──────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const stats    = useAdminStats()

  return (
    <div className="flex min-h-screen bg-[#f8f6f2]">

      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-white border-r flex flex-col shrink-0">

        {/* Header */}
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight leading-none">Atlas Control</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Flowjuyu Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>

              {/* Group label */}
              <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                {group.label}
              </p>

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon     = item.icon
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/")

                  const count: number = item.key ? (stats[item.key] as number) ?? 0 : 0
                  const badgeCls = badgeClass(item.key, count)

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative flex items-center justify-between
                        pl-3 pr-2.5 py-2 rounded-lg text-sm
                        transition-colors duration-100
                        ${isActive
                          ? "bg-zinc-100 text-zinc-900 font-medium border-l-2 border-zinc-800"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-2 border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className="shrink-0" />
                        {item.name}
                      </div>

                      {count > 0 && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${badgeCls}`}>
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between">
          <span className="text-[10px] text-gray-400">v1.0 Demo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" title="Connected" />
        </div>

      </aside>

      {/* ── CONTENT AREA ── */}
      <main className="flex-1 p-10 min-w-0">
        {children}
      </main>

    </div>
  )
}
