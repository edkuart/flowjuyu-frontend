// src/components/layout/Header.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Globe,
  LogOut,
  LayoutDashboard,
  Store,
  ChevronDown,
  X,
  Package,
  Ticket,
  Users,
  Brain,
  ShieldCheck,
  ShoppingBag,
  Settings,
  Heart,
  Bell,
  MapPin,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar/SidebarTrigger";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/ui/SearchBar";
import { useAdminStats } from "@/hooks/useAdminStats";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";
import { useFavorites } from "@/hooks/useFavorites";
import { timeAgo } from "@/lib/adminHelpers";

// ── Stat tile color helpers ─────────────────────────────────────────────────

function ticketStyle(n: number) {
  if (n >= 10) return { tile: "bg-red-50",    value: "text-red-700",    label: "text-red-400"    }
  if (n >= 5)  return { tile: "bg-amber-50",  value: "text-amber-700",  label: "text-amber-400"  }
  if (n > 0)   return { tile: "bg-zinc-50",   value: "text-zinc-700",   label: "text-zinc-400"   }
  return              { tile: "bg-zinc-50",   value: "text-zinc-400",   label: "text-zinc-300"   }
}

function sellerStyle(n: number) {
  if (n >= 3) return { tile: "bg-amber-50",  value: "text-amber-700",  label: "text-amber-400"  }
  if (n > 0)  return { tile: "bg-zinc-50",   value: "text-zinc-700",   label: "text-zinc-400"   }
  return             { tile: "bg-zinc-50",   value: "text-zinc-400",   label: "text-zinc-300"   }
}

function leadStyle(n: number) {
  if (n > 0) return { tile: "bg-blue-50",   value: "text-blue-700",   label: "text-blue-400"   }
  return            { tile: "bg-zinc-50",   value: "text-zinc-400",   label: "text-zinc-300"   }
}

// ── Buyer dropdown ──────────────────────────────────────────────────────────

function BuyerDropdown({
  user,
  onClose,
  onLogout,
}: {
  user: { name?: string; email?: string };
  onClose: () => void;
  onLogout: () => void;
}) {
  const { unread, notifications, markAsRead } = useNotifications();
  const { favorites } = useFavorites();
  const favCount = favorites.length;
  const recentActivity = notifications.slice(0, 2);

  return (
    <div className="w-60 bg-white rounded-xl shadow-2xl border border-neutral-100 py-1.5 text-neutral-800 text-sm">

      {/* Identity header */}
      <div className="px-4 pb-2 mb-1 border-b border-neutral-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-sm font-bold text-orange-600 uppercase">
          {user.name?.charAt(0) ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-none truncate">{user.name ?? "Usuario"}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Flowjuyu Buyer</p>
        </div>
      </div>

      {/* ACTIVIDAD */}
      <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Actividad
      </p>
      <Link href="/buyer/orders" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Package className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="flex-1">Mis pedidos</span>
      </Link>
      <Link href="/buyer/favorites" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Heart className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="flex-1">Mis favoritos</span>
        {favCount > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 leading-tight tabular-nums">
            {favCount}
          </span>
        )}
      </Link>
      <Link href="/buyer/notifications" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Bell className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="flex-1">Notificaciones</span>
        {unread > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 leading-tight tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>

      {/* MI CUENTA */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Mi cuenta
      </p>
      <Link href="/buyer/profile" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Mi perfil
      </Link>
      <Link href="/buyer/addresses" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Direcciones
      </Link>

      {/* ACTIVIDAD RECIENTE */}
      <div className="my-1.5 border-t border-neutral-100" />
      <div className="px-4 pt-1 pb-1 flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Actividad reciente
        </p>
        {recentActivity.length > 0 && (
          <Link href="/buyer/notifications" onClick={onClose}
            className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors">
            Ver todas
          </Link>
        )}
      </div>

      {recentActivity.length === 0 ? (
        <p className="px-4 py-2 text-xs text-neutral-400 italic">
          Aún no tienes actividad
        </p>
      ) : (
        <div className="px-2 pb-1 space-y-0.5">
          {recentActivity.map((n) => {
            const inner = (
              <div
                className={`px-2 py-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer ${
                  !n.is_read ? "bg-orange-50/60" : ""
                }`}
                onClick={() => {
                  markAsRead(n.id);
                  onClose();
                }}
              >
                <p className="text-xs font-semibold text-neutral-800 leading-snug truncate">
                  {n.title}
                </p>
                <p className="text-[11px] text-neutral-500 leading-snug truncate mt-0.5">
                  {n.message}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {timeAgo(n.created_at)}
                </p>
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link}>
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}

      {/* Logout */}
      <div className="mt-1.5 border-t border-neutral-100" />
      <button
        onClick={() => { onClose(); onLogout(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-600 hover:bg-neutral-50 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  );
}

// ── Admin dropdown (isolated so useAdminStats only runs for admins) ─────────

function AdminDropdown({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const stats = useAdminStats()

  const ts = ticketStyle(stats.tickets)
  const ss = sellerStyle(stats.sellersPendientes)
  const ls = leadStyle(stats.leads)

  return (
    <div className="w-64 bg-white rounded-xl shadow-2xl border border-neutral-100 py-2 text-neutral-800 text-sm">

      {/* Header pill */}
      <div className="px-4 pb-2 mb-1 border-b border-neutral-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-bold">A</span>
        </div>
        <div>
          <p className="text-xs font-semibold leading-none">Atlas Control</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Flowjuyu Admin</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-3 pt-1 pb-2">
        <p className="px-1 pb-1.5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Quick Stats
        </p>
        <div className="grid grid-cols-3 gap-1.5">

          <Link href="/admin/tickets" onClick={onClose}
            className={`${ts.tile} rounded-lg px-2 py-2 flex flex-col gap-0.5 hover:brightness-95 transition-all`}>
            <span className={`text-base font-bold leading-none tabular-nums ${ts.value}`}>
              {stats.tickets > 99 ? "99+" : stats.tickets}
            </span>
            <span className={`text-[10px] font-medium leading-none ${ts.label}`}>Tickets</span>
          </Link>

          <Link href="/admin/sellers" onClick={onClose}
            className={`${ss.tile} rounded-lg px-2 py-2 flex flex-col gap-0.5 hover:brightness-95 transition-all`}>
            <span className={`text-base font-bold leading-none tabular-nums ${ss.value}`}>
              {stats.sellersPendientes > 99 ? "99+" : stats.sellersPendientes}
            </span>
            <span className={`text-[10px] font-medium leading-none ${ss.label}`}>Sellers</span>
          </Link>

          <Link href="/admin/leads" onClick={onClose}
            className={`${ls.tile} rounded-lg px-2 py-2 flex flex-col gap-0.5 hover:brightness-95 transition-all`}>
            <span className={`text-base font-bold leading-none tabular-nums ${ls.value}`}>
              {stats.leads > 99 ? "99+" : stats.leads}
            </span>
            <span className={`text-[10px] font-medium leading-none ${ls.label}`}>Leads</span>
          </Link>

        </div>
      </div>

      {/* MAIN */}
      <div className="border-t border-neutral-100 pt-1">
        <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Main
        </p>
        <Link href="/admin" onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
          <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          Dashboard
        </Link>
        <Link href="/admin/leads" onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
          <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          Leads
        </Link>
      </div>

      {/* OPERATIONS */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Operations
      </p>
      <Link href="/admin/sellers" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Store className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Sellers
      </Link>
      <Link href="/admin/products" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Package className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Products
      </Link>
      <Link href="/admin/tickets" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Ticket className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Tickets
      </Link>

      {/* INTELLIGENCE */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Intelligence
      </p>
      <Link href="/admin/ai" onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
        <Brain className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        AI Control
      </Link>

      {/* Logout */}
      <div className="mt-1.5 border-t border-neutral-100" />
      <button
        onClick={() => { onClose(); onLogout(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-600 hover:bg-neutral-50 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  )
}

// ── Main Header ─────────────────────────────────────────────────────────────

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();

  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const helpRef = useRef<HTMLLIElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  const isSellerPanel = pathname.startsWith("/seller");

  const normalizedRole = useMemo(() => {
    if (!user) return null;
    // user.role is always canonical after Phase 1 (buyer | seller | admin | support)
    return user.role ?? null;
  }, [user]);

  const isBuyer  = normalizedRole === "buyer";
  const isSeller = normalizedRole === "seller";
  const isAdmin  = normalizedRole === "admin";

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node))
        setHelpOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setOpenAccount(false);
      if (createRef.current && !createRef.current.contains(e.target as Node))
        setOpenCreate(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false);
        setOpenAccount(false);
        setOpenCreate(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (isSellerPanel) return null;

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0f2e22] to-[#184c37] text-white">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-2 md:gap-4">

          {/* Mobile: sidebar trigger */}
          <div className="md:hidden shrink-0">
            <SidebarTrigger className="text-white" />
          </div>

          {/* Logo */}
          <Link
            href="/"
            aria-label="Flowjuyu — Inicio"
            className="shrink-0 flex items-center"
          >
            {/* Mobile — bare isotipo, no container box */}
            <Image
              src="/flowjuyu-isotipo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="md:hidden object-contain"
            />

            {/* Desktop wordmark */}
            <div className="hidden md:flex items-center rounded-lg bg-[#f6f2ea] px-2 py-1 ring-1 ring-white/20 shadow-md">
              <Image
                src="/flowjuyu-logo-completo.png"
                alt=""
                width={170}
                height={52}
                priority
                className="object-contain h-10 w-auto"
              />
            </div>
          </Link>

          {/* Search — desktop center */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Actions — right side */}
          <div className="ml-auto flex items-center gap-2 md:gap-2">

            {/* Search toggle — mobile only */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Buscar"}
              aria-expanded={mobileSearchOpen}
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all duration-150"
            >
              {mobileSearchOpen
                ? <X className="w-5 h-5" />
                : <Search className="w-5 h-5" />
              }
            </button>

            {/* Account */}
            {user ? (
              <div className="relative" ref={accountRef}>
                {/* Mobile — icon-only circle */}
                <button
                  onClick={() => setOpenAccount((v) => !v)}
                  aria-expanded={openAccount}
                  aria-haspopup="true"
                  aria-label={isAdmin ? "Admin" : isSeller ? "Mi panel" : "Mi cuenta"}
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {isAdmin
                    ? <ShieldCheck className="w-5 h-5" />
                    : <User className="w-5 h-5" />
                  }
                </button>

                {/* Desktop — text pill */}
                <button
                  onClick={() => setOpenAccount((v) => !v)}
                  aria-expanded={openAccount}
                  aria-haspopup="true"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {isAdmin
                    ? <ShieldCheck className="w-4 h-4 shrink-0" />
                    : <User className="w-4 h-4 shrink-0" />
                  }
                  {isAdmin ? "Admin" : isSeller ? "Mi panel" : "Mi cuenta"}
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      openAccount ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openAccount && (
                  <div className="absolute right-0 top-full pt-2 z-50">

                    {/* ── Admin dropdown ── */}
                    {isAdmin && (
                      <AdminDropdown
                        onClose={() => setOpenAccount(false)}
                        onLogout={logout}
                      />
                    )}

                    {/* ── Buyer dropdown ── */}
                    {isBuyer && (
                      <BuyerDropdown
                        user={user}
                        onClose={() => setOpenAccount(false)}
                        onLogout={logout}
                      />
                    )}

                    {/* ── Seller dropdown ── */}
                    {!isAdmin && isSeller && (
                      <div className="w-60 bg-white rounded-xl shadow-2xl border border-neutral-100 py-1.5 text-neutral-800 text-sm">

                        {/* Header pill */}
                        <div className="px-4 pb-2 mb-1 border-b border-neutral-100 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#0f2e22] flex items-center justify-center shrink-0">
                            <Store className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold leading-none">Panel vendedor</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Flowjuyu Seller</p>
                          </div>
                        </div>

                        {/* ACTIVIDAD */}
                        <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Actividad
                        </p>
                        <Link href="/seller/dashboard" onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                          <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Métricas
                        </Link>
                        <Link href="/seller/orders" onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                          <ShoppingBag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Pedidos
                        </Link>
                        <Link href="/seller/products" onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                          <Package className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Productos
                        </Link>

                        {/* MI NEGOCIO */}
                        <div className="my-1.5 border-t border-neutral-100" />
                        <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Mi negocio
                        </p>
                        <Link href="/seller/my-business" onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                          <Store className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Mi tienda
                        </Link>
                        <Link href="/seller/account" onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                          <Settings className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Cuenta y seguridad
                        </Link>

                        <div className="my-1 border-t border-neutral-100" />

                        <button
                          onClick={() => { setOpenAccount(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-600 hover:bg-neutral-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Cerrar sesión
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop: inline "Iniciar sesión" shortcut */}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-2 py-2 text-sm hover:text-amber-300 transition-colors"
                >
                  Iniciar sesión
                </Link>

                {/* Account dropdown — icon-only on mobile, text pill on desktop */}
                <div className="relative" ref={createRef}>
                  {/* Mobile trigger */}
                  <button
                    onClick={() => setOpenCreate((v) => !v)}
                    aria-expanded={openCreate}
                    aria-haspopup="true"
                    aria-label="Cuenta"
                    className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* Desktop trigger */}
                  <button
                    onClick={() => setOpenCreate((v) => !v)}
                    aria-expanded={openCreate}
                    aria-haspopup="true"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    Crear cuenta
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        openCreate ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openCreate && (
                    <div className="absolute right-0 top-full pt-2 w-56 z-50">
                      <div className="bg-white rounded-xl shadow-2xl border border-neutral-100 py-1.5 text-neutral-800 text-sm">

                        {/* Login — visible in dropdown on mobile (desktop has inline link) */}
                        <Link
                          href="/login"
                          onClick={() => setOpenCreate(false)}
                          className="sm:hidden flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Iniciar sesión
                        </Link>
                        <div className="sm:hidden my-1 border-t border-neutral-100" />

                        <p className="px-4 pt-2 pb-1.5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Crear cuenta
                        </p>
                        <Link
                          href="/register/buyer"
                          onClick={() => setOpenCreate(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Comprador
                        </Link>
                        <Link
                          href="/register/seller"
                          onClick={() => setOpenCreate(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          Vender en Flowjuyu
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notification bell — buyers only, desktop only */}
            {isBuyer && <div className="hidden sm:block"><NotificationBell /></div>}

            {/* Cart */}
            <Link
              href="/carrito"
              aria-label={count > 0 ? `Carrito, ${count} artículos` : "Carrito"}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all duration-150"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-medium px-1 leading-none"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* Language */}
            <button
              aria-label="Cambiar idioma"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 text-sm hover:bg-white/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              ES
            </button>

          </div>
        </div>

        {/* Mobile search expansion */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3 border-t border-white/10 pt-3">
            <SearchBar />
          </div>
        )}
      </div>

      {/* ── Bottom nav ───────────────────────────────────────── */}
      <nav
        aria-label="Navegación secundaria"
        className="bg-[#081a13] border-t border-white/10 text-white/80"
      >
        <div className="max-w-screen-xl mx-auto h-10 px-4 md:px-8 flex items-center justify-between text-sm">

          <ul className="flex items-center gap-6" role="list">
            <li>
              <Link
                href="/new-arrivals"
                className="hover:text-amber-300 transition-colors"
              >
                Lo + nuevo
              </Link>
            </li>

            <li>
              <Link
                href="/sell"
                className="hover:text-amber-300 transition-colors"
              >
                Vende en Flowjuyu
              </Link>
            </li>

            <li ref={helpRef} className="relative">
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                aria-expanded={helpOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors"
              >
                Ayuda
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    helpOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {helpOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="w-52 bg-white rounded-xl shadow-2xl border border-neutral-100 py-1.5 text-neutral-800 text-sm">
                    <Link
                      href="/ayuda/faq"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      Preguntas frecuentes
                    </Link>
                    <Link
                      href="/ayuda/contacto"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      Contáctanos
                    </Link>
                    <Link
                      href="/ayuda/devoluciones"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      Devoluciones
                    </Link>
                  </div>
                </div>
              )}
            </li>
          </ul>

          <span className="hidden md:block text-xs text-white/50 tracking-wide">
            100% chapines
          </span>

        </div>
      </nav>
    </header>
  );
}
