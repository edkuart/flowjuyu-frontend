"use client";

import { useState } from "react";
import AuthHeroLayout from "@/components/auth/AuthHeroLayout";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
).replace(/\/$/, "");

export default function RecuperarPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Ocurrió un error inesperado.");
        return;
      }

      setMessage(
        data?.message ||
          "Si el correo existe, recibirás instrucciones."
      );
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthHeroLayout
      title="Recupera tu acceso"
      subtitle="Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-neutral-200/60"
      >
        {/* Campo correo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 
                       focus:ring-2 focus:ring-amber-500 
                       focus:border-amber-500 
                       outline-none transition-all"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 hover:bg-black 
                     text-white py-3 rounded-xl font-medium 
                     shadow-md transition-all duration-200 
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando instrucciones..." : "Enviar enlace"}
        </button>

        {/* Mensaje éxito */}
        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl text-center">
            {message}
          </div>
        )}

        {/* Mensaje error */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Link volver */}
        <div className="text-center text-sm text-neutral-600">
          <a
            href="/login"
            className="underline hover:text-neutral-900 transition-colors"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </form>
    </AuthHeroLayout>
  );
}
