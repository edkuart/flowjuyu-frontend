"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { ArrowLeft, Loader2, Save, MapPin } from "lucide-react";

import { departamentos } from "@/data/departamentos";
import { departamentosConMunicipios } from "@/data/municipios";

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

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [form, setForm] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para el guardado

  // Obtener municipios por departamento
  const obtenerMunicipios = (depto: string): string[] => {
    const item = departamentosConMunicipios.find((d) => d.nombre === depto);
    return item ? item.municipios : [];
  };

  // Cargar datos de la dirección
  useEffect(() => {
    const fetchAddress = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login"); // Redirección de seguridad
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/buyer/addresses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        const found = data.find((a: Address) => a.id === id);

        if (!found) {
          Swal.fire("Error", "Dirección no encontrada.", "error");
          router.push("/buyer/addresses");
          return;
        }

        setForm(found);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la dirección.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSaving(true);

    const payload = {
      nombre_receptor: form.nombre_receptor,
      apellido_receptor: form.apellido_receptor,
      telefono: form.telefono,
      departamento: form.departamento,
      municipio: form.municipio,
      direccion_exacta: form.direccion_exacta,
      referencia: form.referencia,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/buyer/addresses/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.message || "No se pudo guardar.", "error");
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Dirección actualizada",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/buyer/addresses");
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ESTADO: CARGANDO
  if (loading || !form) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-sm font-medium">Cargando información...</p>
      </div>
    );
  }

  // ESTILO COMPARTIDO PARA LOS INPUTS Y SELECTS
  const inputClassName = "rounded-xl border-gray-200 focus-visible:ring-orange-500 mt-1.5";
  const selectClassName = "flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5";

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER Y BOTÓN DE REGRESAR */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/buyer/addresses")}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-500" />
            Editar dirección
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Actualiza los datos para asegurarte de recibir tus compras sin problemas.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nombre y apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre del receptor *</label>
              <Input
                value={form.nombre_receptor}
                onChange={(e) =>
                  setForm((prev: any) => ({ ...prev, nombre_receptor: e.target.value }))
                }
                placeholder="Ej. Juan"
                required
                className={inputClassName}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Apellidos del receptor *</label>
              <Input
                value={form.apellido_receptor}
                onChange={(e) =>
                  setForm((prev: any) => ({ ...prev, apellido_receptor: e.target.value }))
                }
                placeholder="Ej. Pérez"
                required
                className={inputClassName}
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-medium text-gray-700">Teléfono de contacto *</label>
            <Input
              value={form.telefono}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, telefono: e.target.value.replace(/[^0-9]/g, "") }))
              }
              maxLength={8}
              placeholder="Ej. 12345678"
              required
              className={inputClassName}
            />
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Ubicación de entrega</h3>
            
            {/* Departamento y municipio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Departamento *</label>
                <select
                  className={selectClassName}
                  required
                  value={form.departamento}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      departamento: e.target.value,
                      municipio: "", // reset al cambiar departamento
                    }))
                  }
                >
                  <option value="" disabled>Selecciona un departamento</option>
                  {departamentos.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Municipio *</label>
                <select
                  className={selectClassName}
                  required
                  value={form.municipio}
                  disabled={!form.departamento}
                  onChange={(e) =>
                    setForm((prev: any) => ({ ...prev, municipio: e.target.value }))
                  }
                >
                  <option value="" disabled>Selecciona un municipio</option>
                  {obtenerMunicipios(form.departamento).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dirección exacta */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700">Dirección exacta *</label>
              <Input
                value={form.direccion_exacta}
                onChange={(e) =>
                  setForm((prev: any) => ({ ...prev, direccion_exacta: e.target.value }))
                }
                placeholder="Ej. 4ta Avenida 10-30 Zona 1"
                required
                className={inputClassName}
              />
            </div>

            {/* Referencia */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Referencia adicional <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <Input
                value={form.referencia ?? ""}
                onChange={(e) =>
                  setForm((prev: any) => ({ ...prev, referencia: e.target.value }))
                }
                placeholder="Ej. Casa de portón verde frente al parque"
                className={inputClassName}
              />
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/buyer/addresses")}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all sm:min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Guardar cambios
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}