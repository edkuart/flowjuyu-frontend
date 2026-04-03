// src/components/layout/Header.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import { LANGUAGES } from "@/i18n/languages";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";

// ── Stat tile color helpers ─────────────────────────────────────────────────

function ticketStyle(n: number) {
  if (n >= 10)
    return { tile: "bg-red-50", value: "text-red-700", label: "text-red-400" };
  if (n >= 5)
    return {
      tile: "bg-amber-50",
      value: "text-amber-700",
      label: "text-amber-400",
    };
  if (n > 0)
    return {
      tile: "bg-zinc-50",
      value: "text-zinc-700",
      label: "text-zinc-400",
    };
  return { tile: "bg-zinc-50", value: "text-zinc-400", label: "text-zinc-300" };
}

function sellerStyle(n: number) {
  if (n >= 3)
    return {
      tile: "bg-amber-50",
      value: "text-amber-700",
      label: "text-amber-400",
    };
  if (n > 0)
    return {
      tile: "bg-zinc-50",
      value: "text-zinc-700",
      label: "text-zinc-400",
    };
  return { tile: "bg-zinc-50", value: "text-zinc-400", label: "text-zinc-300" };
}

function leadStyle(n: number) {
  if (n > 0)
    return {
      tile: "bg-blue-50",
      value: "text-blue-700",
      label: "text-blue-400",
    };
  return { tile: "bg-zinc-50", value: "text-zinc-400", label: "text-zinc-300" };
}

// ── Language Switcher ───────────────────────────────────────────────────────

function LanguageSwitcher({ className }: { className: string }) {
  const { language, setLanguage, meta, dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={tr("language.label")}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-1.5 text-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        <Globe className="h-4 w-4" />
        {meta.shortCode}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 z-50 pt-2"
          role="listbox"
          aria-label={tr("language.label")}
        >
          <div className="w-44 rounded-xl border border-neutral-100 bg-white py-1.5 text-sm text-neutral-800 shadow-2xl">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLanguage(lang);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-neutral-50 ${
                    active ? "font-semibold text-[#0f2e22]" : "text-neutral-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? "bg-[#0f2e22]" : "bg-transparent"
                    }`}
                  />
                  {LANGUAGES[lang].nativeLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const { unread, notifications, markAsRead } = useNotifications();
  const { favorites } = useFavorites();
  const favCount = favorites.length;
  const recentActivity = notifications.slice(0, 2);

  return (
    <div className="w-60 rounded-xl border border-neutral-100 bg-white py-1.5 text-sm text-neutral-800 shadow-2xl">
      {/* Identity header */}
      <div className="mb-1 flex items-center gap-2.5 border-b border-neutral-100 px-4 pb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 uppercase">
          {user.name?.charAt(0) ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs leading-none font-semibold">
            {user.name ?? "Usuario"}
          </p>
          <p className="mt-0.5 text-[10px] text-neutral-400">Flowjuyu Buyer</p>
        </div>
      </div>

      {/* ACTIVIDAD */}
      <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        {tr("nav.activity")}
      </p>
      <Link
        href="/buyer/orders"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Package className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="flex-1">{tr("nav.myOrders")}</span>
      </Link>
      <Link
        href="/buyer/favorites"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Heart className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="flex-1">{tr("nav.myFavorites")}</span>
        {favCount > 0 && (
          <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] leading-tight font-semibold text-orange-600 tabular-nums">
            {favCount}
          </span>
        )}
      </Link>
      <Link
        href="/buyer/notifications"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Bell className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="flex-1">{tr("nav.notifications")}</span>
        {unread > 0 && (
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] leading-tight font-semibold text-red-600 tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>

      {/* MI CUENTA */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        {tr("nav.account")}
      </p>
      <Link
        href="/buyer/profile"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <User className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        {tr("nav.myProfile")}
      </Link>
      <Link
        href="/buyer/addresses"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        {tr("nav.addresses")}
      </Link>

      {/* ACTIVIDAD RECIENTE */}
      <div className="my-1.5 border-t border-neutral-100" />
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          {tr("nav.recentActivity")}
        </p>
        {recentActivity.length > 0 && (
          <Link
            href="/buyer/notifications"
            onClick={onClose}
            className="text-[10px] text-neutral-400 transition-colors hover:text-neutral-600"
          >
            {tr("nav.seeAll")}
          </Link>
        )}
      </div>

      {recentActivity.length === 0 ? (
        <p className="px-4 py-2 text-xs text-neutral-400 italic">
          {tr("nav.noActivity")}
        </p>
      ) : (
        <div className="space-y-0.5 px-2 pb-1">
          {recentActivity.map((n) => {
            const inner = (
              <div
                className={`cursor-pointer rounded-lg px-2 py-2 transition-colors hover:bg-neutral-50 ${
                  !n.is_read ? "bg-orange-50/60" : ""
                }`}
                onClick={() => {
                  markAsRead(n.id);
                  onClose();
                }}
              >
                <p className="truncate text-xs leading-snug font-semibold text-neutral-800">
                  {n.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-snug text-neutral-500">
                  {n.message}
                </p>
                <p className="mt-1 text-[10px] text-neutral-400">
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
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-red-600 transition-colors hover:bg-neutral-50"
      >
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        {tr("nav.logout")}
      </button>
    </div>
  );
}

// ── Admin dropdown (isolated so useAdminStats only runs for admins) ─────────

function AdminDropdown({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const stats = useAdminStats();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const ts = ticketStyle(stats.tickets);
  const ss = sellerStyle(stats.sellersPendientes);
  const ls = leadStyle(stats.leads);

  return (
    <div className="w-64 rounded-xl border border-neutral-100 bg-white py-2 text-sm text-neutral-800 shadow-2xl">
      {/* Header pill */}
      <div className="mb-1 flex items-center gap-2 border-b border-neutral-100 px-4 pb-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-900">
          <span className="text-[10px] font-bold text-white">A</span>
        </div>
        <div>
          <p className="text-xs leading-none font-semibold">Atlas Control</p>
          <p className="mt-0.5 text-[10px] text-neutral-400">Flowjuyu Admin</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-3 pt-1 pb-2">
        <p className="px-1 pb-1.5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Quick Stats
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <Link
            href="/admin/tickets"
            onClick={onClose}
            className={`${ts.tile} flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-all hover:brightness-95`}
          >
            <span
              className={`text-base leading-none font-bold tabular-nums ${ts.value}`}
            >
              {stats.tickets > 99 ? "99+" : stats.tickets}
            </span>
            <span
              className={`text-[10px] leading-none font-medium ${ts.label}`}
            >
              Tickets
            </span>
          </Link>

          <Link
            href="/admin/sellers"
            onClick={onClose}
            className={`${ss.tile} flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-all hover:brightness-95`}
          >
            <span
              className={`text-base leading-none font-bold tabular-nums ${ss.value}`}
            >
              {stats.sellersPendientes > 99 ? "99+" : stats.sellersPendientes}
            </span>
            <span
              className={`text-[10px] leading-none font-medium ${ss.label}`}
            >
              Sellers
            </span>
          </Link>

          <Link
            href="/admin/leads"
            onClick={onClose}
            className={`${ls.tile} flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-all hover:brightness-95`}
          >
            <span
              className={`text-base leading-none font-bold tabular-nums ${ls.value}`}
            >
              {stats.leads > 99 ? "99+" : stats.leads}
            </span>
            <span
              className={`text-[10px] leading-none font-medium ${ls.label}`}
            >
              Leads
            </span>
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <div className="border-t border-neutral-100 pt-1">
        <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Main
        </p>
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
        >
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          Dashboard
        </Link>
        <Link
          href="/admin/leads"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
        >
          <Users className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          Leads
        </Link>
      </div>

      {/* OPERATIONS */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Operations
      </p>
      <Link
        href="/admin/sellers"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Store className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        Sellers
      </Link>
      <Link
        href="/admin/products"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Package className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        Products
      </Link>
      <Link
        href="/admin/tickets"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Ticket className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        Tickets
      </Link>

      {/* INTELLIGENCE */}
      <div className="my-1.5 border-t border-neutral-100" />
      <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
        Intelligence
      </p>
      <Link
        href="/admin/ai"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
      >
        <Brain className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        AI Control
      </Link>

      {/* Logout */}
      <div className="mt-1.5 border-t border-neutral-100" />
      <button
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-red-600 transition-colors hover:bg-neutral-50"
      >
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        {tr("nav.logout")}
      </button>
    </div>
  );
}

// ── Main Header ─────────────────────────────────────────────────────────────

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const { dictionary } = useLanguage();

  // Safe fallback: use static es dictionary until async load completes.
  // This prevents any flash of untranslated text on the initial render.
  const tr = createT(dictionary ?? esDictionary);

  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const helpRef = useRef<HTMLLIElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isSellerPanel = pathname.startsWith("/seller");
  const normalizedRole = user?.role ?? null;

  const isBuyer = normalizedRole === "buyer";
  const isSeller = normalizedRole === "seller";
  const isAdmin = normalizedRole === "admin";

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node))
        setHelpOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setOpenAccount(false);
      if (createRef.current && !createRef.current.contains(e.target as Node))
        setOpenCreate(false);
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setMobileSearchOpen(false);
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

  useEffect(() => {
    setHelpOpen(false);
    setOpenAccount(false);
    setOpenCreate(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  if (isSellerPanel) return null;

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" ref={headerRef}>
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0f2e22] to-[#184c37] text-white">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-2 px-4 md:h-16 md:gap-4 md:px-8">
          {/* Mobile: sidebar trigger */}
          <div className="shrink-0 md:hidden">
            <SidebarTrigger className="text-white" />
          </div>

          {/* Logo */}
          <Link
            href="/"
            aria-label="Flowjuyu — Inicio"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/flowjuyu-isotipo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="object-contain md:hidden"
            />
            <div className="hidden items-center rounded-lg bg-[#f6f2ea] px-2 py-1 shadow-md ring-1 ring-white/20 md:flex">
              <Image
                src="/flowjuyu-logo-completo.png"
                alt=""
                width={170}
                height={52}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Search — desktop center */}
          <div className="mx-4 hidden max-w-2xl flex-1 sm:flex">
            <SearchBar />
          </div>

          {/* Actions — right side */}
          <div className="ml-auto flex items-center gap-2 md:gap-2">
            {/* Search toggle — mobile only */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(false);
                  setOpenAccount(false);
                  setOpenCreate(false);
                  setMobileSearchOpen((v) => !v);
                }}
                aria-label={
                  mobileSearchOpen ? tr("nav.closeSearch") : tr("common.search")
                }
                aria-expanded={mobileSearchOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:bg-white/10 active:scale-95"
              >
                {mobileSearchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Account */}
            {user ? (
              <div className="relative" ref={accountRef}>
                {/* Mobile — icon-only circle */}
                <button
                  type="button"
                  onClick={() => {
                    setHelpOpen(false);
                    setOpenCreate(false);
                    setMobileSearchOpen(false);
                    setOpenAccount((v) => !v);
                  }}
                  aria-expanded={openAccount}
                  aria-haspopup="true"
                  aria-label={
                    isAdmin
                      ? "Admin"
                      : isSeller
                        ? tr("nav.sellerPanel")
                        : tr("nav.account")
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 active:scale-95 md:hidden"
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                {/* Desktop — text pill */}
                <button
                  type="button"
                  onClick={() => {
                    setHelpOpen(false);
                    setOpenCreate(false);
                    setMobileSearchOpen(false);
                    setOpenAccount((v) => !v);
                  }}
                  aria-expanded={openAccount}
                  aria-haspopup="true"
                  className="hidden items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 md:inline-flex"
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                  ) : (
                    <User className="h-4 w-4 shrink-0" />
                  )}
                  {isAdmin
                    ? "Admin"
                    : isSeller
                      ? tr("nav.sellerPanel")
                      : tr("nav.account")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openAccount ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openAccount && (
                  <div className="absolute top-full right-0 z-50 pt-2">
                    {isAdmin && (
                      <AdminDropdown
                        onClose={() => setOpenAccount(false)}
                        onLogout={logout}
                      />
                    )}

                    {isBuyer && (
                      <BuyerDropdown
                        user={user}
                        onClose={() => setOpenAccount(false)}
                        onLogout={logout}
                      />
                    )}

                    {!isAdmin && isSeller && (
                      <div className="w-60 rounded-xl border border-neutral-100 bg-white py-1.5 text-sm text-neutral-800 shadow-2xl">
                        <div className="mb-1 flex items-center gap-2 border-b border-neutral-100 px-4 pb-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0f2e22]">
                            <Store className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs leading-none font-semibold">
                              {tr("nav.sellerPanel")}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              Flowjuyu Seller
                            </p>
                          </div>
                        </div>

                        <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          {tr("nav.activity")}
                        </p>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {tr("nav.metrics")}
                        </Link>
                        <Link
                          href="/seller/orders"
                          onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {tr("nav.orders")}
                        </Link>
                        <Link
                          href="/seller/products"
                          onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <Package className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {tr("nav.products")}
                        </Link>

                        <div className="my-1.5 border-t border-neutral-100" />
                        <p className="px-4 pb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          {tr("nav.myBusiness")}
                        </p>
                        <Link
                          href="/seller/my-business"
                          onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <Store className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {tr("nav.myStore")}
                        </Link>
                        <Link
                          href="/seller/account"
                          onClick={() => setOpenAccount(false)}
                          className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <Settings className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {tr("nav.accountSecurity")}
                        </Link>

                        <div className="my-1 border-t border-neutral-100" />
                        <button
                          onClick={() => {
                            setOpenAccount(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-red-600 transition-colors hover:bg-neutral-50"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          {tr("nav.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden items-center px-2 py-2 text-sm transition-colors hover:text-amber-300 sm:inline-flex"
                >
                  {tr("nav.login")}
                </Link>

                <div className="relative" ref={createRef}>
                  {/* Mobile trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setHelpOpen(false);
                      setOpenAccount(false);
                      setMobileSearchOpen(false);
                      setOpenCreate((v) => !v);
                    }}
                    aria-expanded={openCreate}
                    aria-haspopup="true"
                    aria-label={tr("nav.account")}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 active:scale-95 sm:hidden"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {/* Desktop trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setHelpOpen(false);
                      setOpenAccount(false);
                      setMobileSearchOpen(false);
                      setOpenCreate((v) => !v);
                    }}
                    aria-expanded={openCreate}
                    aria-haspopup="true"
                    className="hidden items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 sm:inline-flex"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    {tr("nav.createAccount")}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        openCreate ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openCreate && (
                    <div className="absolute top-full right-0 z-50 w-56 pt-2">
                      <div className="rounded-xl border border-neutral-100 bg-white py-1.5 text-sm text-neutral-800 shadow-2xl">
                        <Link
                          href="/login"
                          onClick={() => setOpenCreate(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-neutral-50 sm:hidden"
                        >
                          <User className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {tr("nav.login")}
                        </Link>
                        <div className="my-1 border-t border-neutral-100 sm:hidden" />

                        <p className="px-4 pt-2 pb-1.5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          {tr("nav.createAccount")}
                        </p>
                        <Link
                          href="/register/buyer"
                          onClick={() => setOpenCreate(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-neutral-50"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {tr("nav.buyer")}
                        </Link>
                        <Link
                          href="/register/seller"
                          onClick={() => setOpenCreate(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-neutral-50"
                        >
                          <Store className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          {tr("nav.sellOnRegister")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notification bell — buyers only, desktop only */}
            {isBuyer && (
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
            )}

            {/* Cart */}
            <Link
              href="/carrito"
              aria-label={
                count > 0 ? `${tr("nav.cart")}, ${count}` : tr("nav.cart")
              }
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:bg-white/10 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] leading-none font-medium text-white"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* Language switcher */}
            <LanguageSwitcher className="sm:hidden" />
            <LanguageSwitcher className="hidden sm:block" />
          </div>
        </div>

        {/* Mobile search expansion */}
        {mobileSearchOpen && (
          <div className="border-t border-white/10 px-4 pt-3 pb-3 sm:hidden">
            <SearchBar />
          </div>
        )}
      </div>

      {/* ── Bottom nav ───────────────────────────────────────── */}
      <nav
        aria-label="Navegación secundaria"
        className="border-t border-white/10 bg-[#081a13] text-white/80"
      >
        <div className="mx-auto flex h-10 max-w-screen-xl items-center justify-between px-4 text-sm md:px-8">
          <ul className="flex items-center gap-6" role="list">
            <li>
              <Link
                href="/new-arrivals"
                className="transition-colors hover:text-amber-300"
              >
                {tr("nav.newArrivals")}
              </Link>
            </li>

            <li>
              <Link
                href="/sell"
                className="transition-colors hover:text-amber-300"
              >
                {tr("nav.sellOn")}
              </Link>
            </li>

            <li ref={helpRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenAccount(false);
                  setOpenCreate(false);
                  setMobileSearchOpen(false);
                  setHelpOpen((v) => !v);
                }}
                aria-expanded={helpOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1 transition-colors hover:text-amber-300"
              >
                {tr("nav.help")}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    helpOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {helpOpen && (
                <div className="absolute top-full left-0 z-50 pt-2">
                  <div className="w-52 rounded-xl border border-neutral-100 bg-white py-1.5 text-sm text-neutral-800 shadow-2xl">
                    <Link
                      href="/ayuda/faq"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-neutral-50"
                    >
                      {tr("nav.faq")}
                    </Link>
                    <Link
                      href="/ayuda/contacto"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-neutral-50"
                    >
                      {tr("nav.contactUs")}
                    </Link>
                    <Link
                      href="/ayuda/devoluciones"
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-neutral-50"
                    >
                      {tr("nav.returns")}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          </ul>

          <span className="hidden text-xs tracking-wide text-white/50 md:block">
            100% chapines
          </span>
        </div>
      </nav>
    </header>
  );
}
