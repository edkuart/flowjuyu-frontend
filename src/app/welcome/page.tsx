"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, Loader2 } from "lucide-react";

export default function WelcomePage() {
  const router  = useRouter();
  const { user, token, login } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "bienvenido";

  const handleBecomesSeller = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiUrl()}/api/seller/activate`, {
        method:      "POST",
        credentials: "include",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok || !json.ok || !json.user) {
        setError(json.message || "No se pudo activar la cuenta de vendedor.");
        return;
      }

      // Update in-memory auth state with promoted role — keep existing token.
      // The access token's payload still says "buyer" but the backend always
      // reads role from the DB, so seller routes work immediately.
      // On next token refresh the new token will carry role:"seller".
      login(json.user, token);

      router.push("/seller/my-business");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-10">

        {/* Greeting */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-2">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            ¡Hola, {firstName}!
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed">
            Tu cuenta está lista. ¿Cómo quieres empezar?
          </p>
        </div>

        {/* CTAs */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Explore */}
          <button
            onClick={() => router.push("/productos")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-left hover:border-orange-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-50 group-hover:bg-orange-50 transition-colors">
              <ShoppingBag className="w-6 h-6 text-neutral-600 group-hover:text-orange-500 transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-sm">Explorar productos</p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Descubre artesanías guatemaltecas únicas.
              </p>
            </div>
          </button>

          {/* Create store */}
          <button
            onClick={handleBecomesSeller}
            disabled={loading}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-left hover:bg-orange-100 hover:border-orange-400 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white group-hover:bg-orange-50 transition-colors">
              {loading ? (
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              ) : (
                <Store className="w-6 h-6 text-orange-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-orange-700 text-sm">
                {loading ? "Creando tu tienda..." : "Crear mi tienda"}
              </p>
              <p className="text-xs text-orange-600/70 mt-1 leading-relaxed">
                Empieza a vender en minutos. Sin formularios largos.
              </p>
            </div>
          </button>

        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <p className="text-xs text-neutral-400">
          Puedes cambiar esto en cualquier momento desde tu perfil.
        </p>

      </div>
    </main>
  );
}
