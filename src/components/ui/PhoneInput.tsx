"use client"

import type { PhoneNumber } from "@/lib/phone"

/* ─────────────────────────────────────────────
   COUNTRY LIST
───────────────────────────────────────────── */

const COUNTRIES = [
  { code: "502", flag: "🇬🇹", label: "+502", name: "Guatemala"   },
  { code: "52",  flag: "🇲🇽", label: "+52",  name: "México"      },
  { code: "1",   flag: "🇺🇸", label: "+1",   name: "USA"         },
  { code: "503", flag: "🇸🇻", label: "+503", name: "El Salvador" },
  { code: "504", flag: "🇭🇳", label: "+504", name: "Honduras"    },
  { code: "506", flag: "🇨🇷", label: "+506", name: "Costa Rica"  },
] as const

const DEFAULT_CC = "502"
const MAX_DIGITS  = 8

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Formats stored raw digits for display: "55554446" → "5555-4446" */
function formatDisplay(digits: string): string {
  if (digits.length <= 4) return digits
  return `${digits.slice(0, 4)}-${digits.slice(4, MAX_DIGITS)}`
}

/** Returns the border/ring class based on digit count */
function validationClass(digits: string): string {
  if (digits.length === 0) return "border-neutral-200"
  if (digits.length < MAX_DIGITS) return "border-red-300 ring-1 ring-red-200"
  return "border-neutral-200"
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

type Props = {
  value: PhoneNumber | null
  onChange: (value: PhoneNumber) => void
  placeholder?: string
  disabled?: boolean
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export function PhoneInput({
  value,
  onChange,
  placeholder = "5555-4446",
  disabled = false,
}: Props) {
  const cc  = value?.country_code ?? DEFAULT_CC
  const num = value?.number ?? ""

  const handleCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ country_code: e.target.value, number: num })
  }

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any formatting the user may type (dashes, spaces) and cap at MAX_DIGITS
    const digits = e.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS)
    onChange({ country_code: cc, number: digits })
  }

  const inputBorder = validationClass(num)

  const base =
    "text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 focus:border-[#0F3D3A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="flex items-stretch max-w-[280px]">
      {/* Country selector */}
      <div className="relative shrink-0">
        <select
          value={cc}
          onChange={handleCountry}
          disabled={disabled}
          aria-label="Código de país"
          className={`${base} appearance-none border border-neutral-200 border-r-0 rounded-l-lg rounded-r-none pl-2.5 pr-7 py-2 bg-neutral-50 cursor-pointer h-full`}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] leading-none">
          ▾
        </span>
      </div>

      {/* Local number — shows formatted value, stores raw digits */}
      <input
        type="tel"
        inputMode="numeric"
        value={formatDisplay(num)}
        onChange={handleNumber}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Número local"
        className={`${base} border ${inputBorder} flex-1 rounded-r-lg rounded-l-none px-3 py-2 font-mono tracking-wide`}
      />
    </div>
  )
}
