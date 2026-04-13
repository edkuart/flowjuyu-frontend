"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  PauseCircle,
  Sparkles,
} from "lucide-react";

import { BaseCard } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { track } from "@/lib/analytics";
import {
  parseMarketingPromptSnapshot,
  type MarketingPromptKey,
  type MarketingPromptSnapshot,
} from "@/lib/marketingPrompt";

interface MarketingOptInNudgeProps {
  promptKey: MarketingPromptKey;
  eligible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  settingsHref: string;
  surface: string;
}

const SESSION_PREFIX = "flowjuyu:marketing-prompt";

function getSessionKey(promptKey: MarketingPromptKey) {
  return `${SESSION_PREFIX}:${promptKey}`;
}

function readSessionSeen(promptKey: MarketingPromptKey): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(getSessionKey(promptKey)) === "1";
  } catch {
    return false;
  }
}

function writeSessionSeen(promptKey: MarketingPromptKey): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getSessionKey(promptKey), "1");
  } catch {
    // sessionStorage may be unavailable in hardened browsers
  }
}

export function MarketingOptInNudge({
  promptKey,
  eligible,
  eyebrow,
  title,
  description,
  bullets,
  settingsHref,
  surface,
}: MarketingOptInNudgeProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<MarketingPromptSnapshot | null>(null);
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      setSnapshot(null);
      setAccepted(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadPrompt() {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(`/api/consent/prompts/${promptKey}`);
        const json = await res.json().catch(() => null);
        const parsed = parseMarketingPromptSnapshot(json);

        if (!res.ok || !parsed) {
          throw new Error("No pudimos preparar esta invitación ahora.");
        }

        if (cancelled) return;

        setSnapshot(parsed);

        if (parsed.preferences.marketingEmail || !parsed.prompt.shouldShow) {
          setVisible(false);
          return;
        }

        if (readSessionSeen(promptKey)) {
          setVisible(false);
          return;
        }

        writeSessionSeen(promptKey);
        setVisible(true);

        const seenRes = await apiFetch(`/api/consent/prompts/${promptKey}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "shown",
            metadata: { surface },
          }),
        });

        const seenJson = await seenRes.json().catch(() => null);
        const seenParsed = parseMarketingPromptSnapshot(seenJson);

        if (!cancelled && seenRes.ok && seenParsed) {
          setSnapshot(seenParsed);
        }

        track("marketing_nudge_viewed", {
          promptKey,
          surface,
          channel: "email",
          source: "marketing_nudge",
        });
      } catch (err) {
        if (!cancelled) {
          setVisible(false);
          setError(
            err instanceof Error
              ? err.message
              : "No pudimos preparar esta invitación ahora.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPrompt();

    return () => {
      cancelled = true;
    };
  }, [eligible, promptKey, surface]);

  const cooldownLabel = useMemo(() => {
    const iso = snapshot?.prompt.cooldownUntil;
    if (!iso) return null;

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString("es-GT", {
      month: "short",
      day: "numeric",
    });
  }, [snapshot?.prompt.cooldownUntil]);

  async function handleAccept() {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/consent/prompts/${promptKey}/accept`, {
        method: "POST",
        body: JSON.stringify({
          metadata: { surface },
        }),
      });

      const json = await res.json().catch(() => null);
      const parsed = parseMarketingPromptSnapshot(json);

      if (!res.ok || !parsed) {
        throw new Error("No pudimos activar estos emails ahora.");
      }

      setSnapshot(parsed);
      setAccepted(true);
      setVisible(false);

      track("marketing_nudge_accepted", {
        promptKey,
        surface,
        channel: "email",
        source: "marketing_nudge",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos activar estos emails ahora.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSnooze() {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/consent/prompts/${promptKey}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "snoozed",
          metadata: { surface, reason: "not_now" },
        }),
      });

      const json = await res.json().catch(() => null);
      const parsed = parseMarketingPromptSnapshot(json);

      if (!res.ok || !parsed) {
        throw new Error("No pudimos guardar tu preferencia ahora.");
      }

      setSnapshot(parsed);
      setVisible(false);

      track("marketing_nudge_snoozed", {
        promptKey,
        surface,
        channel: "email",
        source: "marketing_nudge",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos guardar tu preferencia ahora.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!eligible || loading) return null;

  if (accepted) {
    return (
      <BaseCard
        className="border-emerald-200 bg-emerald-50/80"
        contentClassName="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900">
              Emails promocionales activados
            </p>
            <p className="text-sm text-emerald-800/80">
              Ya quedaste suscrito. Puedes cambiarlo cuando quieras desde tus
              preferencias de comunicación.
            </p>
          </div>
        </div>
        <Link href={settingsHref}>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
          >
            Ver preferencias
          </Button>
        </Link>
      </BaseCard>
    );
  }

  if (!visible) return null;

  return (
    <BaseCard
      className="border-[#0F3D3A]/15 bg-gradient-to-br from-[#fff7e6] via-white to-[#eef6f4]"
      contentClassName="space-y-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F3D3A] text-white shadow-sm">
            <Mail className="h-5 w-5" />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0F3D3A]/60">
                {eyebrow}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                {title}
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                {description}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-2xl border border-white/80 bg-white/80 px-3 py-3 text-sm text-neutral-700 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
                    <span>{bullet}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-[#0F3D3A]/15 bg-white/70 px-4 py-3 text-sm text-neutral-600">
              Los correos operativos de cuenta y seguridad siguen activos aparte.
              Este opt-in es solo para contenido promocional y puedes revertirlo
              cuando quieras.
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-[#0F3D3A]/10 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <PauseCircle className="h-4 w-4" />
          <span>
            Si eliges "Ahora no", pausamos esta invitación para no repetírtela
            enseguida{cooldownLabel ? ` hasta ${cooldownLabel}` : ""}.
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={handleSnooze}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ahora no
          </Button>

          <Button
            type="button"
            className="h-11 rounded-xl bg-[#0F3D3A] px-5 text-white hover:bg-[#0c322f]"
            onClick={handleAccept}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Activar emails
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </BaseCard>
  );
}
