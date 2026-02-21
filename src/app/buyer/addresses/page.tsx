"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  MapPinOff
} from "lucide-react";

interface Address {
  id: number;
  nombre_receptor: string;
  apellido_receptor: string;
  telefono: string;
  departamento: string;
  municipio: string;
  direccion_exacta: string;
  referencia: string | null;
}

export default function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar direcciones (Lógica original)
  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8800/api/buyer/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAddresses(data);
        } else {
          console.error("Error cargando direcciones:", data);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Eliminar dirección (Lógica original con SweetAlert2)
  const eliminarDireccion = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar dirección?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Color rojo de Tailwind para peligro
      cancelButtonColor: "#6b7280", // Gris
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `http://localhost:8800/api/buyer/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id));
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "La dirección fue eliminada.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", "No se pudo eliminar.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER: Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los lugares donde recibes tus compras.
          </p>
        </div>
        
        <Link href="/buyer/addresses/new" className="shrink-0">
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Dirección
          </Button>
        </Link>
      </div>

      {/* ESTADO: CARGANDO */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-medium">Cargando tus direcciones...</p>
        </div>
      )}

      {/* ESTADO: VACÍO */}
      {!loading && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MapPinOff className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no tienes direcciones guardadas
          </h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Agrega una dirección para agilizar tu proceso de compra y recibir tus productos sin problemas.
          </p>
          <Link href="/buyer/addresses/new">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Agregar mi primera dirección
            </Button>
          </Link>
        </div>
      )}

      {/* LISTA DE DIRECCIONES (GRID) */}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div 
              key={addr.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Info de la dirección */}
              <div>
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {addr.nombre_receptor} {addr.apellido_receptor}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tel: {addr.telefono}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-800">{addr.direccion_exacta}</p>
                  <p>{addr.municipio}, {addr.departamento}</p>
                  {addr.referencia && (
                    <p className="text-gray-400 italic pt-1">
                      Ref: {addr.referencia}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                <Link href={`/buyer/addresses/${addr.id}/edit`}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => eliminarDireccion(addr.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}