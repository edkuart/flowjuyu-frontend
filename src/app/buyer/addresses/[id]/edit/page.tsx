"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

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

  // Obtener municipios por departamento
  const obtenerMunicipios = (depto: string): string[] => {
    const item = departamentosConMunicipios.find((d) => d.nombre === depto);
    return item ? item.municipios : [];
  };

  // Cargar datos de la dirección
  useEffect(() => {
    const fetchAddress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `http://localhost:8800/api/buyer/addresses`,
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
        `http://localhost:8800/api/buyer/addresses/${id}`,
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
        timer: 1200,
        showConfirmButton: false,
      });

      router.push("/buyer/addresses");
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    }
  };

  if (loading || !form) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Editar dirección</h1>
      <p className="text-muted-foreground">
        Actualiza los datos de tu dirección.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nombre y apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={form.nombre_receptor}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                nombre_receptor: e.target.value,
              }))
            }
            placeholder="Nombre"
            required
          />

          <Input
            value={form.apellido_receptor}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                apellido_receptor: e.target.value,
              }))
            }
            placeholder="Apellidos"
            required
          />
        </div>

        {/* Teléfono */}
        <Input
          value={form.telefono}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              telefono: e.target.value.replace(/[^0-9]/g, ""),
            }))
          }
          maxLength={8}
          placeholder="Teléfono"
          required
        />

        {/* Departamento y municipio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded-md p-2 h-10"
            required
            value={form.departamento}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                departamento: e.target.value,
                municipio: "", // reset
              }))
            }
          >
            <option value="">Departamento</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md p-2 h-10"
            required
            value={form.municipio}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                municipio: e.target.value,
              }))
            }
          >
            <option value="">Municipio</option>
            {obtenerMunicipios(form.departamento).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección exacta */}
        <Input
          value={form.direccion_exacta}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              direccion_exacta: e.target.value,
            }))
          }
          placeholder="Dirección exacta"
          required
        />

        {/* Referencia */}
        <Input
          value={form.referencia ?? ""}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              referencia: e.target.value,
            }))
          }
          placeholder="Referencia (opcional)"
        />

        <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}

