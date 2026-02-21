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
  Menu,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <AuthGuard allowedRoles={["seller"]}>
      <div className="min-h-screen flex bg-[#f8f5ef]">

        {/* SIDEBAR DESKTOP */}
        <aside className="w-64 bg-white/90 backdrop-blur border-r border-neutral-200 shadow-sm hidden md:flex flex-col">

          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Flowjuyu
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Panel del vendedor
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-amber-100 text-amber-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
            Flowjuyu © {new Date().getFullYear()}
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 md:p-10">

          {/* 🔥 MOBILE HEADER */}
          <div className="md:hidden mb-6 flex items-center justify-between">

            <h2 className="text-lg font-semibold">Panel vendedor</h2>

            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-neutral-200 transition">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72">
                <div className="mt-8 space-y-2">
                  {navItems.map(({ label, icon: Icon, href }) => {
                    const isActive = pathname === href;

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-xl transition-all
                          ${
                            isActive
                              ? "bg-amber-100 text-amber-700"
                              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

          </div>

          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}