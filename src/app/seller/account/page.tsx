// src/app/seller/account/page.tsx

"use client"

import { useEffect, useState } from "react"
import {
  Shield,
  Lock,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileCheck,
  FileX,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const API = process.env.NEXT_PUBLIC_API_URL

type EstadoValidacion =
  | "pendiente"
  | "en_revision"
  | "aprobado"
  | "rechazado"
  | null

export default function SellerAccountPage() {
  const [loading, setLoading] = useState(true)

  const [estadoAdmin, setEstadoAdmin] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoValidacion>(null)
  const [observaciones, setObservaciones] = useState<string | null>(null)
  const [puedePublicar, setPuedePublicar] = useState(false)

  // 🔥 Estado seguro para evitar crash
  const [documentos, setDocumentos] = useState({
    dpi_frente: { subido: false },
    dpi_reverso: { subido: false },
    selfie_dpi: { subido: false },
  })

  // 🔐 Seguridad
  const [passwordActual, setPasswordActual] = useState("")
  const [passwordNueva, setPasswordNueva] = useState("")
  const [mensajePassword, setMensajePassword] = useState("")
  const [estadoPassword, setEstadoPassword] =
    useState<"idle" | "loading" | "ok" | "error">("idle")

  // 📩 Soporte
  const [mensajeSoporte, setMensajeSoporte] = useState("")
  const [estadoSoporte, setEstadoSoporte] =
    useState<"idle" | "loading" | "ok" | "error">("idle")

  /* ============================================
     📡 Cargar estado desde backend
  ============================================ */

  useEffect(() => {
    async function load() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null

        const res = await fetch(`${API}/api/seller/account-status`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        if (!res.ok) {
          console.error("Error account-status:", await res.text())
          setLoading(false)
          return
        }

        const data = await res.json()

        setEstado(data.estado_validacion ?? null)
        setObservaciones(data.observaciones ?? null)
        setPuedePublicar(Boolean(data.puede_publicar))

        // 🔥 Solo si backend manda documentos
        if (data.documentos) {
          setDocumentos({
            dpi_frente: {
              subido: Boolean(data.documentos?.dpi_frente),
            },
            dpi_reverso: {
              subido: Boolean(data.documentos?.dpi_reverso),
            },
            selfie_dpi: {
              subido: Boolean(data.documentos?.selfie_dpi),
            },
          })
        }

      } catch (err) {
        console.error("Error cargando cuenta:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando cuenta...</p>
      </main>
    )
  }

  /* ============================================
     🔐 Cambiar contraseña
  ============================================ */

  async function handleChangePassword() {
    try {
      setEstadoPassword("loading")

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null

      const res = await fetch(
        `${API}/api/users/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            passwordActual,
            passwordNueva,
          }),
        }
      )

      if (!res.ok) throw new Error()

      setMensajePassword("Contraseña actualizada correctamente.")
      setEstadoPassword("ok")
      setPasswordActual("")
      setPasswordNueva("")
    } catch {
      setMensajePassword("Error al actualizar contraseña.")
      setEstadoPassword("error")
    }
  }

  /* ============================================
     📩 Soporte
  ============================================ */

  async function handleSoporte() {
    try {
      setEstadoSoporte("loading")

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null

      const res = await fetch(
        `${API}/api/support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            mensaje: mensajeSoporte,
          }),
        }
      )

      if (!res.ok) throw new Error()

      setEstadoSoporte("ok")
      setMensajeSoporte("")
    } catch {
      setEstadoSoporte("error")
    }
  }

  /* ============================================
     🎨 Render estado badge
  ============================================ */

  const renderEstado = () => {
  switch (estado) {
    case "pendiente":
      return (
        <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
          <AlertCircle className="w-3 h-3" />
          Pendiente de envío de documentos
        </span>
      )

    case "en_revision":
      return (
        <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
          <AlertCircle className="w-3 h-3" />
          En revisión
        </span>
      )

    case "aprobado":
      return (
        <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
          <CheckCircle className="w-3 h-3" />
          Verificado
        </span>
      )

    case "rechazado":
      return (
        <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
          <XCircle className="w-3 h-3" />
          Rechazado
        </span>
      )

    default:
      return null
  }
}

  return (
    <main className="min-h-screen px-6 py-12 space-y-12 max-w-4xl mx-auto bg-[#f8f5ef]">

      {/* HEADER */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Cuenta y seguridad
        </h1>
        <p className="text-neutral-600">
          Gestiona la seguridad de tu cuenta y el estado de verificación.
        </p>
      </section>

      {/* ESTADO VERIFICACIÓN */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6 space-y-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Shield className="w-5 h-5" />
              Estado de verificación
            </div>
            {renderEstado()}
          </div>

          {(estado === "pendiente" || estado === "en_revision") && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-md">
              Podrás crear y editar productos, pero no podrás activarlos
              hasta que tu comercio sea aprobado.
            </div>
          )}

          {estado === "pendiente" && (
            <p className="text-sm text-neutral-600">
              Debes enviar tus documentos de identificación para activar tu comercio.
            </p>
          )}

          {estado === "en_revision" && (
            <p className="text-sm text-neutral-600">
              Tus documentos están siendo revisados. Este proceso puede tardar hasta 24 horas.
            </p>
          )}

          {estado === "aprobado" && (
            <p className="text-sm text-neutral-600">
              Tu comercio está verificado y puede operar normalmente.
            </p>
          )}

          {estado === "rechazado" && (
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                Tu verificación fue rechazada.
                {observaciones && (
                  <>
                    <br />
                    <strong>Motivo:</strong> {observaciones}
                  </>
                )}
              </div>
            </div>
          )}

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6 space-y-4">

              <h3 className="font-medium text-neutral-800">
                Estado operativo
              </h3>

              <div className="space-y-2 text-sm">

                <div className="flex justify-between">
                  <span>Crear productos</span>
                  <span className="text-green-600 font-medium">Permitido</span>
                </div>

                <div className="flex justify-between">
                  <span>Editar productos</span>
                  <span className="text-green-600 font-medium">Permitido</span>
                </div>

                <div className="flex justify-between">
                  <span>Activar productos</span>
                  {puedePublicar ? (
                    <span className="text-green-600 font-medium">Permitido</span>
                  ) : (
                    <span className="text-red-600 font-medium">Requiere aprobación</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Visible públicamente</span>
                  {puedePublicar ? (
                    <span className="text-green-600 font-medium">Sí</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </div>

              </div>

            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6 space-y-4">

              <h3 className="font-medium text-neutral-800">
                Estado administrativo
              </h3>

              <div className="flex justify-between text-sm">
                <span>Estado del comercio</span>

                {estadoAdmin === "activo" && (
                  <span className="text-green-600 font-medium">Activo</span>
                )}

                {estadoAdmin === "inactivo" && (
                  <span className="text-gray-600 font-medium">Inactivo</span>
                )}

                {estadoAdmin === "suspendido" && (
                  <span className="text-red-600 font-medium">Suspendido</span>
                )}
              </div>

              {estadoAdmin === "suspendido" && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
                  Tu comercio ha sido suspendido. Contacta soporte para más información.
                </div>
              )}

            </CardContent>
          </Card>

          {/* Documentos */}
          <div className="pt-4 space-y-2 text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              {documentos.dpi_frente.subido ? 
                <FileCheck className="w-4 h-4 text-green-600" /> 
                : 
                <FileX className="w-4 h-4 text-red-600" />
              }
              DPI frente
            </div>

            <div className="flex items-center gap-2">
              {documentos.dpi_reverso.subido ? 
                <FileCheck className="w-4 h-4 text-green-600" /> 
                : 
                <FileX className="w-4 h-4 text-red-600" />
              }
              DPI reverso
            </div>

            <div className="flex items-center gap-2">
              {documentos.selfie_dpi.subido ? 
                <FileCheck className="w-4 h-4 text-green-600" /> 
                : 
                <FileX className="w-4 h-4 text-red-600" />
              }
              Selfie con DPI
            </div>
          </div>

        </CardContent>
      </Card>

      {/* SEGURIDAD */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-5 h-5" />
            Seguridad de la cuenta
          </div>

          <div className="space-y-2">
            <Label>Contraseña actual</Label>
            <Input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Nueva contraseña</Label>
            <Input
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword}>
            Cambiar contraseña
          </Button>

          {mensajePassword && (
            <p className={`text-sm ${
              estadoPassword === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}>
              {mensajePassword}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SOPORTE */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-medium">
            <HelpCircle className="w-5 h-5" />
            Soporte técnico
          </div>

          <Textarea
            value={mensajeSoporte}
            onChange={(e) => setMensajeSoporte(e.target.value)}
            placeholder="Describe tu problema..."
          />

          <Button variant="secondary" onClick={handleSoporte}>
            Contactar soporte
          </Button>
        </CardContent>
      </Card>


    </main>
  )
}
