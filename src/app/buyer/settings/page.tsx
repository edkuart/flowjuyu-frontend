"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Moon, Bell, Shield, Trash2 } from "lucide-react";

export default function BuyerSettingsPage() {
  return (
    <div className="space-y-10 max-w-2xl">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Ajusta tus preferencias de cuenta y notificaciones.
        </p>
      </div>

      {/* Notificaciones */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notificaciones
        </h2>

        <div className="border rounded-xl bg-white divide-y">
          <div className="flex items-center justify-between p-4">
            <span className="font-medium">Preferencias de notificaciones</span>
            <Link href="/buyer/notifications/settings">
              <Button variant="outline" size="sm">Configurar</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Idioma */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" /> Idioma
        </h2>

        <div className="border rounded-xl bg-white p-4">
          <p className="font-medium">Español (ES)</p>
          <p className="text-sm text-muted-foreground">Por ahora solo disponible en español.</p>
        </div>
      </section>

      {/* Tema */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Moon className="w-5 h-5" /> Tema
        </h2>

        <div className="border rounded-xl bg-white flex items-center justify-between p-4">
          <span className="font-medium">Modo oscuro</span>
          <Switch />
        </div>
      </section>

      {/* Seguridad */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" /> Seguridad
        </h2>

        <div className="border rounded-xl bg-white divide-y">
          <button className="w-full text-left p-4 hover:bg-zinc-50 transition">
            Cerrar todas las sesiones
          </button>
        </div>
      </section>

      {/* Eliminar cuenta */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
          <Trash2 className="w-5 h-5" /> Eliminar cuenta
        </h2>

        <p className="text-sm text-muted-foreground">
          Esta acción es permanente y no podrás recuperar tu información.
        </p>

        <Button variant="destructive">Eliminar cuenta</Button>
      </section>

    </div>
  );
}
