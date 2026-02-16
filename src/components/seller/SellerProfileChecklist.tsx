'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'

type Item = { label: string; done: boolean }

export default function SellerProfileChecklist({ items }: { items: Item[] }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5 space-y-3">
        <p className="font-semibold">Checklist del perfil</p>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {it.done ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className={it.done ? 'text-neutral-900' : 'text-muted-foreground'}>
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
