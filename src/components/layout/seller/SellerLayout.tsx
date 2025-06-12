'use client'

import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/seller/app-sidebar'
import Image from 'next/image'

interface SellerLayoutProps {
  children: ReactNode
}

export default function SellerLayoutWrapper({ children }: SellerLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset">
        <div className="flex items-center gap-3 p-4">
          <Image
            src="/cortelogo.png"
            alt="Flowjuyu"
            width={36}
            height={36}
            priority
            className="rounded-sm"
          />
          <span className="text-lg font-semibold tracking-tight">
            Flowjuyu
          </span>
        </div>
      </AppSidebar>

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
