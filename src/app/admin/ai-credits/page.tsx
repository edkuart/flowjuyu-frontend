"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Coins,
  Gift,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  fetchAdminAiCreditPurchaseRequests,
  fetchAdminAiCreditSummary,
  fetchAdminAiCreditTransactions,
  grantAdminAiCredits,
  searchAdminAiCreditSellers,
  type AdminAiCreditPurchaseRequest,
  type AdminAiCreditSeller,
  type AdminAiCreditSummary,
  type AdminAiCreditTransaction,
} from "@/services/adminAiCredits";

const TX_TYPES = [
  { value: "", label: "Todos" },
  { value: "purchase", label: "Compras" },
  { value: "debit", label: "Usos" },
  { value: "refund", label: "Refunds" },
  { value: "manual_grant", label: "Promos" },
  { value: "plan_renewal", label: "Planes" },
];

const PAYMENT_STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "approved", label: "Pagados" },
  { value: "pending", label: "Pendientes" },
  { value: "rejected", label: "Cancelados" },
];

const GRANT_CATEGORIES = [
  { value: "promotion", label: "Promoción" },
  { value: "support", label: "Soporte" },
  { value: "compensation", label: "Compensación" },
  { value: "internal_test", label: "Prueba interna" },
  { value: "correction", label: "Corrección" },
];

function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fmtGtq(value: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(value);
}

function typeLabel(type: string) {
  return TX_TYPES.find((item) => item.value === type)?.label ?? type;
}

function paymentStatusLabel(status: AdminAiCreditPurchaseRequest["status"]) {
  if (status === "approved") return "Pagado";
  if (status === "rejected") return "No pagado";
  if (status === "under_review") return "En revisión";
  return "Pendiente";
}

function paymentStatusClass(status: AdminAiCreditPurchaseRequest["status"]) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "under_review") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-card rounded-xl border px-4 py-3">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-2xl font-bold tabular-nums">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
    </div>
  );
}

export default function AdminAiCreditsPage() {
  const [summary, setSummary] = useState<AdminAiCreditSummary | null>(null);
  const [transactions, setTransactions] = useState<AdminAiCreditTransaction[]>(
    [],
  );
  const [requests, setRequests] = useState<AdminAiCreditPurchaseRequest[]>([]);
  const [sellers, setSellers] = useState<AdminAiCreditSeller[]>([]);
  const [selectedSeller, setSelectedSeller] =
    useState<AdminAiCreditSeller | null>(null);

  const [search, setSearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [txType, setTxType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [grantCredits, setGrantCredits] = useState("70");
  const [grantCategory, setGrantCategory] = useState("promotion");
  const [grantReason, setGrantReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [granting, setGranting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBalanceAfter = useMemo(() => {
    if (!selectedSeller) return null;
    const credits = Number(grantCredits);
    if (!Number.isFinite(credits) || credits <= 0) return null;
    return selectedSeller.ai_credits_balance + Math.floor(credits);
  }, [grantCredits, selectedSeller]);

  const loadData = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const [summaryData, txData, requestData] = await Promise.all([
          fetchAdminAiCreditSummary(),
          fetchAdminAiCreditTransactions({ search, type: txType, limit: 80 }),
          fetchAdminAiCreditPurchaseRequests({
            status: paymentStatus,
            limit: 40,
          }),
        ]);
        setSummary(summaryData);
        setTransactions(txData.transactions);
        setRequests(requestData.requests);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar créditos IA",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [paymentStatus, search, txType],
  );

  const loadSellers = useCallback(async () => {
    try {
      const rows = await searchAdminAiCreditSellers(sellerSearch);
      setSellers(rows);
      if (!selectedSeller && rows[0]) setSelectedSeller(rows[0]);
    } catch {
      setSellers([]);
    }
  }, [selectedSeller, sellerSearch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadSellers(), 250);
    return () => window.clearTimeout(id);
  }, [loadSellers]);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSeller) return;

    const credits = Number(grantCredits);
    if (!Number.isFinite(credits) || credits <= 0) {
      setError("Ingresa una cantidad válida de créditos");
      return;
    }
    if (grantReason.trim().length < 8) {
      setError("Agrega un motivo claro para la auditoría");
      return;
    }

    setGranting(true);
    setError(null);
    setNotice(null);
    try {
      await grantAdminAiCredits({
        sellerId: selectedSeller.seller_id,
        credits: Math.floor(credits),
        category: grantCategory,
        reason: grantReason.trim(),
      });
      setNotice(
        `Se acreditaron ${Math.floor(credits)} créditos a ${selectedSeller.seller_name || selectedSeller.seller_email}`,
      );
      setGrantReason("");
      await Promise.all([loadData(true), loadSellers()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo acreditar");
    } finally {
      setGranting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs">
          Cargando control de créditos IA...
        </p>
        <div className="grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-28 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="bg-muted h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Créditos IA</h1>
              <p className="text-muted-foreground text-sm">
                Control de saldos, pagos confirmados y acreditaciones manuales.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="bg-card hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      {(notice || error) && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ? (
            <XCircle className="mt-0.5 h-4 w-4" />
          ) : (
            <Activity className="mt-0.5 h-4 w-4" />
          )}
          <span>{error || notice}</span>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-5">
        <StatCard
          label="En circulación"
          value={(summary?.activeCredits ?? 0).toLocaleString("es-GT")}
          hint="Saldo total activo"
        />
        <StatCard
          label="Vendidos"
          value={(summary?.purchasedCredits30d ?? 0).toLocaleString("es-GT")}
          hint="Últimos 30 días"
        />
        <StatCard
          label="Consumidos"
          value={(summary?.consumedCredits30d ?? 0).toLocaleString("es-GT")}
          hint="Uso real de IA"
        />
        <StatCard
          label="Promos"
          value={(summary?.manualGrantCredits30d ?? 0).toLocaleString("es-GT")}
          hint="Acreditación manual"
        />
        <StatCard
          label="Intentos abiertos"
          value={(summary?.pendingPurchaseRequests ?? 0).toLocaleString(
            "es-GT",
          )}
          hint="Sin pago confirmado"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="bg-card overflow-hidden rounded-xl border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">
                Historial de movimientos
              </h2>
              <p className="text-muted-foreground text-xs">
                Ledger append-only con balance antes/después para movimientos
                nuevos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar vendedor o referencia"
                  className="bg-background focus:ring-primary/20 h-9 w-64 rounded-lg border pr-3 pl-8 text-xs outline-none focus:ring-2"
                />
              </div>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="bg-background focus:ring-primary/20 h-9 rounded-lg border px-3 text-xs outline-none focus:ring-2"
              >
                {TX_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Vendedor</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Créditos
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Balance
                  </th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 align-top">
                    <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
                      {fmtDate(tx.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {tx.seller_name || "Sin tienda"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        #{tx.seller_id} · {tx.seller_email || "sin correo"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-muted rounded-full px-2 py-1 text-xs font-medium">
                        {typeLabel(tx.type)}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        tx.credits > 0 ? "text-emerald-600" : "text-foreground"
                      }`}
                    >
                      {tx.credits > 0 ? "+" : ""}
                      {tx.credits}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right text-xs tabular-nums">
                      {tx.balance_before === null ? "-" : tx.balance_before} →{" "}
                      <span className="text-foreground font-semibold">
                        {tx.balance_after}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-4 py-3">
                      <p className="text-foreground line-clamp-2 text-xs">
                        {tx.description}
                      </p>
                      {(tx.ref_type || tx.ref_id) && (
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          {tx.ref_type || "ref"} · {tx.ref_id || "-"}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground px-4 py-10 text-center text-sm"
                    >
                      No hay movimientos con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-card rounded-xl border">
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Gift className="text-primary h-4 w-4" />
                <h2 className="text-sm font-semibold">Acreditar créditos</h2>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Para promociones, soporte o correcciones con motivo obligatorio.
              </p>
            </div>

            <form onSubmit={handleGrant} className="space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Vendedor</label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
                  <input
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    placeholder="Buscar por tienda, correo o ID"
                    className="bg-background focus:ring-primary/20 h-9 w-full rounded-lg border pr-3 pl-8 text-xs outline-none focus:ring-2"
                  />
                </div>
                <div className="bg-background max-h-44 space-y-1 overflow-y-auto rounded-lg border p-1">
                  {sellers.map((seller) => (
                    <button
                      key={seller.seller_id}
                      type="button"
                      onClick={() => setSelectedSeller(seller)}
                      className={`w-full rounded-md px-2 py-2 text-left text-xs transition ${
                        selectedSeller?.seller_id === seller.seller_id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold">
                        {seller.seller_name || seller.seller_email}
                      </p>
                      <p className="text-muted-foreground">
                        #{seller.seller_id} · {seller.ai_credits_balance} cr.
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-xs font-medium">
                  Créditos
                  <input
                    value={grantCredits}
                    onChange={(e) => setGrantCredits(e.target.value)}
                    inputMode="numeric"
                    className="bg-background focus:ring-primary/20 h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
                  />
                </label>
                <label className="space-y-2 text-xs font-medium">
                  Motivo
                  <select
                    value={grantCategory}
                    onChange={(e) => setGrantCategory(e.target.value)}
                    className="bg-background focus:ring-primary/20 h-9 w-full rounded-lg border px-3 text-xs outline-none focus:ring-2"
                  >
                    {GRANT_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedSeller && (
                <div className="border-primary/20 bg-primary/5 rounded-lg border px-3 py-2 text-xs">
                  <p className="font-medium">
                    {selectedSeller.seller_name || "Vendedor"}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Saldo: {selectedSeller.ai_credits_balance} →{" "}
                    <span className="text-foreground font-semibold">
                      {selectedBalanceAfter ?? "-"}
                    </span>
                  </p>
                </div>
              )}

              <label className="space-y-2 text-xs font-medium">
                Nota de auditoría
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  rows={3}
                  placeholder="Ej. Promoción de lanzamiento por campaña de abril"
                  className="bg-background focus:ring-primary/20 w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                />
              </label>

              <button
                type="submit"
                disabled={!selectedSeller || granting}
                className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              >
                {granting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Acreditar con auditoría
              </button>
            </form>
          </section>

          <section className="bg-card rounded-xl border">
            <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="text-primary h-4 w-4" />
                  <h2 className="text-sm font-semibold">Intentos de pago</h2>
                </div>
                <p className="text-muted-foreground text-xs">
                  Los créditos se acreditan solo cuando el proveedor confirma el
                  pago. Admin no aprueba compras alojadas.
                </p>
              </div>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="bg-background focus:ring-primary/20 h-8 rounded-lg border px-2 text-[11px] outline-none focus:ring-2"
              >
                {PAYMENT_STATUS_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="border-b bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Si el cliente cancela o abandona el checkout, el intento queda
                  como <strong>No pagado</strong>. Si paga, el webhook/captura
                  acredita automáticamente los créditos.
                </p>
              </div>
            </div>
            <div className="max-h-[520px] divide-y overflow-y-auto">
              {requests.map((request) => (
                <div key={request.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {request.nombre_comercio ||
                          request.seller_email ||
                          `Seller #${request.seller_id}`}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {request.credits} cr. ·{" "}
                        {fmtGtq(Number(request.price_gtq))} ·{" "}
                        {fmtDate(request.created_at)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${paymentStatusClass(request.status)}`}
                    >
                      {paymentStatusLabel(request.status)}
                    </span>
                  </div>
                  <div className="bg-muted/40 text-muted-foreground grid grid-cols-2 gap-2 rounded-lg px-3 py-2 text-[11px]">
                    <span>Proveedor: {request.provider || "pendiente"}</span>
                    <span className="text-right">
                      Paquete:{" "}
                      {request.package_name || `#${request.package_id}`}
                    </span>
                  </div>
                  {request.rejection_reason && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">
                      {request.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  No hay intentos de pago con este filtro.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
