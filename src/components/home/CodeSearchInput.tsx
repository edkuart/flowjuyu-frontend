// src/components/home/CodeSearchInput.tsx
// Client Component — interactive code lookup bar embedded in the hero.
// HeroSection is a Server Component so this is extracted to keep that boundary.
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CodeSearchInput() {
  const [code, setCode] = useState("")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount (desktop only — avoids keyboard pop on mobile)
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus()
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    router.push(`/p/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="mt-7">
      <p className="text-[9px] md:text-[10px] uppercase tracking-[0.24em] text-white/40 mb-2">
        ¿Tienes un código?
      </p>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-[360px]">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: FJ-XXXX"
            spellCheck={false}
            autoComplete="off"
            aria-label="Código de producto"
            className="
              w-full
              bg-white/10 hover:bg-white/[0.14] focus:bg-white/[0.14]
              border border-white/15 focus:border-white/30
              text-white placeholder:text-white/30
              text-sm font-mono tracking-wider
              rounded-md
              px-4 py-[11px] pr-3
              outline-none
              transition-colors duration-150
            "
          />
        </div>

        <button
          type="submit"
          disabled={!code.trim()}
          className="
            flex-shrink-0
            bg-white text-[#0d0d0b]
            text-[11px] uppercase tracking-[0.18em] font-semibold
            px-5 py-[11px] rounded-md
            hover:bg-white/90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          Buscar
        </button>
      </form>

      <p className="mt-2 text-[9px] text-white/25 tracking-wide">
        Puedes pedir el código al vendedor
      </p>
    </div>
  )
}
