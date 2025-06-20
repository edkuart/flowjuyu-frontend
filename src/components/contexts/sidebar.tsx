'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type SidebarCtx = { isOpen: boolean; toggle: () => void; close: () => void };
const Ctx = createContext<SidebarCtx | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider
      value={{
        isOpen,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useSidebar = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be inside <SidebarProvider>');
  return ctx;
};
