// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from '@/lib/fonts'
import Sidebar from '@/components/layout/Sidebar'
import { NextIntlClientProvider } from 'next-intl'

export const metadata: Metadata = {
  title: 'Flowjuyu | Cortes Marketplace',
  description: 'Compra directo al productor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es"> {/* ✅ requerido */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Sidebar />
        <main className="pl-64 min-h-screen">{children}</main>
      </body>
    </html>
  )
}
