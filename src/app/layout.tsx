// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { ClientProviders } from "@/providers/ClientProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

const siteUrl = "https://www.flowjuyu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flowjuyu | Cortes Marketplace",
    template: "%s | Flowjuyu",
  },
  description:
    "Compra directa al productor. Descubre cortes, textiles y tiendas en Flowjuyu.",
  openGraph: {
    title: "Flowjuyu | Cortes Marketplace",
    description:
      "Compra directa al productor. Descubre cortes, textiles y tiendas en Flowjuyu.",
    url: siteUrl,
    siteName: "Flowjuyu",
    locale: "es_GT",
    type: "website",
    images: [
      {
        url: "/images/hero-cultural.jpg",
        width: 1536,
        height: 1024,
        alt: "Flowjuyu | Cortes Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowjuyu | Cortes Marketplace",
    description:
      "Compra directa al productor. Descubre cortes, textiles y tiendas en Flowjuyu.",
    images: ["/images/hero-cultural.jpg"],
  },
  icons: {
    icon: "/flowjuyu-isotipo.png",
    shortcut: "/flowjuyu-isotipo.png",
    apple: "/flowjuyu-isotipo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#f6f2ea] text-neutral-900 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ClientProviders>
            <CartProvider>
              <header className="sticky top-0 z-50 w-full">
                <Header />
              </header>
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </ClientProviders>
        </AuthProvider>

        {/* TOAST */}
        <Toaster richColors position="top-right" />

      </body>
    </html>
  );
}