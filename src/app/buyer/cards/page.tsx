"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  ShieldCheck,
  Loader2
} from "lucide-react";

// Definimos la estructura que esperarás de tu Base de Datos / Procesador de pagos
type Tarjeta = {
  id: string;
  marca: string; // Ej: "visa", "mastercard"
  ultimos_cuatro: string;
  mes_expiracion: string;
  anio_expiracion: string;
  es_predeterminada: boolean;
};

export default function BuyerCardsPage() {
  // Estados preparados para cuando conectes tu backend
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí irá la llamada a tu API o Supabase para obtener las tarjetas
    const cargarTarjetas = async () => {
      try {
        // const res = await fetch('/api/buyer/cards');
        // const data = await res.json();
        // setTarjetas(data);
        
        setTarjetas([]); // Lo dejamos vacío para el Empty State
      } catch (error) {
        console.error("Error al cargar tarjetas:", error);
      } finally {
        setLoading(false); // Simulamos que ya cargó
      }
    };

    cargarTarjetas();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER: Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Tarjetas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus métodos de pago para un checkout más rápido.
          </p>
        </div>
        
        <Link href="/buyer/cards/new" className="shrink-0">
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarjeta
          </Button>
        </Link>
      </div>

      {/* BANNER DE SEGURIDAD */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-green-800">Tus datos están protegidos</h4>
          <p className="text-sm text-green-700 mt-0.5">
            No almacenamos los datos completos de tus tarjetas. Todos los pagos son procesados de forma encriptada y segura.
          </p>
        </div>
      </div>

      {/* ESTADO: CARGANDO */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-medium">Cargando tus métodos de pago...</p>
        </div>
      )}

      {/* ESTADO: VACÍO */}
      {!loading && tarjetas.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CreditCard className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no tienes tarjetas guardadas
          </h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Agrega una tarjeta de crédito o débito para realizar tus compras de forma segura y en un solo clic.
          </p>
          <Link href="/buyer/cards/new">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Agregar mi primera tarjeta
            </Button>
          </Link>
        </div>
      )}

      {/* LISTA DE TARJETAS (PREPARADA) */}
      {!loading && tarjetas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tarjetas.map((tarjeta) => (
            <div 
              key={tarjeta.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                tarjeta.es_predeterminada ? "border-orange-500 ring-1 ring-orange-500/20" : "border-gray-200"
              }`}
            >
              {/* Info visual de la tarjeta */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-8 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                    {/* Aquí podrías renderizar un logo de Visa/Mastercard según tarjeta.marca */}
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {tarjeta.es_predeterminada && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-orange-500" /> Predeterminada
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-mono text-gray-900 tracking-widest">
                    **** **** **** {tarjeta.ultimos_cuatro}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vence: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-2">
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </Button>
                
                {!tarjeta.es_predeterminada && (
                  <Button variant="ghost" size="sm" className="ml-auto text-gray-500 hover:text-gray-900 rounded-lg text-xs">
                    Hacer predeterminada
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}