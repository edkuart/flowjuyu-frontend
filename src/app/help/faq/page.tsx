'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type FaqItem = {
  id: string
  q: string
  a: string
  category: 'Compras' | 'Pagos' | 'Envíos' | 'Devoluciones' | 'Vendedores' | 'Cuenta'
  keywords?: string[]
}

const ALL_FAQS: FaqItem[] = [
  // Compras
  {
    id: 'c-01',
    q: '¿Cómo encuentro productos auténticos?',
    a: 'Puedes usar el buscador y los filtros por categoría, talla o precio. Todos los productos muestran su procedencia y artesano cuando está disponible.',
    category: 'Compras',
    keywords: ['buscar', 'filtrar', 'autenticidad', 'artesanos'],
  },
  {
    id: 'c-02',
    q: '¿Puedo guardar productos como favoritos?',
    a: 'Sí. En la ficha del producto haz clic en “❤️ Favoritos”. Desde tu cuenta puedes ver y gestionar la lista completa.',
    category: 'Compras',
  },

  // Pagos
  {
    id: 'p-01',
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito/débito, algunas billeteras locales y pago contra entrega en zonas habilitadas.',
    category: 'Pagos',
    keywords: ['tarjeta', 'efectivo', 'contra entrega', 'billetera'],
  },
  {
    id: 'p-02',
    q: '¿Es seguro pagar en Flowjuyu?',
    a: 'Sí. Trabajamos con pasarelas certificadas (PCI DSS), cifrado TLS y nunca almacenamos los datos completos de tu tarjeta.',
    category: 'Pagos',
    keywords: ['seguridad', 'pago seguro', 'pci', 'tls'],
  },

  // Envíos
  {
    id: 'e-01',
    q: '¿Cuánto tarda el envío?',
    a: 'Dentro de Guatemala, los envíos suelen tardar de 2 a 5 días hábiles según la ubicación. Recibirás un número de guía para rastreo.',
    category: 'Envíos',
    keywords: ['entrega', 'tiempo', 'tracking', 'envio'],
  },
  {
    id: 'e-02',
    q: '¿Cuánto cuesta el envío?',
    a: 'El costo se calcula según peso/volumen y tu dirección. Lo verás antes de confirmar la compra.',
    category: 'Envíos',
  },

  // Devoluciones
  {
    id: 'd-01',
    q: '¿Cómo solicito una devolución?',
    a: 'Desde tu cuenta entra a “Mis pedidos”, elige el pedido y selecciona “Solicitar devolución”. Nuestro equipo revisará el caso en 24–48h.',
    category: 'Devoluciones',
    keywords: ['reembolsos', 'cambio', 'garantía'],
  },
  {
    id: 'd-02',
    q: '¿Cuándo recibo el reembolso?',
    a: 'Una vez aceptada la devolución y recibido el producto, procesamos el reembolso en 3–7 días hábiles (según el método de pago).',
    category: 'Devoluciones',
  },

  // Vendedores
  {
    id: 'v-01',
    q: '¿Cómo vendo mis productos en Flowjuyu?',
    a: 'Crea tu cuenta de vendedor y completa la verificación. Luego podrás publicar productos y gestionar pedidos desde tu panel.',
    category: 'Vendedores',
    keywords: ['registrar', 'publicar', 'validación', 'kpis'],
  },
  {
    id: 'v-02',
    q: '¿Cuáles son las comisiones?',
    a: 'Las comisiones dependen del método de pago. En promedio están entre 10% y 15% por orden; encontrarás el detalle en tu panel.',
    category: 'Vendedores',
  },

  // Cuenta
  {
    id: 'a-01',
    q: 'Olvidé mi contraseña, ¿qué hago?',
    a: 'Ve a la página de inicio de sesión y usa “¿Olvidaste tu contraseña?” para restablecerla por correo.',
    category: 'Cuenta',
    keywords: ['password', 'recuperar', 'correo'],
  },
  {
    id: 'a-02',
    q: '¿Cómo cambio mi dirección o teléfono?',
    a: 'Entra a tu perfil y edita tus datos personales. Recuerda guardar los cambios.',
    category: 'Cuenta',
  },
]

const CATEGORIES: Array<FaqItem['category']> = [
  'Compras',
  'Pagos',
  'Envíos',
  'Devoluciones',
  'Vendedores',
  'Cuenta',
]

export default function FaqPage() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<FaqItem['category'] | 'Todas'>('Todas')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_FAQS.filter((f) => {
      const byCat = active === 'Todas' || f.category === active
      if (!q) return byCat
      const haystack = [f.q, f.a, f.category, ...(f.keywords ?? [])].join(' ').toLowerCase()
      return byCat && haystack.includes(q)
    })
  }, [query, active])

  // JSON-LD para SEO (FAQPage)
  const faqJsonLd = useMemo(() => {
    const items = filtered.slice(0, 25).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }))
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items,
    }
  }, [filtered])

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-10">
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Preguntas frecuentes</h1>
        <p className="text-muted-foreground">
          Encuentra respuestas rápidas a las dudas más comunes sobre compras, envíos, pagos,
          devoluciones y cómo vender en Flowjuyu.
        </p>
        <div className="text-xs text-zinc-500">Última actualización: {new Date().toLocaleDateString('es-GT')}</div>
      </header>

      {/* Búsqueda + categorías */}
      <section className="rounded-xl border bg-white p-4 md:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Buscar en las preguntas (ej. envío, devolución, pago)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-md border px-3 text-sm"
            aria-label="Buscar preguntas frecuentes"
          />

          <select
            className="h-10 rounded-md border px-3 text-sm sm:w-56"
            value={active}
            onChange={(e) => setActive(e.target.value as any)}
            aria-label="Filtrar por categoría"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* atajos de categorías */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setActive('Todas')}
            className={`h-8 rounded-full border px-3 text-sm ${active === 'Todas' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'}`}
          >
            Todas
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`h-8 rounded-full border px-3 text-sm ${active === c ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'}`}
              aria-pressed={active === c}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Resultados */}
      <section className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-md border bg-white p-6 text-sm text-zinc-600">
            No encontramos resultados para “{query}”. Intenta con otra palabra o revisa otra
            categoría.
          </div>
        )}

        {filtered.map((f) => {
          const open = openId === f.id
          return (
            <article key={f.id} className="rounded-md border bg-white">
              <button
                className="w-full text-left px-4 py-3 md:px-5 md:py-4 flex items-start justify-between gap-4"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : f.id)}
              >
                <div>
                  <div className="text-xs text-zinc-500">{f.category}</div>
                  <h3 className="font-medium leading-snug">{f.q}</h3>
                </div>
                <span className="text-zinc-500 text-sm">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 -mt-2 text-sm text-zinc-700">
                  {f.a}
                </div>
              )}
            </article>
          )
        })}
      </section>

      {/* CTA contacto */}
      <section className="rounded-xl border bg-white p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-2">¿Aún necesitas ayuda?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Nuestro equipo de soporte responde normalmente en menos de 24 horas hábiles.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/help/contact"
            className="h-10 px-4 inline-flex items-center justify-center rounded-md border hover:bg-gray-50 text-sm"
          >
            Contactar soporte
          </Link>
          <Link
            href="/help/returns"
            className="h-10 px-4 inline-flex items-center justify-center rounded-md border hover:bg-gray-50 text-sm"
          >
            Ver política de devoluciones
          </Link>
          <Link
            href="/sell"
            className="h-10 px-4 inline-flex items-center justify-center rounded-md border hover:bg-gray-50 text-sm"
          >
            Vender en Flowjuyu
          </Link>
        </div>
      </section>
    </main>
  )
}
