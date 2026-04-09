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
  { id: "section-informacion",  label: "Info",    priority: "high" },
  { id: "section-clasificacion",label: "Tipo",    priority: "low"  },
  { id: "section-precio",       label: "Precio",  priority: "high" },
  { id: "section-ubicacion",    label: "Origen",  priority: "low"  },
  { id: "section-imagenes",     label: "Fotos",   priority: "high" },
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
    <div className="lg:hidden sticky top-[48px] z-[8] -mx-3 px-3 py-2 bg-[#f5f4f2]/90 backdrop-blur-md border-b border-gray-200/50">
      <div
        ref={barRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
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
                "flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2e22] focus-visible:ring-offset-1",
                isActive
                  ? "bg-[#0f2e22] text-white shadow-sm scale-[1.02]"
                  : priority === "high"
                  ? "bg-white text-gray-600 border border-gray-200/80 hover:border-gray-300 hover:text-gray-900"
                  : "bg-white/60 text-gray-400 border border-gray-200/50 hover:text-gray-600"
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
