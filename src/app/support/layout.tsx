"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Home, LifeBuoy, Ticket } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/support/dashboard" },
  { label: "Tickets", icon: Ticket, href: "/support/tickets" },
];

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["support", "admin"]}>
      <div className="min-h-screen flex bg-muted/20">
        <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
          <div className="p-6 border-b flex items-center gap-2">
            <LifeBuoy className="w-5 h-5" />
            <h2 className="text-xl font-bold">Panel Soporte</h2>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition px-3 py-2 rounded-md hover:bg-muted"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
