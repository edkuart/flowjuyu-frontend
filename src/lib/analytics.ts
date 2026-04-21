'use client'

import { apiFetch } from '@/lib/api'

export type AnalyticsPayload = Record<string, unknown>

const ANALYTICS_SESSION_STORAGE_KEY = 'fj_analytics_session_id'

function generateAnalyticsSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `fj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function getAnalyticsSessionId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const existing = window.localStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)
    if (existing) return existing

    const next = generateAnalyticsSessionId()
    window.localStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, next)
    return next
  } catch {
    return null
  }
}

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
  const sessionId = getAnalyticsSessionId()
  const nextPayload = {
    ...(userId ? { user_id: userId } : {}),
    ...(role ? { role } : {}),
    ...(sessionId ? { session_id: sessionId } : {}),
    ...(payload ?? {}),
    ...(sellerId ? { seller_id: sellerId } : {}),
  }

  console.log('📊 EVENT:', event, nextPayload)

  void apiFetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event,
      event_name: event,
      seller_id: sellerId,
      payload: nextPayload,
      metadata: nextPayload,
    }),
  }).catch(() => {})

  // Future:
  // enrich with session ids, experiments, or source attribution
}

export function trackEvent(event_name: string, metadata?: AnalyticsPayload) {
  track(event_name, metadata)
}
