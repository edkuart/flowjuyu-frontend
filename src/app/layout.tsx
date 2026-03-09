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

const siteUrl = "https://www.flowjuyu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Flowjuyu | Catálogo Cultural",
  description: "Artesanía y diseño tradicional en formato digital.",
  openGraph: {
    title: "Flowjuyu | Catálogo Cultural",
    description: "Artesanía y diseño tradicional en formato digital.",
    url: siteUrl,
    siteName: "Flowjuyu",
    locale: "es_GT",
    type: "website",
    images: [
      {
        url: "/flowjuyu-logo-completo.png",
        width: 1024,
        height: 1024,
        alt: "Logo de Flowjuyu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowjuyu | Catálogo Cultural",
    description: "Artesanía y diseño tradicional en formato digital.",
    images: ["/flowjuyu-logo-completo.png"],
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
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#f6f2ea] text-neutral-900 min-h-screen m-0 p-0`}
      >
        <AuthProvider>
          <ClientProviders>
            <CartProvider>
              <header className="sticky top-0 z-50 w-full">
                <Header />
              </header>

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