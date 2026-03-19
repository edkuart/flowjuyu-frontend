"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
).replace(/\/$/, "");

type ResetCode = "TOKEN_EXPIRED" | "TOKEN_INVALID" | "VALIDATION_ERROR" | "INTERNAL_ERROR";

const CODE_COPY: Record<ResetCode, { title: string; body: string }> = {
  TOKEN_EXPIRED: {
    title: "El enlace ha expirado",
    body:  "Los enlaces de recuperación son válidos por 15 minutos. Solicita uno nuevo.",
  },
  TOKEN_INVALID: {
    title: "El enlace no es válido",
    body:  "Este enlace ya fue usado o no es correcto. Solicita uno nuevo.",
  },
  VALIDATION_ERROR: {
    title: "Error de validación",
    body:  "Revisa que la contraseña tenga al menos 8 caracteres.",
  },
  INTERNAL_ERROR: {
    title: "Error del servidor",
    body:  "Ocurrió un error inesperado. Intenta nuevamente en unos minutos.",
  },
};

// Shared input class — matches LoginForm exactly
const INPUT_CLS =
  "h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all";

export default function RestablecerPasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [passwordNueva,     setPasswordNueva]     = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mismatch,          setMismatch]          = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [success,           setSuccess]           = useState(false);
  const [countdown,         setCountdown]         = useState(3);
  const [errorCode,         setErrorCode]         = useState<ResetCode | null>(null);
  const [networkError,      setNetworkError]      = useState<string | null>(null);

  // Countdown after success → redirect to /login
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!success) return;
    timerRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timerRef.current!);
          router.push("/login");
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [success, router]);

  function handleConfirmBlur() {
    setMismatch(confirmarPassword.length > 0 && confirmarPassword !== passwordNueva);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (passwordNueva !== confirmarPassword) {
      setMismatch(true);
      return;
    }

    if (passwordNueva.length < 8) {
      setNetworkError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setLoading(true);
    setErrorCode(null);
    setNetworkError(null);

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10_000);

    try {
      const res  = await fetch(`${API_URL}/api/reset-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, passwordNueva }),
        signal:  controller.signal,
      });

      const data: { ok: boolean; code?: string; message?: string } = await res.json();

      if (res.ok && data.ok) {
        setSuccess(true);
        return;
      }

      const raw  = data.code ?? "INTERNAL_ERROR";
      const code = (raw in CODE_COPY ? raw : "INTERNAL_ERROR") as ResetCode;
      setErrorCode(code);
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

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthHeroLayout
        title="¡Contraseña actualizada!"
        subtitle="Tu contraseña fue cambiada correctamente."
      >
        <AuthLayout heading="¡Listo!">
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 leading-relaxed">
                Tu contraseña fue actualizada correctamente. Serás redirigido en{" "}
                <span className="font-semibold">{countdown}</span>{" "}
                segundo{countdown !== 1 ? "s" : ""}…
              </p>
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline underline-offset-4 transition-colors"
            >
              Ir al inicio de sesión →
            </Link>
          </div>
        </AuthLayout>
      </AuthHeroLayout>
    );
  }

  // ── Token-level error screen ─────────────────────────────────────────────
  if (!token || errorCode === "TOKEN_INVALID" || errorCode === "TOKEN_EXPIRED") {
    const copy = errorCode
      ? CODE_COPY[errorCode]
      : { title: "Enlace inválido", body: "Este enlace no es válido o ha expirado." };
    return (
      <AuthHeroLayout title={copy.title} subtitle={copy.body}>
        <AuthLayout heading={copy.title}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">{copy.body}</p>
            <Button
              onClick={() => router.push("/recuperar-password")}
              className="w-full h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </AuthLayout>
      </AuthHeroLayout>
    );
  }

  // ── Reset form ───────────────────────────────────────────────────────────
  return (
    <AuthHeroLayout
      title="Nueva contraseña"
      subtitle="Crea una contraseña segura para proteger tu cuenta."
    >
      <AuthLayout
        heading="Nueva contraseña"
        subheading="Debe tener al menos 8 caracteres."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="passwordNueva" className="text-sm text-neutral-700">
              Nueva contraseña
            </Label>
            <Input
              id="passwordNueva"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              value={passwordNueva}
              onChange={(e) => {
                setPasswordNueva(e.target.value);
                if (mismatch) setMismatch(e.target.value !== confirmarPassword);
              }}
              className={INPUT_CLS}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarPassword" className="text-sm text-neutral-700">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmarPassword"
              type="password"
              required
              placeholder="Repite tu contraseña"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value);
                if (mismatch) setMismatch(e.target.value !== passwordNueva);
              }}
              onBlur={handleConfirmBlur}
              className={
                mismatch
                  ? "h-11 rounded-xl border-red-400 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-0 transition-all"
                  : INPUT_CLS
              }
            />
            {mismatch && (
              <p className="text-xs text-red-600">Las contraseñas no coinciden.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || mismatch}
            className="w-full h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Actualizando contraseña…
              </span>
            ) : (
              "Actualizar contraseña"
            )}
          </Button>

          {(networkError || errorCode) && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
              {networkError ?? CODE_COPY[errorCode!]?.body}
            </div>
          )}
        </form>
      </AuthLayout>
    </AuthHeroLayout>
  );
}
