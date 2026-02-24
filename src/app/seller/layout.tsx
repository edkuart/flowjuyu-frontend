"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Shield,
  Menu,
  LogOut,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import SellerTopbar from "@/components/seller/SellerTopbar";
import { useAuth } from "@/context/AuthContext";
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
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  // Cierra automáticamente el menú móvil cuando cambia la ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <AuthGuard allowedRoles={["seller"]}>
      <div className="min-h-screen flex bg-neutral-50">

        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col h-screen sticky top-0">

          {/* Sidebar header */}
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Flowjuyu
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Panel del vendedor
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-150
                    ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 group-hover:text-neutral-700"
                    }`}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Footer + Logout */}
          <div className="border-t border-neutral-200 p-4 mt-6 space-y-3">

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>

            <div className="text-xs text-neutral-400 px-3">
              Flowjuyu © {new Date().getFullYear()}
            </div>

          </div>
        </aside>

        {/* ================= CONTENIDO ================= */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* ================= MOBILE HEADER ================= */}
          <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Panel vendedor
            </h2>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-neutral-100 transition">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 bg-white">
                <div className="mt-8 space-y-2">
                  {navItems.map(({ label, icon: Icon, href }) => {
                    const isActive = pathname.startsWith(href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-150
                          ${
                            isActive
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                          }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? "text-white"
                              : "text-neutral-400 group-hover:text-neutral-700"
                          }`}
                        />
                        {label}
                      </Link>
                    );
                  })}

                  {/* Logout en móvil */}
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>

                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* ================= TOPBAR DESKTOP ================= */}
          <div className="hidden md:block">
            <SellerTopbar
              businessName="Artesanías Test"
              status="activo"
            />
          </div>

          {/* ================= MAIN ================= */}
          <main className="flex-1 p-6 md:p-10">
            <div className="w-full max-w-6xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </div>
    </AuthGuard>
  );
}