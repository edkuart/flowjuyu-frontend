'use client'

import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'

import { track } from '@/lib/analytics'
import { buildWhatsAppHref, extractWhatsAppPhone } from '@/lib/whatsapp'
import { apiFetch } from '@/services/apiClient'

type Props = {
  isLinked?: boolean
  code?: string | null
}

type ApiStatusResponse = {
  ok?: boolean
  data?: {
    linkedPhone?: string | null
  }
}

type LinkState = {
  state: 'connected' | 'not_connected' | 'auth_error' | 'error'
  isLinked: boolean
}

const SESSION_CODE_KEY = 'flowjuyu.whatsapp_link_code'
const BOT_PHONE = extractWhatsAppPhone(process.env.NEXT_PUBLIC_WHATSAPP_BOT_PHONE ?? '')

function buildFloatingMessage({ isLinked, code }: { isLinked: boolean; code?: string | null }) {
  if (code) {
    return code
  }

  if (isLinked) {
    return 'Hola, quiero gestionar mi tienda'
  }

  return 'Hola, quiero vincular mi cuenta'
}

function getStoredCode() {
  if (typeof window === 'undefined') return null
  const value = window.sessionStorage.getItem(SESSION_CODE_KEY)
  return value?.trim() || null
}

async function fetchWhatsAppLinkState(): Promise<LinkState> {
  const res = await apiFetch('/api/seller/whatsapp-link', { method: 'GET' })
  const json = (await res.json().catch(() => ({}))) as ApiStatusResponse

  if (!res.ok || !json.ok) {
    const error = new Error('No pudimos cargar el estado de WhatsApp.') as Error & { status?: number }
    error.status = res.status
    throw error
  }

  return {
    state: Boolean(json.data?.linkedPhone) ? 'connected' : 'not_connected',
    isLinked: Boolean(json.data?.linkedPhone),
  }
}

export function WhatsAppFloatingButton({ isLinked: isLinkedProp, code }: Props) {
  const [resolvedLinked, setResolvedLinked] = useState(Boolean(isLinkedProp))
  const [resolvedCode, setResolvedCode] = useState<string | null>(code ?? null)
  const [linkState, setLinkState] = useState<'loading' | 'connected' | 'not_connected' | 'auth_error' | 'error'>(
    typeof isLinkedProp === 'boolean'
      ? (isLinkedProp ? 'connected' : 'not_connected')
      : 'loading'
  )

  useEffect(() => {
    if (!BOT_PHONE) {
      console.warn(
        'WhatsAppFloatingButton: NEXT_PUBLIC_WHATSAPP_BOT_PHONE is missing or invalid. Expected E.164 digits without "+" or spaces.'
      )
    }
  }, [])

  useEffect(() => {
    const nextStoredCode = code ?? getStoredCode()
    if (nextStoredCode) {
      setResolvedCode(nextStoredCode)
    }
  }, [code])

  useEffect(() => {
    if (typeof isLinkedProp === 'boolean') {
      setResolvedLinked(isLinkedProp)
      setLinkState(isLinkedProp ? 'connected' : 'not_connected')
      return
    }

    let active = true

    fetchWhatsAppLinkState()
      .then((next) => {
        if (!active) return
        setResolvedLinked(next.isLinked)
        setLinkState(next.state)

        if (next.isLinked && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(SESSION_CODE_KEY)
          setResolvedCode(null)
        }
      })
      .catch((error: any) => {
        if (!active) return
        setLinkState(error?.status === 401 ? 'auth_error' : 'error')
      })

    return () => {
      active = false
    }
  }, [isLinkedProp])

  const message = useMemo(
    () => buildFloatingMessage({ isLinked: resolvedLinked, code: resolvedCode }),
    [resolvedLinked, resolvedCode]
  )

  const href = useMemo(
    () => (BOT_PHONE ? buildWhatsAppHref(BOT_PHONE, message) : '#'),
    [message]
  )

  const label = resolvedCode
    ? 'Enviar código por WhatsApp'
    : linkState === 'auth_error'
      ? 'Revisa tu sesión'
      : resolvedLinked
      ? 'Abrir workspace de WhatsApp'
      : 'Vincular cuenta por WhatsApp'

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!BOT_PHONE) {
      event.preventDefault()
      return
    }

    track('whatsapp_floating_clicked', {
      hasCode: Boolean(resolvedCode),
      isLinked: resolvedLinked,
      location: 'seller_workspace',
    })
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
      <div className="pointer-events-auto flex items-center justify-end">
        <a
          href={href}
          onClick={handleClick}
          aria-label={label}
          aria-disabled={!BOT_PHONE}
          className={`group inline-flex items-center gap-3 rounded-full border px-4 py-3 text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.95)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 ${
            BOT_PHONE
              ? 'border-emerald-400/20 bg-emerald-500 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_22px_45px_-18px_rgba(5,150,105,0.95)]'
              : 'cursor-not-allowed border-neutral-300 bg-neutral-400 opacity-70'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-50/80">
              WhatsApp
            </p>
            <p className="max-w-[180px] truncate text-sm font-semibold">
              {BOT_PHONE ? label : 'Configura el bot de WhatsApp'}
            </p>
          </div>

          {(resolvedCode || resolvedLinked) && (
            <span className="hidden rounded-full bg-white/16 px-2 py-1 text-[11px] font-semibold text-white/90 lg:inline-flex">
              {resolvedCode ? 'Código listo' : 'Activo'}
            </span>
          )}

          {linkState === 'auth_error' && !resolvedCode && (
            <span className="hidden rounded-full bg-white/16 px-2 py-1 text-[11px] font-semibold text-white/90 lg:inline-flex">
              Sesión
            </span>
          )}

          {!resolvedLinked && !resolvedCode && (
            <Sparkles className="hidden h-4 w-4 text-emerald-100 lg:block" />
          )}
        </a>
      </div>
    </div>
  )
}
