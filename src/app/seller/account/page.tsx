"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil"

type EstadoValidacion =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | null

export default function SellerAccountPage() {
  const [estado, setEstado] =
    useState<EstadoValidacion>(null)

  const [observaciones, setObservaciones] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  // 🔐 Seguridad
  const [passwordActual, setPasswordActual] =
    useState("")
  const [passwordNueva, setPasswordNueva] =
    useState("")
  const [mensajePassword, setMensajePassword] =
    useState("")
  const [estadoPassword, setEstadoPassword] =
    useState<"idle" | "loading" | "ok" | "error">(
      "idle"
    )

  // 📩 Soporte
  const [mensajeSoporte, setMensajeSoporte] =
    useState("")
  const [estadoSoporte, setEstadoSoporte] =
    useState<"idle" | "loading" | "ok" | "error">(
      "idle"
    )

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGetVendedorPerfil()

        if (res.ok && res.perfil) {
          setEstado(
            res.perfil.estado_validacion ?? null
          )
          setObservaciones(
            res.perfil.observaciones ?? null
          )
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Cargando cuenta…
        </p>
      </main>
    )
  }

  const isPendiente = estado === "pendiente"
  const isAprobado = estado === "aprobado"
  const isRechazado = estado === "rechazado"

  // ============================
  // 🔐 Cambiar contraseña
  // ============================
  async function handleChangePassword() {
    try {
      setEstadoPassword("loading")

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
          body: JSON.stringify({
            passwordActual,
            passwordNueva,
          }),
        }
      )

      if (!res.ok)
        throw new Error(
          "No se pudo actualizar la contraseña"
        )

      setMensajePassword(
        "Contraseña actualizada correctamente."
      )
      setEstadoPassword("ok")
      setPasswordActual("")
      setPasswordNueva("")
    } catch (err: any) {
      setMensajePassword(
        err.message ||
          "Error al actualizar contraseña."
      )
      setEstadoPassword("error")
    }
  }

  // ============================
  // 📩 Soporte
  // ============================
  async function handleSoporte() {
    try {
      setEstadoSoporte("loading")

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
          body: JSON.stringify({
            mensaje: mensajeSoporte,
          }),
        }
      )

      if (!res.ok)
        throw new Error(
          "No se pudo enviar el mensaje"
        )

      setEstadoSoporte("ok")
      setMensajeSoporte("")
    } catch {
      setEstadoSoporte("error")
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto space-y-10">

      {/* ==============================
          1️⃣ Estado del Comercio
      ============================== */}
      <Card>
        <CardHeader>
          <CardTitle>
            Estado de verificación
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {isPendiente && (
            <>
              <Badge variant="secondary">
                En revisión
              </Badge>
              <p className="text-sm text-muted-foreground">
                Estamos revisando tu documentación.
                Esto puede tardar hasta 24 horas.
              </p>
            </>
          )}

          {isAprobado && (
            <>
              <Badge className="bg-emerald-100 text-emerald-700">
                Verificado
              </Badge>
              <p className="text-sm text-muted-foreground">
                Tu comercio está activo y puede
                publicar productos.
              </p>
            </>
          )}

          {isRechazado && (
            <div className="space-y-2">
              <Badge className="bg-red-100 text-red-700">
                Rechazado
              </Badge>

              {observaciones && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
                  Motivo: {observaciones}
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* ==============================
          2️⃣ Seguridad
      ============================== */}
      <Card>
        <CardHeader>
          <CardTitle>
            Seguridad de la cuenta
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <label className="text-sm">
              Contraseña actual
            </label>
            <Input
              type="password"
              value={passwordActual}
              onChange={(e) =>
                setPasswordActual(e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm">
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={passwordNueva}
              onChange={(e) =>
                setPasswordNueva(e.target.value)
              }
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              estadoPassword === "loading"
            }
          >
            {estadoPassword === "loading"
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </Button>

          {mensajePassword && (
            <p
              className={`text-sm ${
                estadoPassword === "error"
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {mensajePassword}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ==============================
          3️⃣ Soporte
      ============================== */}
      <Card>
        <CardHeader>
          <CardTitle>
            Soporte técnico
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Textarea
            placeholder="Describe tu problema..."
            value={mensajeSoporte}
            onChange={(e) =>
              setMensajeSoporte(e.target.value)
            }
          />

          <Button
            onClick={handleSoporte}
            disabled={
              estadoSoporte === "loading"
            }
          >
            {estadoSoporte === "loading"
              ? "Enviando..."
              : "Contactar soporte"}
          </Button>

          {estadoSoporte === "ok" && (
            <p className="text-green-600 text-sm">
              Mensaje enviado correctamente.
            </p>
          )}

          {estadoSoporte === "error" && (
            <p className="text-red-600 text-sm">
              Error al enviar el mensaje.
            </p>
          )}
        </CardContent>
      </Card>

    </main>
  )
}
