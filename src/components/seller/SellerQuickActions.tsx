'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Action = {
  href: string
  text: string
  icon?: React.ReactNode
}

export default function SellerQuickActions({ actions }: { actions: Action[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-16">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}>
          <Button variant="secondary" className="w-full justify-start gap-2">
            {a.icon}
            {a.text}
          </Button>
        </Link>
      ))}
    </section>
  )
}
