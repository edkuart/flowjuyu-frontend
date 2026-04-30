"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Wrench,
  BadgeCheck,
  Zap,
  MessageCircle,
  CheckCircle2,
  Send,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Tipo config ────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, {
  label: string
  description: string
  placeholder_asunto: string
  placeholder_mensaje: string
  icon: React.ReactNode
}> = {
  soporte: {
    label:               "Soporte general",
    description:         "Problemas con tu cuenta, productos o pagos.",
    icon:                <Wrench className="h-4 w-4" />,
    placeholder_asunto:  "Ej: No puedo subir mis productos",
    placeholder_mensaje: "Describe tu problema con el mayor detalle posible. ¿Cuándo empezó? ¿Qué intentaste hacer?",
  },
  verificacion: {
    label:               "Verificación KYC",
    description:         "Validación de identidad y documentos DPI.",
    icon:                <BadgeCheck className="h-4 w-4" />,
    placeholder_asunto:  "Ej: Mis documentos fueron rechazados",
    placeholder_mensaje: "Describe qué documento tienes problemas para subir o qué error ves al intentarlo.",
  },
  incidencia: {
    label:               "Incidencia técnica",
    description:         "Errores o fallos en la plataforma.",
    icon:                <Zap className="h-4 w-4" />,
    placeholder_asunto:  "Ej: La página no carga correctamente",
    placeholder_mensaje: "¿Qué acción realizabas? ¿Qué error aparece? Puedes copiar el mensaje de error aquí.",
  },
  otro: {
    label:               "Otro",
    description:         "Consultas generales o cualquier otra solicitud.",
    icon:                <MessageCircle className="h-4 w-4" />,
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
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">

        {/* ── Back ──────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/seller/tickets")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Mis tickets
        </button>

        {/* ── Header editorial ──────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--seller-accent)] uppercase">
            Soporte · Flowjuyu Seller
          </p>
          <h1 className="mt-1.5 text-[28px] leading-[1.05] font-bold tracking-tight text-[var(--seller-ink)]">
            Nuevo ticket
          </h1>
          <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-[var(--seller-muted)]">
            Cuéntanos tu problema y te ayudaremos lo antes posible.
          </p>
        </div>

        {/* ── Tipo selector ─────────────────────────────────────────── */}
        <section className="rounded-3xl border border-[var(--seller-line)] bg-white p-5">
          <p className="mb-3 text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
            Tipo de solicitud
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(TIPO_CONFIG).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTipo(key)}
                className={`text-left rounded-2xl border p-5 transition-all duration-150 ${
                  tipo === key
                    ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] ring-2 ring-[var(--seller-accent)] ring-offset-1"
                    : "border-[var(--seller-line)] bg-white hover:border-[var(--seller-accent)]/40 hover:bg-[var(--seller-panel)]"
                }`}
              >
                <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  tipo === key
                    ? "bg-[var(--seller-accent)] text-white"
                    : "bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]"
                }`}>
                  {info.icon}
                </span>
                <p className="text-sm font-semibold leading-snug text-[var(--seller-ink)]">{info.label}</p>
                <p className={`mt-1.5 text-xs leading-relaxed ${
                  tipo === key ? "text-[var(--seller-accent)]" : "text-[var(--seller-muted)]"
                }`}>
                  {info.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── KYC helper ────────────────────────────────────────────── */}
        {tipo === "verificacion" && (
          <div className="flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-purple-900">
                Este ticket es para validación de identidad
              </p>
              <p className="mt-0.5 text-xs text-purple-700">
                Asegúrate de tener tus documentos listos: DPI frontal, reverso y selfie.
                Podrás subirlos desde tu perfil de vendedor.
              </p>
            </div>
          </div>
        )}

        {/* ── Form fields ───────────────────────────────────────────── */}
        <section className="space-y-5 rounded-3xl border border-[var(--seller-line)] bg-white p-5">

          {/* Asunto */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
              Asunto
            </label>
            <input
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder={tipoInfo.placeholder_asunto}
              className="w-full rounded-xl border border-[var(--seller-line)] bg-white px-4 py-3 text-sm text-[var(--seller-ink)] placeholder:text-[var(--seller-faint-text)] outline-none transition focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
            />
            {asunto.trim().length > 0 && asunto.trim().length <= 3 && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                El asunto es demasiado corto
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
              Descripción
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={tipoInfo.placeholder_mensaje}
              rows={5}
              className="w-full resize-none rounded-xl border border-[var(--seller-line)] bg-white px-4 py-3 text-sm text-[var(--seller-ink)] placeholder:text-[var(--seller-faint-text)] outline-none transition focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
            />
            {mensaje.trim().length > 0 && mensaje.trim().length <= 10 && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                La descripción es muy corta
              </p>
            )}
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
              Prioridad
            </label>
            <div className="flex gap-2">
              {[
                { value: "baja",  label: "Baja",  active: "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200" },
                { value: "media", label: "Media", active: "border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-200"          },
                { value: "alta",  label: "Alta",  active: "border-red-400 bg-red-50 text-red-800 ring-2 ring-red-200"                  },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPrioridad(p.value)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    prioridad === p.value
                      ? p.active
                      : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* ── Submit ────────────────────────────────────────────────── */}
        <section className="space-y-4 rounded-3xl border border-[var(--seller-line)] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--seller-muted)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Nuestro equipo responderá en menos de 24 horas
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(15,61,58,0.5)] transition-all hover:shadow-[0_14px_28px_-12px_rgba(15,61,58,0.6)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <Send className="h-4 w-4" />
              {loading ? "Creando ticket…" : "Crear ticket"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/seller/tickets")}
              className="rounded-2xl border border-[var(--seller-line-strong)] px-4 py-3.5 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
            >
              Cancelar
            </button>
          </div>
          {!isValid && (asunto.trim().length > 0 || mensaje.trim().length > 0) && (
            <p className="text-center text-xs text-[var(--seller-muted)]">
              Completa el asunto (mín. 4 car.) y la descripción (mín. 11 car.) para continuar
            </p>
          )}
        </section>

        <p className="px-2 pb-4 text-center text-[11px] leading-relaxed text-[var(--seller-muted)]">
          Al enviar este ticket aceptas que el equipo de{" "}
          <span className="font-medium text-[var(--seller-ink)]">Flowjuyu Support</span>{" "}
          se comunique contigo por esta vía.
        </p>

      </div>
    </div>
  )
}
