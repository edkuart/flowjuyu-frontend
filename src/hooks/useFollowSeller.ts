"use client";

import { useEffect, useReducer, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FollowedSeller = {
  seller_user_id:        number;
  nombre:                string;
  nombre_comercio:       string;
  logo:                  string | null;
  departamento:          string | null;
  municipio:             string | null;
  notifications_enabled: boolean;
  following_since:       string;
};

// ─── Module-level singleton store ─────────────────────────────────────────────
// Same pattern as useFavorites — all hook instances share one store.

const _store = {
  ids:     new Set<number>(),
  items:   [] as FollowedSeller[],
  loaded:  false,
  loading: false,
  subs:    new Set<() => void>(),

  _notify() {
    this.subs.forEach((fn) => fn());
  },

  setAll(items: FollowedSeller[]) {
    this.items   = items;
    this.ids     = new Set(items.map((i) => i.seller_user_id));
    this.loaded  = true;
    this.loading = false;
    this._notify();
  },

  follow(sellerId: number) {
    this.ids.add(sellerId);
    this._notify();
  },

  unfollow(sellerId: number) {
    this.ids.delete(sellerId);
    this.items = this.items.filter((i) => i.seller_user_id !== sellerId);
    this._notify();
  },

  reset() {
    this.ids     = new Set();
    this.items   = [];
    this.loaded  = false;
    this.loading = false;
    this._notify();
  },
};

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function loadStore(): Promise<void> {
  try {
    const res = await apiFetch("/api/follows/sellers");
    if (!res.ok) return;
    const json = await res.json();
    _store.setAll(json.data ?? []);
  } catch {
    _store.loaded  = true;
    _store.loading = false;
    _store._notify();
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFollowSeller() {
  const { user } = useAuth();
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    _store.subs.add(tick);
    return () => { _store.subs.delete(tick); };
  }, []);

  useEffect(() => {
    if (!user) { _store.reset(); return; }
    if (_store.loaded || _store.loading) return;

    _store.loading = true;
    _store._notify();
    loadStore();
  }, [user]);

  const isFollowing = useCallback(
    (sellerId: number) => _store.ids.has(sellerId),
    []
  );

  const follow = useCallback(async (sellerId: number) => {
    _store.follow(sellerId); // optimistic
    try {
      const res = await apiFetch(`/api/follows/sellers/${sellerId}`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      _store.unfollow(sellerId); // revert
    }
  }, []);

  const unfollow = useCallback(async (sellerId: number) => {
    _store.unfollow(sellerId); // optimistic
    try {
      const res = await apiFetch(`/api/follows/sellers/${sellerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      _store.ids.add(sellerId); // revert — re-add id without full metadata
      _store._notify();
    }
  }, []);

  const toggle = useCallback(async (sellerId: number) => {
    if (_store.ids.has(sellerId)) {
      await unfollow(sellerId);
    } else {
      await follow(sellerId);
    }
  }, [follow, unfollow]);

  return {
    followedSellers: _store.items,
    loading:         _store.loading,
    isFollowing,
    follow,
    unfollow,
    toggle,
  };
}
