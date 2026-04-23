"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import {
  SellerActionButton,
  SellerIconBadge,
  SellerPanelHeader,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import {
  sellerHelperTextClassName,
  sellerPanelSubtleClassName,
  sellerSurfaceSoftClassName,
} from "@/components/seller/ui/sellerFormStyles";
import { apiFetch } from "@/lib/api";
import { track } from "@/lib/analytics";
import {
  parseCommunicationPreferences,
  type CommunicationPreferences,
} from "@/lib/communicationPreferences";

interface Props {
  title?: string;
  description?: string;
  compact?: boolean;
  surface?: string;
}

const DEFAULT_PREFERENCES: CommunicationPreferences = {
  operationalEmail: true,
  marketingEmail: false,
  operationalWhatsapp: false,
  marketingWhatsapp: false,
};

export function CommunicationPreferencesPanel({
  title = "Preferencias de comunicación",
  description = "Controla únicamente mensajes promocionales. Los mensajes operativos de cuenta y seguridad permanecen activos.",
  compact = false,
  surface = "communication_preferences",
}: Props) {
  const [preferences, setPreferences] = useState<CommunicationPreferences | null>(
    null,
  );
  const [draft, setDraft] = useState<CommunicationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const didTrackView = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch("/api/consent/preferences", {
          method: "GET",
        });
        const json = await res.json().catch(() => null);
        const parsed = parseCommunicationPreferences(json);

        if (!res.ok || !parsed) {
          throw new Error(
            "No se pudieron cargar tus preferencias de comunicación.",
          );
        }

        if (!cancelled) {
          setPreferences(parsed);
          setDraft(parsed);
          if (!didTrackView.current) {
            didTrackView.current = true;
            track("marketing_preferences_viewed", {
              surface,
              source: "preferences_screen",
              marketingEmailEnabled: parsed.marketingEmail,
              marketingWhatsappEnabled: parsed.marketingWhatsapp,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar tus preferencias de comunicación.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [surface]);

  const hasChanges =
    !!preferences &&
    (preferences.marketingEmail !== draft.marketingEmail ||
      preferences.marketingWhatsapp !== draft.marketingWhatsapp);

  const handleSave = async () => {
    if (!hasChanges || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch("/api/consent/preferences", {
        method: "PUT",
        body: JSON.stringify({
          marketingEmail: draft.marketingEmail,
          marketingWhatsapp: draft.marketingWhatsapp,
        }),
      });

      const json = await res.json().catch(() => null);
      const parsed = parseCommunicationPreferences(json);

      if (!res.ok || !parsed) {
        throw new Error(
          isErrorPayload(json) && typeof json.message === "string"
            ? json.message
            : "No se pudieron guardar tus preferencias.",
        );
      }

      if (preferences.marketingEmail !== parsed.marketingEmail) {
        track(
          parsed.marketingEmail
            ? "marketing_email_enabled"
            : "marketing_email_disabled",
          {
            surface,
            source: "preferences_screen",
            channel: "email",
          },
        );
      }

      if (preferences.marketingWhatsapp !== parsed.marketingWhatsapp) {
        track(
          parsed.marketingWhatsapp
            ? "marketing_whatsapp_enabled"
            : "marketing_whatsapp_disabled",
          {
            surface,
            source: "preferences_screen",
            channel: "whatsapp",
          },
        );
      }

      setPreferences(parsed);
      setDraft(parsed);
      setSuccess("Preferencias guardadas correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar tus preferencias.",
      );
    } finally {
      setSaving(false);
    }
  };

  const bodyPadding = compact ? "p-5" : "p-6 md:p-7";

  return (
    <SellerSurfaceCard>
      <SellerPanelHeader
        className={compact ? "px-5 pb-0 pt-5" : undefined}
        eyebrow="Comunicación"
        icon={<MessageCircle className="h-5 w-5" />}
        title={title}
        description={description}
      />

      <div className={bodyPadding}>
        {loading ? (
          <div className={`flex items-center gap-3 rounded-[var(--seller-radius-xl)] px-4 py-4 text-sm text-[var(--seller-muted)] ${sellerPanelSubtleClassName}`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando preferencias...
          </div>
        ) : (
          <div className="space-y-4">
            <PreferenceRow
              icon={<ShieldCheck className="h-5 w-5 text-[#0F3D3A]" />}
              title="Emails de cuenta y seguridad"
              description="Recibirás avisos sobre acceso, recuperación de cuenta, cambios relevantes y mensajes operativos. No se pueden desactivar."
              enabled={draft.operationalEmail}
              readOnly
            />

            <PreferenceRow
              icon={<Mail className="h-5 w-5 text-amber-600" />}
              title="Emails con novedades, ofertas o consejos"
              description="Mensajes promocionales de Flowjuyu sobre productos, descuentos, recomendaciones y lanzamientos."
              enabled={draft.marketingEmail}
              onChange={(checked) =>
                setDraft((prev) => ({ ...prev, marketingEmail: checked }))
              }
            />

            <PreferenceRow
              icon={<MessageCircle className="h-5 w-5 text-emerald-600" />}
              title="WhatsApp promocional"
              description="Avisos promocionales por WhatsApp cuando exista un canal compatible para tu cuenta. Es opcional y reversible."
              enabled={draft.marketingWhatsapp}
              onChange={(checked) =>
                setDraft((prev) => ({ ...prev, marketingWhatsapp: checked }))
              }
              badge={
                draft.operationalWhatsapp ? (
                  <SellerPill tone="success">
                    Canal operativo disponible
                  </SellerPill>
                ) : (
                  <SellerPill tone="neutral">
                    Canal operativo no activo
                  </SellerPill>
                )
              }
            />

            <div className={`${sellerSurfaceSoftClassName} border-dashed px-4 py-4 text-sm text-[var(--seller-muted)]`}>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-neutral-500" />
                <p>
                  Los mensajes operativos siguen activos para proteger tu cuenta y
                  mantener la operación del marketplace. Solo estás configurando
                  comunicaciones promocionales.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <p>{success}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-[var(--seller-line)] pt-4 md:flex-row md:items-center md:justify-between">
              <p className={sellerHelperTextClassName}>
                Los cambios se registran como consentimiento revocable en tu cuenta.
              </p>

              <SellerActionButton
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="h-11 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar preferencias"
                )}
              </SellerActionButton>
            </div>
          </div>
        )}
      </div>
    </SellerSurfaceCard>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  readOnly = false,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange?: (checked: boolean) => void;
  readOnly?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="seller-surface-card px-4 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <SellerIconBadge className="h-10 w-10 shrink-0">
            {icon}
          </SellerIconBadge>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-[var(--seller-ink)]">{title}</h3>
              {badge}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--seller-muted)]">
              {description}
            </p>
          </div>
        </div>

        {readOnly ? (
          <SellerPill className="px-3 py-1.5">
            Siempre activo
          </SellerPill>
        ) : (
          <div className="flex items-center gap-3 md:pl-4">
            <span className="text-sm text-[var(--seller-muted)]">
              {enabled ? "Activo" : "Inactivo"}
            </span>
            <Switch
              checked={enabled}
              onCheckedChange={onChange}
              aria-label={title}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function isErrorPayload(value: unknown): value is { message?: unknown } {
  return !!value && typeof value === "object";
}
