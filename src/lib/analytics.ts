'use client'

import { apiFetch } from '@/lib/api'

export type AnalyticsPayload = Record<string, unknown>

function getCurrentAnalyticsUser(): {
  userId: number | null
  role: string | null
  sellerId: number | null
} {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (!raw) {
      return {
        userId: null,
        role: null,
        sellerId: null,
      }
    }

    const parsed = JSON.parse(raw) as { id?: number | string; role?: string } | null
    const userId = Number(parsed?.id)
    const role = typeof parsed?.role === 'string' ? parsed.role : null

    return {
      userId: Number.isFinite(userId) ? userId : null,
      role,
      sellerId:
        role === 'seller' && Number.isFinite(userId)
          ? userId
          : null,
    }
  } catch {
    return {
      userId: null,
      role: null,
      sellerId: null,
    }
  }
}

export function track(event: string, payload?: AnalyticsPayload) {
  const { sellerId, userId, role } = getCurrentAnalyticsUser()
  const nextPayload = {
    ...(userId ? { user_id: userId } : {}),
    ...(role ? { role } : {}),
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
