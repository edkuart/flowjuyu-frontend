"use client"

import { useState, type ChangeEvent } from "react"
import { CheckCircle, Lock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      <div className="flex items-start gap-3 rounded-[24px] border border-neutral-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(247,245,238,0.92))] px-4 py-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
          <Lock className="h-4 w-4 text-neutral-600" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-800">Contraseña de acceso</p>
          <p className="text-sm text-neutral-500">
            Usa una contraseña única y de al menos 8 caracteres para proteger tu panel.
          </p>
        </div>
      </div>

      <div className="rounded-[26px] border border-neutral-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,248,243,0.96))] p-5 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.22)]">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Actualizar contraseña</h3>
            <p className="text-sm text-neutral-500">
              Cambia tu clave actual para reforzar el acceso a tu panel.
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
            Recomendado
          </span>
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
                className="rounded-xl border-neutral-200 bg-white/90"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Nueva contraseña</Label>
              <Input
                type="password"
                value={passwordNueva}
                disabled={estado === "loading"}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordNueva(e.target.value)}
                className="rounded-xl border-neutral-200 bg-white/90"
              />
              {passwordNueva.length > 0 && passwordNueva.length < 8 && (
                <p className="text-xs text-amber-600">La contraseña debe tener al menos 8 caracteres.</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={estado === "loading" || !isValid}
            className="rounded-xl bg-[#0F3D3A] px-5 text-white shadow-[0_16px_30px_-20px_rgba(15,61,58,0.7)] hover:bg-[#0a2e2c]"
          >
            {estado === "loading" ? "Actualizando…" : "Actualizar contraseña"}
          </Button>

          {mensaje && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
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
      </div>
    </div>
  )
}
