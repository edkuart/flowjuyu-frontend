// src/components/ui/sidebar/SidebarMenuButton.tsx

import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

const SidebarMenuButton = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithoutRef<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      className={cn(
        'w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-800',
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

export { SidebarMenuButton }
