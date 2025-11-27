"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default function BuyerCardsPage() {
  const cards = []; // ← luego lo conectamos al backend/supabase

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold">Tarjetas guardadas</h1>
        <p className="text-muted-foreground">
          Gestiona tus métodos de pago guardados.
        </p>
      </div>

      {/* Botón agregar tarjeta */}
      <div>
        <Link href="/buyer/cards/new">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-md px-5 py-2">
            + Agregar tarjeta
          </Button>
        </Link>
      </div>

      {/* Vista vacía si no hay tarjetas */}
      {cards.length === 0 && (
        <div className="py-16 text-center space-y-4">
          <CreditCard className="w-12 h-12 mx-auto text-zinc-400" />
          <p className="text-lg font-medium text-zinc-700">
            Aún no tienes tarjetas guardadas
          </p>
          <p className="text-sm text-muted-foreground">
            Guarda una tarjeta para pagar más rápido en tus compras.
          </p>

          <Link href="/buyer/cards/new">
            <Button className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 rounded-md">
              Agregar tarjeta
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
