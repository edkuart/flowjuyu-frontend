"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Shield,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";

const navItems = [
  { label: "Mi tienda", icon: Home, href: "/seller/my-business" },
  { label: "Productos", icon: Package, href: "/seller/products" },
  { label: "Pedidos", icon: ShoppingCart, href: "/seller/orders" },
  { label: "Métricas", icon: BarChart3, href: "/seller/dashboard" },
  { label: "Cuenta y seguridad", icon: Shield, href: "/seller/account" },
];

export default function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard allowedRoles={["vendedor"]}>
      <div className="min-h-screen flex bg-[#f8f5ef]">

        {/* SIDEBAR */}
        <aside className="w-64 bg-white/90 backdrop-blur border-r border-neutral-200 shadow-sm hidden md:flex flex-col">

          {/* HEADER */}
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Flowjuyu
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Panel del vendedor
            </p>
          </div>

          {/* NAV */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-amber-100 text-amber-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
            Flowjuyu © {new Date().getFullYear()}
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
