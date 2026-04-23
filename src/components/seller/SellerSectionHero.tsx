"use client"

import type { ReactNode } from "react"

interface SellerSectionHeroProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  aside?: ReactNode
  tone?: "default" | "accent"
}

export function SellerSectionHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  tone = "default",
}: SellerSectionHeroProps) {
  const accent = tone === "accent"

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] shadow-sm ${
        accent
          ? "bg-[var(--seller-accent)] text-white shadow-xl shadow-[color-mix(in_srgb,var(--seller-accent)_15%,transparent)]"
          : "seller-surface-card bg-[radial-gradient(circle_at_top_left,_rgba(15,61,58,0.08),_transparent_35%),linear-gradient(180deg,_#ffffff,_#fbfaf7)] text-neutral-900"
      }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          accent
            ? "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(234,179,8,0.14),_transparent_24%)]"
            : "bg-[linear-gradient(135deg,_rgba(15,61,58,0.04)_0%,_transparent_35%,_rgba(234,179,8,0.07)_100%)]"
        }`}
      />
      <div className="relative grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-8 lg:py-8">
        <div className="relative space-y-4">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
              accent
                ? "border border-white/10 bg-white/10 text-white/80"
                : "border border-[color:var(--seller-line-strong)] bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]"
            }`}
          >
            {eyebrow}
          </span>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-[2.1rem]">{title}</h1>
            <p
              className={`max-w-2xl text-sm leading-6 ${
                accent ? "text-white/75" : "text-[var(--seller-muted)]"
              }`}
            >
              {description}
            </p>
          </div>

          {actions}
        </div>

        {aside ? <div className="relative grid gap-4 sm:grid-cols-2">{aside}</div> : null}
      </div>
    </section>
  )
}
