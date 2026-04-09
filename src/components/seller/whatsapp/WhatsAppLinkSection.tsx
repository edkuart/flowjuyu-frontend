'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Link2, RefreshCw, ShieldCheck, Unlink2, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { track } from '@/lib/analytics'
import { apiFetch } from '@/services/apiClient'

const SESSION_CODE_KEY = 'flowjuyu.whatsapp_link_code'

type WhatsAppLinkStatus = {
  isLinked: boolean
  phone?: string
  linkedAt?: string
  activeToken?: {
    tokenHint: string
    expiresAt: string
  } | null
}

type ApiStatusResponse = {
  ok: boolean
  data?: {
    linkedPhone?: string | null
    linkedAt?: string | null
    activeToken?: {
      tokenHint: string
      expiresAt: string
    } | null
  }
}

type WhatsAppUiState =
  | 'loading'
  | 'connected'
  | 'not_connected'
  | 'auth_error'
  | 'error'

type ApiTokenResponse = {
  ok: boolean
  data?: {
    code: string
    expiresAt: string
    instructions?: string
  }
  message?: string
}

function formatDate(value?: string) {
  if (!value) return 'No disponible'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No disponible'
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function mapStatus(payload?: ApiStatusResponse['data']): WhatsAppLinkStatus {
  return {
    isLinked: Boolean(payload?.linkedPhone),
    phone: payload?.linkedPhone ?? undefined,
    linkedAt: payload?.linkedAt ?? undefined,
    activeToken: payload?.activeToken ?? null,
  }
}

function createApiError(status: number, message: string) {
  const error = new Error(message) as Error & { status?: number }
  error.status = status
  return error
}

function buildWhatsAppLinkMessage(code: string) {
  const text = `Hola Flowjuyu, quiero vincular mi número con este código: ${code}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

async function fetchWhatsAppLinkStatus(): Promise<WhatsAppLinkStatus> {
  const res = await apiFetch('/api/seller/whatsapp-link', { method: 'GET' })
  const json = (await res.json().catch(() => ({}))) as ApiStatusResponse

  if (!res.ok || !json.ok) {
    throw createApiError(
      res.status,
      (json as any)?.message || 'No pudimos cargar el estado de vinculación.'
    )
  }

  return mapStatus(json.data)
}

async function createLinkCode(): Promise<{ code: string; expiresAt: string }> {
  const res = await apiFetch('/api/seller/whatsapp-link/token', { method: 'POST' })
  const json = (await res.json().catch(() => ({}))) as ApiTokenResponse

  if (!res.ok || !json.ok || !json.data?.code) {
    throw createApiError(
      res.status,
      json.message || 'No pudimos generar el código.'
    )
  }

  return {
    code: json.data.code,
    expiresAt: json.data.expiresAt,
  }
}

async function revokeLink(): Promise<void> {
  const res = await apiFetch('/api/seller/whatsapp-link', { method: 'DELETE' })
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }

  if (!res.ok || !json.ok) {
    throw createApiError(
      res.status,
      json.message || 'No pudimos revocar el vínculo.'
    )
  }
}

function StatusSkeleton() {
  return (
    <Card className="rounded-2xl border border-neutral-100 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function WhatsAppLinkSection() {
  const [viewState, setViewState] = useState<WhatsAppUiState>('loading')
  const [status, setStatus] = useState<WhatsAppLinkStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generatedExpiresAt, setGeneratedExpiresAt] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)

  async function loadStatus() {
    try {
      setViewState('loading')
      setErrorMessage(null)
      const next = await fetchWhatsAppLinkStatus()
      setStatus(next)
      setViewState(next.isLinked ? 'connected' : 'not_connected')
      if (next.activeToken?.tokenHint && !generatedCode) {
        setGeneratedExpiresAt(next.activeToken.expiresAt)
      }
      if (next.isLinked) {
        setGeneratedCode(null)
        setGeneratedExpiresAt(null)
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(SESSION_CODE_KEY)
        }
      }
    } catch (error: any) {
      const nextState: WhatsAppUiState = error?.status === 401 ? 'auth_error' : 'error'
      setViewState(nextState)
      setErrorMessage(error?.message || 'No pudimos cargar el estado de WhatsApp.')
      toast.error(error?.message || 'No pudimos cargar el estado de WhatsApp.')
    } finally {
    }
  }

  useEffect(() => {
    track('whatsapp_link_viewed', {
      section: 'seller_my_business',
    })
    loadStatus()
  }, [])

  async function handleGenerateCode() {
    try {
      setGenerating(true)
      const result = await createLinkCode()
      track('whatsapp_link_token_generated', {
        section: 'seller_my_business',
        expiresAt: result.expiresAt,
      })
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(SESSION_CODE_KEY, result.code)
      }
      setGeneratedCode(result.code)
      setGeneratedExpiresAt(result.expiresAt)
      setStatus((current) => ({
        isLinked: current?.isLinked ?? false,
        phone: current?.phone,
        linkedAt: current?.linkedAt,
        activeToken: {
          tokenHint: result.code,
          expiresAt: result.expiresAt,
        },
      }))
      setViewState('not_connected')
      toast.success('Código generado. Envíalo por WhatsApp desde tu número.')
    } catch (error: any) {
      if (error?.status === 401) {
        setViewState('auth_error')
      }
      toast.error(error?.message || 'No pudimos generar el código.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRevoke() {
    try {
      setRevoking(true)
      await revokeLink()
      setGeneratedCode(null)
      setGeneratedExpiresAt(null)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SESSION_CODE_KEY)
      }
      setStatus({
        isLinked: false,
        activeToken: null,
      })
      setViewState('not_connected')
      toast.success('Vínculo revocado correctamente.')
    } catch (error: any) {
      if (error?.status === 401) {
        setViewState('auth_error')
      }
      toast.error(error?.message || 'No pudimos revocar el vínculo.')
    } finally {
      setRevoking(false)
    }
  }

  async function handleCopyCode() {
    if (!generatedCode) return
    try {
      await navigator.clipboard.writeText(generatedCode)
      toast.success('Código copiado.')
    } catch {
      toast.error('No pudimos copiar el código.')
    }
  }

  function handleOpenWhatsApp() {
    if (!generatedCode) return

    track('whatsapp_link_open_clicked', {
      section: 'seller_my_business',
      hasPendingCode: true,
    })

    window.open(buildWhatsAppLinkMessage(generatedCode), '_blank', 'noopener,noreferrer')
  }

  if (viewState === 'loading') {
    return <StatusSkeleton />
  }

  if (viewState === 'auth_error') {
    return (
      <Card className="rounded-2xl border border-amber-200 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                WhatsApp workspace
              </p>
              <h3 className="text-base font-bold text-neutral-900">No pudimos validar tu sesión</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {errorMessage || 'Tu cuenta puede seguir vinculada, pero no pudimos verificar el estado en este momento.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={loadStatus} className="rounded-full">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (viewState === 'error') {
    return (
      <Card className="rounded-2xl border border-red-200 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                WhatsApp workspace
              </p>
              <h3 className="text-base font-bold text-neutral-900">No pudimos cargar el estado</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {errorMessage || 'Hubo un problema temporal cargando el estado de WhatsApp.'}
              </p>
            </div>
          </div>
          <Button type="button" onClick={loadStatus} className="rounded-full">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const safeStatus = status ?? { isLinked: false }
  const isLinked = safeStatus.isLinked
  const hasPendingCode = !isLinked && Boolean(generatedCode)

  return (
    <Card className="rounded-2xl border border-neutral-100 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                WhatsApp workspace
              </p>
              <h3 className="text-base font-bold text-neutral-900">
                Vinculación de número
              </h3>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
                Conecta tu número para usar el asistente conversacional de productos desde WhatsApp.
              </p>
            </div>
          </div>

          <Badge variant={isLinked ? 'success' : hasPendingCode ? 'warning' : 'secondary'} className="w-fit">
            {isLinked ? 'Vinculado' : hasPendingCode ? 'Pendiente' : 'No vinculado'}
          </Badge>
        </div>

        {isLinked ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div className="space-y-2 text-sm text-emerald-900">
                <p className="font-semibold">Tu número ya está listo para usar el espacio de vendedor.</p>
                <div className="space-y-1 text-emerald-800/90">
                  <p>• Número vinculado: <span className="font-medium">{safeStatus.phone || 'No disponible'}</span></p>
                  <p>• Vinculado el: <span className="font-medium">{formatDate(safeStatus.linkedAt)}</span></p>
                </div>
                <p className="text-emerald-800/80">
                  Desde WhatsApp podrás usar comandos como <span className="font-medium">menu</span>, <span className="font-medium">mis productos</span> o <span className="font-medium">nuevo</span>.
                </p>
              </div>
            </div>
          </div>
        ) : hasPendingCode ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Código generado</p>
                  <p className="text-sm text-amber-800/90">
                    Envíalo por WhatsApp desde el número que quieres vincular.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700/80">
                      Código
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black tracking-[0.22em] text-neutral-900">
                      {generatedCode}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Expira el {formatDate(generatedExpiresAt || undefined)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:min-w-[220px]">
                    <Button
                      type="button"
                      className="gap-2 rounded-full bg-green-600 text-white hover:bg-green-700"
                      onClick={handleOpenWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Abrir WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 rounded-full"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar código
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-amber-900">
                  <p className="font-medium">Cómo usarlo:</p>
                  <p>1. Abre WhatsApp en el número que vas a vincular.</p>
                  <p>2. Envía este código al bot de Flowjuyu.</p>
                  <p>3. Cuando el vínculo se confirme, podrás vender desde ese chat.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 h-5 w-5 text-neutral-500" />
              <div className="space-y-2 text-sm text-neutral-700">
                <p className="font-semibold text-neutral-900">Todavía no has vinculado un número.</p>
                <p>
                  Genera un código temporal y envíalo desde WhatsApp para activar tu espacio conversacional.
                </p>
                <p className="text-neutral-500">
                  El código dura pocos minutos y solo se puede usar una vez.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {!isLinked && (
            <Button
              type="button"
              onClick={handleGenerateCode}
              disabled={generating}
              className="gap-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {hasPendingCode ? 'Generar nuevo código' : 'Generar código'}
            </Button>
          )}

          {isLinked && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRevoke}
              disabled={revoking}
              className="gap-2 rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
              Revocar vínculo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
