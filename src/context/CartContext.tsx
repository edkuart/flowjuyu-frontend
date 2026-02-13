'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
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

  // cargar carrito
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // persistir carrito
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const value = useMemo<CartContextType>(() => {
    const addItem: CartContextType['addItem'] = (item, qty = 1) => {
      if (qty <= 0) return

      setItems(prev => {
        const found = prev.find(p => p.id === item.id)
        if (found) {
          return prev.map(p =>
            p.id === item.id ? { ...p, qty: p.qty + qty } : p
          )
        }
        return [...prev, { ...item, qty }]
      })
    }

    const setQty: CartContextType['setQty'] = (id, qty) => {
      setItems(prev =>
        prev
          .map(p => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
          .filter(p => p.qty > 0)
      )
    }

    const removeItem = (id: string) => {
      setItems(prev => prev.filter(p => p.id !== id))
    }

    const clear = () => setItems([])

    const count = items.reduce((a, i) => a + i.qty, 0)
    const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0)

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
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
