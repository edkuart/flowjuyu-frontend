"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileWarning, SearchX } from "lucide-react"; // Importamos íconos

export default function WarrantyPage() {
  const [tab, setTab] = useState<"proceso" | "finalizadas">("proceso");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Garantías y reclamos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las devoluciones o problemas con tus productos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200">
        <button
          onClick={() => setTab("proceso")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            tab === "proceso"
              ? "text-orange-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          En proceso
          {/* Indicador inferior animado */}
          {tab === "proceso" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-md" />
          )}
        </button>

        <button
          onClick={() => setTab("finalizadas")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            tab === "finalizadas"
              ? "text-orange-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Finalizadas
          {tab === "finalizadas" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-md" />
          )}
        </button>
      </div>

      {/* Contenido (Estado Vacío Mejorado) */}
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        
        {/* Ícono ilustrativo dinámico */}
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          {tab === "proceso" ? (
            <FileWarning className="w-10 h-10 text-orange-500" />
          ) : (
            <ShieldCheck className="w-10 h-10 text-orange-500" />
          )}
        </div>

        {/* Mensaje dinámico */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {tab === "proceso" 
            ? "No tienes reclamos en proceso" 
            : "No tienes reclamos finalizados"}
        </h3>
        
        <p className="text-gray-500 max-w-sm mb-8">
          Para crear un reclamo ve a tus pedidos, busca el producto y presiona el botón <strong>“Solicitar garantía”</strong>.
        </p>

        {/* Botón */}
        <Link href="/buyer/orders">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm transition-all">
            Ir a mis pedidos
          </Button>
        </Link>
      </div>
    </div>
  );
}