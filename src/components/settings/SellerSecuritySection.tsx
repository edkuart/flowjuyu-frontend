"use client"

import { useState, type ChangeEvent } from "react"
import { CheckCircle, Lock, XCircle } from "lucide-react"

import { SellerActionButton, SellerPill, SellerSurfaceCard } from "@/components/seller/ui/SellerPrimitives"
import { sellerFieldClassName, sellerHelperTextClassName } from "@/components/seller/ui/sellerFormStyles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

export function SellerSecuritySection() {
  const [passwordActual, setPasswordActual] = useState("")
  const [passwordNueva, setPasswordNueva] = useState("")
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  const isValid = passwordActual.length >= 1 && passwordNueva.length >= 8

  async function handleSubmit() {
    if (!isValid) return

    setEstado("loading")
    setMensaje("")

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${API}/api/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Error al actualizar")
      }

      setEstado("ok")
      setMensaje("Contraseña actualizada correctamente.")
      setPasswordActual("")
      setPasswordNueva("")
    } catch (err: any) {
      setEstado("error")
      setMensaje(err?.message || "No se pudo actualizar la contraseña.")
    }
  }

  return (
    <div className="space-y-6">
      <SellerSurfaceCard tone="soft" className="flex items-start gap-3 px-4 py-4">
        <div className="rounded-[var(--seller-radius-md)] border border-[var(--seller-line)] bg-white p-2 shadow-[var(--seller-shadow-panel)]">
          <Lock className="h-4 w-4 text-[var(--seller-muted)]" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--seller-ink)]">Contraseña de acceso</p>
          <p className="text-sm text-[var(--seller-muted)]">
            Usa una contraseña única y de al menos 8 caracteres para proteger tu panel.
          </p>
        </div>
      </SellerSurfaceCard>

      <SellerSurfaceCard className="p-5">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--seller-line)] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--seller-ink)]">Actualizar contraseña</h3>
            <p className="text-sm text-[var(--seller-muted)]">
              Cambia tu clave actual para reforzar el acceso a tu panel.
            </p>
          </div>
          <SellerPill tone="neutral">Recomendado</SellerPill>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Contraseña actual</Label>
              <Input
                type="password"
                value={passwordActual}
                disabled={estado === "loading"}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordActual(e.target.value)}
                className={sellerFieldClassName}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Nueva contraseña</Label>
              <Input
                type="password"
                value={passwordNueva}
                disabled={estado === "loading"}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordNueva(e.target.value)}
                className={sellerFieldClassName}
              />
              {passwordNueva.length > 0 && passwordNueva.length < 8 && (
                <p className={sellerHelperTextClassName}>La contraseña debe tener al menos 8 caracteres.</p>
              )}
            </div>
          </div>

          <SellerActionButton
            onClick={handleSubmit}
            disabled={estado === "loading" || !isValid}
            className="px-5"
          >
            {estado === "loading" ? "Actualizando…" : "Actualizar contraseña"}
          </SellerActionButton>

          {mensaje && (
            <div
              className={`flex items-center gap-2 rounded-[var(--seller-radius-md)] px-3 py-2 text-sm font-medium ${
                estado === "ok"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {estado === "ok" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {mensaje}
            </div>
          )}
        </div>
      </SellerSurfaceCard>
    </div>
  )
}
