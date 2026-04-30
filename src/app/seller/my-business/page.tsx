'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Eye,
  Pencil,
  MapPin,
  MessageCircle,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Shield,
  Package,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SellerSectionCard } from '@/components/seller/ui/SellerProfileSection'
import {
  sellerGlassButtonClassName,
  sellerOptionCardActiveClassName,
  sellerOptionCardClassName,
  sellerPillClassName,
  sellerPrimarySoftButtonClassName,
} from '@/components/seller/ui/sellerFormStyles'

import { apiGetVendedorPerfil } from '@/services/vendedorPerfil'
import { SellerLogo } from '@/components/seller/SellerLogo'
import SellerQrModal from '@/components/seller/SellerQrModal'
import SocialButtons from '@/components/seller/SocialButtons'
import { WhatsAppLinkSection } from '@/components/seller/whatsapp/WhatsAppLinkSection'
import { PublicReviewList } from '@/components/reviews/PublicReviewList'
import { buildHeaderStyle, DEFAULT_HEADER_STYLE } from '@/lib/headerStyle'
import type { HeaderStyle } from '@/lib/headerStyle'
import { phoneToWaUrl, hasPhone } from '@/lib/phone'
import type { PhoneNumber } from '@/lib/phone'
import { markSellerStoreShared } from '@/lib/sellerEducation'

/* =========================================================
   TYPES
========================================================= */

type SellerProfile = {
  id: number
  user_id: number
  nombre_comercio: string
  descripcion?: string | null
  logo?: string | null
  banner_url?: string | null
  departamento?: string | null
  municipio?: string | null
  mensaje_destacado?: string | null
  plan?: 'free' | 'founder'
  plan_activo?: boolean
  whatsapp_numero?: PhoneNumber | null
  identidad_tags?: string[] | null
  estado_validacion?: 'pendiente' | 'aprobado' | 'rechazado' | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  header_style?: HeaderStyle | null
}

/* =========================================================
   PAGE
========================================================= */

export default function MyBusinessPage() {
  const [loading, setLoading]     = useState(true)
  const [perfil, setPerfil]       = useState<SellerProfile | null>(null)
  const [qrOpen, setQrOpen]       = useState(false)
  const [optimOpen, setOptimOpen] = useState(true) // updated after profile loads

  /* ── Load ── */
  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await apiGetVendedorPerfil()
        if (profileRes.ok && profileRes.perfil) {
          setPerfil(profileRes.perfil as unknown as SellerProfile)
        }
      } catch (err) {
        console.warn('Profile fetch failed:', err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  /* ── Header background ── */
  const headerBgStyle = useMemo(
    () => buildHeaderStyle(perfil?.header_style ?? DEFAULT_HEADER_STYLE, perfil?.banner_url),
    [perfil?.banner_url, perfil?.header_style]
  )

  const showWhatsapp =
    perfil?.plan === 'founder' &&
    perfil?.plan_activo === true &&
    hasPhone(perfil?.whatsapp_numero)

  /* ── Profile optimization checklist ── */
  const setupSteps = useMemo(() => {
    if (!perfil) return []
    return [
      {
        id: 'logo',
        label: 'Sube tu logo',
        done: !!perfil.logo,
        href: '/seller/profile',
        hint: 'Da identidad visual a tu tienda',
      },
      {
        id: 'banner',
        label: 'Agrega un banner',
        done: !!perfil.banner_url,
        href: '/seller/profile',
        hint: 'Aumenta la confianza de tus compradores',
      },
      {
        id: 'descripcion',
        label: 'Escribe tu descripción',
        done: !!perfil.descripcion?.trim(),
        href: '/seller/profile',
        hint: 'Conecta con tu audiencia',
      },
      {
        id: 'mensaje',
        label: 'Agrega un mensaje destacado',
        done: !!perfil.mensaje_destacado?.trim(),
        href: '/seller/profile',
        hint: 'Personaliza tu tienda pública',
      },
      {
        id: 'social',
        label: 'Conecta tus redes sociales',
        done: !!(perfil.instagram || perfil.facebook || perfil.tiktok),
        href: '/seller/profile',
        hint: 'Amplía tu presencia digital',
      },
      {
        id: 'verificacion',
        label: 'Solicita tu verificación',
        done: perfil.estado_validacion === 'aprobado',
        href: '/seller/profile',
        hint: 'Genera más confianza en el marketplace',
      },
    ]
  }, [perfil])

  const completedSteps = setupSteps.filter((s) => s.done).length
  const totalSteps     = setupSteps.length
  const progressPct    = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  const progressColor  = progressPct >= 80 ? 'bg-emerald-500' : progressPct >= 50 ? 'bg-amber-400' : 'bg-[#0F3D3A]'
  const progressLabel  = progressPct === 100
    ? 'Tu tienda está lista 🎉'
    : progressPct >= 80 ? 'Perfil excelente'
    : progressPct >= 50 ? 'En progreso'
    : 'Empieza a optimizar tu tienda'

  // Collapse optimization hub automatically when profile is 100% complete
  useEffect(() => {
    if (progressPct === 100) setOptimOpen(false)
  }, [progressPct])

  /* ── Loading / error ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-neutral-500">
        Cargando tu tienda…
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center text-neutral-500">
        No se encontró información del negocio.
      </main>
    )
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
    <main className="min-h-screen bg-[#f8f5ef]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        <section className="rounded-[28px] border border-[#0F3D3A]/10 bg-gradient-to-r from-[#0F3D3A] to-[#14544f] px-6 py-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
              <Eye className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/65">
                Vista comprador
              </p>
              <h2 className="text-xl font-bold tracking-tight">
                Vista previa de tu tienda
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80">
                Así ven tu perfil, tus productos y tus reseñas los compradores.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            1. HERO — BRAND IDENTITY (no KPIs)
        ══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-[32px] text-white shadow-xl">

          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-[background-image,background-color] duration-300"
            style={headerBgStyle}
          />

          {/* Content */}
          <div className="relative px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col md:flex-row gap-7 md:gap-10">

              {/* Logo — circular premium */}
              <SellerLogo
                src={perfil.logo}
                alt={perfil.nombre_comercio}
                size="lg"
                className="mx-auto md:mx-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">

                {/* Badges */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    {perfil.estado_validacion === 'aprobado' && (
                      <span className={`${sellerPillClassName} border-blue-400/30 bg-blue-600/80 px-3 py-0.5 text-[10px] font-bold text-white`}>
                        ✔ Verificado
                      </span>
                    )}
                    {perfil.plan === 'founder' && perfil.plan_activo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-0.5 text-[10px] font-bold text-black shadow-sm">
                        ⭐ Founder
                      </span>
                    )}
                    <span className={`${sellerPillClassName} border-white/20 bg-white/15 px-3 py-0.5 text-[10px] text-white/80`}>
                      🧵 Hecho a mano
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    {perfil.nombre_comercio}
                  </h1>

                  {(perfil.municipio || perfil.departamento) && (
                    <p className="flex items-center gap-1.5 text-sm opacity-80 justify-center md:justify-start">
                      <MapPin className="w-3.5 h-3.5" />
                      {[perfil.municipio, perfil.departamento].filter(Boolean).join(', ')}
                    </p>
                  )}

                  {perfil.descripcion && (
                    <p className="text-sm opacity-80 leading-relaxed max-w-xl line-clamp-2">
                      {perfil.descripcion}
                    </p>
                  )}
                </div>

                {/* Identity tags */}
                {perfil.identidad_tags && perfil.identidad_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {perfil.identidad_tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className={`${sellerPillClassName} border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* WhatsApp CTA — founder only */}
                {showWhatsapp && (
                  <div className="pt-1 flex items-end gap-2 justify-center md:justify-start">
                    <a
                      href={phoneToWaUrl(perfil.whatsapp_numero) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-full bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contactar por WhatsApp
                    </a>
                    <p className="text-xs text-white/50 mb-0.5">
                      Visible en tu tienda pública
                    </p>
                  </div>
                )}

                <SocialButtons
                  links={{ instagram: perfil.instagram, facebook: perfil.facebook, tiktok: perfil.tiktok }}
                  className="mt-2 justify-center md:justify-start"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-row md:flex-col gap-2 flex-wrap justify-center md:justify-start md:w-44 shrink-0">
                <Link href="/seller/profile">
                  <Button
                    variant="secondary"
                    className={`w-full gap-1.5 ${sellerGlassButtonClassName}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar perfil
                  </Button>
                </Link>

                <Link href={`/store/${perfil.user_id}`}>
                  <Button className={`w-full gap-1.5 text-emerald-900 ${sellerPrimarySoftButtonClassName} bg-white hover:bg-[#f6f4ef]`}>
                    <Eye className="w-3.5 h-3.5" />
                    Ver tienda
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  onClick={() => {
                    markSellerStoreShared()
                    setQrOpen(true)
                  }}
                  className={`w-full gap-1.5 ${sellerGlassButtonClassName}`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Ver QR de mi tienda
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            2. PROFILE OPTIMIZATION HUB (collapsible)
        ══════════════════════════════════════════════════ */}
        <SellerSectionCard title="Optimización de perfil" bodyClassName="p-0">

          {/* Clickable header — always visible */}
          <button
            type="button"
            onClick={() => setOptimOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#faf8f3]"
          >
            <div className="text-left">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8c9892]">
                Optimización de perfil
              </p>
              <h2 className="text-base font-bold text-neutral-900">{progressLabel}</h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black text-[#0F3D3A]">{progressPct}%</p>
                <p className="text-[10px] text-[#97a19b]">{completedSteps}/{totalSteps} pasos</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-[#97a19b] transition-transform duration-300 ${
                  optimOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </button>

          {/* Collapsible body */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              optimOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-[#eef1ec]">
              <div
                className={`h-full transition-all duration-700 ${progressColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="divide-y divide-[#f2f4f0]">
              {setupSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#faf8f3] ${
                    step.done ? 'opacity-50' : ''
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-neutral-300" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${step.done ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>
                      {step.label}
                    </p>
                    {!step.done && (
                      <p className="mt-0.5 text-xs text-[#8a968f]">{step.hint}</p>
                    )}
                  </div>
                  {!step.done && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </SellerSectionCard>

        {/* ══════════════════════════════════════════════════
            3. QUICK ACTIONS — PERSONALIZATION + CATALOG
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Mensaje destacado */}
          <SellerSectionCard title="Personalización" bodyClassName="space-y-3 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8c9892]">
                  Personalización
                </p>
                <h3 className="text-sm font-bold text-neutral-900">Mensaje público</h3>
              </div>
              <Link href="/seller/profile">
                <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 rounded-xl border-[#0f2e22]/10 px-3 text-xs hover:bg-[#faf8f3]">
                  <Pencil className="w-3 h-3" />
                  Editar
                </Button>
              </Link>
            </div>
            {perfil.mensaje_destacado ? (
              <p className="text-sm text-neutral-700 leading-relaxed italic line-clamp-3">
                "{perfil.mensaje_destacado}"
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                Sin mensaje. Agrégalo desde "Editar perfil".
              </p>
            )}
          </SellerSectionCard>

          {/* Catalog shortcuts */}
          <SellerSectionCard title="Catálogo" bodyClassName="space-y-3 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8c9892]">
                  Catálogo
                </p>
                <h3 className="text-sm font-bold text-neutral-900">Tus productos</h3>
              </div>
              <Link href="/seller/products">
                <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 rounded-xl border-[#0f2e22]/10 px-3 text-xs hover:bg-[#faf8f3]">
                  <Package className="w-3 h-3" />
                  Gestionar
                </Button>
              </Link>
            </div>
            <div className="space-y-2.5">
              <Link
                href="/seller/products/new"
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#0F3D3A] ${sellerOptionCardClassName} ${sellerOptionCardActiveClassName}`}
              >
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                Agregar nuevo producto
              </Link>
              <Link
                href="/seller/products"
                className={`flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 ${sellerOptionCardClassName}`}
              >
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                Ver todos mis productos
              </Link>
              <Link
                href={`/store/${perfil.user_id}`}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 ${sellerOptionCardClassName}`}
              >
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                Ver tienda pública
              </Link>
            </div>
          </SellerSectionCard>
        </div>

        <WhatsAppLinkSection />

        {/* ══════════════════════════════════════════════════
            4. REPUTATION — Reviews & Trust
        ══════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="px-1 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                Vista pública
              </p>
              <h2 className="text-base font-bold text-neutral-900">Reseñas de tus clientes</h2>
              <p className="text-sm text-neutral-500">
                Esta sección reutiliza las reseñas reales publicadas de tu storefront.
              </p>
            </div>
            {perfil.estado_validacion === 'aprobado' && (
              <div className="flex items-center gap-1.5 shrink-0 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700">Artesano verificado</span>
              </div>
            )}
          </div>
          <PublicReviewList sellerId={perfil.id} />
        </section>

        {/* ══════════════════════════════════════════════════
            5. FOUNDER UPGRADE — Growth & Visibility
        ══════════════════════════════════════════════════ */}
        {perfil.plan === 'free' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-300/20 rounded-full" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Plan Founder
                  </span>
                </div>
                <h3 className="text-xl font-bold text-amber-900">
                  Lleva tu tienda al siguiente nivel
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Botón de contacto por WhatsApp en tu tienda
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Badge Founder + mayor visibilidad en el marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Productos destacados en la página principal
                  </li>
                </ul>
              </div>

              <Button className="shrink-0 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all gap-2">
                Conocer plan Founder
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>

    <SellerQrModal
      open={qrOpen}
      onClose={() => setQrOpen(false)}
      sellerId={Number(perfil.user_id)}
      nombreComercio={perfil.nombre_comercio || 'Mi tienda'}
    />
    </>
  )
}
