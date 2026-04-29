"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Shield,
  Menu,
  LogOut,
  Layers2,
  RadioTower,
  Clapperboard,
  ChevronRight,
  Sparkles,
  LifeBuoy,
  Plus,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import SellerTopbar from "@/components/seller/SellerTopbar";
import { WhatsAppFloatingButton } from "@/components/seller/whatsapp/WhatsAppFloatingButton";
import { PageShell } from "@/components/layout/PageShell";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { fetchAiCreditsBalance } from "@/services/aiCredits";

const navItems = [
  { label: "Resumen", icon: LayoutDashboard, href: "/seller/dashboard" },
  { label: "Live", icon: RadioTower, href: "/seller/live" },
  { label: "Mi tienda", icon: Home, href: "/seller/my-business" },
  { label: "Productos", icon: Package, href: "/seller/products" },
  { label: "Pedidos", icon: ShoppingCart, href: "/seller/orders" },
  { label: "Colecciones", icon: Layers2, href: "/seller/collections" },
  { label: "Video Studio", icon: Clapperboard, href: "/seller/video-studio" },
  { label: "Créditos IA", icon: Sparkles, href: "/seller/ai-credits" },
  { label: "Métricas", icon: BarChart3, href: "/seller/metrics" },
  { label: "Cuenta", icon: User, href: "/seller/account" },
  { label: "Seguridad", icon: Shield, href: "/seller/security" },
];

const navDescriptions: Record<string, string> = {
  "/seller/dashboard":
    "Vista general de ventas, actividad y salud del negocio.",
  "/seller/live": "Transmisiones, productos activos y ritmo del live.",
  "/seller/my-business":
    "Identidad de tienda, presencia publica y optimizacion.",
  "/seller/products": "Catalogo, altas, edicion y control de tus piezas.",
  "/seller/orders":
    "Seguimiento operativo de pedidos y conversaciones de venta.",
  "/seller/collections": "Conjuntos visuales, stories y experiencias curadas.",
  "/seller/video-studio":
    "Genera videos promocionales para productos, lives y colecciones.",
  "/seller/ai-credits":
    "Compra y administra tus creditos para funciones de inteligencia artificial.",
  "/seller/metrics": "Lecturas de trafico, reputacion y conversion.",
  "/seller/account": "Configuracion principal, perfil y datos de cuenta.",
  "/seller/security": "Accesos, proteccion y confianza de la cuenta.",
};

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [businessName, setBusinessName] = useState("Mi negocio");
  const [storeHref, setStoreHref] = useState("/");
  const [sellerStatus, setSellerStatus] = useState<
    "activo" | "revision" | "inactivo" | "suspendido"
  >("activo");
  const [aiBalance, setAiBalance] = useState<number | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchAiCreditsBalance()
      .then(setAiBalance)
      .catch(() => {});
  }, []);

  // Cierra automáticamente el menú móvil cuando cambia la ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    apiGetVendedorPerfil()
      .then((profileRes) => {
        if (cancelled || !profileRes?.ok || !profileRes.perfil) return;
        const perfil = profileRes.perfil;
        setIsLive(Boolean(perfil.is_live));
        setBusinessName(perfil.nombre_comercio || "Mi negocio");
        setStoreHref(perfil.user_id ? `/store/${perfil.user_id}` : "/");
        setSellerStatus(
          perfil.estado_validacion === "aprobado"
            ? "activo"
            : perfil.estado_validacion === "pendiente"
              ? "revision"
              : "inactivo",
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const currentNavItem =
    [...navItems]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname.startsWith(item.href)) ?? navItems[0];

  const currentSectionDescription =
    navDescriptions[currentNavItem.href] ??
    "Gestion centralizada del espacio seller.";

  const renderSidebarNavigation = () => (
    <>
      <div className="border-b border-[var(--seller-line)] px-5 py-5">
        <div className="rounded-[26px] border border-[var(--seller-line-strong)] bg-[linear-gradient(135deg,#0f3d3a_0%,#14544f_52%,#1f6a61_100%)] p-4 text-white shadow-[0_22px_45px_-28px_rgba(15,61,58,0.45)]">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
            Flowjuyu Seller
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            {businessName}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
              {sellerStatus === "activo"
                ? "Operando"
                : sellerStatus === "revision"
                  ? "En revisión"
                  : "Ajustes pendientes"}
            </span>
            <Link
              href={storeHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 transition hover:text-white"
            >
              Ver tienda
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-[var(--seller-faint-text)] uppercase">
            Operación
          </p>
          {navItems.slice(0, 9).map(({ label, icon, href }) => (
            <SidebarNavItem
              key={href}
              href={href}
              label={
                href === "/seller/live"
                  ? isLive
                    ? "En vivo ahora"
                    : "En vivo"
                  : label
              }
              icon={icon}
              isActive={pathname.startsWith(href)}
              onClick={() => setOpen(false)}
              className={
                pathname.startsWith(href)
                  ? "!border-[var(--seller-accent)] !bg-[color:color-mix(in_srgb,var(--seller-accent)_9%,white)] !text-[var(--seller-accent)] shadow-[0_10px_24px_-20px_rgba(15,61,58,0.45)]"
                  : "!border-transparent !text-[var(--seller-text)] hover:!bg-[var(--seller-panel)] hover:!text-[var(--seller-ink)]"
              }
              labelClassName={
                href === "/seller/live" && isLive
                  ? "font-semibold text-red-600"
                  : undefined
              }
              iconClassName={
                href === "/seller/live" && isLive ? "text-red-600" : undefined
              }
              badge={
                href === "/seller/live" && isLive ? (
                  <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                ) : undefined
              }
            />
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-[var(--seller-faint-text)] uppercase">
            Cuenta
          </p>
          {navItems.slice(9).map(({ label, icon, href }) => (
            <SidebarNavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              isActive={pathname.startsWith(href)}
              onClick={() => setOpen(false)}
              className={
                pathname.startsWith(href)
                  ? "!border-[var(--seller-accent)] !bg-[color:color-mix(in_srgb,var(--seller-accent)_9%,white)] !text-[var(--seller-accent)] shadow-[0_10px_24px_-20px_rgba(15,61,58,0.45)]"
                  : "!border-transparent !text-[var(--seller-text)] hover:!bg-[var(--seller-panel)] hover:!text-[var(--seller-ink)]"
              }
            />
          ))}
        </div>
        <div className="rounded-[24px] border border-[var(--seller-line-strong)] bg-[var(--seller-panel)] p-4 shadow-[var(--seller-shadow-panel)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] text-[var(--seller-accent)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--seller-ink)]">
                Ahora en {currentNavItem.label}
              </p>
              <p className="text-xs leading-relaxed text-[var(--seller-muted)]">
                {currentSectionDescription}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="space-y-2 border-t border-[var(--seller-line)] p-3">
        <div className="rounded-2xl border border-[var(--seller-line-strong)] bg-[var(--seller-panel)] px-3 py-2.5 shadow-[var(--seller-shadow-panel)]">
          <p className="text-[9px] font-semibold tracking-[0.16em] text-[var(--seller-faint-text)] uppercase">
            Accesos utiles
          </p>
          <div className="mt-1.5 space-y-1">
            <Link
              href="/seller/products/new"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg border border-[var(--seller-line)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--seller-ink)] transition hover:border-[var(--seller-line-strong)] hover:bg-[var(--seller-panel)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[var(--seller-accent)]" />
                Nuevo producto
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--seller-soft-text)]" />
            </Link>
            <Link
              href="/seller/tickets"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg border border-[var(--seller-line)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--seller-ink)] transition hover:border-[var(--seller-line-strong)] hover:bg-[var(--seller-panel)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <LifeBuoy className="h-3.5 w-3.5 text-[var(--seller-accent)]" />
                Contactar soporte
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--seller-soft-text)]" />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
          <span className="text-[10px] text-[var(--seller-faint-text)]">
            Flowjuyu © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <AuthGuard allowedRoles={["seller", "admin"]}>
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="bg-background flex min-h-screen">
          <SheetContent
            side="left"
            className="w-80 border-r-0 bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_30%,#fbfaf7_100%)] p-0"
          >
            <div className="flex h-full flex-col">
              {renderSidebarNavigation()}
            </div>
          </SheetContent>

          <div className="relative z-0 flex min-h-screen min-w-0 flex-1 flex-col">
            {/* ================= MOBILE HEADER ================= */}
            <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[var(--seller-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,251,248,0.92))] px-4 py-4 md:hidden">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--seller-faint-text)] uppercase">
                  Flowjuyu Seller
                </p>
                <h2 className="text-base font-semibold text-[var(--seller-ink)]">
                  {businessName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {aiBalance !== null && (
                  <Link
                    href="/seller/ai-credits"
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--seller-line-strong)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] px-2.5 py-1.5 text-xs font-semibold text-[var(--seller-accent)] transition hover:bg-[color:color-mix(in_srgb,var(--seller-accent)_12%,white)]"
                    title="Créditos IA"
                  >
                    <Sparkles className="h-3 w-3" />
                    {aiBalance} cr
                  </Link>
                )}
                <SheetTrigger asChild>
                  <button className="rounded-xl border border-[var(--seller-line-strong)] bg-white/80 p-2 text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
              </div>
            </div>

            {/* ================= TOPBAR DESKTOP ================= */}
            <div className="fixed inset-x-0 top-0 z-30 hidden md:block">
              <SellerTopbar
                businessName={businessName}
                status={sellerStatus}
                storeHref={storeHref}
                onOpenSidebar={() => setOpen(true)}
                currentSection={currentNavItem.label}
                currentDescription={currentSectionDescription}
              />
            </div>

            {/* ================= MAIN ================= */}
            <div className="pt-[81px] md:pt-[92px]">
              {/^\/seller\/collections\/[^/]+\/canvas/.test(pathname) ? (
                <div className="p-3 md:p-4">{children}</div>
              ) : (
                <PageShell>{children}</PageShell>
              )}
            </div>

            <WhatsAppFloatingButton />
          </div>
        </div>
      </Sheet>
    </AuthGuard>
  );
}
