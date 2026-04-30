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
import {
  SellerInfoRow,
  SellerSectionCard,
  SellerSectionHeading,
} from "@/components/seller/ui/SellerProfileSection"
import {
  sellerFieldClassName,
  sellerGlassButtonClassName,
  sellerHelperTextClassName,
  sellerLinkClassName,
  sellerMutedValueClassName,
  sellerOptionCardActiveClassName,
  sellerOptionCardClassName,
  sellerPillClassName,
  sellerPrimarySoftButtonClassName,
  sellerSelectClassName,
  sellerTextareaClassName,
} from "@/components/seller/ui/sellerFormStyles"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { formatPhone, phoneToWaUrl } from "@/lib/phone"
import {
  compressImage,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/imageCompression"
import { apiFetch } from "@/services/apiClient"
import type { PhoneNumber } from "@/lib/phone"

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
const heroNameInputClassName =
  "max-w-xs border-white/18 bg-white/10 text-lg font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] placeholder:text-white/45 focus-visible:border-white/30 focus-visible:ring-[3px] focus-visible:ring-white/12"

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

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      alert(`El archivo supera el tamaño máximo de ${MAX_IMAGE_UPLOAD_MB}MB.`)
      if (bannerInputRef.current) bannerInputRef.current.value = ""
      return
    }

    const processedFile = await compressImage(file)

    // Immediate local preview — no waiting for the upload
    setBannerPreview(URL.createObjectURL(processedFile))
    setBannerUploading(true)

    try {
      const token = localStorage.getItem("token")
      const fd = new FormData()
      fd.append("banner", processedFile)
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
        className="-mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mi tienda
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
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/35 bg-white px-3 py-1 text-[10px] font-semibold text-[#0F3D3A] shadow-lg transition hover:bg-[#f6f4ef]"
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
                className={heroNameInputClassName}
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
                <span className={`${sellerPillClassName} border-emerald-300/30 bg-emerald-500/18 text-emerald-50`}>
                  <ShieldCheck className="w-3 h-3" />
                  Tienda verificada
                </span>
              ) : (
                <span className={`${sellerPillClassName} border-amber-300/25 bg-amber-400/14 font-medium text-amber-50`}>
                  Pendiente de verificación
                </span>
              )}
              <span className={`${sellerPillClassName} border-white/15 bg-white/10 font-medium text-white/85`}>
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
                  className={`w-full gap-1.5 sm:w-auto ${sellerGlassButtonClassName}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver tienda
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrOpen(true)}
                className={`w-full gap-1.5 sm:w-auto ${sellerGlassButtonClassName}`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditando(!editando)}
                className={`w-full sm:w-auto ${sellerGlassButtonClassName}`}
              >
                {editando ? "Cancelar" : "Editar perfil"}
              </Button>
              {editando && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  className={`w-full font-semibold sm:w-auto ${sellerPrimarySoftButtonClassName}`}
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
      <SellerSectionCard
        title={editando ? "Descripción de tu tienda" : "Sobre esta tienda"}
      >
        {editando ? (
          <Textarea
            value={formData.descripcion || ""}
            onChange={(e) => onChange("descripcion", e.target.value)}
            placeholder="Cuenta qué vendes, cómo trabajas y qué hace única tu tienda"
            rows={5}
            className={`resize-none ${sellerTextareaClassName}`}
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

      </SellerSectionCard>

      {/* ══════════════════════════════════════
          3. MENSAJE PÚBLICO
      ══════════════════════════════════════ */}
      <SellerSectionCard
        title={editando ? "Mensaje público de tu tienda" : "En palabras del artesano"}
      >
        {editando ? (
          <div className="space-y-3">
            <p className="text-[13px] leading-snug text-[#7b8881]">
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
                className={`resize-none pr-16 ${sellerTextareaClassName}`}
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
      </SellerSectionCard>

      {/* ══════════════════════════════════════
          4 & 5. INFORMACIÓN DEL NEGOCIO + CONTACTO
      ══════════════════════════════════════ */}
      <SellerSectionCard title="Datos del negocio" bodyClassName="p-0">

        <SellerSectionHeading>Información del negocio</SellerSectionHeading>

        <SellerInfoRow label="Departamento">
          {editando ? (
            <select
              value={formData.departamento || ""}
              onChange={(e) => {
                onChange("departamento", e.target.value)
                onChange("municipio", "")
              }}
              className={sellerSelectClassName}
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
        </SellerInfoRow>

        <SellerInfoRow label="Municipio">
          {editando ? (
            <select
              value={formData.municipio || ""}
              onChange={(e) => onChange("municipio", e.target.value)}
              disabled={!formData.departamento}
              className={sellerSelectClassName}
            >
              <option value="">Seleccionar municipio</option>
              {departamentos
                .find((d) => d.nombre === formData.departamento)
                ?.municipios.map((mun) => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
            </select>
          ) : (
            <span className={vendedor.municipio ? "" : sellerMutedValueClassName}>
              {vendedor.municipio || "—"}
            </span>
          )}
        </SellerInfoRow>

        <SellerInfoRow label="Dirección">
          {editando ? (
            <Textarea
              value={formData.direccion || ""}
              onChange={(e) => onChange("direccion", e.target.value)}
              rows={2}
              className={`resize-none ${sellerTextareaClassName}`}
            />
          ) : (
            <span className={vendedor.direccion ? "" : sellerMutedValueClassName}>
              {vendedor.direccion || "—"}
            </span>
          )}
        </SellerInfoRow>

        <SellerSectionHeading>Contacto</SellerSectionHeading>

        <SellerInfoRow label="Teléfono">
          {editando ? (
            <PhoneInput
              value={formData.telefono_comercio ?? null}
              onChange={(val: PhoneNumber) =>
                setFormData((prev: any) => ({ ...prev, telefono_comercio: val }))
              }
            />
          ) : (
            <span className={vendedor.telefono_comercio ? "" : sellerMutedValueClassName}>
              {formatPhone(vendedor.telefono_comercio)}
            </span>
          )}
        </SellerInfoRow>

        <SellerInfoRow label="WhatsApp">
          {editando ? (
            <div className="space-y-1.5">
              <PhoneInput
                value={formData.whatsapp_numero ?? null}
                onChange={(val: PhoneNumber) =>
                  setFormData((prev: any) => ({ ...prev, whatsapp_numero: val }))
                }
              />
              {formData.whatsapp_numero && (
                <p className={sellerHelperTextClassName}>
                  Enlace:{" "}
                  <span className="font-mono text-neutral-600">
                    wa.me/{formData.whatsapp_numero.country_code}{formData.whatsapp_numero.number}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <span className={vendedor.whatsapp_numero ? "" : sellerMutedValueClassName}>
              {vendedor.whatsapp_numero ? formatPhone(vendedor.whatsapp_numero) : "Sin número de WhatsApp"}
            </span>
          )}
        </SellerInfoRow>

        <SellerSectionHeading>Redes sociales</SellerSectionHeading>

        <SellerInfoRow label="Instagram">
          {editando ? (
            <Input
              value={formData.instagram || ""}
              onChange={(e) => onChange("instagram", e.target.value)}
              placeholder="https://instagram.com/tu_tienda"
              className={sellerFieldClassName}
            />
          ) : vendedor.instagram ? (
            <a
              href={vendedor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={sellerLinkClassName}
            >
              {vendedor.instagram}
            </a>
          ) : (
            <span className={sellerMutedValueClassName}>—</span>
          )}
        </SellerInfoRow>

        <SellerInfoRow label="Facebook">
          {editando ? (
            <Input
              value={formData.facebook || ""}
              onChange={(e) => onChange("facebook", e.target.value)}
              placeholder="https://facebook.com/tu_tienda"
              className={sellerFieldClassName}
            />
          ) : vendedor.facebook ? (
            <a
              href={vendedor.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={sellerLinkClassName}
            >
              {vendedor.facebook}
            </a>
          ) : (
            <span className={sellerMutedValueClassName}>—</span>
          )}
        </SellerInfoRow>

        <SellerInfoRow label="TikTok">
          {editando ? (
            <Input
              value={formData.tiktok || ""}
              onChange={(e) => onChange("tiktok", e.target.value)}
              placeholder="https://tiktok.com/@tu_tienda"
              className={sellerFieldClassName}
            />
          ) : vendedor.tiktok ? (
            <a
              href={vendedor.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className={sellerLinkClassName}
            >
              {vendedor.tiktok}
            </a>
          ) : (
            <span className={sellerMutedValueClassName}>—</span>
          )}
        </SellerInfoRow>

      </SellerSectionCard>

      {/* ══════════════════════════════════════
          ESTILO DEL ENCABEZADO
      ══════════════════════════════════════ */}
      <SellerSectionCard title="Estilo del encabezado">
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
                className="text-[11px] font-semibold text-[#0F3D3A] underline underline-offset-2 transition-colors hover:text-[#0a2e2b]"
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
                className={`mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-semibold ${sellerPrimarySoftButtonClassName}`}
              >
                Aplicar esta sugerencia
              </button>
            )}
          </div>

          {editando ? (
            <>
              {/* ── Theme selector ── */}
              <div className="border-t border-[#0f2e22]/8 pt-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                        className={`flex flex-col items-center gap-1 px-2 py-3 ${sellerOptionCardClassName} ${
                          active
                            ? sellerOptionCardActiveClassName
                            : ""
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                        className={`flex flex-col items-center gap-1.5 px-3 py-4 ${sellerOptionCardClassName} ${
                          active
                            ? sellerOptionCardActiveClassName
                            : ""
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
                <div className="space-y-3 border-t border-[#0f2e22]/8 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                          className={`relative overflow-hidden rounded-2xl border px-3 py-3 text-left shadow-sm transition-all ${
                            active
                              ? "border-[#0F3D3A]/26 shadow-[0_10px_24px_rgba(15,61,58,0.12)]"
                              : "border-[#0f2e22]/10 hover:border-[#0f2e22]/18"
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
                <div className="space-y-3 border-t border-[#0f2e22]/8 pt-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Imagen del encabezado
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      Esta imagen se mostrará en tu tienda pública
                    </p>
                  </div>

                  {/* No banner state */}
                  {!bannerPreview && !formData.banner_url && (
                    <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-[#0f2e22]/12 bg-[#faf8f3] text-sm text-neutral-400">
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
                    className="inline-flex items-center gap-2 rounded-xl border border-[#0f2e22]/10 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-[#0f2e22]/20 hover:bg-[#faf8f3] disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="space-y-5 border-t border-[#0f2e22]/8 pt-3">

                  {/* Quick presets */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Presets rápidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {OVERLAY_QUICK_PRESETS.map(({ name, config }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setHS(prev => ({ ...prev, ...config }))}
                          className="rounded-full border border-[#0f2e22]/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition-colors hover:border-[#0f2e22]/20 hover:bg-[#faf8f3]"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color palette */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                            className={`h-9 w-9 rounded-full border-4 transition-all ${
                              selected ? "scale-110 border-neutral-800 shadow-md" : "border-white shadow-sm hover:scale-105"
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                    <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                      <span>Sutil</span>
                      <span>Intenso</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Smart suggestions — shown at bottom of edit section ── */}
              {suggestions.length > 0 && (
                <div className="space-y-2 border-t border-[#0f2e22]/8 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Sugerencias
                  </p>
                  {suggestions.map((s) => (
                    <div
                      key={s.key}
                      className={`rounded-2xl border p-3 text-[13px] leading-snug ${
                        s.priority === "high"
                          ? "border-red-100 bg-red-50 text-red-700"
                          : s.priority === "medium"
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : "border-blue-100 bg-blue-50 text-blue-600"
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
      </SellerSectionCard>

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
