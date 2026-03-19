"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  UserCircle,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Loader2,
  Trash2
} from "lucide-react";

export default function BuyerProfilePage() {
  const { user, token } = useAuth();

  // Auth context carries the lean auth DTO: { id, name, email, role }.
  // Extended profile fields (apellido, telefono) are fetched from the API.
  const [nombre,   setNombre]   = useState(user?.name  ?? "");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email,    setEmail]    = useState(user?.email ?? "");

  // Load extended profile data on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/buyer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.nombre)   setNombre(data.nombre);
        if (data.apellido) setApellido(data.apellido);
        if (data.telefono) setTelefono(data.telefono);
        if (data.email || data.correo) setEmail(data.email ?? data.correo);
      })
      .catch(() => {});
  }, [token]);

  const [loading, setLoading] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/buyer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          apellido,
          telefono,
          email,
        }),
      });

      alert("Perfil actualizado correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      
      {/* TÍTULO */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra tu información personal y la seguridad de tu cuenta.
        </p>
      </div>

      <div className="space-y-6">
        {/* TARJETA: DATOS PERSONALES */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-semibold text-gray-900">Datos Personales</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={onSave} className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Apellido *</label>
                  <Input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> Número de teléfono *
                  </label>
                  <Input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Correo electrónico *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 shadow-sm transition-all"
                >
                  {loading ? (
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
        </section>

        {/* TARJETA: SEGURIDAD (Cambio de contraseña) */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Seguridad</h2>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Contraseña</h3>
              <p className="text-sm text-gray-500 mt-1">
                Te recomendamos usar una contraseña segura que no uses en otros sitios.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl font-medium shrink-0 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => alert("Aquí abriremos un modal de cambio de contraseña.")}
            >
              Cambiar contraseña
            </Button>
          </div>
        </section>

        {/* ZONA DE PELIGRO: BORRAR CUENTA */}
        <section className="pt-4">
          <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg mt-1 sm:mt-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-900">Borrar cuenta</h3>
                <p className="text-sm text-red-700/80 mt-1 max-w-sm">
                  Al eliminar tu cuenta, se borrará toda tu información de nuestra base de datos. Esto no se puede deshacer.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="shrink-0 rounded-xl font-medium shadow-sm"
              onClick={() => alert("Aquí haremos el proceso para borrar la cuenta.")}
            >
              Borrar cuenta
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}