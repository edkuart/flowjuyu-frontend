// src/components/profile/ReviewSection.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  userId: string
}

interface Review {
  id: string
  productName: string
  rating: number
  comment: string
  date: string
}

export default function ReviewSection({ userId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    // Simula carga de reseñas desde una API
    setReviews([
      {
        id: 'r1',
        productName: 'Corte tradicional',
        rating: 5,
        comment: 'Excelente calidad y envío rápido.',
        date: '2024-06-05',
      },
    ])
  }, [userId])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Mis reseñas</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No has dejado reseñas todavía.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border rounded p-4">
              <p className="font-medium">{r.productName}</p>
              <p className="text-xs text-muted-foreground">{r.date}</p>
              <p className="text-sm">{r.comment}</p>
              <p className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
