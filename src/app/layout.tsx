import './globals.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from '@/lib/fonts'
import { NextIntlClientProvider } from 'next-intl'

import { SidebarProvider } from '@/components/ui/sidebar/SidebarContext'
import { AppSidebar } from '@/components/ui/sidebar/AppSidebar'
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Flowjuyu | Cortes Marketplace',
  description: 'Compra directo al productor',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <SidebarProvider>
          <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow h-16 flex items-center justify-between px-4">
            <Header />
            <SidebarTrigger />
          </header>

          <AppSidebar />

          <main className="pt-16 min-h-screen">
            <NextIntlClientProvider locale="es">
              {children}
            </NextIntlClientProvider>
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
