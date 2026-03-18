// src/components/ui/SaveButton.tsx
//
// Botón de guardar pieza — persiste en localStorage sin login.
//
// Estados:
//   idle     → corazón outline + "Guardar"
//   saved    → corazón relleno + "Guardada"
//   hover-saved → "Quitar" (hint destructivo al pasar el cursor)
//
// Tamaños:
//   "sm"  → solo icono, para cards en grid
//   "md"  → icono + texto, para product page
//
// IMPORTANTE: el botón llama a e.stopPropagation() para no
// interferir con el Link padre en cards.

"use client";

import { useState } from "react";
import { useSavedPieces } from "@/hooks/useSavedPieces";
import type { SavedPiece } from "@/hooks/useSavedPieces";

/* ─── Props ───────────────────────────────────────────────── */

interface SaveButtonProps {
  piece: Omit<SavedPiece, "savedAt">;
  size?: "sm" | "md";
  className?: string;
}

/* ─── Icon ────────────────────────────────────────────────── */

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 24 22"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ─── Component ───────────────────────────────────────────── */

export default function SaveButton({
  piece,
  size = "md",
  className = "",
}: SaveButtonProps) {
  const { isSaved, toggle, hydrated } = useSavedPieces();
  const [hovering, setHovering] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // No renderizar hasta tener localStorage leído (evita flash)
  if (!hydrated) return null;

  const saved = isSaved(piece.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    toggle(piece);

    // Breve feedback visual al guardar
    if (!saved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    }
  }

  /* ── Size: sm — solo icono, para cards ── */
  if (size === "sm") {
    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label={saved ? "Quitar de guardadas" : "Guardar pieza"}
        title={saved ? "Quitar de guardadas" : "Guardar pieza"}
        className={`
          flex items-center justify-center
          w-8 h-8 rounded-full
          transition-all duration-200
          ${saved
            ? "bg-white text-[#0d2d20] shadow-sm"
            : "bg-white/80 backdrop-blur-sm text-[#0d0d0b]/40 hover:text-[#0d2d20] hover:bg-white"
          }
          ${justSaved ? "scale-125" : "scale-100"}
          ${className}
        `}
      >
        <HeartIcon filled={saved} />
      </button>
    );
  }

  /* ── Size: md — icono + texto, para product page ── */
  const label = saved
    ? hovering ? "Quitar de guardadas" : "Guardada"
    : "Guardar esta pieza";

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-label={label}
      className={`
        inline-flex items-center gap-2
        text-[10px] uppercase tracking-[0.22em]
        transition-all duration-200
        ${saved
          ? hovering
            ? "text-red-400"
            : "text-[#0d2d20]"
          : "text-[#0d0d0b]/40 hover:text-[#0d2d20]"
        }
        ${justSaved ? "scale-105" : "scale-100"}
        ${className}
      `}
    >
      <HeartIcon filled={saved} />
      <span>{label}</span>
    </button>
  );
}
