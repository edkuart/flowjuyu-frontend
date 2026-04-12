// src/components/seller/SellerExecutiveSummaryCard.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Full-width card showing the executive summary tone + message.

import type { ExecutiveSummary } from "@/lib/sellerPerformance";

/* ──────────────────────────────────────────
   TONE CONFIG
────────────────────────────────────────── */

const TONE_CONFIG = {
  success: {
    bar: "bg-emerald-500",
    title: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Buen desempeño",
  },
  warning: {
    bar: "bg-amber-400",
    title: "text-amber-900",
    badge: "bg-amber-100 text-amber-700",
    label: "Atencion",
  },
  info: {
    bar: "bg-neutral-400",
    title: "text-neutral-800",
    badge: "bg-neutral-100 text-neutral-600",
    label: "Información",
  },
} as const;

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

interface Props {
  summary: ExecutiveSummary;
}

export function SellerExecutiveSummaryCard({ summary }: Props) {
  const cfg = TONE_CONFIG[summary.tone];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      {/* Accent bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:gap-5 sm:px-6 sm:py-5">
        {/* Badge */}
        <span
          className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge} `}
        >
          {cfg.label}
        </span>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] leading-snug font-bold sm:text-base ${cfg.title}`}
          >
            {summary.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            {summary.message}
          </p>
        </div>
      </div>
    </div>
  );
}
