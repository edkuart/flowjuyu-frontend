// src/components/product-edit/MobileSectionNav.tsx
//
// Sticky horizontal scroll nav for the product edit page on mobile.
// Uses IntersectionObserver to highlight the section currently in view.
// Smooth-scrolls to the section when a tab is tapped.
// Hidden on lg+ (desktop uses the sticky preview instead).

"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type SectionNavItem = {
  id: string
  label: string
  priority?: "high" | "low"
}

const NAV_ITEMS: SectionNavItem[] = [
  { id: "section-informacion",  label: "Info",     priority: "high" },
  { id: "section-clasificacion",label: "Tipo",     priority: "low"  },
  { id: "section-precio",       label: "Precio",   priority: "high" },
  { id: "section-ubicacion",    label: "Origen",   priority: "low"  },
  { id: "section-detalles",     label: "Detalles", priority: "low"  },
  { id: "section-imagenes",     label: "Fotos",    priority: "high" },
]

// Pixel offset for the sticky header + nav bar itself when scrolling into view
const SCROLL_OFFSET = 108

export function MobileSectionNav() {
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id)
  const barRef = useRef<HTMLDivElement>(null)

  // ── Track active section via IntersectionObserver ────────────────────────────
  useEffect(() => {
    const targets = NAV_ITEMS
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ── Auto-scroll the nav bar to keep active tab visible ───────────────────────
  useEffect(() => {
    const btn = barRef.current?.querySelector<HTMLElement>(`[data-id="${activeId}"]`)
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [activeId])

  // ── Scroll page to section ───────────────────────────────────────────────────
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top, behavior: "smooth" })
    setActiveId(id)
  }

  return (
    <div className="sticky top-[61px] z-[18] -mx-3 border-b border-[#0f2e22]/6 bg-[#f5f4f2]/78 px-3 py-2 backdrop-blur-xl lg:hidden">
      <div
        ref={barRef}
        className="flex gap-2 overflow-x-auto scrollbar-none"
        role="navigation"
        aria-label="Secciones del producto"
      >
        {NAV_ITEMS.map(({ id, label, priority }) => {
          const isActive = activeId === id

          return (
            <button
              key={id}
              data-id={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2e22] focus-visible:ring-offset-1",
                isActive
                  ? "scale-[1.02] border-[#0f2e22] bg-[#0f2e22] text-white shadow-[0_12px_20px_-16px_rgba(15,46,34,0.6)]"
                  : "border-[#0f2e22]/8 bg-white/92 text-neutral-500 hover:border-[#0f2e22]/18 hover:text-[#14231c]"
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
