"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Ticket,
  Users,
  Brain,
  Coins,
  LucideIcon,
} from "lucide-react";

import { useAdminStats } from "@/hooks/useAdminStats";
import AuthGuard from "@/components/auth/AuthGuard";
import { PageShell } from "@/components/layout/PageShell";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";

// ── Nav structure ───────────────────────────────────────────────────────────────

// Only numeric keys from AdminStats can be used as badge counters.
type NumericStatKey = "tickets" | "sellersPendientes" | "leads";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  key?: NumericStatKey;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { name: "Leads", href: "/admin/leads", icon: Users, key: "leads" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        name: "Sellers",
        href: "/admin/sellers",
        icon: Store,
        key: "sellersPendientes",
      },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Tickets", href: "/admin/tickets", icon: Ticket, key: "tickets" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [{ name: "AI Control", href: "/admin/ai", icon: Brain }],
  },
  {
    label: "FINANCE",
    items: [{ name: "AI Credits", href: "/admin/ai-credits", icon: Coins }],
  },
];

// ── Badge color logic ───────────────────────────────────────────────────────────
// tickets:           0 → none | 1-4 → muted | 5-9 → yellow | 10+ → red
// sellersPendientes: 0 → none | 1-2 → muted | 3+  → yellow
// leads:             0 → none | any → muted

function badgeClass(key: string | undefined, count: number): string {
  if (!key || count === 0) return "";

  if (key === "tickets") {
    if (count >= 10) return "bg-red-100 text-red-700";
    if (count >= 5) return "bg-yellow-100 text-yellow-700";
    return "bg-muted text-muted-foreground";
  }

  if (key === "sellersPendientes") {
    if (count >= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-muted text-muted-foreground";
  }

  return "bg-muted text-muted-foreground";
}

// ── Layout ──────────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const stats = useAdminStats();

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="bg-background flex min-h-screen">
        {/* ── SIDEBAR ── */}
        <aside className="border-border flex w-60 shrink-0 flex-col border-r bg-white">
          {/* Header */}
          <div className="border-border border-b px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <span className="text-primary-foreground text-xs font-bold">
                  A
                </span>
              </div>
              <div>
                <h2 className="text-sm leading-none font-semibold tracking-tight">
                  Atlas Control
                </h2>
                <p className="text-muted-foreground mt-0.5 text-[10px]">
                  Flowjuyu Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {/* Group label */}
                <p className="text-muted-foreground mb-1.5 px-2 text-[10px] font-semibold tracking-widest uppercase">
                  {group.label}
                </p>

                {/* Items */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                    const count: number = item.key
                      ? ((stats[item.key] as number) ?? 0)
                      : 0;
                    const badgeCls = badgeClass(item.key, count);

                    return (
                      <SidebarNavItem
                        key={item.name}
                        href={item.href}
                        label={item.name}
                        icon={item.icon}
                        isActive={isActive}
                        badge={
                          count > 0 ? (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${badgeCls}`}
                            >
                              {count > 99 ? "99+" : count}
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-border flex items-center justify-between border-t px-5 py-3">
            <span className="text-muted-foreground text-[10px]">v1.0 Demo</span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-green-400"
              title="Connected"
            />
          </div>
        </aside>

        {/* ── CONTENT AREA ── */}
        <PageShell>{children}</PageShell>
      </div>
    </AuthGuard>
  );
}
