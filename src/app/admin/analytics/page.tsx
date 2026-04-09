'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, ExternalLink, Eye, Link2, RefreshCw } from 'lucide-react'
import { authFetch } from '@/lib/authFetch'
import { Skeleton } from '@/components/ui/skeleton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

type FunnelStats = {
  viewed: number
  generated: number
  opened: number
  success: number
}

type ConversionRates = {
  view_to_generate: number
  generate_to_open: number
  open_to_success: number
}

type TrendPoint = {
  date: string
  viewed: number
  generated: number
  opened: number
  success: number
}

type AnalyticsResponse<T> = {
  ok?: boolean
  data?: T
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-neutral-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
          {icon}
        </div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-80 rounded-xl" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [funnel, setFunnel] = useState<FunnelStats | null>(null)
  const [conversion, setConversion] = useState<ConversionRates | null>(null)
  const [timeseries, setTimeseries] = useState<TrendPoint[]>([])

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    setError(null)

    try {
      const [funnelRes, conversionRes, timeseriesRes] = await Promise.all([
        authFetch(`${API_URL}/api/admin/analytics/funnel`),
        authFetch(`${API_URL}/api/admin/analytics/conversion`),
        authFetch(`${API_URL}/api/admin/analytics/timeseries?days=14`),
      ])

      if (!funnelRes.ok || !conversionRes.ok || !timeseriesRes.ok) {
        throw new Error('No pudimos cargar los analytics del funnel.')
      }

      const [funnelJson, conversionJson, timeseriesJson] = (await Promise.all([
        funnelRes.json(),
        conversionRes.json(),
        timeseriesRes.json(),
      ])) as [
        AnalyticsResponse<FunnelStats>,
        AnalyticsResponse<ConversionRates>,
        AnalyticsResponse<TrendPoint[]>,
      ]

      setFunnel(funnelJson.data ?? null)
      setConversion(conversionJson.data ?? null)
      setTimeseries(timeseriesJson.data ?? [])
    } catch (nextError: any) {
      setError(nextError?.message || 'No pudimos cargar los analytics.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <PageSkeleton />
  }

  if (error || !funnel || !conversion) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-neutral-900">Analytics no disponibles</p>
        <p className="max-w-xl text-sm text-neutral-500">{error || 'No pudimos cargar el funnel de WhatsApp.'}</p>
        <button
          type="button"
          onClick={() => load(true)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">Admin analytics</p>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">WhatsApp Activation Funnel</h1>
          <p className="max-w-2xl text-sm text-neutral-500">
            Seguimiento interno del recorrido desde la vista del bloque de vinculación hasta la vinculación exitosa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">Funnel</p>
          <h2 className="text-xl font-bold text-neutral-900">Viewed → Generated → Opened → Success</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Viewed" value={funnel.viewed} icon={<Eye className="h-5 w-5" />} />
          <MetricCard label="Generated" value={funnel.generated} icon={<Link2 className="h-5 w-5" />} />
          <MetricCard label="Opened" value={funnel.opened} icon={<ExternalLink className="h-5 w-5" />} />
          <MetricCard label="Success" value={funnel.success} icon={<CheckCircle2 className="h-5 w-5" />} />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
          <span className="font-semibold text-neutral-900">{funnel.viewed}</span>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
          <span className="font-semibold text-neutral-900">{funnel.generated}</span>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
          <span className="font-semibold text-neutral-900">{funnel.opened}</span>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
          <span className="font-semibold text-emerald-700">{funnel.success}</span>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">Conversion</p>
          <h2 className="text-xl font-bold text-neutral-900">Rates between steps</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="View → Generate" value={`${conversion.view_to_generate}%`} icon={<Activity className="h-5 w-5" />} />
          <MetricCard label="Generate → Open" value={`${conversion.generate_to_open}%`} icon={<Activity className="h-5 w-5" />} />
          <MetricCard label="Open → Success" value={`${conversion.open_to_success}%`} icon={<Activity className="h-5 w-5" />} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">Daily trend</p>
          <h2 className="text-xl font-bold text-neutral-900">Last 14 days</h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            <span>Day</span>
            <span>Viewed</span>
            <span>Generated</span>
            <span>Opened</span>
            <span>Success</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {timeseries.map((row) => (
              <div key={row.date} className="grid grid-cols-5 gap-4 px-5 py-3 text-sm text-neutral-700">
                <span className="font-medium text-neutral-900">{row.date}</span>
                <span>{row.viewed}</span>
                <span>{row.generated}</span>
                <span>{row.opened}</span>
                <span className="font-semibold text-emerald-700">{row.success}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
