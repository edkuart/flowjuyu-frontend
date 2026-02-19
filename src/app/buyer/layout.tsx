"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
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
  Menu,
  X,
} from "lucide-react";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menu = [
    { name: "Mis Pedidos", href: "/buyer/orders", icon: Package },
    { name: "Mi Cuenta", href: "/buyer/profile", icon: User },
    { name: "Mis direcciones", href: "/buyer/addresses", icon: MapPin },
    { name: "Notificaciones", href: "/buyer/notifications", icon: Bell },
    { name: "Reseñas", href: "/buyer/reviews", icon: Eye },
    { name: "Mis favoritos", href: "/buyer/favorites", icon: Heart },
    { name: "Configuración", href: "/buyer/settings", icon: Settings },
  ];

  const helpMenu = [
    { name: "Garantías y reclamos", href: "/buyer/warranty", icon: BadgeInfo },
    { name: "Tarjetas guardadas", href: "/buyer/cards", icon: CreditCard },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      
      {/* HEADER MÓVIL (Solo visible en celular) */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <span className="font-semibold text-gray-800">Mi Cuenta</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 py-6 md:py-10 px-4 relative">
        
        {/* OVERLAY OSCURO (Solo móvil cuando el menú está abierto) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR (LA CORRECCIÓN ESTÁ AQUÍ) */}
        <aside 
          className={`
            /* 1. Comportamiento Móvil (Drawer Flotante) */
            fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-2xl
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}

            /* 2. Comportamiento Escritorio (Columna Estática) */
            md:translate-x-0 md:static md:shadow-sm md:z-auto md:h-fit md:block md:border
            md:rounded-xl
          `}
        >
          {/* Botón cerrar (Solo visible en móvil) */}
          <div className="flex justify-end md:hidden p-4 border-b mb-2">
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
               <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-5 pt-2 md:pt-5">
            {/* Perfil */}
            <div className="flex flex-col items-center pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600 uppercase">
                {user?.nombre?.charAt(0) ?? "?"}
              </div>
              <h3 className="mt-3 font-medium text-gray-800 text-center px-2 line-clamp-1">
                  {user?.nombre}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1">{user?.email}</p>
            </div>

            {/* Navegación */}
            <nav className="mt-5 space-y-1">
              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition text-gray-700 font-medium"
                >
                  <item.icon className="w-4 h-4 text-gray-500" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Ayuda y Logout */}
            <div className="mt-6 pt-6 border-t space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ayuda</p>
              {helpMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition text-gray-700"
                >
                  <item.icon className="w-4 h-4 text-gray-500" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={logout}
                className="mt-4 flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENIDO DERECHO */}
        <main className="flex-1 bg-white rounded-xl border shadow-sm p-4 md:p-8 min-h-[600px]">
          {children}
        </main>
      </div>
    </div>
  );
}