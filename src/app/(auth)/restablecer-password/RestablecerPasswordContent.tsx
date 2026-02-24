"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import AuthHeroLayout from "@/components/auth/AuthHeroLayout";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
).replace(/\/$/, "");

export default function RestablecerPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) return;

    if (passwordNueva !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordNueva.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passwordNueva }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No se pudo actualizar la contraseña.");
        return;
      }

      setMessage("Contraseña actualizada correctamente.");

      // Redirección elegante
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  // 🔴 Token inválido
  if (!token) {
    return (
      <AuthHeroLayout
        title="Enlace inválido"
        subtitle="Este enlace no es válido o ha expirado."
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl border text-center space-y-4">
          <p className="text-red-600 font-medium">
            El enlace de recuperación no es válido.
          </p>

          <button
            onClick={() => router.push("/recuperar-password")}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-black transition"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </AuthHeroLayout>
    );
  }

  return (
    <AuthHeroLayout
      title="Nueva contraseña"
      subtitle="Crea una contraseña segura para proteger tu cuenta."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-neutral-200/60"
      >
        {/* Nueva contraseña */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Nueva contraseña
          </label>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3
                       focus:ring-2 focus:ring-amber-500 
                       focus:border-amber-500 
                       outline-none transition-all"
          />
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Confirmar contraseña
          </label>
          <input
            type="password"
            required
            placeholder="Repite tu contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
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
          {loading ? "Actualizando contraseña..." : "Actualizar contraseña"}
        </button>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Éxito */}
        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl text-center">
            {message}
            <p className="mt-2 text-neutral-500 text-xs">
              Serás redirigido al inicio de sesión…
            </p>
          </div>
        )}
      </form>
    </AuthHeroLayout>
  );
}
