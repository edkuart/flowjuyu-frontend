"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { departamentos } from "@/data/departamentos";
import { departamentosConMunicipios } from "@/data/municipios";

export default function NewBuyerAddressPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");

  const obtenerMunicipios = (depto: string): string[] => {
    const item = departamentosConMunicipios.find((d) => d.nombre === depto);
    return item ? item.municipios : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Sesion expirada",
        text: "Inicia sesión nuevamente",
      });
      return;
    }

    const body = {
      nombre_receptor: nombre,
      apellido_receptor: apellido,
      telefono,
      departamento,
      municipio,
      direccion_exacta: direccion,
      referencia,
    };

    try {
      const res = await fetch("http://localhost:8800/api/buyer/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error backend:", data);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo guardar la dirección",
        });

        return;
      }

      // ✔ SweetAlert2 de éxito + redirección
      Swal.fire({
        icon: "success",
        title: "Dirección guardada",
        text: "Tu dirección se guardó correctamente",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/buyer/addresses";
      });

    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-xl">

      <h1 className="text-2xl font-bold">Nueva dirección de envío</h1>
      <p className="text-muted-foreground">La dirección donde recibirás tus productos.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Nombre y apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nombre de quien recibe"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, ""))}
          />
          <Input
            placeholder="Apellidos de quien recibe"
            required
            value={apellido}
            onChange={(e) => setApellido(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, ""))}
          />
        </div>

        {/* Teléfono */}
        <Input
          type="text"
          placeholder="Número de teléfono"
          required
          maxLength={8}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))}
        />

        {/* Departamento y municipio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded-md p-2 h-10"
            required
            value={departamento}
            onChange={(e) => {
              setDepartamento(e.target.value);
              setMunicipio("");
            }}
          >
            <option value="">Departamento</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="border rounded-md p-2 h-10"
            required
            value={municipio}
            disabled={!departamento}
            onChange={(e) => setMunicipio(e.target.value)}
          >
            <option value="">Municipio</option>
            {obtenerMunicipios(departamento).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Dirección exacta */}
        <Input
          placeholder="Dirección exacta"
          required
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        {/* Referencia */}
        <Input
          placeholder="Referencia o indicaciones (opcional)"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
        />

        <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
          Guardar dirección
        </Button>

      </form>
    </div>
  );
}
