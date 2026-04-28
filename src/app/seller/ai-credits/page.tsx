"use client";

import { useEffect, useState, useCallback } from "react";
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
  createAiCreditCheckout,
  AI_CREDIT_COSTS,
  type AiCreditPackage,
  type AiCreditTransaction,
  type AiCreditPurchaseRequest,
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

function BalanceHero({
  balance,
  loading,
}: {
  balance: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f3d3a_0%,#14544f_52%,#1f6a61_100%)] p-6 text-white shadow-[0_22px_45px_-28px_rgba(15,61,58,0.45)]">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
        Saldo disponible
      </p>
      {loading ? (
        <div className="mt-3 h-12 w-32 animate-pulse rounded-xl bg-white/10" />
      ) : (
        <div className="mt-2 flex items-end gap-3">
          <span className="text-5xl leading-none font-bold tabular-nums">
            {balance}
          </span>
          <span className="mb-1 text-lg font-medium text-white/70">
            créditos
          </span>
        </div>
      )}
      <p className="mt-4 text-xs text-white/60">
        Los créditos se usan para generar contenido, canvas y videos con IA.
      </p>
    </div>
  );
}

function CostTable({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--seller-line)] bg-white/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--seller-ink)]"
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--seller-accent)]" />
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
          <div className="space-y-2">
            {Object.entries(AI_CREDIT_COSTS).map(
              ([key, { label, credits }]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--seller-muted)]">{label}</span>
                  <span className="font-semibold text-[var(--seller-ink)] tabular-nums">
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

function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: AiCreditPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const pricePerCredit = (pkg.price_gtq / pkg.credits).toFixed(2);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] shadow-[0_10px_24px_-20px_rgba(15,61,58,0.35)]"
          : "border-[var(--seller-line)] bg-white hover:border-[var(--seller-line-strong)]"
      }`}
    >
      {selected && (
        <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-[var(--seller-accent)]" />
      )}
      <span className="text-xs font-semibold tracking-wide text-[var(--seller-muted)] uppercase">
        {pkg.name}
      </span>
      <span className="text-3xl font-bold text-[var(--seller-ink)] tabular-nums">
        {pkg.credits}
        <span className="ml-1 text-base font-normal text-[var(--seller-muted)]">
          cr.
        </span>
      </span>
      <span className="text-lg font-semibold text-[var(--seller-accent)]">
        {fmtGtq(pkg.price_gtq)}
      </span>
      <span className="text-xs text-[var(--seller-muted)]">
        {fmtGtq(Number(pricePerCredit))} / crédito
      </span>
    </button>
  );
}

function PurchaseForm({ packages }: { packages: AiCreditPackage[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = packages.find((p) => p.id === selectedId) ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { url } = await createAiCreditCheckout({ packageId: selectedId });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar el pago");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedId === pkg.id}
            onSelect={() => setSelectedId(pkg.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">Pago seguro alojado</p>
            <p className="mt-1 leading-relaxed text-emerald-700">
              Te redirigiremos al checkout por{" "}
              <strong>{fmtGtq(selected.price_gtq)}</strong>. Los créditos se
              activan automáticamente cuando el proveedor confirma el pago.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--seller-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Conectando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Pagar {selected.credits}{" "}
                créditos por {fmtGtq(selected.price_gtq)}
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

function TxIcon({ type }: { type: AiCreditTransaction["type"] }) {
  const map: Record<string, { icon: React.ReactNode; bg: string }> = {
    purchase: {
      icon: <ArrowDownLeft className="h-4 w-4" />,
      bg: "bg-emerald-100 text-emerald-600",
    },
    debit: {
      icon: <ArrowUpRight className="h-4 w-4" />,
      bg: "bg-red-100 text-red-500",
    },
    refund: {
      icon: <RotateCcw className="h-4 w-4" />,
      bg: "bg-blue-100 text-blue-600",
    },
    manual_grant: {
      icon: <Gift className="h-4 w-4" />,
      bg: "bg-amber-100 text-amber-600",
    },
    plan_renewal: {
      icon: <RefreshCw className="h-4 w-4" />,
      bg: "bg-violet-100 text-violet-600",
    },
  };
  const { icon, bg } = map[type] ?? map.debit;
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}
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
            <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-100" />
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
      <p className="py-8 text-center text-sm text-[var(--seller-muted)]">
        Aún no tienes movimientos de créditos.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--seller-line)]">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-3 py-3">
          <TxIcon type={tx.type} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--seller-ink)]">
              {tx.description}
            </p>
            <p className="text-xs text-[var(--seller-muted)]">
              {fmt(tx.created_at)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-semibold tabular-nums ${tx.credits > 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {tx.credits > 0 ? "+" : ""}
              {tx.credits}
            </span>
            <p className="text-[11px] text-[var(--seller-muted)]">
              saldo: {tx.balance_after}
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
      <p className="py-8 text-center text-sm text-[var(--seller-muted)]">
        Aún no has solicitado créditos. Selecciona un paquete arriba.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--seller-line)]">
      {requests.map((req) => (
        <div key={req.id} className="py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--seller-ink)]">
                {req.package_name ?? `Paquete #${req.package_id}`} —{" "}
                {req.credits} créditos
              </p>
              <p className="mt-0.5 text-xs text-[var(--seller-muted)]">
                {fmtGtq(req.price_gtq)} · Solicitado el {fmt(req.created_at)}
              </p>
              {req.status === "rejected" && req.rejection_reason && (
                <p className="mt-1 text-xs text-red-600">
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

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

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
  }, [loadBalance]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("credit_success") === "1") {
      setCheckoutNotice("success");
      setActiveTab("history");
      router.replace("/seller/ai-credits", { scroll: false } as any);
    } else if (params.get("credit_cancel") === "1") {
      setCheckoutNotice("cancel");
      router.replace("/seller/ai-credits", { scroll: false } as any);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <SellerSurfaceCard className="overflow-hidden">
          <SellerPanelHeader
            eyebrow="IA seller"
            title="Créditos de IA"
            description="Compra créditos para generar contenido, canvas y videos con inteligencia artificial."
            action={
              <SellerPill tone="neutral">
                {loadingBalance ? "—" : `${balance} cr.`}
              </SellerPill>
            }
          />
        </SellerSurfaceCard>

        {checkoutNotice === "success" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Pago recibido</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Tus créditos se acreditan desde el webhook del proveedor. Si el
                saldo tarda unos segundos, refresca esta vista.
              </p>
            </div>
          </div>
        )}

        {checkoutNotice === "cancel" && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Pago cancelado</p>
              <p className="mt-0.5 text-xs text-amber-700">
                No se cargaron créditos. Puedes elegir otro paquete cuando estés
                listo.
              </p>
            </div>
          </div>
        )}

        {/* Balance + cost table */}
        <SellerSurfaceCard>
          <div className="space-y-4">
            <BalanceHero balance={balance} loading={loadingBalance} />
            <CostTable open={costOpen} setOpen={setCostOpen} />
          </div>
        </SellerSurfaceCard>

        {/* Buy credits */}
        <SellerSurfaceCard className="overflow-hidden">
          <div className="border-b border-[var(--seller-line)] px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--seller-muted)] uppercase">
              Comprar créditos
            </p>
            <p className="mt-0.5 text-sm text-[var(--seller-ink)]">
              Elige un paquete y paga en checkout seguro. La acreditación ocurre
              al confirmar el proveedor.
            </p>
          </div>
          <div className="p-5">
            {loadingPackages ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <PurchaseForm packages={packages} />
            )}
          </div>
        </SellerSurfaceCard>

        {/* History + Requests tabs */}
        <SellerSurfaceCard className="overflow-hidden">
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
          <div className="p-5">
            {activeTab === "history" && (
              <TransactionList transactions={txns} loading={loadingTxns} />
            )}
            {activeTab === "requests" && (
              <RequestList requests={requests} loading={loadingRequests} />
            )}
          </div>
        </SellerSurfaceCard>
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
      className={`flex items-center gap-1.5 rounded-t-[var(--seller-radius-md)] border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] text-[var(--seller-accent)]"
          : "border-transparent text-[var(--seller-muted)] hover:text-[var(--seller-ink)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
