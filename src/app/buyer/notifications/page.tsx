"use client";

import Link from "next/link";
import { Bell, CheckCheck, Package, Star, Tag, Info } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days} d`;
  return new Date(dateStr).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "short",
    year: days > 365 ? "numeric" : undefined,
  });
}

// ─── Type → icon mapping ──────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const base = "w-4 h-4";
  if (type === "order")   return <Package className={cn(base, "text-[#0d2d20]")} />;
  if (type === "review")  return <Star    className={cn(base, "text-amber-500")} />;
  if (type === "promo")   return <Tag     className={cn(base, "text-orange-500")} />;
  return <Info className={cn(base, "text-gray-400")} />;
}

function iconBg(type: string): string {
  if (type === "order")  return "bg-[#0d2d20]/8";
  if (type === "review") return "bg-amber-50";
  if (type === "promo")  return "bg-orange-50";
  return "bg-gray-50";
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function NotifRow({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const row = (
    <div
      className={cn(
        "flex gap-4 px-5 py-4 transition-colors cursor-pointer",
        notif.is_read ? "hover:bg-gray-50" : "bg-orange-50/50 hover:bg-orange-50"
      )}
      onClick={() => { if (!notif.is_read) onRead(notif.id); }}
    >
      {/* Icon bubble */}
      <div className={cn("mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center", iconBg(notif.type))}>
        <NotifIcon type={notif.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-snug", !notif.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[11px] text-gray-400 mt-1.5 uppercase tracking-wide">
          {relativeTime(notif.created_at)}
        </p>
      </div>
    </div>
  );

  if (notif.link) {
    return <Link href={notif.link} className="block">{row}</Link>;
  }
  return <div>{row}</div>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-2.5 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuyerNotificationsPage() {
  const { notifications, unread, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-orange-400" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notificaciones</h1>
          </div>
          <p className="text-sm text-gray-400 pl-7">
            {loading
              ? "Cargando..."
              : unread > 0
              ? `${unread} ${unread === 1 ? "sin leer" : "sin leer"}`
              : "Todo al día"}
          </p>
        </div>

        {unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0d2d20] border border-[#0d2d20]/20 rounded-full hover:border-[#0d2d20]/50 transition-colors uppercase tracking-wide"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {loading && <SkeletonList />}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Sin notificaciones</h2>
            <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed">
              Aquí aparecerán actualizaciones de tus pedidos y novedades de la plataforma.
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <NotifRow key={n.id} notif={n} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
