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
import { SellerSectionHero } from "@/components/seller/SellerSectionHero"
import { SellerProgressCard } from "@/components/seller/SellerProgressCard"
import { SellerSectionCard } from "@/components/seller/ui/SellerProfileSection"
import {
  sellerFieldClassName,
  sellerOptionCardActiveClassName,
  sellerOptionCardClassName,
  sellerPillClassName,
  sellerPrimarySoftButtonClassName,
  sellerTextareaClassName,
} from "@/components/seller/ui/sellerFormStyles"
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
    <SellerSectionCard title="Panel" className={className} bodyClassName="p-6">
      {children}
    </SellerSectionCard>
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
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#0f2e22]/8 pb-4">
      <div className="flex items-center gap-3 font-semibold text-neutral-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-[#0F3D3A]/8 text-[#0F3D3A] shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
        </div>
      </div>
      {badge}
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c9892]">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <p className="max-w-2xl text-sm leading-7 text-neutral-500">{description}</p>
    </div>
  )
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden p-5 ${sellerOptionCardClassName} rounded-[26px] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(15,61,58,0.35)]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(15,61,58,0.12),_transparent_55%)]"
      />
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-[#0F3D3A]/8 text-[#0F3D3A] shadow-sm">
        {icon}
      </div>
      <div className="relative space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      <div className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#0F3D3A]">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
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
    <div className={`space-y-3 rounded-[24px] border border-neutral-200 border-l-4 px-5 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] ${cfg.accent}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          {cfg.icon}
        </div>
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
            <div className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-medium text-purple-700 transition hover:bg-purple-50">
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
            <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
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
        <div key={doc.key} className="flex items-start gap-3 rounded-2xl border border-[#0f2e22]/10 bg-[#fcfbf8] px-4 py-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-50">
            {doc.subido ? (
              <FileCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <FileX className="w-4 h-4 text-red-400" />
            )}
          </div>
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
    <div className="space-y-4 border-t border-[#0f2e22]/8 pt-5">
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
          className={`rounded-xl ${sellerPrimarySoftButtonClassName}`}
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
        className={sellerFieldClassName}
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
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
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
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{cfg.alert}</p>
          </div>
          <Link href="/seller/tickets/new">
            <Button className="h-8 rounded-xl bg-red-600 text-xs text-white hover:bg-red-700">
              Contactar soporte ahora
            </Button>
          </Link>
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
        <div className="flex items-start gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
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
            className={`resize-none ${sellerTextareaClassName}`}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleSubmit}
              disabled={estado === "loading" || !mensaje.trim()}
              className={`rounded-xl ${sellerPrimarySoftButtonClassName}`}
            >
              {estado === "loading" ? "Enviando…" : "Enviar mensaje"}
            </Button>
            <Link href="/seller/tickets">
              <Button variant="outline" className="rounded-xl border-[#0f2e22]/10 text-sm hover:bg-[#faf8f3]">
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
        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
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
    <main className="mx-auto min-h-screen max-w-5xl space-y-10 bg-[#f8f5ef] px-4 py-10 sm:px-6">
      <SellerSectionHero
        eyebrow="Cuenta del vendedor"
        title="Cuenta"
        description="Organiza la operación de tu tienda, revisa tu verificación y mantén a mano los canales clave de comunicación."
        aside={
          <>
            <ShortcutCard
              href="/seller/security"
              icon={<Lock className="h-5 w-5" />}
              title="Seguridad"
              description="Gestiona tu contraseña y deja separado todo lo relacionado con acceso."
              cta="Abrir seguridad"
            />
            <ShortcutCard
              href="/seller/tickets"
              icon={<TicketCheck className="h-5 w-5" />}
              title="Tickets"
              description="Consulta solicitudes en curso y sigue cualquier caso pendiente con soporte."
              cta="Ver mis tickets"
            />
          </>
        }
        actions={
          <Link
            href="/seller/account#comunicaciones"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0F3D3A] transition hover:text-[#0a2e2c]"
          >
            Ir a comunicaciones
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="space-y-5 rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.62),_rgba(250,248,242,0.88))] p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-6">
        <SectionIntro
          eyebrow="Estado de cuenta"
          title="Verificación y operación de la tienda"
          description="Aquí ves el estado real de tu cuenta de vendedor: qué falta para activar tu tienda, qué permisos tienes hoy y si existe alguna restricción administrativa."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <SellerProgressCard
              estadoValidacion={estado}
              productos={progressProductos}
              perfil={progressPerfil}
            />

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

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Documentos requeridos
                  </p>
                  <DocumentsStatusList documentos={documentos} />
                </div>

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
          </div>

          <div className="space-y-6">
            <Section>
              <SectionHeader
                icon={<Package className="w-5 h-5 text-neutral-600" />}
                title="Estado operativo"
              />
              <OperationalStatusCard puedePublicar={puedePublicar} />
            </Section>

            <Section>
              <SectionHeader
                icon={<Store className="w-5 h-5 text-neutral-600" />}
                title="Estado administrativo"
              />
              <AdminStatusCard estadoAdmin={estadoAdmin} />
            </Section>
          </div>
        </div>
      </section>

      <section
        id="comunicaciones"
        className="scroll-mt-24 space-y-5 rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.55),_rgba(248,245,236,0.9))] p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-6"
      >
        <SectionIntro
          eyebrow="Comunicación"
          title="Preferencias y ayuda"
          description="Separamos las decisiones de comunicación y soporte para que puedas ajustar mensajes promocionales y resolver incidencias sin perder contexto operativo."
        />

        <div className="grid gap-6 lg:grid-cols-2">
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

          <Section>
            <SectionHeader
              icon={<HelpCircle className="w-5 h-5 text-neutral-600" />}
              title="Soporte y ayuda"
            />
            <SupportSection actionRequired={actionRequired} />
          </Section>
        </div>
      </section>
    </main>
  )
}
