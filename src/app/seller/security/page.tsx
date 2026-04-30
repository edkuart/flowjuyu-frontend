"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  KeyRound,
  LifeBuoy,
  Lock,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { SellerSecuritySection } from "@/components/settings/SellerSecuritySection";
import {
  AccountActionCard,
  AccountCollapsibleSection,
  AccountContentBand,
  AccountPageHeader,
  AccountSectionIntro,
} from "@/components/seller/account/SellerAccountSections";
import { Button } from "@/components/ui/button";

function SecurityStatusAside() {
  const items = [
    {
      label: "Contraseña",
      value: "Disponible",
    },
    {
      label: "Soporte",
      value: "Activo",
    },
  ];

  return (
    <div className="rounded-[24px] border border-white/70 bg-white/60 px-5 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] sm:w-72 sm:shrink-0">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#8c9892] uppercase">
        Estado de acceso
      </p>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm text-neutral-600">{item.label}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" />
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SellerSecurityPage() {
  const { logout } = useAuth();

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 bg-[#f8f5ef] px-4 py-6 sm:px-6 sm:py-10">
      <AccountPageHeader
        eyebrow="Protección de acceso · Flowjuyu"
        title="Seguridad"
        description="Configura la protección de acceso de tu cuenta de vendedor y mantén separadas las acciones sensibles."
        backHref="/seller/account"
        backLabel="Cuenta del vendedor"
        actionHref="/seller/security#acciones-seguridad"
        actionLabel="Ver opciones de seguridad"
        aside={<SecurityStatusAside />}
      />

      <AccountContentBand id="acciones-seguridad">
        <AccountSectionIntro
          eyebrow="Opciones principales"
          title="Acciones de seguridad"
          description="Solo dejamos herramientas que tienen flujo real hoy: cambiar contraseña, cerrar sesión y pedir ayuda."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AccountActionCard
            href="/seller/security#contrasena"
            icon={<KeyRound className="h-5 w-5" />}
            title="Cambiar contraseña"
            description="Actualiza tu clave de acceso con una contraseña única y segura."
            cta="Abrir"
            featured
          />
          <AccountActionCard
            href="/seller/security#sesion"
            icon={<LogOut className="h-5 w-5" />}
            title="Cerrar sesión"
            description="Sal de este dispositivo si terminaste de trabajar o estás en un equipo compartido."
            cta="Abrir"
          />
          <AccountActionCard
            href="/seller/security#soporte"
            icon={<LifeBuoy className="h-5 w-5" />}
            title="Ayuda de acceso"
            description="Continúa con soporte si detectas cambios o accesos extraños."
            cta="Ir a ayuda"
          />
        </div>
      </AccountContentBand>

      <AccountContentBand id="contrasena">
        <AccountSectionIntro
          eyebrow="Acceso"
          title="Contraseña"
          description="Actualiza tu clave de acceso cuando lo necesites. Mantén esta acción separada del resto de tu cuenta."
        />

        <AccountCollapsibleSection
          icon={<KeyRound className="h-5 w-5 text-neutral-600" />}
          title="Cambiar contraseña"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
              <Lock className="h-3.5 w-3.5" />
              Recomendado
            </span>
          }
        >
          <SellerSecuritySection />
        </AccountCollapsibleSection>
      </AccountContentBand>

      <AccountContentBand id="sesion">
        <AccountSectionIntro
          eyebrow="Sesión"
          title="Acceso actual"
          description="Usa esta acción cuando estés en un dispositivo compartido o quieras salir de tu panel."
        />

        <AccountCollapsibleSection
          icon={<LogOut className="h-5 w-5 text-neutral-600" />}
          title="Cerrar sesión en este dispositivo"
          description="Cierra tu acceso actual y vuelve a la pantalla de inicio de sesión."
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-[#0f2e22]/10 bg-[#fcfbf8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Salida segura
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Úsalo si compartes computadora o terminaste de administrar tu
                tienda.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => void logout()}
              className="rounded-xl border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </AccountCollapsibleSection>
      </AccountContentBand>

      <AccountContentBand id="soporte">
        <AccountSectionIntro
          eyebrow="Ayuda"
          title="Soporte de seguridad"
          description="Si algo no se ve normal en tu cuenta, usa soporte para dejar registro y darle seguimiento."
        />

        <AccountCollapsibleSection
          icon={<LifeBuoy className="h-5 w-5 text-neutral-600" />}
          title="Ayuda rápida"
          description="Reporta accesos extraños, cambios no reconocidos o problemas para entrar."
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-neutral-600">
              Si detectas accesos extraños, cambios que no reconoces o problemas
              para entrar, puedes continuar el seguimiento desde soporte.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/seller/tickets">
                <Button
                  variant="outline"
                  className="justify-between rounded-xl border-[#0f2e22]/10 text-sm hover:bg-[#faf8f3]"
                >
                  Ir a mis tickets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/seller/tickets/new">
                <Button className="rounded-xl bg-[var(--seller-accent)] text-sm text-white hover:bg-[var(--seller-accent-strong)]">
                  Crear ticket
                </Button>
              </Link>
            </div>
          </div>
        </AccountCollapsibleSection>
      </AccountContentBand>
    </main>
  );
}
