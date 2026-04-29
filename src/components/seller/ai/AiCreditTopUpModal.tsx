"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Sparkles, X } from "lucide-react";
import {
  createAiCreditCheckout,
  fetchAiCreditPackages,
  fetchAiCreditPaymentOptions,
  type AiCreditPackage,
  type AiCreditPaymentProvider,
  type AiCreditPaymentProviderId,
} from "@/services/aiCredits";

function fmtGtq(n: number) {
  return `Q${Number(n).toFixed(2)}`;
}

export default function AiCreditTopUpModal({
  open,
  onClose,
  returnTo,
  source,
  title = "Comprar créditos de IA",
  description = "Elige un paquete y vuelve automáticamente a tu flujo.",
}: {
  open: boolean;
  onClose: () => void;
  returnTo: string;
  source: string;
  title?: string;
  description?: string;
}) {
  const [packages, setPackages] = useState<AiCreditPackage[]>([]);
  const [providers, setProviders] = useState<AiCreditPaymentProvider[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AiCreditPaymentProviderId | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchAiCreditPackages(), fetchAiCreditPaymentOptions()])
      .then(([pkgList, providerList]) => {
        setPackages(pkgList);
        setProviders(providerList);
        setSelectedPackageId((current) => current ?? pkgList[0]?.id ?? null);
        const available = providerList.filter((p) => p.available);
        setSelectedProvider(
          (current) =>
            current ??
            available.find((p) => p.preferred)?.id ??
            available[0]?.id ??
            null,
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar pagos"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) ?? packages[0] ?? null;
  const availableProvider = selectedProvider
    ? providers.find((p) => p.id === selectedProvider)
    : null;
  const pricePerCredit =
    selectedPackage && selectedPackage.credits > 0
      ? selectedPackage.price_gtq / selectedPackage.credits
      : null;

  async function handlePay() {
    if (!selectedPackage || !availableProvider?.available) return;
    setPaying(true);
    setError(null);
    try {
      const checkout = await createAiCreditCheckout({
        packageId: selectedPackage.id,
        provider: availableProvider.id,
        returnTo,
        source,
      });
      window.location.href = checkout.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar el pago");
      setPaying(false);
    }
  }

  return (
    /*
     * Backdrop — z-[200] ensures it beats the layout's z-0 stacking context.
     * Mobile: bottom sheet (items-end) — slides up from bottom, never conflicts with header.
     * Desktop (sm+): centered modal (items-center).
     */
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — visible en mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[var(--seller-line)]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--seller-line)] px-5 py-4">
          <div>
            <p className="text-base font-bold leading-tight text-[var(--seller-ink)]">{title}</p>
            <p className="mt-0.5 max-w-[22rem] text-xs leading-snug text-[var(--seller-muted)]">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--seller-muted)] hover:bg-[var(--seller-panel)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[60dvh] space-y-4 overflow-y-auto px-5 py-4 sm:max-h-[62vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-[var(--seller-muted)]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando opciones
            </div>
          ) : (
            <>
              {/* Package grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--seller-muted)] uppercase">
                    Paquete
                  </p>
                  {pricePerCredit !== null && (
                    <p className="text-[11px] font-medium text-[var(--seller-muted)]">
                      {fmtGtq(pricePerCredit)} / crédito
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {packages.map((pkg) => {
                    const selected = selectedPackage?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`relative rounded-xl border px-3 py-2.5 text-left transition ${
                          selected
                            ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] ring-1 ring-[var(--seller-accent)]"
                            : "border-[var(--seller-line)] bg-white hover:border-[var(--seller-line-strong)]"
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-[var(--seller-accent)]" />
                        )}
                        <span className="line-clamp-1 block pr-4 text-[9px] font-semibold tracking-wide text-[var(--seller-muted)] uppercase">
                          {pkg.name.replace("Paquete ", "")}
                        </span>
                        <span className="mt-1 block text-xl leading-none font-bold text-[var(--seller-ink)]">
                          {pkg.credits}
                          <span className="ml-0.5 text-xs font-medium text-[var(--seller-muted)]">
                            cr.
                          </span>
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-[var(--seller-accent)]">
                          {fmtGtq(pkg.price_gtq)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--seller-muted)] uppercase">
                    Método de pago
                  </p>
                  <p className="text-[11px] font-medium text-[var(--seller-muted)]">
                    Pago seguro alojado
                  </p>
                </div>
                <div className="space-y-2">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      disabled={!provider.available}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`flex min-h-0 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        selectedProvider === provider.id
                          ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] ring-1 ring-[var(--seller-accent)]"
                          : "border-[var(--seller-line)] bg-white"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--seller-panel)] text-[var(--seller-accent)]">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight text-[var(--seller-ink)]">
                          {provider.label}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[11px] leading-snug text-[var(--seller-muted)]">
                          {provider.available ? provider.description : provider.unavailableReason}
                        </span>
                      </span>
                      {selectedProvider === provider.id && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--seller-accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-center text-xs text-red-500">{error}</p>}
          <div className="h-1" />
        </div>

        {/* Sticky footer CTA */}
        <div className="border-t border-[var(--seller-line)] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={loading || paying || !selectedPackage || !availableProvider?.available}
            onClick={handlePay}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--seller-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(15,61,58,0.5)] transition hover:opacity-90 disabled:opacity-50 disabled:shadow-none"
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conectando
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Comprar créditos y volver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
