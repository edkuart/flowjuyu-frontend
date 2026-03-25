// src/app/seller/profile/page.tsx
"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  computeHeaderScore,
  generateHeaderSuggestions,
  getRecommendedStyle,
  scoreLabel,
  scoreBarColor,
} from "@/lib/headerScore"
import { THEMES, THEME_KEYS, detectTheme } from "@/lib/headerThemes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { useFileUpload } from "@/hooks/useFileUpload"
import { departamentos } from "@/lib/guatemala"
import {
  analyzeImageBrightness,
  buildHeaderStyle,
  GRADIENT_VARIANTS,
  DEFAULT_HEADER_STYLE,
  sanitizeHeaderStyle,
} from "@/lib/headerStyle"
import type { HeaderStyle, GradientVariantKey } from "@/lib/headerStyle"
import { MapPin, QrCode, ShieldCheck, Eye, Hand, Leaf, ArrowLeft } from "lucide-react"
import { SellerContactCTA } from "@/components/seller/SellerContactCTA"
import SellerQrModal from "@/components/seller/SellerQrModal"
import { StoreHeaderPreview } from "@/components/seller/StoreHeaderPreview"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { formatPhone, phoneToWaUrl } from "@/lib/phone"
import { apiFetch } from "@/services/apiClient"
import type { PhoneNumber } from "@/lib/phone"

/* ──────────────────────────────────────────
   SMALL HELPERS
────────────────────────────────────────── */

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </p>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </section>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/80 border-b border-neutral-100">
      {children}
    </p>
  )
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-4 grid grid-cols-[148px_1fr] items-start gap-4 border-b border-neutral-100 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 pt-0.5">
        {label}
      </span>
      <div className="text-sm text-neutral-700">{children}</div>
    </div>
  )
}

/* ──────────────────────────────────────────
   PAGE
────────────────────────────────────────── */

const MENSAJE_MAX = 160

/* ──────────────────────────────────────────
   HEADER STYLE — UI constants
   (HeaderStyle type + DEFAULT_HEADER_STYLE imported from @/lib/headerStyle)
────────────────────────────────────────── */

const HEADER_MODES: { value: HeaderStyle["mode"]; label: string; hint: string }[] = [
  { value: "gradient",      label: "Flowjuyu clásico", hint: "Fondo de marca" },
  { value: "image",         label: "Solo imagen",      hint: "Banner sin filtro" },
  { value: "image+overlay", label: "Imagen + overlay", hint: "Banner con color" },
]

const OVERLAY_PRESETS = [
  { name: "Flowjuyu", color: "#0f2e22" },
  { name: "Cálido",   color: "#5a3e2b" },
  { name: "Neutro",   color: "#1f2937" },
]

// Quick presets for image+overlay mode only
const OVERLAY_QUICK_PRESETS: { name: string; config: Partial<HeaderStyle> }[] = [
  { name: "Cálido artesanal", config: { overlay_color: "#5a3e2b", overlay_opacity: 0.7  } },
  { name: "Minimal oscuro",   config: { overlay_color: "#1f2937", overlay_opacity: 0.85 } },
  { name: "Verde Flowjuyu",   config: { overlay_color: "#0f2e22", overlay_opacity: 0.75 } },
]

// Gradient sub-variants — all 4 options including the default
const GRADIENT_VARIANT_KEYS: GradientVariantKey[] = ["default", "suave", "calido", "oscuro"]

export default function SellerPublicProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [vendedor, setVendedor] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({})
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(DEFAULT_HEADER_STYLE)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [brightness, setBrightness] = useState<"dark" | "light" | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const inputFileRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const { previews, files, handleFile } = useFileUpload()
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  /* ── Fetch ── */
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await apiFetch("/api/seller/profile")
        if (!res.ok) return

        const data = await res.json()
        const perfil = data.perfil || data
        setVendedor(perfil)
        setFormData(perfil)
        setHeaderStyle({ ...DEFAULT_HEADER_STYLE, ...(perfil.header_style ?? {}) })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPerfil()
  }, [])

  /* ── Handlers ── */
  const onChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    const body = new FormData()
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "header_style") return // controlled by dedicated state below
      if (val !== undefined && val !== null) {
        body.append(key, typeof val === "object" ? JSON.stringify(val) : (val as string))
      }
    })
    // Always send headerStyle from its own state — avoids stale-closure bugs
    body.append("header_style", JSON.stringify(headerStyle))
    if (files.fotoPerfil) body.append("logo", files.fotoPerfil)

    const res = await fetch(`${API}/api/seller/profile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body,
    })

    if (res.ok) {
      const data = await res.json()
      const perfil = data.perfil || data
      setVendedor(perfil)
      setFormData(perfil)
      setHeaderStyle({ ...DEFAULT_HEADER_STYLE, ...(perfil.header_style ?? {}) })
      setEditando(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediate local preview — no waiting for the upload
    setBannerPreview(URL.createObjectURL(file))
    setBannerUploading(true)

    try {
      const token = localStorage.getItem("token")
      const fd = new FormData()
      fd.append("banner", file)
      const res = await fetch(`${API}/api/seller/banner`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        const newUrl: string = data.banner_url
        // Sync real URL into both vendedor and formData, clear local blob
        setVendedor((prev: any) => ({ ...prev, banner_url: newUrl }))
        setFormData((prev: any) => ({ ...prev, banner_url: newUrl }))
        setBannerPreview(null)
      }
    } catch (err) {
      console.error("Banner upload failed:", err)
    } finally {
      setBannerUploading(false)
      // Reset input so same file can be re-selected if needed
      if (bannerInputRef.current) bannerInputRef.current.value = ""
    }
  }

  /* ── Sanitizing header style setter — enforces opacity clamp + constraints ── */
  const setHS = (updater: HeaderStyle | ((prev: HeaderStyle) => HeaderStyle)) => {
    setHeaderStyle(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater
      return sanitizeHeaderStyle(next)
    })
  }

  /* ── Brightness analysis — runs on banner change ── */
  useEffect(() => {
    const url = bannerPreview || formData.banner_url
    if (!url) { setBrightness(null); return }
    analyzeImageBrightness(url).then(setBrightness)
  }, [bannerPreview, formData.banner_url])

  /* ── Visual score ── */
  const { total: score } = useMemo(
    () => computeHeaderScore(headerStyle, bannerPreview || formData.banner_url, brightness),
    [headerStyle, bannerPreview, formData.banner_url, brightness],
  )

  /* ── Smart suggestions ── */
  const suggestions = useMemo(
    () => generateHeaderSuggestions({
      headerStyle,
      brightness,
      bannerUrl: bannerPreview || formData.banner_url,
    }),
    [headerStyle, brightness, bannerPreview, formData.banner_url],
  )

  /* ── Recommended style (used by comparison preview) ── */
  const recommendedStyle = useMemo(
    () => getRecommendedStyle(headerStyle, brightness),
    [headerStyle, brightness],
  )

  /* ── Hero background — live-updates as header style is edited ── */
  const heroBgStyle = useMemo(
    () => buildHeaderStyle(headerStyle, bannerPreview || formData.banner_url),
    [headerStyle, bannerPreview, formData.banner_url],
  )

  /* ── Guards ── */
  if (loading) return <p className="p-8 text-center text-neutral-500">Cargando perfil...</p>
  if (!vendedor) return <p className="p-8 text-center text-red-500">Perfil no encontrado</p>

  const esPropietario = Number(user?.id) === Number(vendedor.user_id)
  const esVerificado  = vendedor.estado_validacion === "aprobado"
  const ubicacion     = [vendedor.municipio, vendedor.departamento].filter(Boolean).join(", ")
  const mensajeLen    = (formData.mensaje_destacado || "").length

  return (
    <>
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">

      {/* ── Back navigation ── */}
      <button
        onClick={() => router.push('/seller/my-business')}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer -mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl text-white">

        <div
          className="absolute inset-0 bg-cover bg-center transition-[background-image,background-color] duration-500 ease-in-out"
          style={heroBgStyle}
        />
        {/* Vignette — bottom shadow for editorial depth; top bloom for warmth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07)_0%,transparent_55%)] pointer-events-none" />

        <div className="relative p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">

          {/* Logo */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-white/25 shadow-2xl">
              <AvatarImage src={previews["fotoPerfil"] || vendedor.logo || "/avatar-placeholder.png"} className="object-cover" />
              <AvatarFallback className="bg-white/15 text-white text-2xl font-bold">
                {(vendedor.nombre_comercio ?? "T").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {esPropietario && editando && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={inputFileRef}
                  onChange={(e) => handleFile(e, "fotoPerfil", "perfil-vendedor")}
                  className="hidden"
                />
                <button
                  onClick={() => inputFileRef.current?.click()}
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold bg-white text-[#0F3D3A] px-3 py-1 rounded-full shadow-md hover:bg-neutral-100 transition"
                >
                  Cambiar logo
                </button>
              </>
            )}
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">

            {editando ? (
              <Input
                value={formData.nombre_comercio || ""}
                onChange={(e) => onChange("nombre_comercio", e.target.value)}
                className="text-lg font-bold bg-white/10 border-white/25 text-white placeholder:text-white/40 max-w-xs"
                placeholder="Nombre del negocio"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                {vendedor.nombre_comercio || "Tienda sin nombre"}
              </h1>
            )}

            {ubicacion && (
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-white/75">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {ubicacion}
              </p>
            )}

            <div className="flex gap-2 flex-wrap justify-center sm:justify-start pt-1">
              {esVerificado ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Tienda verificada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-amber-400/15 border border-amber-300/25 text-amber-100/90 px-2.5 py-1 rounded-full">
                  Pendiente de verificación
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/10 border border-white/15 text-white/80 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Activa
              </span>
            </div>
          </div>

          {/* Actions */}
          {esPropietario && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:flex-shrink-0 sm:items-start sm:justify-end">
              <Link href={`/store/${user?.id}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-white/25 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/40 gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver tienda
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrOpen(true)}
                className="w-full sm:w-auto border-white/25 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/40 gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5" />
                QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditando(!editando)}
                className="w-full sm:w-auto border-white/25 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/40 transition-all"
              >
                {editando ? "Cancelar" : "Editar perfil"}
              </Button>
              {editando && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  className="w-full sm:w-auto bg-white text-[#0F3D3A] hover:bg-neutral-100 font-semibold shadow-sm transition-all"
                >
                  Guardar cambios
                </Button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════
          WhatsApp CTA — buyer perspective, view mode only
      ══════════════════════════════════════ */}
      {!editando && (
        <div className="w-full">
          <SellerContactCTA
            whatsapp={phoneToWaUrl(vendedor.whatsapp_numero)}
            nombreComercio={vendedor.nombre_comercio}
            storeUrl={`/store/${vendedor.user_id}`}
          />
        </div>
      )}

      {/* ══════════════════════════════════════
          2. DESCRIPCIÓN DE LA TIENDA
      ══════════════════════════════════════ */}
      <SectionCard title={editando ? "Descripción de tu tienda" : "Sobre esta tienda"}>
        {editando ? (
          <Textarea
            value={formData.descripcion || ""}
            onChange={(e) => onChange("descripcion", e.target.value)}
            placeholder="Cuenta qué vendes, cómo trabajas y qué hace única tu tienda"
            rows={5}
            className="resize-none text-sm"
          />
        ) : vendedor.descripcion ? (
          <div className="space-y-4">
            {ubicacion && (
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0F3D3A]/50">
                {ubicacion} · Guatemala
              </p>
            )}
            <p className="text-[16px] text-neutral-700 leading-[1.85] font-light">
              {vendedor.descripcion}
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-neutral-400">
            Cuenta qué vendes, cómo trabajas y qué hace única tu tienda
          </p>
        )}

      </SectionCard>

      {/* ══════════════════════════════════════
          3. MENSAJE PÚBLICO
      ══════════════════════════════════════ */}
      <SectionCard title={editando ? "Mensaje público de tu tienda" : "En palabras del artesano"}>
        {editando ? (
          <div className="space-y-3">
            <p className="text-[13px] text-neutral-500 leading-snug">
              Este mensaje aparece en la parte principal de tu tienda. Úsalo para invitar al cliente a contactarte.
            </p>
            <div className="relative">
              <Textarea
                value={formData.mensaje_destacado || ""}
                onChange={(e) =>
                  onChange("mensaje_destacado", e.target.value.slice(0, MENSAJE_MAX))
                }
                placeholder="Ej: Piezas hechas a mano con técnicas tradicionales. Escríbeme para más información."
                rows={3}
                className="resize-none text-sm pr-16"
              />
              <span
                className={`absolute bottom-2.5 right-3 text-[11px] tabular-nums font-medium pointer-events-none ${
                  mensajeLen >= MENSAJE_MAX
                    ? "text-red-400"
                    : mensajeLen >= MENSAJE_MAX * 0.85
                    ? "text-amber-400"
                    : "text-neutral-300"
                }`}
              >
                {mensajeLen}/{MENSAJE_MAX}
              </span>
            </div>
          </div>
        ) : vendedor.mensaje_destacado ? (
          <blockquote className="pl-5 border-l-[3px] border-[#0F3D3A]/20">
            <p className="text-[16px] text-neutral-600 leading-relaxed italic font-light">
              "{vendedor.mensaje_destacado}"
            </p>
          </blockquote>
        ) : (
          <p className="text-sm italic text-neutral-400">
            Agrega un mensaje corto para invitar a los compradores a contactarte
          </p>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════
          4 & 5. INFORMACIÓN DEL NEGOCIO + CONTACTO
      ══════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

        <SectionHeading>Información del negocio</SectionHeading>

        <InfoRow label="Departamento">
          {editando ? (
            <select
              value={formData.departamento || ""}
              onChange={(e) => {
                onChange("departamento", e.target.value)
                onChange("municipio", "")
              }}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 cursor-pointer"
            >
              <option value="">Seleccionar departamento</option>
              {departamentos.map((dep) => (
                <option key={dep.nombre} value={dep.nombre}>{dep.nombre}</option>
              ))}
            </select>
          ) : (
            <span className={vendedor.departamento ? "" : "text-neutral-400"}>
              {vendedor.departamento || "—"}
            </span>
          )}
        </InfoRow>

        <InfoRow label="Municipio">
          {editando ? (
            <select
              value={formData.municipio || ""}
              onChange={(e) => onChange("municipio", e.target.value)}
              disabled={!formData.departamento}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 cursor-pointer disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar municipio</option>
              {departamentos
                .find((d) => d.nombre === formData.departamento)
                ?.municipios.map((mun) => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
            </select>
          ) : (
            <span className={vendedor.municipio ? "" : "text-neutral-400"}>
              {vendedor.municipio || "—"}
            </span>
          )}
        </InfoRow>

        <InfoRow label="Dirección">
          {editando ? (
            <Textarea
              value={formData.direccion || ""}
              onChange={(e) => onChange("direccion", e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          ) : (
            <span className={vendedor.direccion ? "" : "text-neutral-400"}>
              {vendedor.direccion || "—"}
            </span>
          )}
        </InfoRow>

        <SectionHeading>Contacto</SectionHeading>

        <InfoRow label="Teléfono">
          {editando ? (
            <PhoneInput
              value={formData.telefono_comercio ?? null}
              onChange={(val: PhoneNumber) =>
                setFormData((prev: any) => ({ ...prev, telefono_comercio: val }))
              }
            />
          ) : (
            <span className={vendedor.telefono_comercio ? "" : "text-neutral-400"}>
              {formatPhone(vendedor.telefono_comercio)}
            </span>
          )}
        </InfoRow>

        <InfoRow label="WhatsApp">
          {editando ? (
            <div className="space-y-1.5">
              <PhoneInput
                value={formData.whatsapp_numero ?? null}
                onChange={(val: PhoneNumber) =>
                  setFormData((prev: any) => ({ ...prev, whatsapp_numero: val }))
                }
              />
              {formData.whatsapp_numero && (
                <p className="text-[11px] text-neutral-400">
                  Enlace:{" "}
                  <span className="font-mono text-neutral-600">
                    wa.me/{formData.whatsapp_numero.country_code}{formData.whatsapp_numero.number}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <span className={vendedor.whatsapp_numero ? "" : "text-neutral-400"}>
              {vendedor.whatsapp_numero ? formatPhone(vendedor.whatsapp_numero) : "Sin número de WhatsApp"}
            </span>
          )}
        </InfoRow>

        <SectionHeading>Redes sociales</SectionHeading>

        <InfoRow label="Instagram">
          {editando ? (
            <Input
              value={formData.instagram || ""}
              onChange={(e) => onChange("instagram", e.target.value)}
              placeholder="https://instagram.com/tu_tienda"
              className="text-sm"
            />
          ) : vendedor.instagram ? (
            <a
              href={vendedor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F3D3A] hover:underline break-all transition-colors cursor-pointer"
            >
              {vendedor.instagram}
            </a>
          ) : (
            <span className="text-neutral-400">—</span>
          )}
        </InfoRow>

        <InfoRow label="Facebook">
          {editando ? (
            <Input
              value={formData.facebook || ""}
              onChange={(e) => onChange("facebook", e.target.value)}
              placeholder="https://facebook.com/tu_tienda"
              className="text-sm"
            />
          ) : vendedor.facebook ? (
            <a
              href={vendedor.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F3D3A] hover:underline break-all transition-colors cursor-pointer"
            >
              {vendedor.facebook}
            </a>
          ) : (
            <span className="text-neutral-400">—</span>
          )}
        </InfoRow>

        <InfoRow label="TikTok">
          {editando ? (
            <Input
              value={formData.tiktok || ""}
              onChange={(e) => onChange("tiktok", e.target.value)}
              placeholder="https://tiktok.com/@tu_tienda"
              className="text-sm"
            />
          ) : vendedor.tiktok ? (
            <a
              href={vendedor.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F3D3A] hover:underline break-all transition-colors cursor-pointer"
            >
              {vendedor.tiktok}
            </a>
          ) : (
            <span className="text-neutral-400">—</span>
          )}
        </InfoRow>

      </section>

      {/* ══════════════════════════════════════
          ESTILO DEL ENCABEZADO
      ══════════════════════════════════════ */}
      <SectionCard title="Estilo del encabezado">
        <div className="space-y-6">

          {/* ── Visual Score ── */}
          {(() => {
            const { label, color } = scoreLabel(score)
            return (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Calidad visual
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
                      {label}
                    </span>
                    <span className="text-sm font-bold text-neutral-800 tabular-nums">
                      {score}<span className="text-neutral-400 font-normal">/100</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })()}

          {/* ── Live preview + comparison toggle ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {showSuggestion ? "Versión sugerida" : "Vista previa de tu tienda"}
              </p>
              {brightness !== null && (
                <button
                  type="button"
                  onClick={() => setShowSuggestion(v => !v)}
                  className="text-[11px] font-semibold text-[#0F3D3A] hover:text-[#0a2e2b] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {showSuggestion ? "← Ver mi versión" : "Ver sugerencia →"}
                </button>
              )}
            </div>
            <StoreHeaderPreview
              headerStyle={showSuggestion ? recommendedStyle : headerStyle}
              bannerUrl={bannerPreview || formData.banner_url}
              sellerName={formData.nombre_comercio}
              logoUrl={previews["fotoPerfil"] || vendedor?.logo}
            />
            {showSuggestion && editando && (
              <button
                type="button"
                onClick={() => { setHS(recommendedStyle); setShowSuggestion(false) }}
                className="mt-2 w-full py-2 text-xs font-semibold rounded-lg bg-[#0F3D3A] text-white hover:bg-[#0a2e2b] transition-colors cursor-pointer"
              >
                Aplicar esta sugerencia
              </button>
            )}
          </div>

          {editando ? (
            <>
              {/* ── Theme selector ── */}
              <div className="pt-1 border-t border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Identidad visual
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_KEYS.map((key) => {
                    const theme = THEMES[key]
                    const active = detectTheme(headerStyle) === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setHS(prev => ({ ...prev, ...theme.style }))}
                        className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer ${
                          active
                            ? "border-[#0F3D3A] bg-[#0F3D3A]/5"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <span className={`text-base leading-none ${active ? "text-[#0F3D3A]" : "text-neutral-400"}`}>
                          {theme.emoji}
                        </span>
                        <span className={`text-[11px] font-bold leading-tight ${active ? "text-[#0F3D3A]" : "text-neutral-700"}`}>
                          {theme.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 leading-tight">{theme.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Mode selector ── */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Modo
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {HEADER_MODES.map(({ value, label, hint }) => {
                    const active = headerStyle.mode === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHS(prev => ({ ...prev, mode: value }))}
                        className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          active
                            ? "border-[#0F3D3A] bg-[#0F3D3A]/5"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${active ? "text-[#0F3D3A]" : "text-neutral-700"}`}>
                          {label}
                        </span>
                        <span className="text-[11px] text-neutral-400">{hint}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Gradient variants — only when gradient mode is selected ── */}
              {headerStyle.mode === "gradient" && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Variante
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENT_VARIANT_KEYS.map((key) => {
                      const variant = GRADIENT_VARIANTS[key]
                      const active = (headerStyle.gradient_variant ?? "default") === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setHS(prev => ({
                              ...prev,
                              gradient_variant: key === "default" ? undefined : key,
                            }))
                          }
                          className={`relative overflow-hidden rounded-xl border-2 px-3 py-3 text-left transition-all cursor-pointer ${
                            active
                              ? "border-[#0F3D3A]"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                          style={{
                            backgroundImage: variant.backgroundImage,
                            backgroundColor: variant.backgroundColor,
                          }}
                        >
                          {active && (
                            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-[8px] text-[#0F3D3A] font-black">
                              ✓
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-white/90 leading-tight">
                            {variant.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Banner uploader — only for image-based modes ── */}
              {headerStyle.mode !== "gradient" && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Imagen del encabezado
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Esta imagen se mostrará en tu tienda pública
                    </p>
                  </div>

                  {/* No banner state */}
                  {!bannerPreview && !formData.banner_url && (
                    <div className="h-20 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
                      Sin imagen
                    </div>
                  )}

                  {/* Upload trigger */}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <button
                    type="button"
                    disabled={bannerUploading}
                    onClick={() => bannerInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bannerUploading
                      ? "Subiendo…"
                      : formData.banner_url
                      ? "Cambiar imagen"
                      : "Subir imagen"}
                  </button>
                </div>
              )}

              {/* ── Overlay controls — only in image+overlay mode ── */}
              {headerStyle.mode === "image+overlay" && (
                <div className="space-y-5 pt-2 border-t border-neutral-100">

                  {/* Quick presets */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      Presets rápidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {OVERLAY_QUICK_PRESETS.map(({ name, config }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setHS(prev => ({ ...prev, ...config }))}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color palette */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                      Color del overlay
                    </p>
                    <div className="flex items-center gap-3">
                      {OVERLAY_PRESETS.map(({ name, color }) => {
                        const selected = headerStyle.overlay_color === color
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setHS(prev => ({ ...prev, overlay_color: color }))}
                            title={name}
                            className={`w-9 h-9 rounded-full border-4 transition-all cursor-pointer ${
                              selected ? "border-neutral-800 scale-110 shadow-md" : "border-white shadow-sm hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Opacity slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        Intensidad
                      </p>
                      <span className="text-xs font-mono text-neutral-600">
                        {Math.round((headerStyle.overlay_opacity ?? 0.7) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={90}
                      step={5}
                      value={Math.round((headerStyle.overlay_opacity ?? 0.7) * 100)}
                      onChange={(e) =>
                        setHS(prev => ({ ...prev, overlay_opacity: Number(e.target.value) / 100 }))
                      }
                      className="w-full accent-[#0F3D3A]"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                      <span>Sutil</span>
                      <span>Intenso</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Smart suggestions — shown at bottom of edit section ── */}
              {suggestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Sugerencias
                  </p>
                  {suggestions.map((s) => (
                    <div
                      key={s.key}
                      className={`text-[13px] p-3 rounded-lg leading-snug ${
                        s.priority === "high"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : s.priority === "medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      💡 {s.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ── View-mode summary ── */
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">
                Modo actual:{" "}
                <span className="font-semibold text-neutral-700">
                  {HEADER_MODES.find((m) => m.value === headerStyle.mode)?.label ?? "—"}
                </span>
                {headerStyle.mode === "image+overlay" && (
                  <span className="ml-2 text-neutral-400">
                    · {Math.round((headerStyle.overlay_opacity ?? 0.7) * 100)}% intensidad
                  </span>
                )}
                {headerStyle.mode !== "gradient" && !vendedor.banner_url && (
                  <span className="ml-2 text-amber-600 font-medium">· Sin imagen de encabezado</span>
                )}
              </p>
              {suggestions.length > 0 && (
                <p className="text-xs text-amber-600">
                  💡 {suggestions[0].message}
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

    </main>

    {vendedor?.user_id && (
      <SellerQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        sellerId={Number(vendedor.user_id)}
        nombreComercio={vendedor.nombre_comercio || "Mi tienda"}
      />
    )}
    </>
  )
}
