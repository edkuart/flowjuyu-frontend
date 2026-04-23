"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PageBackNav } from "@/components/ui/PageBackNav"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Tipo config ────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, {
  label: string
  description: string
  placeholder_asunto: string
  placeholder_mensaje: string
  icon: string
}> = {
  soporte: {
    label:               "Soporte general",
    description:         "Problemas con tu cuenta, productos o pagos.",
    icon:                "🛠️",
    placeholder_asunto:  "Ej: No puedo subir mis productos",
    placeholder_mensaje: "Describe tu problema con el mayor detalle posible. ¿Cuándo empezó? ¿Qué intentaste hacer?",
  },
  verificacion: {
    label:               "Verificación KYC",
    description:         "Validación de identidad y documentos DPI.",
    icon:                "🪪",
    placeholder_asunto:  "Ej: Mis documentos fueron rechazados",
    placeholder_mensaje: "Describe qué documento tienes problemas para subir o qué error ves al intentarlo.",
  },
  incidencia: {
    label:               "Incidencia técnica",
    description:         "Errores o fallos en la plataforma.",
    icon:                "⚡",
    placeholder_asunto:  "Ej: La página no carga correctamente",
    placeholder_mensaje: "¿Qué acción realizabas? ¿Qué error aparece? Puedes copiar el mensaje de error aquí.",
  },
  otro: {
    label:               "Otro",
    description:         "Consultas generales o cualquier otra solicitud.",
    icon:                "💬",
    placeholder_asunto:  "Ej: Quiero saber más sobre el plan Founder",
    placeholder_mensaje: "Cuéntanos cómo podemos ayudarte.",
  },
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NewSellerTicketPage() {
  const router = useRouter()

  const [asunto,    setAsunto]    = useState("")
  const [mensaje,   setMensaje]   = useState("")
  const [tipo,      setTipo]      = useState("soporte")
  const [prioridad, setPrioridad] = useState("media")
  const [loading,   setLoading]   = useState(false)

  const isValid  = asunto.trim().length > 3 && mensaje.trim().length > 10
  const tipoInfo = TIPO_CONFIG[tipo]

  async function handleSubmit() {
    if (!isValid) return
    try {
      setLoading(true)
      const res = await authFetch(`${API}/api/seller/tickets`, {
        method: "POST",
        body:   JSON.stringify({ asunto, mensaje, tipo, prioridad }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message ?? "Error al crear el ticket")
        return
      }
      toast.success("Ticket creado correctamente")
      router.push("/seller/tickets")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Back ──────────────────────────────────────────────────────────── */}
        <PageBackNav
          variant="panel"
          onClick={() => router.push("/seller/tickets")}
          label="Volver a mis tickets"
          meta="Soporte"
          title={<p className="truncate text-[15px] font-semibold text-[#14231c]">Crear nuevo ticket</p>}
        />

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h1 className="text-xl font-bold">Crear nuevo ticket</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cuéntanos tu problema y te ayudaremos lo antes posible.
          </p>
        </div>

        {/* ── Tipo selector ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-3">
          <Label className="text-sm font-semibold">Tipo de solicitud</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(TIPO_CONFIG).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTipo(key)}
                className={`text-left rounded-2xl border p-4 transition text-sm ${
                  tipo === key
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-border bg-background hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{info.icon}</span>
                  <p className="font-semibold text-sm">{info.label}</p>
                </div>
                <p className={`text-xs ${tipo === key ? "text-amber-700" : "text-muted-foreground"}`}>
                  {info.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── KYC helper ────────────────────────────────────────────────────── */}
        {tipo === "verificacion" && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🪪</span>
            <div>
              <p className="font-semibold text-purple-900 text-sm">
                Este ticket es para validación de identidad
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Asegúrate de tener tus documentos listos: DPI frontal, reverso y selfie.
                Podrás subirlos desde tu perfil de vendedor.
              </p>
            </div>
          </div>
        )}

        {/* ── Form fields ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">

          {/* Asunto */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Asunto</Label>
            <Input
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder={tipoInfo.placeholder_asunto}
              className="rounded-xl"
            />
            {asunto.trim().length > 0 && asunto.trim().length <= 3 && (
              <p className="text-xs text-red-500">El asunto es demasiado corto</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descripción</Label>
            <Textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={tipoInfo.placeholder_mensaje}
              className="rounded-xl resize-none"
              rows={5}
            />
            {mensaje.trim().length > 0 && mensaje.trim().length <= 10 && (
              <p className="text-xs text-red-500">La descripción es muy corta</p>
            )}
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Prioridad</Label>
            <div className="flex gap-3">
              {[
                { value: "baja",  label: "Baja",  active: "border-green-400 bg-green-50 text-green-800"    },
                { value: "media", label: "Media", active: "border-yellow-400 bg-yellow-50 text-yellow-800"  },
                { value: "alta",  label: "Alta",  active: "border-red-400 bg-red-50 text-red-800"           },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPrioridad(p.value)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    prioridad === p.value
                      ? p.active
                      : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500 font-bold">✓</span>
            Nuestro equipo responderá en menos de 24 horas
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 rounded-xl"
            >
              {loading ? "Creando..." : "Crear ticket"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/seller/tickets")}
              className="rounded-xl"
            >
              Cancelar
            </Button>
          </div>
          {!isValid && (asunto.trim().length > 0 || mensaje.trim().length > 0) && (
            <p className="text-xs text-muted-foreground text-center">
              Completa el asunto (mín. 4 caracteres) y la descripción (mín. 11 caracteres) para continuar
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
