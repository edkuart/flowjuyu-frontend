// src/providers/ClientProviders.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar"; // en Manuel estaba SidebarProvider
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/context/AuthContext"; // en Heynan lo usaba explícito

interface Props {
  children: React.ReactNode;
}

/**
 * Fusiona lo mejor de Heynan y Manuel:
 * - SessionProvider (next-auth) → manejo de sesión extendida
 * - SidebarProvider (UI) → evita errores de SidebarTrigger
 * - NextIntlClientProvider (i18n) → requerido para SSR
 * - AuthProvider → persistencia de usuario/token en localStorage
 */
export default function ClientProviders({ children }: Props) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <NextIntlClientProvider locale="es" messages={{}}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </SidebarProvider>
    </SessionProvider>
  );
}
