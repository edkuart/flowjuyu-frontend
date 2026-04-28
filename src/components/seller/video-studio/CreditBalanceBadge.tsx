"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { fetchVideoCredits } from "@/services/sellerVideoStudio";

interface Props {
  /** When truthy, re-fetches balance (pass an incrementing number after each generation). */
  refreshKey?: number;
  onBalance?: (cents: number) => void;
}

export default function CreditBalanceBadge({ refreshKey, onBalance }: Props) {
  const [cents, setCents] = useState<number | null>(null);

  useEffect(() => {
    fetchVideoCredits()
      .then((data) => {
        setCents(data.balance_gtq_cents);
        onBalance?.(data.balance_gtq_cents);
      })
      .catch(() => {
        // Non-fatal — badge just stays hidden
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (cents === null) return null;

  const low = cents < 500; // < Q5.00
  const display = `Q${(cents / 100).toFixed(2)}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        low
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-ink)]"
      }`}
    >
      <Coins className="h-3 w-3" />
      {display}
      {low && <span className="text-amber-600">· saldo bajo</span>}
    </div>
  );
}
