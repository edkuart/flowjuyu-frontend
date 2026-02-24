'use client'

import { Card, CardContent } from '@/components/ui/card'

type Props = {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export default function SellerKpiCard({ label, value, icon }: Props) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-neutral-600">{icon}</div>
      </CardContent>
    </Card>
  )
}
