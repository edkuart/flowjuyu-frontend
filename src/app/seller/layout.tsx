// src/app/seller/layout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  User,
  Building2,
  ShieldCheck,
  Menu,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/seller/dashboard" },
  { label: "Productos", icon: Package, href: "/seller/products" },
  { label: "Pedidos", icon: ShoppingCart, href: "/seller/orders" },
  { label: "Perfil público", icon: User, href: "/seller/profile" },
  { label: "Mi negocio", icon: Building2, href: "/seller/profile/business" },
  { label: "Validación", icon: ShieldCheck, href: "/seller/profile/validation" },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const Nav = ({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) => (
    <nav className={cn("p-4 space-y-2", className)}>
      {navItems.map(({ label, icon: Icon, href }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 text-sm font-medium transition px-3 py-2 rounded-md",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <AuthGuard allowedRoles={["vendedor"]}>
      <div className="min-h-screen flex bg-muted/20">
        {/* Sidebar (desktop) */}
        <aside className="w-64 bg-white border-r shadow-sm hidden md:flex md:flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Panel Vendedor</h2>
          </div>
          <Nav />
        </aside>

        {/* Top bar + menú móvil */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b p-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                <Menu className="w-4 h-4" />
                Menú vendedor
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Panel Vendedor</SheetTitle>
              </SheetHeader>
              <Nav className="p-2" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
