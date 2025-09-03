// src/components/profile/AddressSection.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
}

export default function AddressSection({ userId }: Props) {
  const [editing, setEditing] = useState(false)
  const [address, setAddress] = useState('') // Puedes traer la dirección desde la API más adelante

  const handleSave = () => {
    // Aquí se actualizará la dirección del usuario en la base de datos
    setEditing(false)
  }

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Dirección de envío</h2>
      {editing ? (
        <div className="space-y-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección completa"
          />
          <Button onClick={handleSave}>Guardar dirección</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {address || 'No hay dirección registrada.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      )}
    </section>
  )
}
