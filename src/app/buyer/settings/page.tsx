"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Moon, Bell, Shield, Trash2, ChevronRight, MonitorSmartphone } from "lucide-react";

export default function BuyerSettingsPage() {
  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">

      {/* Título */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ajusta tus preferencias de cuenta, seguridad y notificaciones.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECCIÓN: Preferencias Generales */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Preferencias Generales
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            
            {/* Notificaciones */}
            <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificaciones</p>
                  <p className="text-sm text-gray-500">Alertas de pedidos y promociones</p>
                </div>
              </div>
              <Link href="/buyer/notifications/settings">
                <Button variant="outline" size="sm" className="rounded-lg text-gray-700 font-medium">
                  Configurar
                </Button>
              </Link>
            </div>

            {/* Idioma */}
            <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Idioma de la plataforma</p>
                  <p className="text-sm text-gray-500">Actualmente en Español (ES)</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                Único disponible
              </span>
            </div>

            {/* Tema */}
            <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Modo oscuro</p>
                  <p className="text-sm text-gray-500">Ajustar la apariencia visual</p>
                </div>
              </div>
              <Switch />
            </div>

          </div>
        </section>

        {/* SECCIÓN: Seguridad */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 mt-8">
            Seguridad y Accesos
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            
            {/* Cerrar sesiones */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Sesiones activas</p>
                  <p className="text-sm text-gray-500">Cierra sesión en todos los demás dispositivos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>

            {/* Cambiar contraseña (Opcional, agregado como idea) */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Actualizar contraseña</p>
                  <p className="text-sm text-gray-500">Cambia tu clave de acceso actual</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
            
          </div>
        </section>

        {/* SECCIÓN: Zona de Peligro (Danger Zone) */}
        <section className="pt-6">
          <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg mt-1 sm:mt-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-900">Eliminar cuenta</h3>
                <p className="text-sm text-red-700/80 mt-1 max-w-sm">
                  Esta acción es permanente. Se borrarán todos tus datos, historial de pedidos y direcciones.
                </p>
              </div>
            </div>
            <Button variant="destructive" className="shrink-0 rounded-xl font-medium shadow-sm">
              Eliminar mi cuenta
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}