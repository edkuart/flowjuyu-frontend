// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import { ClientProviders } from "@/providers/ClientProviders";
import { AppSidebar } from "@/components/ui/sidebar/AppSidebar";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Flowjuyu | Cortes Marketplace",
  description: "Compra directo al productor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <ClientProviders>
            <CartProvider>
              {/* Sidebar colapsable en móvil */}
              <div className="flex flex-col md:flex-row">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  {/* Header sticky y compacto */}
                  <header className="sticky top-0 z-50 bg-white shadow md:px-6 px-3 py-2">
                    <Header />
                  </header>

                  {/* Contenido principal con padding adaptable */}
                  <main className="flex-1 px-3 md:px-6 py-4 md:py-6">{children}</main>
                </div>
              </div>
            </CartProvider>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
