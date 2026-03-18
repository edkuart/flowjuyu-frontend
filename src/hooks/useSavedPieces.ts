// src/hooks/useSavedPieces.ts
//
// Persiste piezas guardadas en localStorage — sin login requerido.
//
// Lo que se almacena por pieza:
//   id, nombre, precio, imagen_url, vendedor_nombre, savedAt
//
// Máximo 50 piezas. Cuando se supera, se elimina la más antigua.
//
// Uso futuro: mostrar en /guardadas, sincronizar con cuenta si el
// usuario decide registrarse.

"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Tipo ────────────────────────────────────────────────── */

export interface SavedPiece {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  vendedor_nombre: string | null;
  savedAt: string; // ISO timestamp
}

/* ─── Constants ───────────────────────────────────────────── */

const STORAGE_KEY = "fj_saved_pieces";
const MAX_SAVED = 50;

/* ─── Helpers ─────────────────────────────────────────────── */

function readFromStorage(): SavedPiece[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(pieces: SavedPiece[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces));
  } catch {
    /* silent — quota exceeded o incognito */
  }
}

/* ─── Hook ────────────────────────────────────────────────── */

export function useSavedPieces() {
  const [savedPieces, setSavedPieces] = useState<SavedPiece[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Leer localStorage solo en el cliente (evita hydration mismatch)
  useEffect(() => {
    setSavedPieces(readFromStorage());
    setHydrated(true);
  }, []);

  const save = useCallback((piece: Omit<SavedPiece, "savedAt">) => {
    setSavedPieces((prev) => {
      // No duplicar
      if (prev.some((p) => p.id === piece.id)) return prev;

      const next: SavedPiece[] = [
        { ...piece, savedAt: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_SAVED);

      writeToStorage(next);
      return next;
    });
  }, []);

  const unsave = useCallback((id: string) => {
    setSavedPieces((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => savedPieces.some((p) => p.id === id),
    [savedPieces]
  );

  const toggle = useCallback(
    (piece: Omit<SavedPiece, "savedAt">) => {
      if (isSaved(piece.id)) {
        unsave(piece.id);
      } else {
        save(piece);
      }
    },
    [isSaved, save, unsave]
  );

  return {
    savedPieces,
    savedCount: savedPieces.length,
    isSaved,
    save,
    unsave,
    toggle,
    hydrated,
  };
}
