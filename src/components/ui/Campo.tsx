// src/components/ui/Campo.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CampoProps {
  id: string
  label: string
  type?: string
  register: any
  error?: string
}

export function Campo({ id, label, type = 'text', register, error }: CampoProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} {...register(id)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
