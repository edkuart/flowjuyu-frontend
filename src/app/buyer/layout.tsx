"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import {
  Package,
  User,
  MapPin,
  Heart,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  comingSoon?: boolean;
};

const menu: MenuItem[] = [
  { name: "Dashboard",       href: "/buyer/dashboard",     icon: LayoutDashboard },
  { name: "Mis Pedidos",     href: "/buyer/orders",        icon: Package },
  { name: "Mi Cuenta",       href: "/buyer/profile",       icon: User    },
  { name: "Mis Direcciones", href: "/buyer/addresses",     icon: MapPin  },
  { name: "Notificaciones",  href: "/buyer/notifications", icon: Bell },
  { name: "Mis Favoritos",   href: "/buyer/favorites",     icon: Heart },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AuthGuard allowedRoles={["buyer", "admin"]}>
    <div className="w-full min-h-screen bg-background">

      {/* HEADER MÓVIL */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <span className="font-bold text-foreground tracking-tight">Mi Cuenta</span>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <Container size="wide" className="flex flex-col md:flex-row gap-6 py-6 md:py-10 relative">

        {/* OVERLAY MÓVIL */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0 md:static md:shadow-sm md:z-auto md:w-64 md:h-fit md:border md:rounded-2xl"
          )}
        >
          {/* Botón cerrar — solo móvil */}
          <div className="flex justify-between items-center md:hidden p-4 border-b">
            <span className="font-bold text-foreground">Menú</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {/* Avatar + datos */}
            <div className="flex flex-col items-center pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-primary uppercase">
                {user?.name?.charAt(0) ?? "?"}
              </div>
              <h3 className="mt-4 font-semibold text-foreground text-center px-2 line-clamp-1">
                {user?.name || "Usuario"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{user?.email}</p>
            </div>

            {/* Navegación */}
            <nav className="mt-6 space-y-0.5">
              {menu.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarNavItem
                    key={item.href}
                    href={item.href}
                    label={item.name}
                    icon={item.icon}
                    isActive={isActive}
                    onClick={() => setIsSidebarOpen(false)}
                    badge={
                      item.comingSoon && !isActive ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground leading-tight">
                          Pronto
                        </span>
                      ) : undefined
                    }
                  />
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium group"
              >
                <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 shrink-0" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8 min-h-[600px]">
          {children}
        </main>
      </Container>
    </div>
    </AuthGuard>
  );
}
