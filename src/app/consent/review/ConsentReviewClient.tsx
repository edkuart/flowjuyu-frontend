"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Loader2,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { track } from "@/lib/analytics";
import { fallbackConsentStatus, type ConsentType } from "@/lib/consent";
import { resolvePostConsentDestination } from "@/lib/consentNavigation";
import { getApiUrl } from "@/lib/config";
import { safeInternalPath } from "@/lib/safeRedirect";

type ChecklistState = Record<ConsentType, boolean>;

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin" | "support";
};

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    ["buyer", "seller", "admin", "support"].includes(user.role as string)
  );
}

const CONSENT_ORDER: ConsentType[] = ["terms", "privacy"];

export default function ConsentReviewClient() {
  const searchParams = useSearchParams();
  const {
    user,
    ready,
    consent,
    consentReady,
    needsConsent,
    refreshAuth,
    refreshConsent,
  } = useAuth();

  const [checks, setChecks] = useState<ChecklistState>({
    terms: false,
    privacy: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapUser, setBootstrapUser] = useState<SessionUser | null>(null);
  const [bootstrapConsent, setBootstrapConsent] = useState<ReturnType<typeof fallbackConsentStatus> | null>(null);
  const didRedirect = useRef(false);
  const didTrackView = useRef(false);
  const didBootstrapConsent = useRef(false);
  const didRevalidateSession = useRef(false);

  const rawNext = searchParams.get("next");
  const safeNext = useMemo(() => safeInternalPath(rawNext), [rawNext]);
  const effectiveUser = user ?? bootstrapUser;
  const effectiveReady = ready || bootstrapDone;
  const mergedConsent = consent ?? bootstrapConsent;
  const destination = effectiveUser
    ? resolvePostConsentDestination(safeNext, effectiveUser.role)
    : safeNext ?? "/";
  const effectiveConsent =
    mergedConsent ??
    (consentReady && effectiveUser
      ? fallbackConsentStatus({
          needsConsent: true,
          currentVersion: null,
        })
      : null);
  const effectiveConsentReady = consentReady || Boolean(bootstrapConsent);
  const effectiveNeedsConsent = effectiveConsent?.needsConsent ?? needsConsent;
  const missingConsents = effectiveConsent?.missingConsents ?? CONSENT_ORDER;

  const fetchSessionUser = async (): Promise<SessionUser | null> => {
    try {
      const res = await fetch(`${getApiUrl()}/api/session`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return null;

      const json = (await res.json().catch(() => null)) as
        | { user?: unknown }
        | null;
      return isSessionUser(json?.user) ? json.user : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    console.log("[consent-review] mount");
  }, []);

  useEffect(() => {
    if (didBootstrapConsent.current) return;
    didBootstrapConsent.current = true;

    console.log("[consent-review] bootstrap-start");
    void (async () => {
      try {
        setBootstrapError(null);
        setBootstrapDone(false);
        const sessionUser = await fetchSessionUser();
        if (sessionUser) {
          setBootstrapUser(sessionUser);
        }
        console.log("[consent-review] bootstrap-before-refreshAuth");
        await refreshAuth();
        console.log("[consent-review] bootstrap-before-refreshConsent");
        const nextConsent = await refreshConsent();
        if (nextConsent) {
          setBootstrapConsent(nextConsent);
        }
        if (!nextConsent) {
          setBootstrapError(
            "No pudimos verificar tu estado de consentimiento. Intenta nuevamente.",
          );
        }
        console.log("[consent-review] bootstrap-done");
      } finally {
        setBootstrapDone(true);
      }
    })();
  }, [refreshAuth, refreshConsent]);

  const handleRetryConsent = async () => {
    setBootstrapError(null);
    setError(null);
    setBootstrapDone(false);

    try {
      const sessionUser = await fetchSessionUser();
      setBootstrapUser(sessionUser);
      await refreshAuth();
      const nextConsent = await refreshConsent();
      setBootstrapConsent(nextConsent);
      if (!nextConsent) {
        setBootstrapError(
          "No pudimos verificar tu estado de consentimiento. Intenta nuevamente.",
        );
      }
    } finally {
      setBootstrapDone(true);
    }
  };

  useEffect(() => {
    console.log("[consent-review] state", {
      ready,
      effectiveReady,
      user,
      effectiveUser,
      consentReady,
      effectiveConsentReady,
      consent,
      mergedConsent,
      effectiveConsent,
      effectiveNeedsConsent,
      safeNext,
      destination,
    });
  }, [
    ready,
    effectiveReady,
    user,
    effectiveUser,
    consentReady,
    effectiveConsentReady,
    consent,
    mergedConsent,
    effectiveConsent,
    effectiveNeedsConsent,
    safeNext,
    destination,
  ]);

  useEffect(() => {
    console.log("[consent-review] revalidate-check", {
      ready: effectiveReady,
      hasUser: Boolean(effectiveUser),
      alreadyRevalidated: didRevalidateSession.current,
    });
    if (!effectiveReady || effectiveUser || didRevalidateSession.current) return;

    didRevalidateSession.current = true;
    console.log("[consent-review] before refreshAuth");
    void refreshAuth();
  }, [effectiveReady, effectiveUser, refreshAuth]);

  useEffect(() => {
    console.log("[consent-review] redirect-check", {
      ready: effectiveReady,
      hasUser: Boolean(effectiveUser),
      consentReady: effectiveConsentReady,
      effectiveNeedsConsent,
      alreadyRevalidated: didRevalidateSession.current,
      alreadyRedirected: didRedirect.current,
      destination,
      safeNext,
    });
    if (!effectiveReady) return;

    if (!effectiveUser && !didRedirect.current) {
      if (!didRevalidateSession.current) return;
      console.log("[consent-review] redirecting-to-login", {
        safeNext,
      });
      didRedirect.current = true;
      const loginUrl = new URL("/login", window.location.origin);
      if (safeNext) loginUrl.searchParams.set("redirectTo", safeNext);
      window.location.replace(loginUrl.toString());
      return;
    }

    if (!effectiveConsentReady) return;

    if (effectiveUser && !effectiveNeedsConsent && !didRedirect.current) {
      console.log("[consent-review] redirecting-to-destination", {
        destination,
      });
      didRedirect.current = true;
      window.location.replace(destination);
    }
  }, [effectiveReady, effectiveUser, effectiveConsentReady, effectiveNeedsConsent, destination, safeNext]);

  useEffect(() => {
    console.log("[consent-review] refreshConsent-check", {
      ready: effectiveReady,
      hasUser: Boolean(effectiveUser),
      consentReady: effectiveConsentReady,
      hasConsent: Boolean(mergedConsent),
      alreadyBootstrapped: didBootstrapConsent.current,
    });
    if (!effectiveReady || !effectiveUser) return;
    if (effectiveConsentReady && mergedConsent) return;
    console.log("[consent-review] before refreshConsent");
    void refreshConsent();
  }, [effectiveReady, effectiveUser, effectiveConsentReady, mergedConsent, refreshConsent]);

  useEffect(() => {
    if (
      !effectiveUser ||
      !effectiveConsentReady ||
      !effectiveConsent ||
      !effectiveNeedsConsent ||
      didTrackView.current
    ) {
      return;
    }

    didTrackView.current = true;
    track("consent_review_viewed", {
      surface: "consent_review",
      source: "consent_enforcement",
      next: safeNext ?? null,
      missingConsents: effectiveConsent.missingConsents,
      currentVersion: effectiveConsent.currentVersion ?? null,
    });
  }, [user, consentReady, effectiveConsent, effectiveNeedsConsent, safeNext]);

  const canSubmit = missingConsents.every((type) => checks[type]);

  const handleSubmit = async () => {
    if (!effectiveUser || !canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      for (const consentType of CONSENT_ORDER) {
        if (!missingConsents.includes(consentType)) continue;

        const res = await apiFetch("/api/consent/accept", {
          method: "POST",
          body: JSON.stringify({
            consentType,
            accepted: true,
          }),
        });

        const json = (await res.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;

        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.message ||
              "No se pudo registrar tu consentimiento. Inténtalo nuevamente.",
          );
        }

        track(
          consentType === "terms"
            ? "consent_terms_accepted"
            : "consent_privacy_accepted",
          {
            surface: "consent_review",
            source: "consent_review_submit",
            next: safeNext ?? null,
          },
        );
      }

      track("consent_review_completed", {
        surface: "consent_review",
        source: "consent_review_submit",
        next: safeNext ?? null,
        acceptedConsents: missingConsents,
      });
      await Promise.all([refreshConsent(), refreshAuth()]);
      window.location.replace(destination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu consentimiento. Inténtalo nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowLoading =
    !bootstrapDone || !effectiveReady || !effectiveConsentReady || !effectiveUser || !effectiveConsent;

  if (bootstrapDone && bootstrapError && !effectiveConsent) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-[28px] border border-[#d8cdbb] bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,61,58,0.45)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-50 p-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-neutral-900">
                No pudimos verificar tu consentimiento
              </h1>
              <p className="text-sm leading-6 text-neutral-600">
                Tu sesion sigue activa, pero el servicio de consentimiento no
                respondió correctamente. Puedes reintentar sin salir de la sesión.
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Button onClick={() => void handleRetryConsent()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.replace(destination);
              }}
            >
              Volver
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (shouldShowLoading) {
    console.log("[consent-review] spinner", {
      ready,
      effectiveReady,
      hasUser: Boolean(effectiveUser),
      consentReady: effectiveConsentReady,
      hasConsent: Boolean(mergedConsent),
      hasEffectiveConsent: Boolean(effectiveConsent),
      bootstrapDone,
      bootstrapError,
    });
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando tu estado de consentimiento...
        </div>
      </main>
    );
  }

  const statusItems = [
    {
      type: "terms" as const,
      title: "Términos y Condiciones",
      description:
        "Regulan el uso de la cuenta, la publicación de productos y la operación del marketplace.",
      href: effectiveConsent.policies.terms?.url || "/legal/terms",
      version: effectiveConsent.policies.terms?.version ?? effectiveConsent.currentVersion,
      icon: FileText,
    },
    {
      type: "privacy" as const,
      title: "Política de Privacidad",
      description:
        "Explica cómo Flowjuyu recopila, usa y protege tus datos personales dentro de la plataforma.",
      href: effectiveConsent.policies.privacy?.url || "/legal/privacy",
      version: effectiveConsent.policies.privacy?.version ?? null,
      icon: Shield,
    },
  ];

  return (
    <main className="bg-[#f6f1e8] px-4 py-10 md:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-[#d8cdbb] bg-white shadow-[0_24px_80px_-40px_rgba(15,61,58,0.45)]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(15,61,58,0.16),_transparent_42%),linear-gradient(135deg,#f3eadf_0%,#fffaf5_58%,#f6eee3_100%)] px-6 py-8 md:px-10 md:py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F3D3A]/15 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#0F3D3A]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Acción requerida
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1.5fr_0.9fr] md:items-end">
              <div>
                <h1 className="max-w-2xl font-serif text-3xl leading-tight text-[#1d1812] md:text-4xl">
                  Revisa y acepta los documentos legales vigentes para continuar.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-700 md:text-base">
                  Necesitamos confirmar tu consentimiento antes de permitir acceso a
                  rutas privadas. Cuando termines, volverás automáticamente a tu
                  destino original.
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Estado actual
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#0F3D3A]">
                  {effectiveConsent.missingConsents.length} pendiente
                  {effectiveConsent.missingConsents.length === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Versión de términos: {effectiveConsent.currentVersion ?? "vigente"}
                </p>
                {safeNext && (
                  <p className="mt-3 text-xs text-neutral-500">
                    Destino después de aceptar: <span className="font-medium">{safeNext}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-10 md:py-8">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const required = missingConsents.includes(item.type);

              return (
                <article
                  key={item.type}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F3D3A]/8 text-[#0F3D3A]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-neutral-900">
                            {item.title}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              required
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {required ? "Requiere aceptación" : "Vigente"}
                          </span>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                          {item.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          <Link
                            href={item.href}
                            target="_blank"
                            className="font-medium text-[#0F3D3A] underline-offset-4 hover:underline"
                          >
                            Abrir documento
                          </Link>
                          {item.version && (
                            <span className="text-neutral-500">
                              Versión: {item.version}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {required ? (
                      <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
                        <Checkbox
                          checked={checks[item.type]}
                          onCheckedChange={(checked) =>
                            setChecks((prev) => ({
                              ...prev,
                              [item.type]: checked === true,
                            }))
                          }
                          className="mt-0.5 border-neutral-300 data-[state=checked]:border-[#0F3D3A] data-[state=checked]:bg-[#0F3D3A]"
                        />
                        <span>
                          Confirmo que revisé y acepto este documento.
                        </span>
                      </label>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Ya aceptado
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                Flowjuyu registra estos consentimientos de forma individual para
                mantener tu cuenta al día con las políticas vigentes.
              </p>

              <Button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className="h-11 rounded-xl bg-[#0F3D3A] px-6 text-white hover:bg-[#0c322f]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando consentimiento...
                  </>
                ) : (
                  "Aceptar y continuar"
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
