"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  value: number
  icon: ReactNode
  description?: string
  highlight?: boolean
  href?: string
}

export function AdminKPICard({
  title,
  value,
  icon,
  description,
  highlight = false,
  href,
}: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() => href && router.push(href)}
      className={cn(
        "rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200",
        "hover:shadow-md",
        href && "cursor-pointer hover:scale-[1.02]",
        highlight && "border-red-300 bg-red-50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-500 text-sm">{title}</div>
        <div className="text-gray-400">{icon}</div>
      </div>

      <div className="text-3xl font-bold tracking-tight">
        {value}
      </div>

      {description && (
        <div className="text-xs text-gray-400 mt-2">
          {description}
        </div>
      )}
    </div>
  )
}