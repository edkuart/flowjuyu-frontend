"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Gift,
  AlertCircle,
  TrendingUp,
  Shield,
  Lock,
  Wand2,
} from "lucide-react";
import {
  SellerPanelHeader,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import {
  fetchAiCreditsBalance,
  fetchAiCreditPackages,
  fetchAiCreditTransactions,
  fetchAiCreditPurchaseRequests,
  fetchAiCreditPaymentOptions,
  createAiCreditCheckout,
  captureAiCreditPayment,
  AI_CREDIT_COSTS,
  type AiCreditPackage,
  type AiCreditTransaction,
  type AiCreditPurchaseRequest,
  type AiCreditPaymentProvider,
  type AiCreditPaymentProviderId,
} from "@/services/aiCredits";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtGtq(n: number) {
  return `Q${Number(n).toFixed(2)}`;
}

type Tab = "history" | "requests";

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Hero de saldo — el número como activo financiero.
 * Verde profundo + tipografía display + microtextura de luz.
 */
function BalanceHero({
  balance,
  loading,
}: {
  balance: number;
  loading: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0f3d3a] px-6 pt-7 pb-6 text-white shadow-[0_24px_60px_-30px_rgba(15,61,58,0.55)]">
      {/* Glow / luz superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(31,106,97,0.45)_0%,transparent_70%)]"
      />

      {/* Eyebrow */}
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.22em] text-white/55 uppercase">
          <span className="h-1 w-1 rounded-full bg-emerald-300" />
          Saldo disponible
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/70 backdrop-blur">
          IA · Flowjuyu
        </span>
      </div>

      {/* Número */}
      {loading ? (
        <div className="mt-5 h-16 w-44 animate-pulse rounded-2xl bg-white/10" />
      ) : (
        <div className="relative mt-4 flex items-baseline gap-3">
          <span className="text-[64px] leading-[0.9] font-bold tracking-tight tabular-nums">
            {balance.toLocaleString("es-GT")}
          </span>
          <span className="text-lg font-medium text-white/55">créditos</span>
        </div>
      )}

      {/* Microcopy motivacional */}
      <p className="relative mt-5 max-w-[28ch] text-[13px] leading-relaxed text-white/65">
        Genera más, crece más. Tu próxima campaña, video o canvas empieza aquí.
      </p>
    </div>
  );
}

/**
 * Tabla de costos colapsable — referencia rápida sin saturar.
 */
function CostTable({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--seller-line)] bg-white/70 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-[var(--seller-ink)]"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)]">
            <Zap className="h-3.5 w-3.5 text-[var(--seller-accent)]" />
          </span>
          ¿Cuánto cuesta cada operación?
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[var(--seller-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--seller-muted)]" />
        )}
      </button>
      {open && (
        <div className="border-t border-[var(--seller-line)] px-4 pt-3 pb-4">
          <div className="space-y-2.5">
            {Object.entries(AI_CREDIT_COSTS).map(
              ([key, { label, credits }]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--seller-muted)]">{label}</span>
                  <span className="rounded-md bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] px-2 py-0.5 text-xs font-semibold text-[var(--seller-accent)] tabular-nums">
                    {credits} cr.
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card de paquete — vertical, jerarquía clara, "Más popular" destacado.
 */
function PackageCard({
  pkg,
  selected,
  onSelect,
  badge,
  highlight,
}: {
  pkg: AiCreditPackage;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  highlight?: boolean;
}) {
  const pricePerCredit = pkg.price_gtq / pkg.credits;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col rounded-3xl border p-5 text-left transition-all duration-200 ${
        selected
          ? "border-[var(--seller-accent)] bg-white shadow-[0_18px_40px_-20px_rgba(15,61,58,0.45)] ring-2 ring-[var(--seller-accent)] ring-offset-2 ring-offset-[#f8f5ef]"
          : highlight
            ? "border-[var(--seller-accent)]/30 bg-white shadow-[0_10px_30px_-18px_rgba(15,61,58,0.35)] hover:border-[var(--seller-accent)]"
            : "border-[var(--seller-line)] bg-white/80 hover:border-[var(--seller-accent)]/40 hover:bg-white"
      }`}
    >
      {/* Badge superior */}
      {badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase shadow-[0_4px_12px_-4px_rgba(15,61,58,0.4)] ${
            highlight
              ? "bg-[var(--seller-accent)] text-white"
              : "bg-white text-[var(--seller-accent)] ring-1 ring-[var(--seller-accent)]/30"
          }`}
        >
          {highlight && <Sparkles className="mr-1 inline h-2.5 w-2.5" />}
          {badge}
        </span>
      )}

      {/* Check selected */}
      <span
        className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full transition ${
          selected
            ? "bg-[var(--seller-accent)] text-white"
            : "border border-[var(--seller-line)] bg-white"
        }`}
      >
        {selected && <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />}
      </span>

      {/* Nombre */}
      <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
        {pkg.name}
      </span>

      {/* Créditos — número protagonista */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl leading-none font-bold tracking-tight text-[var(--seller-ink)] tabular-nums">
          {pkg.credits.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-[var(--seller-muted)]">
          cr.
        </span>
      </div>

      {/* Divisor sutil */}
      <div className="my-4 h-px w-10 bg-[var(--seller-line)]" />

      {/* Precio */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl leading-none font-bold text-[var(--seller-accent)] tabular-nums">
          {fmtGtq(pkg.price_gtq)}
        </span>
      </div>

      {/* Precio por crédito — métrica de valor */}
      <span className="mt-2 text-[11px] text-[var(--seller-muted)] tabular-nums">
        {fmtGtq(pricePerCredit)} / crédito
      </span>
    </button>
  );
}

const PACKAGE_BADGES: Record<number, { label: string; highlight?: boolean }> = {
  1: { label: "Más popular", highlight: true },
  3: { label: "Mejor precio" },
};

/**
 * Form de compra — selección + método de pago + CTA irresistible.
 */
function PurchaseForm({
  packages,
  providers,
}: {
  packages: AiCreditPackage[];
  providers: AiCreditPaymentProvider[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] =
    useState<AiCreditPaymentProviderId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentPanelRef = useRef<HTMLDivElement | null>(null);

  const selected = packages.find((p) => p.id === selectedId) ?? null;
  const availableProviders = providers.filter((p) => p.available);
  const activeProvider =
    selectedProvider ??
    availableProviders.find((p) => p.preferred)?.id ??
    availableProviders[0]?.id ??
    null;

  function handlePackageSelect(packageId: number) {
    setSelectedId(packageId);
    window.setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !activeProvider) return;
    setSubmitting(true);
    setError(null);
    try {
      const { url } = await createAiCreditCheckout({
        packageId: selectedId,
        provider: activeProvider,
        returnTo: "/seller/ai-credits?credit_success=1",
        source: "ai_credits",
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar el pago");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Grid de paquetes — 1 col móvil con highlight, 2x2 sm, 4 col lg */}
      <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg, i) => {
          const badge = PACKAGE_BADGES[i];
          return (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selectedId === pkg.id}
              onSelect={() => handlePackageSelect(pkg.id)}
              badge={badge?.label}
              highlight={badge?.highlight}
            />
          );
        })}
      </div>

      {/* Panel inferior — método de pago + CTA, aparece al seleccionar */}
      {selected && (
        <div
          ref={paymentPanelRef}
          className="scroll-mt-24 space-y-4 rounded-3xl border border-[var(--seller-line)] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(15,61,58,0.3)]"
        >
          {/* Resumen */}
          <div className="flex items-center justify-between border-b border-dashed border-[var(--seller-line)] pb-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">
                Resumen de compra
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--seller-ink)]">
                <span className="tabular-nums">
                  {selected.credits.toLocaleString()}
                </span>{" "}
                créditos · {selected.name}
              </p>
            </div>
            <p className="text-xl font-bold text-[var(--seller-accent)] tabular-nums">
              {fmtGtq(selected.price_gtq)}
            </p>
          </div>

          {/* Método de pago — múltiples */}
          {availableProviders.length > 1 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--seller-muted)] uppercase">
                Método de pago
              </p>
              <div className="flex flex-wrap gap-2">
                {availableProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                      activeProvider === provider.id
                        ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] text-[var(--seller-ink)]"
                        : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:text-[var(--seller-ink)]"
                    }`}
                  >
                    {activeProvider === provider.id && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--seller-accent)]" />
                    )}
                    {provider.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Provider único — confianza compacta */}
          {availableProviders.length === 1 && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Lock className="h-4 w-4 text-[var(--seller-accent)]" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--seller-ink)]">
                  Pago seguro vía {availableProviders[0].label}
                </p>
                <p className="truncate text-[11px] text-[var(--seller-muted)]">
                  {availableProviders[0].description}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* CTA irresistible — verde acento, sombra firma, ícono */}
          <button
            type="submit"
            disabled={submitting || !activeProvider}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgba(15,61,58,0.55)] transition-all hover:shadow-[0_18px_36px_-12px_rgba(15,61,58,0.65)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
          >
            {/* Shimmer en hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            {submitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Conectando con el pago…</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>
                  Activar {selected.credits.toLocaleString()} créditos ·{" "}
                  {fmtGtq(selected.price_gtq)}
                </span>
              </>
            )}
          </button>

          {/* Trust microcopy */}
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-[var(--seller-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Pago seguro
            </span>
            <span className="h-3 w-px bg-[var(--seller-line)]" />
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Activación instantánea
            </span>
          </div>
        </div>
      )}

      {/* Empty state — invita a seleccionar */}
      {!selected && (
        <div className="rounded-2xl border border-dashed border-[var(--seller-line)] bg-white/40 px-4 py-3 text-center">
          <p className="text-xs text-[var(--seller-muted)]">
            ↑ Selecciona un paquete para continuar al pago
          </p>
        </div>
      )}
    </form>
  );
}

function TxIcon({ type }: { type: AiCreditTransaction["type"] }) {
  const map: Record<string, { icon: React.ReactNode; bg: string }> = {
    purchase: {
      icon: <ArrowDownLeft className="h-4 w-4" />,
      bg: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    },
    debit: {
      icon: <ArrowUpRight className="h-4 w-4" />,
      bg: "bg-red-50 text-red-600 ring-1 ring-red-100",
    },
    refund: {
      icon: <RotateCcw className="h-4 w-4" />,
      bg: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    },
    manual_grant: {
      icon: <Gift className="h-4 w-4" />,
      bg: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    },
    plan_renewal: {
      icon: <RefreshCw className="h-4 w-4" />,
      bg: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
    },
  };
  const { icon, bg } = map[type] ?? map.debit;
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}
    >
      {icon}
    </div>
  );
}

function TransactionList({
  transactions,
  loading,
}: {
  transactions: AiCreditTransaction[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
          <Clock className="h-5 w-5 text-[var(--seller-accent)]" />
        </div>
        <p className="text-sm font-medium text-[var(--seller-ink)]">
          Sin movimientos aún
        </p>
        <p className="mt-1 text-xs text-[var(--seller-muted)]">
          Tus compras y consumos aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--seller-line)]">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-3 py-3.5">
          <TxIcon type={tx.type} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--seller-ink)]">
              {tx.description}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--seller-muted)]">
              {fmt(tx.created_at)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-bold tabular-nums ${
                tx.credits > 0 ? "text-emerald-600" : "text-[var(--seller-ink)]"
              }`}
            >
              {tx.credits > 0 ? "+" : ""}
              {tx.credits}
            </span>
            <p className="text-[10px] text-[var(--seller-muted)] tabular-nums">
              saldo {tx.balance_after}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestStatusBadge({
  status,
}: {
  status: AiCreditPurchaseRequest["status"];
}) {
  const map: Record<
    string,
    { tone: "success" | "warning" | "danger" | "neutral"; label: string }
  > = {
    pending: { tone: "neutral", label: "Pendiente" },
    under_review: { tone: "warning", label: "En revisión" },
    approved: { tone: "success", label: "Aprobada" },
    rejected: { tone: "danger", label: "Rechazada" },
  };
  const { tone, label } = map[status] ?? map.pending;
  return <SellerPill tone={tone}>{label}</SellerPill>;
}

function RequestList({
  requests,
  loading,
}: {
  requests: AiCreditPurchaseRequest[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
          <CheckCircle2 className="h-5 w-5 text-[var(--seller-accent)]" />
        </div>
        <p className="text-sm font-medium text-[var(--seller-ink)]">
          Sin solicitudes
        </p>
        <p className="mt-1 text-xs text-[var(--seller-muted)]">
          Las solicitudes manuales aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--seller-line)]">
      {requests.map((req) => (
        <div key={req.id} className="py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--seller-ink)]">
                {req.package_name ?? `Paquete #${req.package_id}`} —{" "}
                <span className="tabular-nums">{req.credits}</span> créditos
              </p>
              <p className="mt-0.5 text-xs text-[var(--seller-muted)]">
                {fmtGtq(req.price_gtq)} · Solicitado el {fmt(req.created_at)}
              </p>
              {req.status === "rejected" && req.rejection_reason && (
                <p className="mt-1.5 rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-700">
                  Motivo: {req.rejection_reason}
                </p>
              )}
            </div>
            <RequestStatusBadge status={req.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SellerAiCreditsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<AiCreditPackage[]>([]);
  const [txns, setTxns] = useState<AiCreditTransaction[]>([]);
  const [requests, setRequests] = useState<AiCreditPurchaseRequest[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<
    AiCreditPaymentProvider[]
  >([]);

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [capturingPayment, setCapturingPayment] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [costOpen, setCostOpen] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<
    "success" | "cancel" | null
  >(null);

  const loadBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      setBalance(await fetchAiCreditsBalance());
    } catch {
      /* keep 0 */
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    void loadBalance();
    fetchAiCreditPackages()
      .then(setPackages)
      .catch(() => {})
      .finally(() => setLoadingPackages(false));
    fetchAiCreditTransactions({ limit: 30 })
      .then(({ transactions }) => setTxns(transactions))
      .catch(() => {})
      .finally(() => setLoadingTxns(false));
    fetchAiCreditPurchaseRequests({ limit: 20 })
      .then(({ requests: r }) => setRequests(r))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
    fetchAiCreditPaymentOptions()
      .then(setPaymentProviders)
      .catch(() => setPaymentProviders([]));
  }, [loadBalance]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalToken = params.get("token");
    if (params.get("provider") === "paypal" && paypalToken) {
      setCapturingPayment(true);
      captureAiCreditPayment({ provider: "paypal", orderId: paypalToken })
        .then(() => {
          setCheckoutNotice("success");
          setActiveTab("history");
          void loadBalance();
          fetchAiCreditTransactions({ limit: 30 })
            .then(({ transactions }) => setTxns(transactions))
            .catch(() => {});
        })
        .catch(() => setCheckoutNotice("cancel"))
        .finally(() => {
          setCapturingPayment(false);
          router.replace("/seller/ai-credits", { scroll: false } as any);
        });
    } else if (params.get("credit_success") === "1") {
      setCheckoutNotice("success");
      setActiveTab("history");
      router.replace("/seller/ai-credits", { scroll: false } as any);
    } else if (params.get("credit_cancel") === "1") {
      setCheckoutNotice("cancel");
      router.replace("/seller/ai-credits", { scroll: false } as any);
    }
  }, [loadBalance, router]);

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      {/* Wrapper editorial — un poco más ancho que el original para respirar */}
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        {/* ── 1. Header editorial ──────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--seller-accent)] uppercase">
              IA · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-[28px] leading-[1.05] font-bold tracking-tight text-[var(--seller-ink)]">
              Créditos de IA
            </h1>
            <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-[var(--seller-muted)]">
              Recarga para generar contenido, canvas y videos sin frenarte.
            </p>
          </div>
        </div>

        {/* ── 2. Banners de estado (success / capturing / cancel) ── */}
        {checkoutNotice === "success" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold">¡Pago recibido!</p>
              <p className="mt-0.5 text-xs text-emerald-800/80">
                Tus créditos estarán disponibles en unos segundos.
              </p>
            </div>
          </div>
        )}

        {capturingPayment && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-blue-900">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </span>
            <div>
              <p className="font-semibold">Confirmando pago…</p>
              <p className="mt-0.5 text-xs text-blue-800/80">
                Acreditando tus créditos.
              </p>
            </div>
          </div>
        )}

        {checkoutNotice === "cancel" && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
              <XCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold">Pago cancelado</p>
              <p className="mt-0.5 text-xs text-amber-800/80">
                No se cargaron créditos. Puedes intentarlo de nuevo cuando
                quieras.
              </p>
            </div>
          </div>
        )}

        {/* ── 3. Hero de saldo + tabla de costos ────────────────── */}
        <div className="space-y-3">
          <BalanceHero balance={balance} loading={loadingBalance} />
          <CostTable open={costOpen} setOpen={setCostOpen} />
        </div>

        {/* ── 4. Sección de compra — corazón de conversión ──────── */}
        <section className="rounded-3xl border border-[var(--seller-line)] bg-white/60 p-5 backdrop-blur sm:p-6">
          {/* Encabezado de sección con jerarquía editorial */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-[var(--seller-accent)] uppercase">
                <TrendingUp className="h-3 w-3" />
                Recarga
              </p>
              <h2 className="mt-1.5 text-xl leading-tight font-bold tracking-tight text-[var(--seller-ink)]">
                Elige tu paquete
              </h2>
              <p className="mt-1 text-xs text-[var(--seller-muted)]">
                Pago único · sin suscripción · créditos no expiran
              </p>
            </div>
          </div>

          <div className="mt-5">
            {loadingPackages ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-3xl bg-gray-100/70"
                  />
                ))}
              </div>
            ) : (
              <PurchaseForm packages={packages} providers={paymentProviders} />
            )}
          </div>
        </section>

        {/* ── 5. Tabs Historial + Solicitudes ───────────────────── */}
        <section className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
          <div className="flex gap-1 border-b border-[var(--seller-line)] px-3 pt-3">
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Historial"
            />
            <TabButton
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Mis solicitudes"
            />
          </div>
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            {activeTab === "history" && (
              <TransactionList transactions={txns} loading={loadingTxns} />
            )}
            {activeTab === "requests" && (
              <RequestList requests={requests} loading={loadingRequests} />
            )}
          </div>
        </section>

        {/* ── 6. Footer microcopy de confianza ──────────────────── */}
        <p className="px-2 pt-2 pb-4 text-center text-[11px] leading-relaxed text-[var(--seller-muted)]">
          ¿Necesitas un volumen mayor o factura especial?{" "}
          <span className="font-medium text-[var(--seller-ink)] underline-offset-2 hover:underline">
            Habla con nuestro equipo
          </span>
          .
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--seller-accent)] text-[var(--seller-accent)]"
          : "border-transparent text-[var(--seller-muted)] hover:text-[var(--seller-ink)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
