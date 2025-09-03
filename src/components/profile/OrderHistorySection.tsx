// src/components/profile/OrderHistorySection.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  userId: string
}

interface Order {
  id: string
  date: string
  total: number
  status: string
}

export default function OrderHistorySection({ userId }: Props) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Aquí iría la lógica para obtener las órdenes del usuario desde una API
    setOrders([
      { id: '123', date: '2024-06-10', total: 120.5, status: 'Entregado' },
      { id: '124', date: '2024-06-03', total: 64.9, status: 'En camino' },
    ])
  }, [userId])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Historial de pedidos</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tienes pedidos registrados.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded p-3 text-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Pedido #{order.id}</p>
                <p className="text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Q{order.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{order.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
