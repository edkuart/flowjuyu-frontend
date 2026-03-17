"use client"

import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────────────────────

type ActivityEvent = {
  id:        string
  type:      "seller" | "product" | "ticket"
  title:     string
  subtitle?: string
  href:      string
  date:      string
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  ultimosSellers: {
    id:              number
    user_id:         number
    nombre_comercio: string
    estado_admin:    string
    createdAt?:      string
  }[]
  ultimosProductos: {
    id:              string
    nombre:          string
    vendedor_nombre: string
    activo:          boolean
    createdAt?:      string
  }[]
  ultimosTickets?: {
    id:        number
    asunto:    string
    estado:    string
    prioridad: string
    tipo:      string
    createdAt: string
  }[]
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ActivityEvent["type"], {
  icon:  string
  dot:   string
  label: string
}> = {
  seller:  { icon: "🏪", dot: "bg-blue-400",   label: "Seller registered"   },
  product: { icon: "📦", dot: "bg-orange-400",  label: "Product listed"      },
  ticket:  { icon: "🎫", dot: "bg-purple-400",  label: "Ticket opened"       },
}

// ── Time helper ────────────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60)  return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminActivityStream({ ultimosSellers, ultimosProductos, ultimosTickets = [] }: Props) {
  // Build a unified, sorted activity list
  const events: ActivityEvent[] = []

  ultimosSellers.forEach((s) => {
    if (!s.createdAt) return
    events.push({
      id:       `seller-${s.id}`,
      type:     "seller",
      title:    s.nombre_comercio,
      subtitle: s.estado_admin === "activo" ? "Approved & active" : "Pending review",
      href:     `/admin/sellers/${s.user_id}`,
      date:     s.createdAt,
    })
  })

  ultimosProductos.forEach((p) => {
    if (!p.createdAt) return
    events.push({
      id:       `product-${p.id}`,
      type:     "product",
      title:    p.nombre,
      subtitle: p.vendedor_nombre,
      href:     `/admin/products/${p.id}`,
      date:     p.createdAt,
    })
  })

  ultimosTickets.forEach((t) => {
    events.push({
      id:       `ticket-${t.id}`,
      type:     "ticket",
      title:    t.asunto,
      subtitle: `${t.tipo} · ${t.prioridad} priority`,
      href:     `/admin/tickets/${t.id}`,
      date:     t.createdAt,
    })
  })

  // Sort newest first
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const visible = events.slice(0, 8)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Recent Activity</h2>
        <span className="text-xs text-muted-foreground">{visible.length} events</span>
      </div>

      {/* Stream */}
      <div className="bg-card border rounded-xl overflow-hidden divide-y">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No recent activity.</p>
        ) : (
          visible.map((event) => {
            const cfg = TYPE_CONFIG[event.type]
            return (
              <Link
                key={event.id}
                href={event.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                {/* Icon */}
                <span className="text-lg shrink-0 w-7 text-center">{cfg.icon}</span>

                {/* Dot */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                  {timeAgo(event.date)}
                </span>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
