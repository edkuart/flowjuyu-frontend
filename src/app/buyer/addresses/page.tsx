"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

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

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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

  const eliminarDireccion = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar dirección?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
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
        Swal.fire("Eliminada", "La dirección fue eliminada.", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Direcciones de envío</h1>
        <p className="text-muted-foreground">
          Administra tus direcciones guardadas para el checkout.
        </p>
      </div>

      {/* Botón para agregar */}
      <div>
        <Link href="/buyer/addresses/new">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-md px-5 py-2">
            + Agregar nueva dirección
          </Button>
        </Link>
      </div>

      {/* Lista de direcciones */}
      {loading ? (
        <p className="text-muted-foreground">Cargando direcciones...</p>
      ) : addresses.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Aún no tienes direcciones guardadas.
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <p className="font-semibold">
                {addr.nombre_receptor} {addr.apellido_receptor}
              </p>
              <p className="text-sm text-gray-600">{addr.telefono}</p>
              <p className="text-sm">
                {addr.departamento}, {addr.municipio}
              </p>
              <p className="text-sm">{addr.direccion_exacta}</p>

              {addr.referencia && (
                <p className="text-sm text-gray-500 italic">
                  Referencia: {addr.referencia}
                </p>
              )}

              <div className="flex gap-3 mt-3">
                <Link href={`/buyer/addresses/${addr.id}/edit`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Editar
                  </Button>
                </Link>

                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => eliminarDireccion(addr.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
