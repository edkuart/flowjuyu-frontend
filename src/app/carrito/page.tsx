'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function CartPage() {
  const { items, setQty, removeItem, subtotal } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const goCheckout = () => {
    if (items.length === 0) return
    if (!user) {
      router.push('/login?next=/checkout')
      return
    }
    router.push('/checkout')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Carrito</h1>
        <Link href="/" className="text-sm underline">Seguir comprando</Link>
      </header>

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
            <Button className="w-full mt-3" disabled={items.length === 0} onClick={goCheckout}>
              Finalizar compra
            </Button>
            {!user && (
              <p className="text-xs text-zinc-500 mt-2">
                Para finalizar, inicia sesión o crea una cuenta.
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
