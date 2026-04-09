'use client'

import { apiFetch } from '@/lib/api'

export type AnalyticsPayload = Record<string, unknown>

function getCurrentSellerId(): number | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (!raw) return null

    const parsed = JSON.parse(raw) as { id?: number | string; role?: string } | null
    if (parsed?.role !== 'seller') {
      return null
    }

    const sellerId = Number(parsed.id)
    return Number.isFinite(sellerId) ? sellerId : null
  } catch {
    return null
  }
}

export function track(event: string, payload?: AnalyticsPayload) {
  const sellerId = getCurrentSellerId()
  const nextPayload = {
    ...(payload ?? {}),
    ...(sellerId ? { seller_id: sellerId } : {}),
  }

  console.log('📊 EVENT:', event, nextPayload)

  void apiFetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event,
      seller_id: sellerId,
      payload: nextPayload,
    }),
  }).catch(() => {})

  // Future:
  // enrich with session ids, experiments, or source attribution
}
