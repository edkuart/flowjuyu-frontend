'use client';

import { SidebarProvider } from '@/components/ui/sidebar/SidebarContext';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export function ClientProviders({ children }: Props) {
  // One QueryClient per browser session — useState ensures it's not recreated on re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        {/* NextIntlClientProvider requiere locale y messages para SSR */}
        <NextIntlClientProvider locale="es" messages={{}}>
          {children}
        </NextIntlClientProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
