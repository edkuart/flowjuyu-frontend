"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function BuyerProfilePage() {
  const { user, logout } = useAuth();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [email, setEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/buyer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    <div className="space-y-10 max-w-xl">

      {/* PERFIL */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Perfil y contraseña</h2>

        <form onSubmit={onSave} className="space-y-4">

          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Apellido *</label>
            <Input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Número de teléfono *</label>
            <Input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Correo electrónico *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </section>

      {/* CAMBIO DE CONTRASEÑA */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cambio de contraseña</h2>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => alert("Aquí abriremos un modal de cambio de contraseña.")}
        >
          Cambiar contraseña
        </Button>
      </section>

      {/* BORRAR CUENTA */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Borrar cuenta</h2>
        <p className="text-sm text-muted-foreground">
          Al eliminar tu cuenta, se eliminará toda tu información de nuestra base de
          datos. Esto no se puede deshacer.
        </p>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => alert("Aquí haremos el proceso para borrar la cuenta.")}
        >
          Borrar cuenta
        </Button>
      </section>
    </div>
  );
}
