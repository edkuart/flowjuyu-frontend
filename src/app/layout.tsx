// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/providers/ClientProviders";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flowjuyu | Cortes Marketplace",
  description: "Compra directo al productor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          <ClientProviders>
            <CartProvider>

              {/* HEADER SIEMPRE VISIBLE */}
              <header className="sticky top-0 z-50 bg-white shadow md:px-6 px-3 py-2">
                <Header />
              </header>

              {/* CONTENIDO */}
              <main className="min-h-[calc(100vh-72px)]">
                {children}
              </main>

            </CartProvider>
          </ClientProviders>
        </AuthProvider>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}