"use client";

import { useState, type ChangeEvent } from "react";
import { CheckCircle, KeyRound, XCircle } from "lucide-react";

import { SellerActionButton } from "@/components/seller/ui/SellerPrimitives";
import {
  sellerFieldClassName,
  sellerHelperTextClassName,
} from "@/components/seller/ui/sellerFormStyles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

export function SellerSecuritySection() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [mensaje, setMensaje] = useState("");

  const isValid = passwordActual.length >= 1 && passwordNueva.length >= 8;

  async function handleSubmit() {
    if (!isValid) return;

    setEstado("loading");
    setMensaje("");

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API}/api/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Error al actualizar");
      }

      setEstado("ok");
      setMensaje("Contraseña actualizada correctamente.");
      setPasswordActual("");
      setPasswordNueva("");
    } catch (err: any) {
      setEstado("error");
      setMensaje(err?.message || "No se pudo actualizar la contraseña.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm">Contraseña actual</Label>
            <Input
              type="password"
              value={passwordActual}
              disabled={estado === "loading"}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPasswordActual(e.target.value)
              }
              className={sellerFieldClassName}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Nueva contraseña</Label>
            <Input
              type="password"
              value={passwordNueva}
              disabled={estado === "loading"}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPasswordNueva(e.target.value)
              }
              className={sellerFieldClassName}
            />
            {passwordNueva.length > 0 && passwordNueva.length < 8 && (
              <p className={sellerHelperTextClassName}>Mínimo 8 caracteres.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SellerActionButton
            onClick={handleSubmit}
            disabled={estado === "loading" || !isValid}
            className="px-5"
          >
            {estado === "loading" ? "Actualizando…" : "Actualizar contraseña"}
          </SellerActionButton>
          <span className="text-xs text-[var(--seller-muted)]">
            Usa una clave única para Flowjuyu.
          </span>
        </div>

        {mensaje && (
          <div
            className={`flex items-center gap-2 rounded-[var(--seller-radius-md)] px-3 py-2 text-sm font-medium ${
              estado === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {estado === "ok" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {mensaje}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#0f2e22]/10 bg-[#fcfbf8] p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-white text-[#0F3D3A] shadow-sm">
          <KeyRound className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-neutral-800">Buena práctica</p>
        <ul className="mt-3 space-y-2 text-sm leading-5 text-neutral-500">
          <li>Al menos 8 caracteres.</li>
          <li>No reutilices claves de otros sitios.</li>
          <li>Cámbiala si compartiste tu acceso.</li>
        </ul>
      </div>
    </div>
  );
}
