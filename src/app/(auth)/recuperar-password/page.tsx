"use client";

import { useState } from "react";
import Link from "next/link";
import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
).replace(/\/$/, "");

export default function RecuperarPasswordPage() {
  const [correo,       setCorreo]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNetworkError(null);

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ correo }),
        signal:  controller.signal,
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setNetworkError("No se pudo enviar el enlace. Intenta más tarde.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setNetworkError("La solicitud tardó demasiado. Verifica tu conexión.");
      } else {
        setNetworkError("Error de red. Intenta nuevamente.");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <AuthHeroLayout
        title="Revisa tu correo"
        subtitle="Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      >
        <AuthLayout heading="Enlace enviado">
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 leading-relaxed">
                Si <span className="font-medium">{correo}</span> está registrado, recibirás
                instrucciones en los próximos minutos. El enlace es válido por{" "}
                <span className="font-medium">15 minutos</span>.
              </p>
            </div>
            <p className="text-xs text-neutral-400 text-center">
              No olvides revisar tu carpeta de spam.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline underline-offset-4 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </AuthLayout>
      </AuthHeroLayout>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <AuthHeroLayout
      title="Recupera tu acceso"
      subtitle="Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña."
    >
      <AuthLayout
        heading="Recupera tu acceso"
        subheading="Te enviaremos un enlace válido por 15 minutos."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="correo" className="text-sm text-neutral-700">
              Correo electrónico
            </Label>
            <Input
              id="correo"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando instrucciones…
              </span>
            ) : (
              "Enviar enlace"
            )}
          </Button>

          {networkError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
              {networkError}
            </div>
          )}

          <p className="text-center text-sm text-neutral-500">
            <Link
              href="/login"
              className="font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline underline-offset-4 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      </AuthLayout>
    </AuthHeroLayout>
  );
}
