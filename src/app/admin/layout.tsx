"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Package,
  Ticket,
  Users
} from "lucide-react"

import { useAdminStats } from "@/hooks/useAdminStats"

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "Leads",
    href: "/admin/leads",
    icon: Users,
    key: "leads"
  },
  {
    name: "Sellers",
    href: "/admin/sellers",
    icon: Store,
    key: "sellersPendientes"
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package
  },
  {
    name: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
    key: "tickets"
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const stats = useAdminStats()

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">

        {/* Header */}
        <div className="px-6 py-6 border-b">
          <h2 className="text-lg font-semibold tracking-tight">
            Atlas Control
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Flowjuyu Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">

          {navItems.map((item) => {

            const Icon = item.icon

            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/")

            const count =
              item.key && stats[item.key as keyof typeof stats]

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center justify-between
                  px-4 py-2 rounded-lg text-sm
                  transition-colors
                  ${
                    isActive
                      ? "bg-gray-100 text-black font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >

                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.name}
                </div>

                {count ? (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    {count}
                  </span>
                ) : null}

              </Link>
            )
          })}

        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-xs text-gray-400">
          v1.0 Demo
        </div>

      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-10">
        {children}
      </main>

    </div>
  )
}