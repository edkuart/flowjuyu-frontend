"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Package,
  User,
  MapPin,
  Eye,
  Heart,
  Bell,
  Settings,
  LogOut,
  CreditCard,
  BadgeInfo,
} from "lucide-react";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const menu = [
    { name: "Mis Pedidos", href: "/buyer/orders", icon: Package },
    { name: "Mi Cuenta", href: "/buyer/profile", icon: User },
    { name: "Mis direcciones", href: "/buyer/addresses", icon: MapPin },
    { name: "Notificaciones", href: "/buyer/notifications", icon: Bell },
    { name: "rewied", href: "/buyer/reviews", icon: Eye },
    { name: "Mis favoritos", href: "/buyer/favorites", icon: Heart },
    { name: "Configuración", href: "/buyer/settings", icon: Settings },
  ];

  const helpMenu = [
    { name: "Garantías y reclamos", href: "/buyer/warranty", icon: BadgeInfo },
    { name: "Tarjetas guardadas", href: "/buyer/cards", icon: CreditCard },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex gap-6 py-10 px-4">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-white rounded-xl border shadow-sm p-5 h-fit">
          {/* Perfil */}
          <div className="flex flex-col items-center pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
              {user?.nombre?.charAt(0) ?? "?"}
            </div>
            <h3 className="mt-2 font-medium text-gray-800">{user?.nombre}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          {/* Navegación */}
          <nav className="mt-5 space-y-1">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition"
              >
                <item.icon className="w-4 h-4 text-gray-600" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Sección de ayuda */}
          <div className="mt-6 pt-6 border-t">
            {helpMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition"
              >
                <item.icon className="w-4 h-4 text-gray-600" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={logout}
            className="mt-6 flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 bg-white rounded-xl border shadow-sm p-8 min-h-[600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
