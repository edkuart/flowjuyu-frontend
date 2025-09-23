// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientProviders from "@/providers/ClientProviders";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowjuyu Marketplace",
  description: "Compra directo a artesanos guatemaltecos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <ClientProviders>
          {/* Provee contexto a cualquier SidebarTrigger del Header sin pintar sidebar global */}
          <SidebarProvider>
            <div className="flex min-h-screen w-full flex-col">
              {/* Header a ancho completo */}
              <Header />

              {/* Main con contenedor centralizado real (clase propia) */}
              <main className="flex-1 w-full">
                <div className="app-container">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
