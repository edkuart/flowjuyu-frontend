"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Package,
  Ticket,
} from "lucide-react"

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sellers",
    href: "/admin/sellers",
    icon: Store,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

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

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                  transition-colors
                  ${
                    isActive
                      ? "bg-gray-100 text-black font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={16} />
                {item.name}
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