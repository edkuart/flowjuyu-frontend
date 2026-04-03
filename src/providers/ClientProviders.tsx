"use client";

import { SidebarProvider } from "@/components/ui/sidebar/SidebarContext";
import { LanguageSelectorModal } from "@/i18n/components/LanguageSelectorModal";
import { LanguageProvider } from "@/i18n/context/LanguageProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export function ClientProviders({ children }: Props) {
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
      <LanguageProvider>
        <SidebarProvider>
          {children}
          <LanguageSelectorModal />
        </SidebarProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
