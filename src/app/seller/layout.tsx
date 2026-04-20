"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Shield,
  Menu,
  LogOut,
  Layers2,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import SellerTopbar from "@/components/seller/SellerTopbar";
import { WhatsAppFloatingButton } from "@/components/seller/whatsapp/WhatsAppFloatingButton";
import { PageShell } from "@/components/layout/PageShell";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Resumen", icon: LayoutDashboard, href: "/seller/dashboard" },
  { label: "Mi tienda", icon: Home, href: "/seller/my-business" },
  { label: "Productos", icon: Package, href: "/seller/products" },
  { label: "Pedidos", icon: ShoppingCart, href: "/seller/orders" },
  { label: "Colecciones", icon: Layers2, href: "/seller/collections" },
  { label: "Métricas", icon: BarChart3, href: "/seller/metrics" },
  { label: "Cuenta", icon: User, href: "/seller/account" },
  { label: "Seguridad", icon: Shield, href: "/seller/security" },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  // Cierra automáticamente el menú móvil cuando cambia la ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <AuthGuard allowedRoles={["seller", "admin"]}>
      <div className="bg-background flex min-h-screen">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="border-border sticky top-0 hidden h-screen w-64 flex-col border-r bg-white md:flex">
          {/* Sidebar header */}
          <div className="border-border border-b px-6 py-5">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Flowjuyu
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Panel del vendedor
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {navItems.map(({ label, icon, href }) => (
              <div key={href}>
                {href === "/seller/account" ? (
                  <div className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Gestión personal
                  </div>
                ) : null}
                <SidebarNavItem
                  href={href}
                  label={label}
                  icon={icon}
                  isActive={pathname.startsWith(href)}
                />
              </div>
            ))}
          </nav>

          {/* Footer + Logout */}
          <div className="border-border space-y-3 border-t p-4">
            <button
              onClick={logout}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>

            <div className="text-muted-foreground px-3 text-xs">
              Flowjuyu © {new Date().getFullYear()}
            </div>
          </div>
        </aside>

        {/* ================= CONTENIDO ================= */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* ================= MOBILE HEADER ================= */}
          <div className="border-border flex items-center justify-between border-b bg-white px-4 py-4 md:hidden">
            <h2 className="text-foreground text-base font-semibold">
              Panel vendedor
            </h2>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="hover:bg-muted rounded-lg p-2 transition">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 bg-white">
                <nav className="mt-8 space-y-0.5">
                  {navItems.map(({ label, icon, href }) => (
                    <div key={href}>
                      {href === "/seller/account" ? (
                        <div className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Gestión personal
                        </div>
                      ) : null}
                      <SidebarNavItem
                        href={href}
                        label={label}
                        icon={icon}
                        isActive={pathname.startsWith(href)}
                        onClick={() => setOpen(false)}
                      />
                    </div>
                  ))}
                </nav>

                {/* Logout en móvil */}
                <div className="border-border mt-4 border-t pt-4">
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* ================= TOPBAR DESKTOP ================= */}
          <div className="hidden md:block">
            <SellerTopbar businessName="Artesanías Test" status="activo" />
          </div>

          {/* ================= MAIN ================= */}
          <PageShell>{children}</PageShell>

          <WhatsAppFloatingButton />
        </div>
      </div>
    </AuthGuard>
  );
}
