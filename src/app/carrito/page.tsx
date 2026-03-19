'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, setQty, removeItem, subtotal } = useCart()

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Carrito</h1>
        <Link href="/" className="text-sm underline">Seguir comprando</Link>
      </header>

      {/* Demo notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="mt-0.5 shrink-0 text-amber-500">●</span>
        <p>
          <span className="font-semibold">Plataforma en fase demo.</span>{' '}
          Puedes explorar el carrito libremente, pero las compras aún no están habilitadas.
          Pronto lanzaremos la experiencia completa.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-zinc-500">
          Tu carrito está vacío
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {items.map((it) => (
              <article key={it.id} className="flex gap-4 rounded-xl border p-3">
                <div className="w-20 h-20 rounded-md border overflow-hidden bg-zinc-50">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-zinc-400">Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-zinc-500">Q {it.price.toFixed(2)}</div>
                  <div className="mt-3 inline-flex items-center gap-2">
                    <button className="px-2 h-7 border rounded" onClick={() => setQty(it.id, it.qty - 1)}>−</button>
                    <span className="text-sm w-7 text-center">{it.qty}</span>
                    <button className="px-2 h-7 border rounded" onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                    <button className="ml-3 text-sm text-red-600 hover:underline" onClick={() => removeItem(it.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  Q {(it.qty * it.price).toFixed(2)}
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-xl border p-4 h-fit sticky top-24">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">Q {subtotal.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-3" disabled>
              Próximamente
            </Button>
            <p className="text-xs text-zinc-400 mt-2 text-center">
              Las compras estarán disponibles en el lanzamiento.
            </p>
            <Link
              href="/"
              className="mt-3 flex items-center justify-center w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Explorar productos
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
