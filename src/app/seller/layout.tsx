"use client";

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
import { WhatsAppFloatingButton } from "@/components/seller/whatsapp/WhatsAppFloatingButton";
import { PageShell } from "@/components/layout/PageShell";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Mi tienda",          icon: Home,         href: "/seller/my-business" },
  { label: "Productos",          icon: Package,      href: "/seller/products" },
  { label: "Pedidos",            icon: ShoppingCart, href: "/seller/orders" },
  { label: "Métricas",           icon: BarChart3,    href: "/seller/dashboard" },
  { label: "Cuenta y seguridad", icon: Shield,       href: "/seller/account" },
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
      <div className="min-h-screen flex bg-background">

        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col h-screen sticky top-0">

          {/* Sidebar header */}
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Flowjuyu
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Panel del vendedor
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map(({ label, icon, href }) => (
              <SidebarNavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={pathname.startsWith(href)}
              />
            ))}
          </nav>

          {/* Footer + Logout */}
          <div className="border-t border-border p-4 space-y-3">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>

            <div className="text-xs text-muted-foreground px-3">
              Flowjuyu © {new Date().getFullYear()}
            </div>
          </div>
        </aside>

        {/* ================= CONTENIDO ================= */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* ================= MOBILE HEADER ================= */}
          <div className="md:hidden bg-white border-b border-border px-4 py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Panel vendedor
            </h2>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-muted transition">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 bg-white">
                <nav className="mt-8 space-y-0.5">
                  {navItems.map(({ label, icon, href }) => (
                    <SidebarNavItem
                      key={href}
                      href={href}
                      label={label}
                      icon={icon}
                      isActive={pathname.startsWith(href)}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </nav>

                {/* Logout en móvil */}
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
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
            <SellerTopbar businessName="Artesanías Test" status="activo" />
          </div>

          {/* ================= MAIN ================= */}
          <PageShell>
            {children}
          </PageShell>

          <WhatsAppFloatingButton />

        </div>
      </div>
    </AuthGuard>
  );
}
