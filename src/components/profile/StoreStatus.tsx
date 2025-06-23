// src/components/profile/StoreStatus.tsx
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface Props {
  userId: string
}

interface StoreData {
  name: string
  status: 'verificado' | 'pendiente' | 'rechazado'
  createdAt: string
}

export default function StoreStatus({ userId }: Props) {
  const [store, setStore] = useState<StoreData | null>(null)

  useEffect(() => {
    // Simular datos del backend
    setStore({
      name: 'Tienda Xocomil',
      status: 'verificado',
      createdAt: '2024-05-21',
    })
  }, [userId])

  if (!store) return null

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Estado de mi tienda</h2>
      <div className="border rounded p-4">
        <p className="text-sm text-muted-foreground">Nombre del comercio:</p>
        <p className="font-medium">{store.name}</p>

        <p className="text-sm text-muted-foreground mt-2">Fecha de registro:</p>
        <p>{store.createdAt}</p>

        <p className="text-sm text-muted-foreground mt-2">Estado de verificación:</p>
        <Badge
          variant={
            store.status === 'verificado'
              ? 'default'
              : store.status === 'pendiente'
              ? 'secondary'
              : 'destructive'
          }
        >
          {store.status}
        </Badge>
      </div>
    </section>
  )
}
