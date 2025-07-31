import './globals.css';
import type { Metadata } from 'next';
import { geistSans, geistMono } from '@/lib/fonts';
import { ClientProviders } from '@/providers/ClientProviders';
import { AppSidebar } from '@/components/ui/sidebar/AppSidebar';
import Header from '@/components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';

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
            <AppSidebar />
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow h-16">
              <Header />
            </header>
            <main className="pt-16 min-h-screen">{children}</main>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
