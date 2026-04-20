"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useNotificationStream } from "@/hooks/useNotificationStream";
import { getNotificationMeta, sortNotifications } from "@/lib/notificationMeta";
import { cn } from "@/lib/utils";

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days} d`;
  return new Date(dateStr).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const { Icon, iconClass, bg, rowBg, accent, cta } = getNotificationMeta(notif.type);

  const content = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer",
        accent,                                                    // left border for review
        !notif.is_read && `${rowBg} hover:brightness-[0.97]`
      )}
      onClick={() => { if (!notif.is_read) onRead(notif.id); }}
    >
      {/* Type icon */}
      <div className={cn("mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-3.5 h-3.5", iconClass)} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", !notif.is_read ? "font-semibold text-gray-900" : "text-gray-700")}>
          {notif.title}
          {!notif.is_read && (
            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle" />
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
          {relativeTime(notif.created_at)}
        </p>
        {cta && (
          <span className="mt-1 inline-block text-[10px] font-semibold text-red-500 uppercase tracking-wide">
            {cta} →
          </span>
        )}
      </div>
    </div>
  );

  if (notif.link) {
    return (
      <Link href={notif.link} className="block">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

// ─── Bell ─────────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { notifications, unread, markAsRead, markAllAsRead } = useNotifications();
  useNotificationStream(); // opens SSE connection; pushes arrivals into the shared store
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  const preview = sortNotifications(notifications).slice(0, 5);

  return (
    <div className="relative" ref={ref}>

      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `${unread} notificaciones sin leer` : "Notificaciones"}
        aria-expanded={open}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-medium px-1 leading-none"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="w-80 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 text-[11px] text-orange-600 hover:text-orange-700 transition-colors font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            {preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">Sin notificaciones por ahora</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50 max-h-[360px] overflow-y-auto">
                {preview.map((n) => (
                  <NotifRow
                    key={n.id}
                    notif={n}
                    onRead={(id) => { markAsRead(id); }}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-neutral-100 px-4 py-2.5">
              <Link
                href="/buyer/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-[#0d2d20] hover:text-[#163a2b] font-medium transition-colors"
              >
                Ver todas las notificaciones
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
