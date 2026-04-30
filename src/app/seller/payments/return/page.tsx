"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  cancelAiCreditPayment,
  captureAiCreditPayment,
} from "@/services/aiCredits";

function safeReturnTo(value: string | null): string {
  if (!value) return "/seller/ai-credits";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("://")
  ) {
    return "/seller/ai-credits";
  }
  return value;
}

export default function SellerPaymentReturnPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<
    "loading" | "success" | "cancel" | "error"
  >("loading");
  const [message, setMessage] = useState("Confirmando tu pago");
  const returnTo = useMemo(
    () => safeReturnTo(params.get("returnTo")),
    [params],
  );

  useEffect(() => {
    const provider = params.get("provider");
    const token = params.get("token");
    const requestId = params.get("requestId");
    const cancelled = params.get("credit_cancel") === "1";

    if (cancelled) {
      setState("cancel");
      setMessage("Pago cancelado");
      const finish = () =>
        window.setTimeout(() => router.replace(returnTo), 1000);
      if (requestId) {
        cancelAiCreditPayment({ requestId }).finally(finish);
      } else {
        finish();
      }
      return;
    }

    if (provider === "paypal" && token) {
      captureAiCreditPayment({ provider: "paypal", orderId: token })
        .then(() => {
          setState("success");
          setMessage("Créditos acreditados");
          window.setTimeout(() => router.replace(returnTo), 900);
        })
        .catch((err) => {
          setState("error");
          setMessage(
            err instanceof Error ? err.message : "No se pudo confirmar el pago",
          );
        });
      return;
    }

    setState("success");
    setMessage("Pago recibido");
    window.setTimeout(() => router.replace(returnTo), 1200);
  }, [params, returnTo, router]);

  const Icon =
    state === "loading"
      ? Loader2
      : state === "cancel" || state === "error"
        ? XCircle
        : CheckCircle2;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-4">
      <section className="w-full max-w-sm rounded-[24px] border border-[var(--seller-line)] bg-white p-6 text-center shadow-xl">
        <Icon
          className={`mx-auto h-9 w-9 ${
            state === "loading"
              ? "animate-spin text-[var(--seller-accent)]"
              : state === "success"
                ? "text-emerald-600"
                : "text-amber-600"
          }`}
        />
        <h1 className="mt-4 text-lg font-bold text-[var(--seller-ink)]">
          {message}
        </h1>
        <p className="mt-2 text-sm text-[var(--seller-muted)]">
          {state === "error"
            ? "Puedes volver al flujo e intentar otra vez."
            : "Te llevaremos de vuelta automáticamente."}
        </p>
        {state === "error" && (
          <button
            type="button"
            onClick={() => router.replace(returnTo)}
            className="mt-5 rounded-2xl bg-[var(--seller-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Volver
          </button>
        )}
      </section>
    </main>
  );
}
