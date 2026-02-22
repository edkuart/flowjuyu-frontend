"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Package, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";

type Notificacion = {
  id: string;
  tipo: "pedido" | "alerta" | "info";
  mensaje: string;
  detalle?: string;
  fecha: string;
  pedido_id?: string;
};

export default function BuyerNotificationsPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fake: Notificacion[] = [
      {
        id: "1",
        tipo: "pedido",
        mensaje: "Tu pedido #89764 va en camino",
        detalle: "El repartidor te visitará pronto.",
        fecha: "hace 3 días",
      },
      {
        id: "2",
        tipo: "alerta",
        mensaje: "Envíale el código de autorización al repartidor",
        detalle: "Esto asegura la entrega de tu pedido #89764",
        fecha: "hace 6 días",
      },
      {
        id: "3",
        tipo: "info",
        mensaje: "Agrega 5% de descuento en tu siguiente compra",
        detalle: "Usa el código FLOWJUYU5 en tu checkout.",
        fecha: "hace 10 días",
      },
    ];

    setTimeout(() => {
      setNotificaciones(fake);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        
        <Link href="/buyer/notifications/settings">
        <Button
          variant="outline"
          className="rounded-md"
        >
          Configurar
        </Button>
        </Link>
      </div>

      {/* LISTA DE NOTIFICACIONES */}
      <div className="space-y-4">
        {loading && (
          <p className="text-muted-foreground">Cargando notificaciones...</p>
        )}

        {!loading && notificaciones.length === 0 && (
          <p className="text-muted-foreground">
            No tienes notificaciones aún.
          </p>
        )}

        {!loading &&
          notificaciones.map((n) => (
            <NotificacionItem key={n.id} data={n} />
          ))}
      </div>
    </div>
  );
}

/* ============================
   COMPONENTE: ITEM DE NOTIFICACIÓN
   ============================ */

function NotificacionItem({ data }: { data: Notificacion }) {
  const icon =
    data.tipo === "pedido" ? (
      <Package className="w-6 h-6 text-zinc-900" />
    ) : data.tipo === "alerta" ? (
      <AlertTriangle className="w-6 h-6 text-orange-600" />
    ) : (
      <Info className="w-6 h-6 text-blue-600" />
    );

  return (
    <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="font-medium text-zinc-800">{data.mensaje}</p>
          {data.detalle && (
            <p className="text-sm text-muted-foreground">{data.detalle}</p>
          )}
          <span className="text-xs text-zinc-500">{data.fecha}</span>
        </div>
      </div>

      <Link href="/buyer/orders">
        <Button variant="outline" className="text-sm">
          Ver
        </Button>
      </Link>
    </div>
  );
}
