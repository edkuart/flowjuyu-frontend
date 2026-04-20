"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  // Engagement extension — present on rows created after the schema migration
  metadata?: Record<string, unknown> | null;
  actor_id?: number | null;
  actor_type?: string | null;
  subject_type?: string | null;
  subject_id?: string | null;
  is_feed_item?: boolean;
  channel?: string;
};

// ─── Module-level singleton store ─────────────────────────────────────────────
// Shared across all useNotifications() instances — same pattern as useFavorites.

type Store = {
  items: Notification[];
  unread: number;
  loaded: boolean;
  subscribers: Set<() => void>;
  set(items: Notification[], unread: number): void;
  prepend(n: Notification): void;
  markOne(id: string): void;
  markAll(): void;
};

const _store: Store = {
  items: [],
  unread: 0,
  loaded: false,
  subscribers: new Set(),

  set(items, unread) {
    _store.items = items;
    _store.unread = unread;
    _store.loaded = true;
    _store.subscribers.forEach((fn) => fn());
  },

  // Called by useNotificationStream when an SSE push arrives.
  // Deduplicates by id so a concurrent polling fetch never creates a double entry.
  prepend(n) {
    if (_store.items.some((i) => i.id === n.id)) return;
    _store.items = [n, ..._store.items];
    if (!n.is_read) _store.unread += 1;
    _store.subscribers.forEach((fn) => fn());
  },

  markOne(id) {
    _store.items = _store.items.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    _store.unread = Math.max(0, _store.unread - 1);
    _store.subscribers.forEach((fn) => fn());
  },

  markAll() {
    _store.items = _store.items.map((n) => ({ ...n, is_read: true }));
    _store.unread = 0;
    _store.subscribers.forEach((fn) => fn());
  },
};

// ─── Module-level exports for use by SSE hook ─────────────────────────────────

export function prependNotification(n: Notification): void {
  _store.prepend(n);
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchStore(): Promise<void> {
  try {
    const res = await apiFetch("/api/notifications");
    if (!res.ok) return;
    const json = await res.json();
    _store.set(json.data ?? [], json.unread_count ?? 0);
  } catch {
    // silently ignore network errors
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Polling acts as fallback when SSE is unavailable (network drop, reconnecting).
// When SSE is active, prependNotification() delivers new items with 0 ms latency.

const POLL_INTERVAL = 45_000; // 45 s

export function useNotifications() {
  const { user } = useAuth();
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    _store.subscribers.add(tick);
    return () => { _store.subscribers.delete(tick); };
  }, []);

  // Fetch on mount + start polling
  useEffect(() => {
    if (!user) return;

    if (!_store.loaded) fetchStore();

    intervalRef.current = setInterval(fetchStore, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    _store.markOne(id); // optimistic
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // silently ignore — optimistic state is fine
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    _store.markAll(); // optimistic
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch {
      // silently ignore
    }
  }, []);

  const refetch = useCallback(() => fetchStore(), []);

  return {
    notifications: _store.items,
    unread: _store.unread,
    loading: !_store.loaded && !!user,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
