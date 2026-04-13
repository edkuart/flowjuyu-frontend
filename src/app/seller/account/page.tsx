// src/app/seller/account/page.tsx
"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import Link from "next/link"
import {
  Shield,
  Lock,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileCheck,
  FileX,
  Package,
  Eye,
  PenLine,
  Store,
  ArrowRight,
  TicketCheck,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SellerProgressCard } from "@/components/seller/SellerProgressCard"
import { CommunicationPreferencesPanel } from "@/components/settings/CommunicationPreferencesPanel"
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil"
import type { SellerPerfil } from "@/lib/sellerProgress"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

type EstadoValidacion = "pendiente" | "en_revision" | "aprobado" | "rechazado" | null

interface KycTicket {
  id: number
  estado: string
}

/* ──────────────────────────────────────────
   SECTION WRAPPER
────────────────────────────────────────── */

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`bg-white border border-neutral-100 shadow-sm ${className}`}>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5 font-semibold text-neutral-800">
        {icon}
        {title}
      </div>
      {badge}
    </div>
  )
}

/* ──────────────────────────────────────────
   VERIFICATION STATUS BADGE
────────────────────────────────────────── */

function VerificationBadge({ estado }: { estado: EstadoValidacion }) {
  if (!estado) return null
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    pendiente:   { cls: "bg-gray-100 text-gray-700",    icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Pendiente"   },
    en_revision: { cls: "bg-yellow-100 text-yellow-700", icon: <AlertCircle className="w-3.5 h-3.5" />, label: "En revisión" },
    aprobado:    { cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Verificado" },
    rechazado:   { cls: "bg-red-100 text-red-700",      icon: <XCircle className="w-3.5 h-3.5" />,     label: "Rechazado"  },
  }
  const cfg = map[estado]
  if (!cfg) return null
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

/* ──────────────────────────────────────────
   VERIFICATION STATUS CARD
────────────────────────────────────────── */

function VerificationStatusCard({
  estado,
  observaciones,
  kycTicket,
}: {
  estado: EstadoValidacion
  observaciones: string | null
  kycTicket: KycTicket | null
}) {
  const content = {
    pendiente: {
      accent: "border-l-amber-400 bg-amber-50/60",
      icon:   <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
      title:  "Debes enviar tus documentos de identificación",
      body:   "Para activar tu tienda y hacer tus productos visibles al público, necesitamos verificar tu identidad. El proceso toma menos de 24 horas.",
      next:   { label: "Sube tus documentos abajo", cta: null },
    },
    en_revision: {
      accent: "border-l-yellow-400 bg-yellow-50/60",
      icon:   <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />,
      title:  "Estamos revisando tus documentos",
      body:   "El equipo de Flowjuyu está revisando tu solicitud. Este proceso puede tardar hasta 24 horas hábiles. Te notificaremos cuando haya una actualización.",
      next:   { label: "No necesitas hacer nada por ahora", cta: null },
    },
    aprobado: {
      accent: "border-l-emerald-400 bg-emerald-50/60",
      icon:   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
      title:  "Tu tienda está verificada y activa",
      body:   "Puedes publicar productos, aparecer en búsquedas y recibir compradores. Tu identidad ha sido confirmada correctamente.",
      next:   { label: "Tu tienda está lista para vender", cta: null },
    },
    rechazado: {
      accent: "border-l-red-400 bg-red-50/60",
      icon:   <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />,
      title:  "Tu verificación fue rechazada",
      body:   observaciones
        ? `Motivo: ${observaciones}`
        : "Uno o más documentos no pudieron ser verificados. Revisa los requisitos y vuelve a intentarlo.",
      next:   { label: "Corrige y vuelve a subir tus documentos abajo", cta: "ticket" },
    },
  }

  const cfg = estado ? content[estado] : null
  if (!cfg) return null

  return (
    <div className={`rounded-2xl border border-neutral-100 border-l-4 ${cfg.accent} px-5 py-4 space-y-3`}>
      <div className="flex items-start gap-3">
        {cfg.icon}
        <div className="space-y-1">
          <p className="font-semibold text-sm text-neutral-800">{cfg.title}</p>
          <p className="text-sm text-neutral-600 leading-relaxed">{cfg.body}</p>
        </div>
      </div>

      {/* Next step callout */}
      <div className="ml-8 flex items-center gap-2 text-xs font-medium text-neutral-500">
        <ArrowRight className="w-3.5 h-3.5" />
        {cfg.next.label}
      </div>

      {/* KYC ticket banner */}
      {kycTicket && (
        <div className="ml-8 mt-1">
          <Link href={`/seller/tickets/${kycTicket.id}`}>
            <div className="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-purple-700 font-medium hover:bg-purple-50 transition">
              <TicketCheck className="w-3.5 h-3.5" />
              Tu verificación está siendo gestionada en un ticket → Ver ticket
            </div>
          </Link>
        </div>
      )}

      {/* Rejected + no ticket → suggest opening one */}
      {estado === "rechazado" && !kycTicket && (
        <div className="ml-8 mt-1">
          <Link href="/seller/tickets/new">
            <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-medium hover:bg-red-50 transition">
              <HelpCircle className="w-3.5 h-3.5" />
              ¿Necesitas ayuda? Abre un ticket de soporte
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   DOCUMENTS STATUS LIST
────────────────────────────────────────── */

function DocumentsStatusList({
  documentos,
}: {
  documentos: {
    dpi_frente:    { subido: boolean }
    dpi_reverso:   { subido: boolean }
    selfie_con_dpi: { subido: boolean }
  }
}) {
  const docs = [
    {
      key:    "dpi_frente",
      label:  "DPI — Frente",
      hint:   "Foto clara del frente de tu DPI, sin recortes ni reflejos.",
      subido: documentos.dpi_frente.subido,
    },
    {
      key:    "dpi_reverso",
      label:  "DPI — Reverso",
      hint:   "Foto clara de la parte trasera de tu DPI.",
      subido: documentos.dpi_reverso.subido,
    },
    {
      key:    "selfie_con_dpi",
      label:  "Selfie sosteniendo el DPI",
      hint:   "Foto tuya sosteniendo el DPI al lado de tu cara. Rostro y número de DPI deben ser legibles.",
      subido: documentos.selfie_con_dpi.subido,
    },
  ]

  return (
    <div className="space-y-2.5">
      {docs.map((doc) => (
        <div key={doc.key} className="flex items-start gap-3">
          {doc.subido ? (
            <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <FileX className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${doc.subido ? "text-neutral-700" : "text-neutral-600"}`}>
              {doc.label}
              {doc.subido ? (
                <span className="ml-2 text-xs text-emerald-600 font-normal">Subido</span>
              ) : (
                <span className="ml-2 text-xs text-red-500 font-normal">Falta</span>
              )}
            </p>
            {!doc.subido && (
              <p className="text-xs text-neutral-400 mt-0.5">{doc.hint}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────
   UPLOAD DOCUMENTS SECTION
────────────────────────────────────────── */

function UploadDocumentsSection({
  estado,
  dpiFrente, setDpiFrente,
  dpiReverso, setDpiReverso,
  selfieDpi, setSelfieDpi,
  estadoUpload,
  onSubmit,
}: {
  estado:       EstadoValidacion
  dpiFrente:    File | null
  setDpiFrente: (f: File | null) => void
  dpiReverso:   File | null
  setDpiReverso: (f: File | null) => void
  selfieDpi:    File | null
  setSelfieDpi: (f: File | null) => void
  estadoUpload: "idle" | "loading" | "ok" | "error"
  onSubmit:     () => void
}) {
  if (estado !== "pendiente" && estado !== "rechazado") return null

  const allSelected = Boolean(dpiFrente && dpiReverso && selfieDpi)

  return (
    <div className="pt-5 border-t border-neutral-100 space-y-4">
      <div>
        <p className="text-sm font-semibold text-neutral-800">
          {estado === "rechazado" ? "Vuelve a subir tus documentos" : "Subir documentos de verificación"}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Los 3 documentos son obligatorios. Usa fotos nítidas tomadas en buena iluminación.
        </p>
      </div>

      <div className="space-y-3">
        <FileField
          label="DPI — Frente"
          hint="Foto clara del frente de tu DPI"
          onChange={(f) => setDpiFrente(f)}
          disabled={estadoUpload === "loading"}
        />
        <FileField
          label="DPI — Reverso"
          hint="Foto clara del reverso de tu DPI"
          onChange={(f) => setDpiReverso(f)}
          disabled={estadoUpload === "loading"}
        />
        <FileField
          label="Selfie sosteniendo el DPI"
          hint="Tu cara y el número de DPI deben ser legibles"
          onChange={(f) => setSelfieDpi(f)}
          disabled={estadoUpload === "loading"}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={onSubmit}
          disabled={estadoUpload === "loading" || !allSelected}
          className="bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
        >
          {estadoUpload === "loading" ? "Enviando documentos…" : "Enviar documentos"}
        </Button>
        {!allSelected && estadoUpload === "idle" && (
          <span className="text-xs text-neutral-400">Selecciona los 3 archivos para continuar</span>
        )}
      </div>

      {estadoUpload === "ok" && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <CheckCircle className="w-4 h-4" />
          Documentos enviados. El equipo los revisará en las próximas 24 horas.
        </div>
      )}
      {estadoUpload === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="w-4 h-4" />
          Error al enviar. Verifica el formato de las imágenes e intenta de nuevo.
        </div>
      )}
    </div>
  )
}

function FileField({
  label,
  hint,
  onChange,
  disabled,
}: {
  label:    string
  hint:     string
  onChange: (f: File | null) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-neutral-700">{label}</Label>
      <p className="text-xs text-neutral-400">{hint}</p>
      <Input
        type="file"
        accept="image/*"
        disabled={disabled}
        className="text-sm"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

/* ──────────────────────────────────────────
   OPERATIONAL STATUS CARD
────────────────────────────────────────── */

function OperationalStatusCard({ puedePublicar }: { puedePublicar: boolean }) {
  const ops = [
    {
      icon:    <PenLine className="w-4 h-4 text-neutral-400" />,
      label:   "Crear y editar productos",
      allowed: true,
      note:    "Siempre disponible — organiza tu catálogo sin restricciones.",
    },
    {
      icon:    <Eye className="w-4 h-4 text-neutral-400" />,
      label:   "Activar productos",
      allowed: puedePublicar,
      note:    puedePublicar
        ? "Tus productos pueden estar visibles para compradores."
        : "Requiere verificación de identidad para proteger a los compradores.",
    },
    {
      icon:    <Store className="w-4 h-4 text-neutral-400" />,
      label:   "Tienda visible públicamente",
      allowed: puedePublicar,
      note:    puedePublicar
        ? "Tu tienda aparece en búsquedas y puede recibir visitas."
        : "Se activa automáticamente al completar la verificación.",
    },
    {
      icon:    <Package className="w-4 h-4 text-neutral-400" />,
      label:   "Gestionar catálogo completo",
      allowed: true,
      note:    "Agrega imágenes, precios y descripciones en cualquier momento.",
    },
  ]

  return (
    <div className="space-y-3">
      {ops.map((op, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{op.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-neutral-700">{op.label}</span>
              {op.allowed ? (
                <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">Permitido</span>
              ) : (
                <span className="text-xs font-semibold text-amber-600 flex-shrink-0">Requiere verificación</span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{op.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────
   ADMIN STATUS CARD
────────────────────────────────────────── */

function AdminStatusCard({ estadoAdmin }: { estadoAdmin: string | null }) {
  const map: Record<string, { badge: string; note: string; alert?: string }> = {
    activo: {
      badge: "bg-emerald-100 text-emerald-700",
      note:  "Tu comercio está activo y opera con normalidad.",
    },
    inactivo: {
      badge: "bg-gray-100 text-gray-600",
      note:  "Tu cuenta está inactiva. Contacta soporte si crees que esto es un error.",
    },
    suspendido: {
      badge: "bg-red-100 text-red-700",
      note:  "Tu comercio ha sido suspendido temporalmente.",
      alert: "No puedes publicar ni recibir compradores mientras tu cuenta esté suspendida. Contacta al equipo de soporte para resolver esta situación.",
    },
  }

  const cfg = estadoAdmin ? (map[estadoAdmin] ?? null) : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">Estado del comercio</span>
        {cfg ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            {estadoAdmin === "activo" ? "Activo" : estadoAdmin === "inactivo" ? "Inactivo" : "Suspendido"}
          </span>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        )}
      </div>
      {cfg && (
        <p className="text-xs text-neutral-500">{cfg.note}</p>
      )}
      {cfg?.alert && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{cfg.alert}</p>
          </div>
          <Link href="/seller/tickets/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl h-8">
              Contactar soporte ahora
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   SECURITY SECTION
────────────────────────────────────────── */

function SecuritySection() {
  const [passwordActual, setPasswordActual] = useState("")
  const [passwordNueva,  setPasswordNueva]  = useState("")
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
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Contraseña actual</Label>
        <Input
          type="password"
          value={passwordActual}
          disabled={estado === "loading"}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordActual(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Nueva contraseña</Label>
        <Input
          type="password"
          value={passwordNueva}
          disabled={estado === "loading"}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordNueva(e.target.value)}
        />
        {passwordNueva.length > 0 && passwordNueva.length < 8 && (
          <p className="text-xs text-amber-600">La contraseña debe tener al menos 8 caracteres.</p>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={estado === "loading" || !isValid}
        className="bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
      >
        {estado === "loading" ? "Actualizando…" : "Actualizar contraseña"}
      </Button>

      {mensaje && (
        <div className={`flex items-center gap-2 text-sm font-medium ${
          estado === "ok" ? "text-emerald-600" : "text-red-600"
        }`}>
          {estado === "ok"
            ? <CheckCircle className="w-4 h-4" />
            : <XCircle className="w-4 h-4" />}
          {mensaje}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   SUPPORT SECTION
────────────────────────────────────────── */

function SupportSection({ actionRequired }: { actionRequired: number }) {
  const [mensaje, setMensaje] = useState("")
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle")

  async function handleSubmit() {
    if (!mensaje.trim()) return
    setEstado("loading")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${API}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ mensaje }),
      })
      if (!res.ok) throw new Error()
      setEstado("ok")
      setMensaje("")
    } catch {
      setEstado("error")
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        ¿Necesitas ayuda con tu cuenta, verificación o un producto?
        Escríbenos y responderemos en menos de 24 horas.
      </p>

      {actionRequired > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-yellow-800">
              {actionRequired === 1
                ? "Tienes 1 solicitud pendiente que requiere tu respuesta"
                : `Tienes ${actionRequired} solicitudes pendientes que requieren tu respuesta`}
            </span>
            <Link href="/seller/tickets" className="block mt-1 text-yellow-700 underline text-xs">
              Ver mis tickets →
            </Link>
          </div>
        </div>
      )}

      {estado !== "ok" && (
        <>
          <Textarea
            value={mensaje}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMensaje(e.target.value)}
            placeholder="Describe tu consulta o problema en detalle…"
            rows={4}
            disabled={estado === "loading"}
            className="resize-none"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleSubmit}
              disabled={estado === "loading" || !mensaje.trim()}
              className="bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
            >
              {estado === "loading" ? "Enviando…" : "Enviar mensaje"}
            </Button>
            <Link href="/seller/tickets">
              <Button variant="outline" className="rounded-xl text-sm">
                Ver mis tickets
              </Button>
            </Link>
          </div>
          {estado === "error" && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              No se pudo enviar el mensaje. Intenta de nuevo.
            </p>
          )}
        </>
      )}

      {estado === "ok" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            Mensaje enviado correctamente
          </div>
          <p className="text-xs text-emerald-600">
            Nuestro equipo responderá en menos de 24 horas. También puedes seguir tu caso en
            {" "}
            <Link href="/seller/tickets" className="underline">mis tickets</Link>.
          </p>
          <button
            className="text-xs text-emerald-700 underline"
            onClick={() => setEstado("idle")}
          >
            Enviar otro mensaje
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */

export default function SellerAccountPage() {
  const [loading, setLoading] = useState(true)

  const [estadoAdmin,   setEstadoAdmin]   = useState<string | null>(null)
  const [estado,        setEstado]        = useState<EstadoValidacion>(null)
  const [observaciones, setObservaciones] = useState<string | null>(null)
  const [puedePublicar, setPuedePublicar] = useState(false)

  const [documentos, setDocumentos] = useState({
    dpi_frente:     { subido: false },
    dpi_reverso:    { subido: false },
    selfie_con_dpi: { subido: false },
  })

  const [dpiFrente,  setDpiFrente]  = useState<File | null>(null)
  const [dpiReverso, setDpiReverso] = useState<File | null>(null)
  const [selfieDpi,  setSelfieDpi]  = useState<File | null>(null)
  const [estadoUpload, setEstadoUpload] =
    useState<"idle" | "loading" | "ok" | "error">("idle")

  /* tickets integration */
  const [kycTicket,      setKycTicket]      = useState<KycTicket | null>(null)
  const [actionRequired, setActionRequired] = useState(0)

  /* progress card */
  const [progressPerfil,    setProgressPerfil]    = useState<SellerPerfil | null>(null)
  const [progressProductos, setProgressProductos] = useState<{ activo?: boolean }[]>([])

  /* ── fetch progress card data ── */
  useEffect(() => {
    apiGetVendedorPerfil().then((res) => {
      if (res.ok && res.perfil) setProgressPerfil(res.perfil)
    })
  }, [])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    fetch(`${API}/api/seller/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? [])
        setProgressProductos(list)
      })
      .catch(() => {})
  }, [])

  /* ── fetch tickets ── */
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    fetch(`${API}/api/seller/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        const list: { id: number; tipo: string; estado: string }[] = data.data ?? []
        const kyc = list.find(
          (t) => t.tipo === "verificacion" && ["abierto", "esperando_usuario"].includes(t.estado)
        )
        const pending = list.filter(
          (t) => t.estado === "esperando_usuario" && t.tipo !== "verificacion"
        ).length
        setKycTicket(kyc ?? null)
        setActionRequired(pending)
      })
      .catch(() => {})
  }, [])

  /* ── fetch account status ── */
  useEffect(() => {
    async function load() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`${API}/api/seller/account-status`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        })
        if (!res.ok) { setLoading(false); return }

        const { data } = await res.json()
        setEstado(data.estado_validacion ?? null)
        setEstadoAdmin(data.estado_admin ?? null)
        setObservaciones(data.observaciones_generales ?? null)
        setPuedePublicar(Boolean(data.puede_publicar))

        if (data.documentos) {
          setDocumentos({
            dpi_frente:     { subido: Boolean(data.documentos?.dpi_frente?.subido) },
            dpi_reverso:    { subido: Boolean(data.documentos?.dpi_reverso?.subido) },
            selfie_con_dpi: { subido: Boolean(data.documentos?.selfie_con_dpi?.subido) },
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

  /* ── upload documents ── */
  async function handleUploadDocuments() {
    if (!dpiFrente || !dpiReverso || !selfieDpi) return
    setEstadoUpload("loading")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const formData = new FormData()
      formData.append("foto_dpi_frente",  dpiFrente)
      formData.append("foto_dpi_reverso", dpiReverso)
      formData.append("selfie_con_dpi",   selfieDpi)
      const res = await fetch(`${API}/api/seller/validar`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      })
      if (!res.ok) throw new Error()
      // Refresh state without page reload
      setEstadoUpload("ok")
      setEstado("en_revision")
      setDocumentos({
        dpi_frente:     { subido: true },
        dpi_reverso:    { subido: true },
        selfie_con_dpi: { subido: true },
      })
      setDpiFrente(null)
      setDpiReverso(null)
      setSelfieDpi(null)
    } catch {
      setEstadoUpload("error")
    }
  }

  /* ── loading state ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f5ef]">
        <p className="text-muted-foreground text-sm">Cargando tu cuenta…</p>
      </main>
    )
  }

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 space-y-6 max-w-3xl mx-auto bg-[#f8f5ef]">

      {/* 1. HEADER */}
      <section className="space-y-1 pb-2">
        <h1 className="text-2xl font-bold text-neutral-900">Centro de cuenta</h1>
        <p className="text-sm text-neutral-500">
          Verifica tu identidad, gestiona tu seguridad y contacta soporte.
        </p>
      </section>

      {/* 2. PROGRESS CARD */}
      <SellerProgressCard
        estadoValidacion={estado}
        productos={progressProductos}
        perfil={progressPerfil}
      />

      {/* 3. VERIFICATION — dominant, first card */}
      <Section>
        <SectionHeader
          icon={<Shield className="w-5 h-5 text-neutral-600" />}
          title="Verificación de identidad"
          badge={<VerificationBadge estado={estado} />}
        />

        <div className="space-y-5">
          <VerificationStatusCard
            estado={estado}
            observaciones={observaciones}
            kycTicket={kycTicket}
          />

          {/* 4. DOCUMENTS STATUS */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Documentos requeridos
            </p>
            <DocumentsStatusList documentos={documentos} />
          </div>

          {/* UPLOAD (pendiente / rechazado only) */}
          <UploadDocumentsSection
            estado={estado}
            dpiFrente={dpiFrente}       setDpiFrente={setDpiFrente}
            dpiReverso={dpiReverso}     setDpiReverso={setDpiReverso}
            selfieDpi={selfieDpi}       setSelfieDpi={setSelfieDpi}
            estadoUpload={estadoUpload}
            onSubmit={handleUploadDocuments}
          />
        </div>
      </Section>

      {/* 5. OPERATIONAL STATUS */}
      <Section>
        <SectionHeader
          icon={<Package className="w-5 h-5 text-neutral-600" />}
          title="Estado operativo"
        />
        <OperationalStatusCard puedePublicar={puedePublicar} />
      </Section>

      {/* 6. ADMIN STATUS */}
      <Section>
        <SectionHeader
          icon={<Store className="w-5 h-5 text-neutral-600" />}
          title="Estado administrativo"
        />
        <AdminStatusCard estadoAdmin={estadoAdmin} />
      </Section>

      {/* 7. SECURITY */}
      <Section>
        <SectionHeader
          icon={<Lock className="w-5 h-5 text-neutral-600" />}
          title="Seguridad de la cuenta"
        />
        <SecuritySection />
      </Section>

      {/* 8. COMMUNICATION PREFERENCES */}
      <Section>
        <SectionHeader
          icon={<AlertCircle className="w-5 h-5 text-neutral-600" />}
          title="Preferencias de comunicación"
        />
        <CommunicationPreferencesPanel
          compact
          title="Marketing y comunicaciones opcionales"
          description="Tus mensajes operativos y de seguridad siguen activos. Aquí controlas únicamente emails y WhatsApp promocionales de Flowjuyu."
          surface="seller_account_preferences"
        />
      </Section>

      {/* 9. SUPPORT */}
      <Section>
        <SectionHeader
          icon={<HelpCircle className="w-5 h-5 text-neutral-600" />}
          title="Soporte y ayuda"
        />
        <SupportSection actionRequired={actionRequired} />
      </Section>

    </main>
  )
}
