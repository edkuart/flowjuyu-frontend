"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md";
  /** When true, renders as inline text+icon for product detail pages */
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  productId,
  size = "md",
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);
  // Briefly lights up the button background when saving
  const [justSaved, setJustSaved] = useState(false);

  // Derived from shared store — always consistent across all card instances
  const favorited = isFavorite(productId);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (busy) return;

    setBusy(true);
    setPop(true);
    setTimeout(() => setPop(false), 350);

    if (favorited) {
      // Fire toast immediately (optimistic — feels instant)
      toast("Eliminado de favoritos", {
        icon: "🤍",
        duration: 2000,
        style: { fontFamily: "inherit" },
      });
      await removeFavorite(productId);
    } else {
      // Warm background flash on save
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 700);

      toast.success("Guardado en favoritos 💛", {
        description: "Lo encontrarás en Mis Favoritos.",
        duration: 2500,
        style: { fontFamily: "inherit" },
      });
      await addFavorite(productId);
    }

    setBusy(false);
  };

  // ── Text + icon variant (product detail page) ────────────────────────────
  if (showLabel) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={cn(
          "inline-flex items-center gap-2",
          "text-[10px] uppercase tracking-[0.22em]",
          "transition-colors duration-200",
          favorited
            ? "text-orange-500"
            : "text-[#0d0d0b]/40 hover:text-[#0d2d20]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all duration-300",
            pop && "scale-125",
            favorited
              ? "fill-orange-500 text-orange-500"
              : "fill-transparent"
          )}
        />
        <span className="transition-colors duration-200">
          {favorited ? "Guardada" : "Guardar esta pieza"}
        </span>
      </button>
    );
  }

  // ── Icon-only round button variant (cards, grids) ────────────────────────
  const btnSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "shadow-sm border transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        justSaved
          ? "bg-orange-50 border-orange-200"
          : "bg-white/90 backdrop-blur-sm border-white/50",
        btnSize,
        className
      )}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all duration-300",
          pop && "scale-125",
          favorited
            ? "fill-orange-500 text-orange-500"
            : "fill-transparent text-gray-400"
        )}
      />
    </button>
  );
}
