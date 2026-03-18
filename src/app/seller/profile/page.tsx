// src/app/seller/profile/page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { useFileUpload } from "@/hooks/useFileUpload"
import { departamentos } from "@/lib/guatemala"
import { MapPin, ShieldCheck, ShoppingBag, Shield, Store } from "lucide-react"
import { SellerContactCTA } from "@/components/seller/SellerContactCTA"

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

export default function SellerPublicProfilePage() {
  const { user } = useAuth()
  const [vendedor, setVendedor] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({})
  const inputFileRef = useRef<HTMLInputElement>(null)
  const { previews, files, handleFile } = useFileUpload()
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  /* ── Fetch ── */
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`${API}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return

        const data = await res.json()
        const perfil = data.perfil || data
        setVendedor(perfil)
        setFormData(perfil)
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
      if (val !== undefined && val !== null) body.append(key, val as string)
    })
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
      setEditando(false)
    }
  }

  /* ── Guards ── */
  if (loading) return <p className="p-8 text-center text-neutral-500">Cargando perfil...</p>
  if (!vendedor) return <p className="p-8 text-center text-red-500">Perfil no encontrado</p>

  const esPropietario = Number(user?.id) === Number(vendedor.user_id)
  const esVerificado  = vendedor.estado_validacion === "aprobado"
  const ubicacion     = [vendedor.municipio, vendedor.departamento].filter(Boolean).join(", ")
  const mensajeLen    = (formData.mensaje_publico || "").length

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl text-white">

        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D3A] via-[#0a2e2b] to-[#0c3330]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />

        <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Logo */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-white/25 shadow-2xl">
              <AvatarImage src={previews["fotoPerfil"] || vendedor.logo || "/avatar-placeholder.png"} />
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
            <div className="flex gap-3 flex-shrink-0 items-start flex-wrap justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditando(!editando)}
                className="border-white/25 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/40"
              >
                {editando ? "Cancelar" : "Editar perfil"}
              </Button>
              {editando && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  className="bg-white text-[#0F3D3A] hover:bg-neutral-100 font-semibold"
                >
                  Guardar cambios
                </Button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════
          2. DESCRIPCIÓN DE LA TIENDA
      ══════════════════════════════════════ */}
      <SectionCard title="Descripción de tu tienda">
        {editando ? (
          <Textarea
            value={formData.descripcion || ""}
            onChange={(e) => onChange("descripcion", e.target.value)}
            placeholder="Cuenta qué vendes, cómo trabajas y qué hace única tu tienda"
            rows={5}
            className="resize-none text-sm"
          />
        ) : vendedor.descripcion ? (
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            {vendedor.descripcion}
          </p>
        ) : (
          <p className="text-sm italic text-neutral-400">
            Cuenta qué vendes, cómo trabajas y qué hace única tu tienda
          </p>
        )}

        {/* Contact CTA — view mode only so seller sees the buyer perspective */}
        {!editando && (
          <div className="mt-5 pt-5 border-t border-neutral-100">
            <SellerContactCTA
              whatsapp={vendedor.whatsapp_numero}
              nombreComercio={vendedor.nombre_comercio}
            />
          </div>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════
          3. MENSAJE PÚBLICO
      ══════════════════════════════════════ */}
      <SectionCard title="Mensaje público de tu tienda">
        {editando ? (
          <div className="space-y-3">
            <p className="text-[13px] text-neutral-500 leading-snug">
              Este mensaje aparece en la parte principal de tu tienda. Úsalo para invitar al cliente a contactarte.
            </p>
            <div className="relative">
              <Textarea
                value={formData.mensaje_publico || ""}
                onChange={(e) =>
                  onChange("mensaje_publico", e.target.value.slice(0, MENSAJE_MAX))
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
        ) : vendedor.mensaje_publico ? (
          <p className="text-[15px] text-neutral-700 leading-relaxed italic">
            "{vendedor.mensaje_publico}"
          </p>
        ) : (
          <p className="text-sm italic text-neutral-400">
            Agrega un mensaje corto para invitar a los compradores a contactarte
          </p>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════
          TRUST SIGNALS
      ══════════════════════════════════════ */}
      {!editando && (
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-1">
          {([
            { Icon: ShoppingBag, label: "Compra directa" },
            { Icon: Shield,      label: "Sin intermediarios" },
            { Icon: Store,       label: "Tienda en Flowjuyu" },
          ] as const).map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[13px] text-neutral-500">
              <Icon className="w-4 h-4 text-[#0F3D3A] flex-shrink-0" />
              {label}
            </div>
          ))}
        </div>
      )}

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
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20"
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
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 disabled:bg-neutral-50 disabled:text-neutral-400"
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
            <Input
              value={formData.telefono_comercio || ""}
              onChange={(e) => onChange("telefono_comercio", e.target.value)}
              placeholder="Ej: 23456789"
              className="max-w-[180px] text-sm"
            />
          ) : (
            <span className={vendedor.telefono_comercio ? "" : "text-neutral-400"}>
              {vendedor.telefono_comercio ? `+502 ${vendedor.telefono_comercio}` : "—"}
            </span>
          )}
        </InfoRow>

        <InfoRow label="WhatsApp">
          {editando ? (
            <div className="space-y-1">
              <Input
                value={formData.whatsapp_numero || ""}
                onChange={(e) => onChange("whatsapp_numero", e.target.value)}
                placeholder="Ej: 50299887766"
                className="max-w-[200px] text-sm"
              />
              <p className="text-[11px] text-neutral-400">
                Incluye código de país sin "+": <strong className="text-neutral-600">502</strong>99887766
              </p>
            </div>
          ) : (
            <span className={vendedor.whatsapp_numero ? "" : "text-neutral-400"}>
              {vendedor.whatsapp_numero ? `+${vendedor.whatsapp_numero}` : "Sin número de WhatsApp"}
            </span>
          )}
        </InfoRow>

      </section>

    </main>
  )
}
