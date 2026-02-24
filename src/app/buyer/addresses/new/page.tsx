"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Save, MapPin } from "lucide-react";

import { departamentos } from "@/data/departamentos";
import { departamentosConMunicipios } from "@/data/municipios";

export default function NewBuyerAddressPage() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón de guardado

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
        title: "Sesión expirada",
        text: "Inicia sesión nuevamente",
      });
      router.push("/login");
      return;
    }

    setIsSaving(true);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/buyer/addresses`, {
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
          text: data.message || "No se pudo guardar la dirección",
        });
        return;
      }

      // ✔ SweetAlert2 de éxito + redirección optimizada de Next.js
      await Swal.fire({
        icon: "success",
        title: "Dirección guardada",
        text: "Tu dirección se guardó correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      
      router.push("/buyer/addresses");

    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ESTILO COMPARTIDO PARA LOS INPUTS Y SELECTS (Igual que en EditAddressPage)
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
            Nueva dirección
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Agrega la información de dónde recibirás tus productos.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nombre y apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre de quien recibe *</label>
              <Input
                placeholder="Ej. Juan"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, ""))}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Apellidos de quien recibe *</label>
              <Input
                placeholder="Ej. Pérez"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, ""))}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-medium text-gray-700">Teléfono de contacto *</label>
            <Input
              type="text"
              placeholder="Ej. 12345678"
              required
              maxLength={8}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))}
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
                  value={departamento}
                  onChange={(e) => {
                    setDepartamento(e.target.value);
                    setMunicipio("");
                  }}
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
                  value={municipio}
                  disabled={!departamento}
                  onChange={(e) => setMunicipio(e.target.value)}
                >
                  <option value="" disabled>Selecciona un municipio</option>
                  {obtenerMunicipios(departamento).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dirección exacta */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700">Dirección exacta *</label>
              <Input
                placeholder="Ej. 4ta Avenida 10-30 Zona 1"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Referencia */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Referencia o indicaciones <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <Input
                placeholder="Ej. Casa de portón verde frente al parque"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
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
                  <Save className="w-4 h-4 mr-2" /> Guardar dirección
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}