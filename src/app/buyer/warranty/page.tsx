"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WarrantyPage() {
  const [tab, setTab] = useState<"proceso" | "finalizadas">("proceso");

  return (
    <div className="space-y-8">

      {/* Título */}
      <h1 className="text-2xl font-bold">Garantías y reclamos</h1>

      {/* Tabs */}
      <div className="border-b flex gap-8 text-sm">
        <button
          onClick={() => setTab("proceso")}
          className={`pb-2 ${
            tab === "proceso"
              ? "border-b-2 border-red-500 text-red-500 font-medium"
              : "text-zinc-600 hover:text-zinc-800"
          }`}
        >
          En proceso
        </button>

        <button
          onClick={() => setTab("finalizadas")}
          className={`pb-2 ${
            tab === "finalizadas"
              ? "border-b-2 border-red-500 text-red-500 font-medium"
              : "text-zinc-600 hover:text-zinc-800"
          }`}
        >
          Finalizadas
        </button>
      </div>

      {/* Contenido vacío */}
      <div className="flex flex-col items-center text-center mt-16">

        {/* Imagen ilustrativa */}
        <div className="w-60 h-40 bg-zinc-100 rounded-xl flex items-center justify-center mb-5">
          <span className="text-sm text-zinc-500">
            (imagen o ilustración aquí)
          </span>
        </div>

        {/* Mensaje */}
        <p className="text-zinc-600 max-w-md">
          Para crear un reclamo ve al pedido, busca el producto y
          presiona el botón <strong>“Solicitar garantía”</strong>
        </p>

        {/* Botón */}
        <Link href="/buyer/orders">
          <Button className="mt-6 rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
            Ir a mis pedidos
          </Button>
        </Link>
      </div>
    </div>
  );
}
