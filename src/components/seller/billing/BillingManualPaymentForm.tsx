// src/components/seller/billing/BillingManualPaymentForm.tsx
//
// Form the seller fills out after making a bank deposit.
// Shown inside the payment detail page when provider = "manual"
// and the payment is pending / manual_pending.
//
// UX goal (Guatemala context):
//   - Simple language, no banking jargon
//   - One clear "Confirmar depósito" action
//   - Immediate visual feedback (submitting → success → locked)

"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reportManualPayment } from "@/services/sellerBilling"
import type { ManualReport } from "@/types/billing"
import { formatQ } from "./billingFormatters"

interface Props {
  paymentId:     number
  amount:        number
  currency:      string
  /** Already have a report → show read-only */
  existingReport: ManualReport | null
  onSuccess:     (report: ManualReport) => void
}

export function BillingManualPaymentForm({
  paymentId,
  amount,
  currency,
  existingReport,
  onSuccess,
}: Props) {
  // ─── Field state ─────────────────────────────────────────────────────────────
  const [bankName,         setBankName]         = useState(existingReport?.bankName         ?? "")
  const [depositReference, setDepositReference] = useState(existingReport?.depositReference ?? "")
  const [depositorName,    setDepositorName]    = useState(existingReport?.depositorName    ?? "")
  const [depositDate,      setDepositDate]      = useState(existingReport?.depositDate      ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Already submitted — show read-only status card
  if (existingReport) {
    return <ReportStatusCard report={existingReport} />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!bankName.trim())         { setError("Indica el banco donde depositaste."); return }
    if (!depositReference.trim()) { setError("Ingresa el número de referencia del depósito."); return }
    if (!depositorName.trim())    { setError("Escribe el nombre del depositante."); return }
    if (!depositDate)             { setError("Selecciona la fecha del depósito."); return }

    setSubmitting(true)
    try {
      const report = await reportManualPayment({
        paymentId,
        bankName:         bankName.trim(),
        depositReference: depositReference.trim(),
        depositorName:    depositorName.trim(),
        depositDate,
        reportedAmount:   amount,
        currency:         currency || "GTQ",
      })
      onSuccess(report)
    } catch (err: any) {
      setError(err.message ?? "Ocurrió un error. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
        <h3 className="text-sm font-bold text-neutral-800">Confirmar tu depósito</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Completa los datos del depósito de{" "}
          <span className="font-semibold text-neutral-700">{formatQ(amount)}</span>{" "}
          para que podamos verificarlo.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">

        {/* Bank */}
        <div className="space-y-1.5">
          <Label htmlFor="bankName" className="text-xs font-semibold text-neutral-700">
            Banco donde depositaste
          </Label>
          <Input
            id="bankName"
            placeholder="Ej. Banco Industrial, BAC, Banrural…"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={submitting}
            className="text-sm"
          />
        </div>

        {/* Reference */}
        <div className="space-y-1.5">
          <Label htmlFor="depositReference" className="text-xs font-semibold text-neutral-700">
            Número de referencia o boleta
          </Label>
          <Input
            id="depositReference"
            placeholder="Número que aparece en tu comprobante"
            value={depositReference}
            onChange={(e) => setDepositReference(e.target.value)}
            disabled={submitting}
            className="text-sm"
          />
        </div>

        {/* Depositor name */}
        <div className="space-y-1.5">
          <Label htmlFor="depositorName" className="text-xs font-semibold text-neutral-700">
            Nombre del depositante
          </Label>
          <Input
            id="depositorName"
            placeholder="Nombre con el que hiciste el depósito"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
            disabled={submitting}
            className="text-sm"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="depositDate" className="text-xs font-semibold text-neutral-700">
            Fecha del depósito
          </Label>
          <Input
            id="depositDate"
            type="date"
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
            disabled={submitting}
            className="text-sm"
          />
        </div>

        {/* Amount display (read-only — locked to invoice amount) */}
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Monto depositado</span>
          <span className="text-sm font-bold text-neutral-800">{formatQ(amount)}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white font-semibold text-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Enviar confirmación de depósito
            </>
          )}
        </Button>

        <p className="text-center text-xs text-neutral-400 leading-relaxed">
          Un administrador verificará tu depósito en 1–2 días hábiles.
          Te notificaremos cuando esté aprobado.
        </p>
      </form>
    </div>
  )
}

// ─── Read-only status card (after submit or already submitted) ────────────────

function ReportStatusCard({ report }: { report: ManualReport }) {
  const statusConfig = {
    submitted:    { icon: "⏳", color: "bg-blue-50 border-blue-200",   text: "text-blue-800",   label: "Enviado — pendiente de revisión",    msg: "Tu reporte fue enviado. Un administrador lo revisará pronto." },
    under_review: { icon: "🔍", color: "bg-amber-50 border-amber-200", text: "text-amber-800",  label: "En revisión",                        msg: "Estamos verificando tu depósito. Te avisaremos cuando esté listo." },
    approved:     { icon: "✅", color: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", label: "Depósito aprobado",              msg: "Tu pago fue confirmado. ¡Tu suscripción está activa!" },
    rejected:     { icon: "❌", color: "bg-red-50 border-red-200",     text: "text-red-800",    label: "Depósito rechazado",                 msg: report.rejectionReason ?? "Tu depósito no fue aceptado. Contacta a soporte para más detalles." },
  }

  const cfg = statusConfig[report.status]

  return (
    <div className={`rounded-xl border p-5 space-y-3 ${cfg.color}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{cfg.icon}</span>
        <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
      </div>
      <p className={`text-xs leading-relaxed ${cfg.text} opacity-80`}>{cfg.msg}</p>

      <div className="space-y-1.5 pt-1 border-t border-black/5">
        <InfoRow label="Banco"       value={report.bankName} />
        <InfoRow label="Referencia"  value={report.depositReference} />
        <InfoRow label="Depositante" value={report.depositorName} />
        <InfoRow label="Fecha"       value={report.depositDate} />
        <InfoRow label="Monto"       value={formatQ(report.reportedAmount)} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-700">{value}</span>
    </div>
  )
}
