"use client"

import Link from "next/link"
import { ArrowRight, LifeBuoy, Lock, MonitorSmartphone, Shield, ShieldCheck, Smartphone } from "lucide-react"

import { SellerSectionHero } from "@/components/seller/SellerSectionHero"
import { SellerSecuritySection } from "@/components/settings/SellerSecuritySection"
import { Card, CardContent } from "@/components/ui/card"

function SummaryCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-[linear-gradient(180deg,_rgba(255,255,255,0.12),_rgba(255,255,255,0.06))] p-4 backdrop-blur-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/15 text-white">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-white/75">{description}</p>
    </div>
  )
}

function FutureSecurityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-[linear-gradient(180deg,_#fbfaf7,_#f4f2eb)] p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.3)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  )
}

export default function SellerSecurityPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 bg-[#f8f5ef] px-4 py-10 sm:px-6">
      <SellerSectionHero
        eyebrow="Protección de acceso"
        title="Seguridad"
        description="Esta sección concentra todo lo relacionado con acceso y protección de la cuenta del vendedor. Empezamos por la contraseña y dejamos la base lista para controles más avanzados."
        tone="accent"
        actions={
          <Link
            href="/seller/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
          >
            Volver a cuenta
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
        aside={
          <>
            <SummaryCard
              icon={<Lock className="h-5 w-5" />}
              title="Acceso separado"
              description="La contraseña ya vive fuera de cuenta para que la navegación sea más clara."
            />
            <SummaryCard
              icon={<Shield className="h-5 w-5" />}
              title="Base preparada"
              description="Dejamos espacio natural para sesiones activas, dispositivos y verificaciones extra."
            />
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.8fr)]">
        <Card className="border border-neutral-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,248,243,0.96))] shadow-[0_16px_40px_-26px_rgba(15,23,42,0.22)]">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3 font-semibold text-neutral-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8 text-[#0F3D3A]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Seguridad de la cuenta</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                <Lock className="h-3.5 w-3.5" />
                Acceso
              </span>
            </div>

            <SellerSecuritySection />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-neutral-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,248,243,0.96))] shadow-[0_16px_40px_-26px_rgba(15,23,42,0.22)]">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Próximamente
                </p>
                <h2 className="text-lg font-semibold text-neutral-900">Controles que vamos a sumar</h2>
                <p className="text-sm leading-6 text-neutral-500">
                  La pantalla ya queda preparada para crecer sin volver a mezclar seguridad con cuenta.
                </p>
              </div>

              <div className="space-y-3">
                <FutureSecurityCard
                  icon={<MonitorSmartphone className="h-5 w-5" />}
                  title="Sesiones activas"
                  description="Ver y cerrar sesiones abiertas en otros dispositivos cuando este flujo exista."
                />
                <FutureSecurityCard
                  icon={<Smartphone className="h-5 w-5" />}
                  title="Verificación adicional"
                  description="Agregar un segundo factor o validaciones reforzadas para acciones sensibles."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,248,243,0.96))] shadow-[0_16px_40px_-26px_rgba(15,23,42,0.22)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2.5 font-semibold text-neutral-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8 text-[#0F3D3A]">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Ayuda rápida</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-neutral-500">
                Si detectas accesos extraños, cambios que no reconoces o problemas para entrar,
                puedes continuar el seguimiento desde soporte.
              </p>
              <Link
                href="/seller/tickets"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0F3D3A] transition hover:text-[#0a2e2c]"
              >
                Ir a mis tickets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
