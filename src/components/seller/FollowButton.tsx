"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollowSeller } from "@/hooks/useFollowSeller";

type Props = {
  sellerId:   number;
  className?: string;
};

export function FollowButton({ sellerId, className }: Props) {
  const { isFollowing, toggle } = useFollowSeller();
  const [pending, setPending]   = useState(false);

  const following = isFollowing(sellerId);

  const handleClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      await toggle(sellerId);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={following ? "Dejar de seguir este vendedor" : "Seguir a este vendedor"}
      aria-pressed={following}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
        following
          ? "border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600"
          : "bg-[#0d2d20] text-white hover:bg-[#163a2b]",
        pending && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : following ? (
        <UserCheck className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}
