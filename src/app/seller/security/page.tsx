"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, LifeBuoy, Lock, MonitorSmartphone, Shield, ShieldCheck, Smartphone } from "lucide-react"

import { SellerSectionHero } from "@/components/seller/SellerSectionHero"
import { SellerPanelHeader, SellerPill, SellerSurfaceCard } from "@/components/seller/ui/SellerPrimitives"
import { SellerSecuritySection } from "@/components/settings/SellerSecuritySection"
import { PageBackNav } from "@/components/ui/PageBackNav"

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
    <SellerSurfaceCard tone="soft" className="p-4">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--seller-line)] bg-white text-[var(--seller-text)] shadow-[var(--seller-shadow-panel)]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[var(--seller-ink)]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--seller-muted)]">{description}</p>
    </SellerSurfaceCard>
  )
}

export default function SellerSecurityPage() {
  const router = useRouter()

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 bg-[#f8f5ef] px-4 py-10 sm:px-6">
      <PageBackNav
        variant="panel"
        onClick={() => router.push("/seller/account")}
        label="Volver a cuenta"
        meta="Cuenta del vendedor"
        title={<p className="truncate text-[15px] font-semibold text-[var(--seller-ink)]">Seguridad</p>}
      />

      <SellerSectionHero
        eyebrow="Protección de acceso"
        title="Seguridad"
        description="Esta sección concentra todo lo relacionado con acceso y protección de la cuenta del vendedor. Empezamos por la contraseña y dejamos la base lista para controles más avanzados."
        tone="accent"
        actions={
          <Link
            href="/seller/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
          >
            Ir a soporte
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
        <SellerSurfaceCard>
          <SellerPanelHeader
            icon={<Shield className="h-5 w-5" />}
            title="Seguridad de la cuenta"
            action={
              <SellerPill tone="neutral">
                <Lock className="h-3.5 w-3.5" />
                Acceso
              </SellerPill>
            }
          />
          <div className="space-y-6 p-6">
            <SellerSecuritySection />
          </div>
        </SellerSurfaceCard>

        <div className="space-y-6">
          <SellerSurfaceCard>
            <SellerPanelHeader
              eyebrow="Próximamente"
              title="Controles que vamos a sumar"
              description="La pantalla ya queda preparada para crecer sin volver a mezclar seguridad con cuenta."
            />

            <div className="space-y-4 p-6">
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
            </div>
          </SellerSurfaceCard>

          <SellerSurfaceCard>
            <SellerPanelHeader
              icon={<LifeBuoy className="h-5 w-5" />}
              title="Ayuda rápida"
            />
            <div className="space-y-4 p-6">
              <p className="text-sm leading-6 text-[var(--seller-muted)]">
                Si detectas accesos extraños, cambios que no reconoces o problemas para entrar,
                puedes continuar el seguimiento desde soporte.
              </p>
              <Link
                href="/seller/tickets"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--seller-accent)] transition hover:text-[var(--seller-accent-strong)]"
              >
                Ir a mis tickets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </SellerSurfaceCard>
        </div>
      </section>
    </main>
  )
}
