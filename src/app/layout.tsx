// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { geistSans, geistMono } from '@/lib/fonts';
import { ClientProviders } from '@/providers/ClientProviders';
import { AppSidebar } from '@/components/ui/sidebar/AppSidebar';
import Header from '@/components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext'; 

export const metadata: Metadata = {
  title: 'Flowjuyu | Cortes Marketplace',
  description: 'Compra directo al productor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <ClientProviders>
            <CartProvider>
              <AppSidebar />
              {/* Header sticky para que no cubra el contenido */}
              <header className="sticky top-0 z-50 bg-white shadow">
                <Header />
              </header>
              {/* Con sticky NO necesitas pt-16 */}
              <main className="min-h-screen">{children}</main>
            </CartProvider>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
