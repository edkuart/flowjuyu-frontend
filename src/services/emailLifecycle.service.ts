import "server-only";

import { getApiUrl } from "@/lib/config";
import { renderActivationEmail } from "@/services/emailTemplates/activation";
import { renderWeek1Email } from "@/services/emailTemplates/week1";
import { sendEmail } from "@/server/email/email.service";

export type EmailStage = "welcome" | "activation" | "week1";

type SellerListItem = {
  user_id: number;
  nombre_comercio: string;
  createdAt: string;
  estado_validacion: string;
  estado_admin: string;
  email_welcome_sent_at?: string | null;
  email_activation_sent_at?: string | null;
  email_week1_sent_at?: string | null;
  user?: {
    nombre: string;
    correo: string;
  };
};

type SellerDetail = {
  user_id: number;
  createdAt: string;
  estado_validacion: string;
  estado_admin: string;
  nombre_comercio: string;
  email_welcome_sent_at?: string | null;
  email_activation_sent_at?: string | null;
  email_week1_sent_at?: string | null;
  user: {
    nombre: string;
    correo: string;
  };
  metrics?: {
    products_total?: number;
    products_active?: number;
    total_views?: number;
    total_profile_views?: number;
  };
};

type LifecycleSendResult = {
  userId: number;
  stage: EmailStage;
  sent: boolean;
  skippedReason?: string;
};

function getBackofficeAuthHeaders(): HeadersInit {
  const token = process.env.EMAIL_LIFECYCLE_API_TOKEN || process.env.INTERNAL_API_TOKEN;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: "GET",
    headers: getBackofficeAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`[email-lifecycle] Request failed for ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getStageSentAt(
  source: Pick<
    SellerDetail | SellerListItem,
    "email_welcome_sent_at" | "email_activation_sent_at" | "email_week1_sent_at"
  >,
  stage: EmailStage,
): string | null | undefined {
  if (stage === "welcome") return source.email_welcome_sent_at;
  if (stage === "activation") return source.email_activation_sent_at;
  return source.email_week1_sent_at;
}

export function hasSentLifecycleEmail(
  source: Pick<
    SellerDetail | SellerListItem,
    "email_welcome_sent_at" | "email_activation_sent_at" | "email_week1_sent_at"
  >,
  stage: EmailStage,
): boolean {
  return Boolean(getStageSentAt(source, stage));
}

export function getLifecycleEmailCount(
  source: Pick<
    SellerDetail | SellerListItem,
    "email_welcome_sent_at" | "email_activation_sent_at" | "email_week1_sent_at"
  >,
): number {
  return (["welcome", "activation", "week1"] as EmailStage[]).filter((stage) =>
    hasSentLifecycleEmail(source, stage),
  ).length;
}

function getSellerOnboardingUrl(): string {
  return `${getAppBaseUrl()}/seller/onboarding`;
}

function hasPublishedProduct(detail: SellerDetail): boolean {
  const productsTotal = detail.metrics?.products_total ?? 0;
  const productsActive = detail.metrics?.products_active ?? 0;

  return productsTotal > 0 || productsActive > 0;
}

function hasCompletedOnboarding(detail: SellerDetail): boolean {
  if (hasPublishedProduct(detail)) return true;

  return detail.estado_admin === "activo" || detail.estado_validacion === "aprobado";
}

function getTotalViews(detail: SellerDetail): number {
  return (detail.metrics?.total_views ?? 0) + (detail.metrics?.total_profile_views ?? 0)
}

async function sendLifecycleEmail(
  detail: SellerDetail,
  stage: Exclude<EmailStage, "welcome">,
): Promise<LifecycleSendResult> {
  const userId = detail.user_id;

  if (hasSentLifecycleEmail(detail, stage)) {
    return { userId, stage, sent: false, skippedReason: "already_sent" };
  }

  if (getLifecycleEmailCount(detail) >= 3) {
    return { userId, stage, sent: false, skippedReason: "email_limit_reached" };
  }

  if (hasCompletedOnboarding(detail)) {
    return { userId, stage, sent: false, skippedReason: "onboarding_completed" };
  }

  if (stage === "activation" && hasPublishedProduct(detail)) {
    return { userId, stage, sent: false, skippedReason: "product_already_published" };
  }

  const html =
    stage === "activation"
      ? renderActivationEmail({
          sellerName: detail.user.nombre,
          ctaUrl: getSellerOnboardingUrl(),
        })
      : renderWeek1Email({
          sellerName: detail.user.nombre,
          ctaUrl: getSellerOnboardingUrl(),
        });

  const subject =
    stage === "activation"
      ? "Publica tu primer producto en Flowjuyu"
      : "Tu tienda sigue lista para despegar";

  const sent = await sendEmail(detail.user.correo, subject, html);

  if (!sent.ok) {
    return { userId, stage, sent: false, skippedReason: sent.error };
  }

  return { userId, stage, sent: true };
}

export async function runEmailLifecycleJob(): Promise<LifecycleSendResult[]> {
  const sellers = await fetchJson<SellerListItem[]>("/api/admin/sellers");
  const now = Date.now();
  const results: LifecycleSendResult[] = [];

  for (const seller of sellers) {
    const detail = await fetchJson<SellerDetail>(`/api/admin/sellers/${seller.user_id}`);
    const createdAt = new Date(detail.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      results.push({
        userId: detail.user_id,
        stage: "activation",
        sent: false,
        skippedReason: "invalid_created_at",
      });
      continue;
    }

    const ageHours = (now - createdAt) / 3_600_000;
    const ageDays = ageHours / 24;

    if (ageHours >= 72 && ageDays < 7 && !hasPublishedProduct(detail)) {
      results.push(await sendLifecycleEmail(detail, "activation"));
      continue;
    }

    if (ageDays >= 7 && getTotalViews(detail) === 0) {
      results.push(await sendLifecycleEmail(detail, "week1"));
      continue;
    }
  }

  return results;
}
