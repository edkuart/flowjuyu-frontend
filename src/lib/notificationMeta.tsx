// src/lib/notificationMeta.tsx
//
// Single source of truth for notification type → visual + priority mapping.
// Used by NotificationBell, buyer dashboard activity feed,
// and any future surface that renders notifications.

import { Heart, Star, Sparkles, Bell, Users, Radio } from "lucide-react";
import type { ElementType } from "react";

// Priority scale (higher = shown first):
//   live       → 4  (time-sensitive — shown at the very top)
//   review     → 3  (user took an action, highest relevance)
//   suggestion → 2  (personalised — important but not urgent)
//   favorite   → 1  (activity confirmation)
//   system / * → 0  (catch-all)

export type NotificationMeta = {
  Icon: ElementType;
  iconClass: string;  // icon text color
  bg: string;         // icon container background (may include animate-* classes)
  rowBg: string;      // row tint when unread
  priority: number;   // used for sorting
  accent: string;     // left border for high-priority rows
  cta?: string;       // optional action label shown below the message
};

const META: Record<string, NotificationMeta> = {
  live: {
    Icon: Radio,
    iconClass: "text-red-500",
    bg: "bg-red-100 animate-pulse",
    rowBg: "bg-red-50/60",
    priority: 4,
    accent: "border-l-2 border-red-500",
    cta: "Ver ahora",
  },
  review: {
    Icon: Star,
    iconClass: "text-yellow-500",
    bg: "bg-yellow-50",
    rowBg: "bg-yellow-50/60",
    priority: 3,
    accent: "border-l-2 border-yellow-400",
  },
  suggestion: {
    Icon: Sparkles,
    iconClass: "text-blue-500",
    bg: "bg-blue-50",
    rowBg: "bg-blue-50/50",
    priority: 2,
    accent: "",
  },
  favorite: {
    Icon: Heart,
    iconClass: "text-orange-500",
    bg: "bg-orange-50",
    rowBg: "bg-orange-50/50",
    priority: 1,
    accent: "",
  },
  discovery: {
    Icon: Sparkles,
    iconClass: "text-emerald-500",
    bg: "bg-emerald-50",
    rowBg: "bg-emerald-50/50",
    priority: 2,
    accent: "",
  },
  social: {
    Icon: Users,
    iconClass: "text-sky-500",
    bg: "bg-sky-50",
    rowBg: "bg-sky-50/50",
    priority: 2,
    accent: "",
  },
};

const FALLBACK: NotificationMeta = {
  Icon: Bell,
  iconClass: "text-zinc-400",
  bg: "bg-zinc-50",
  rowBg: "bg-zinc-50/60",
  priority: 0,
  accent: "",
};

export function getNotificationMeta(type: string): NotificationMeta {
  return META[type] ?? FALLBACK;
}

// ─── Sort helper ───────────────────────────────────────────────────────────
//
// O(n log n). Returns a new array — never mutates the original.
// Primary key:   priority DESC  (review first, system last)
// Secondary key: created_at DESC (most recent within same priority)

export function sortNotifications<T extends { type: string; created_at: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const pa = getNotificationMeta(a.type).priority;
    const pb = getNotificationMeta(b.type).priority;
    if (pb !== pa) return pb - pa;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
