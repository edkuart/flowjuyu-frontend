"use client";

import { useEffect, useReducer, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FavoriteItem = {
  id: number;
  product_id: string;
  product_nombre: string | null;
  product_imagen: string | null;
  product_precio: string | null;
  seller_nombre: string | null;
  seller_logo: string | null;
  created_at: string;
};

// ─── Module-level store ───────────────────────────────────────────────────────
//
// Singleton pattern: all useFavorites() instances share the same state.
// When the store changes it notifies every subscribed hook instance, which
// triggers a re-render via useReducer. This gives us globally consistent
// favorite state without React Context or a third-party library.

const _store = {
  ids: new Set<string>(),
  items: [] as FavoriteItem[],
  loaded: false,
  loading: false,
  subs: new Set<() => void>(),

  _notify() {
    this.subs.forEach((fn) => fn());
  },

  setAll(items: FavoriteItem[]) {
    this.items = items;
    this.ids = new Set(items.map((i) => i.product_id));
    this.loaded = true;
    this.loading = false;
    this._notify();
  },

  add(productId: string) {
    this.ids.add(productId);
    this._notify();
  },

  remove(productId: string) {
    this.ids.delete(productId);
    this.items = this.items.filter((i) => i.product_id !== productId);
    this._notify();
  },

  revertRemove(item: FavoriteItem) {
    if (!this.ids.has(item.product_id)) {
      this.ids.add(item.product_id);
      this.items = [item, ...this.items];
      this._notify();
    }
  },

  reset() {
    this.ids = new Set();
    this.items = [];
    this.loaded = false;
    this.loading = false;
    this._notify();
  },
};

// ─── Refresh helper ───────────────────────────────────────────────────────────
//
// Re-fetches the full favorites list from the server and calls setAll().
// Called after a successful POST so _store.items gets populated with
// complete metadata (nombre, imagen, precio, seller info) for the buyer page.

async function refreshStore(): Promise<void> {
  try {
    const res = await apiFetch("/api/favorites");
    if (!res.ok) return;
    const json = await res.json();
    const items: FavoriteItem[] = (json.data ?? []).filter(
      (f: FavoriteItem) => !!f.product_id
    );
    _store.setAll(items);
  } catch {
    // silently ignore — optimistic state from _store.ids already reflects user intent
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFavorites() {
  const { user } = useAuth();

  // Each instance subscribes to store changes via a dummy counter increment.
  // When _store._notify() fires, all subscribed components re-render and
  // read fresh values from the store.
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    _store.subs.add(tick);
    return () => {
      _store.subs.delete(tick);
    };
  }, []);

  // Reset store on logout so a new user starts clean
  useEffect(() => {
    if (!user) _store.reset();
  }, [user]);

  // Fetch once per session — guarded by loaded/loading flags on the store
  useEffect(() => {
    if (!user || _store.loaded || _store.loading) return;

    _store.loading = true;
    _store._notify();

    apiFetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        const items: FavoriteItem[] = (json.data ?? []).filter(
          (f: FavoriteItem) => !!f.product_id
        );
        _store.setAll(items);
      })
      .catch(() => {
        _store.loaded = true;
        _store.loading = false;
        _store._notify();
      });
  }, [user]);

  // isFavorite reads from the module-level Set at call time — always fresh
  const isFavorite = useCallback(
    (productId: string) => _store.ids.has(productId),
    []
  );

  const addFavorite = useCallback(async (productId: string) => {
    _store.add(productId); // optimistic — hearts update immediately

    try {
      const res = await apiFetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error();
      // Refresh to populate _store.items with full metadata so the
      // buyer favorites page shows the new item without a manual reload.
      await refreshStore();
    } catch {
      _store.remove(productId); // revert on failure
    }
  }, []);

  const removeFavorite = useCallback(async (productId: string) => {
    const snapshot = _store.items.find((i) => i.product_id === productId);
    _store.remove(productId); // optimistic

    try {
      const res = await apiFetch("/api/favorites/ref", {
        method: "DELETE",
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      if (snapshot) _store.revertRemove(snapshot); // revert with full item
    }
  }, []);

  return {
    favorites: _store.items,
    loading: _store.loading,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
