'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number | string // 🔒 blindaje extra
  image?: string
  qty: number
}

type CartContextType = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // ==========================
  // 🔹 Cargar carrito (localStorage)
  // ==========================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (err) {
      console.error('Error cargando carrito', err)
    }
  }, [])

  // ==========================
  // 🔹 Persistir carrito
  // ==========================
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Error guardando carrito', err)
    }
  }, [items])

  const value = useMemo<CartContextType>(() => {
    // ==========================
    // ➕ Agregar item (stack)
    // ==========================
    const addItem: CartContextType['addItem'] = (item, qty = 1) => {
      if (qty <= 0) return

      setItems(prev => {
        const found = prev.find(p => p.id === item.id)
        if (found) {
          return prev.map(p =>
            p.id === item.id
              ? {
                  ...p,
                  qty: p.qty + qty,
                  price: Number(p.price), // 🔒 refuerzo
                }
              : p
          )
        }

        return [
          ...prev,
          {
            ...item,
            qty,
            price: Number(item.price), // 🔒 refuerzo
          },
        ]
      })
    }

    // ==========================
    // 🔢 Cambiar cantidad
    // ==========================
    const setQty: CartContextType['setQty'] = (id, qty) => {
      setItems(prev =>
        prev
          .map(p =>
            p.id === id
              ? {
                  ...p,
                  qty: Math.max(1, qty),
                  price: Number(p.price), // 🔒 refuerzo
                }
              : p
          )
          .filter(p => p.qty > 0)
      )
    }

    // ==========================
    // ❌ Quitar item
    // ==========================
    const removeItem = (id: string) => {
      setItems(prev => prev.filter(p => p.id !== id))
    }

    // ==========================
    // 🧹 Vaciar carrito
    // ==========================
    const clear = () => setItems([])

    // ==========================
    // 🔢 Totales (REFUERZO CLAVE)
    // ==========================
    const count = items.reduce((a, i) => a + i.qty, 0)

    const subtotal = items.reduce(
      (a, i) => a + i.qty * Number(i.price), // 🔥 AQUÍ VA EL REFUERZO
      0
    )

    return { items, count, subtotal, addItem, setQty, removeItem, clear }
  }, [items])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return ctx
}
