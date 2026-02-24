'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SellerStatusCard({
  title,
  description,
  status = 'ok',
}: {
  title: string
  description: string
  status?: 'ok' | 'warn' | 'danger'
}) {
  const badge =
    status === 'ok'
      ? 'Listo'
      : status === 'warn'
      ? 'Pendiente'
      : 'Acción necesaria'

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{title}</p>
          <Badge variant="outline">{badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
