"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bell, Package, ChevronRight, Sparkles } from "lucide-react";
import { getNotificationMeta, sortNotifications } from "@/lib/notificationMeta";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import RecommendedSection from "@/components/home/RecommendedSection";

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgoEs(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)                          return "Hace un momento";
  const m = Math.floor(s / 60);
  if (m < 60)                          return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)                          return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30)                          return `Hace ${d} días`;
  return new Date(date).toLocaleDateString("es-GT", { month: "short", day: "numeric" });
}

// ─── Activity grouping ─────────────────────────────────────────────────────
//
// Consecutive same-type notifications collapse into a single row.
// e.g. 3 "favorite" events → "Guardaste 3 productos"

type ActivityGroup = {
  key: string;           // first notification id (React key)
  type: string;
  count: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  ids: string[];         // all notification ids in this group
};

function groupActivity(notifications: Notification[]): ActivityGroup[] {
  const groups: ActivityGroup[] = [];

  for (const n of notifications) {
    const last = groups[groups.length - 1];
    if (last && last.type === n.type) {
      last.count += 1;
      last.ids.push(n.id);
      // If any in the group is unread, the group is unread
      if (!n.is_read) last.is_read = false;
      // Update title for plural
      if (last.count > 1) {
        last.title = pluralTitle(last.type, last.count);
      }
    } else {
      groups.push({
        key: n.id,
        type: n.type,
        count: 1,
        title: n.title,
        message: n.message,
        link: n.link,
        is_read: n.is_read,
        created_at: n.created_at,
        ids: [n.id],
      });
    }
  }

  return groups;
}

function pluralTitle(type: string, count: number): string {
  switch (type) {
    case "favorite": return `Guardaste ${count} productos`;
    case "review":   return `Dejaste ${count} reseñas`;
    default:         return `${count} notificaciones`;
  }
}

// ─── Activity row ──────────────────────────────────────────────────────────

function ActivityRow({
  group,
  onRead,
  onClose,
}: {
  group: ActivityGroup;
  onRead: (ids: string[]) => void;
  onClose?: () => void;
}) {
  const { Icon, iconClass, bg, rowBg, accent } = getNotificationMeta(group.type);

  const handleClick = () => {
    if (!group.is_read) onRead(group.ids);
    onClose?.();
  };

  const inner = (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 ${accent} ${
        !group.is_read ? rowBg : ""
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
        <Icon className={`w-4 h-4 ${iconClass}`} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {group.title}
          {!group.is_read && (
            <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle" />
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-1">
          {group.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgoEs(group.created_at)}</p>
      </div>

      {group.link && (
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-1" />
      )}
    </div>
  );

  if (group.link) {
    return (
      <Link href={group.link} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Quick stat card ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-5 py-4 hover:shadow-sm hover:border-gray-200 transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 ml-auto transition-colors" />
    </Link>
  );
}

// ─── Compact favorite card ─────────────────────────────────────────────────

function FavoriteCard({
  productId,
  nombre,
  imagen,
  precio,
  sellerNombre,
}: {
  productId: string;
  nombre: string | null;
  imagen: string | null;
  precio: string | null;
  sellerNombre: string | null;
}) {
  const displayPrice = precio
    ? new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
        parseFloat(precio)
      )
    : null;

  return (
    <Link
      href={`/product/${productId}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className="aspect-[3/4] bg-[#f0ece4] relative overflow-hidden">
        {imagen ? (
          <Image
            src={imagen}
            alt={nombre ?? "Producto"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-900 truncate">{nombre ?? "Pieza artesanal"}</p>
        {sellerNombre && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{sellerNombre}</p>
        )}
        {displayPrice && (
          <p className="text-sm font-semibold text-[#0d2d20] mt-1">{displayPrice}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { notifications, unread, markAsRead } = useNotifications();

  const recentFavorites = favorites.slice(0, 4);
  const activityGroups = groupActivity(sortNotifications(notifications).slice(0, 12)).slice(0, 8);

  function handleMarkGroup(ids: string[]) {
    ids.forEach((id) => markAsRead(id));
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bienvenido{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Aquí tienes un resumen de tu actividad en Flowjuyu.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <StatCard
          icon={Heart}
          label="Favoritos guardados"
          value={favorites.length}
          href="/buyer/favorites"
          accent="bg-orange-50 text-orange-500"
        />
        <StatCard
          icon={Bell}
          label="Notificaciones sin leer"
          value={unread}
          href="/buyer/notifications"
          accent={unread > 0 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}
        />
        <StatCard
          icon={Package}
          label="Pedidos realizados"
          value={0}
          href="/buyer/orders"
          accent="bg-blue-50 text-blue-400"
        />
      </div>

      {/* ── Activity timeline ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Tu actividad
          </h2>
          {activityGroups.length > 0 && (
            <Link
              href="/buyer/notifications"
              className="text-xs font-medium text-[#0d2d20] hover:opacity-70 transition-opacity"
            >
              Ver todo →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {activityGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="w-8 h-8 text-gray-200 mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-500">Aún no tienes actividad</p>
              <Link
                href="/productos"
                className="mt-3 text-xs font-medium text-[#0d2d20] hover:opacity-70 transition-opacity"
              >
                Explorar productos →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 p-1">
              {activityGroups.map((group) => (
                <ActivityRow
                  key={group.key}
                  group={group}
                  onRead={handleMarkGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent favorites */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Favoritos recientes</h2>
          {favorites.length > 0 && (
            <Link
              href="/buyer/favorites"
              className="text-xs font-medium text-[#0d2d20] hover:opacity-70 transition-opacity"
            >
              Ver todos →
            </Link>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-[#faf9f7] rounded-xl border border-gray-100 text-center">
            <Heart className="w-8 h-8 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm text-gray-500">Aún no tienes favoritos</p>
            <Link
              href="/productos"
              className="mt-3 text-xs font-medium text-[#0d2d20] hover:opacity-70 transition-opacity"
            >
              Explorar productos →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentFavorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                productId={fav.product_id}
                nombre={fav.product_nombre}
                imagen={fav.product_imagen}
                precio={fav.product_precio}
                sellerNombre={fav.seller_nombre}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommendations — full bleed */}
      <div className="-mx-4 md:-mx-8">
        <RecommendedSection />
      </div>
    </div>
  );
}
