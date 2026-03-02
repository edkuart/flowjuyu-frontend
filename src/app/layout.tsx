// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClientProviders } from "@/providers/ClientProviders";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flowjuyu | Catálogo Cultural",
  description: "Artesanía y diseño tradicional en formato digital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#f6f2ea] text-neutral-900 min-h-screen m-0 p-0`}
      >
        <AuthProvider>
          <ClientProviders>
            <CartProvider>

              {/* HEADER CORREGIDO: Eliminamos el padding, el fondo blanco y el borde */}
              <header className="sticky top-0 z-50 w-full">
                <Header />
              </header>

              {/* CONTENIDO */}
              <main className="min-h-[calc(100vh-72px)] w-full">
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