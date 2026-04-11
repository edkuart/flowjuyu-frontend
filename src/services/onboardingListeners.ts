import "server-only";

import {
  getLifecycleEmailCount,
  hasSentLifecycleEmail,
  type EmailStage,
  getAppBaseUrl,
} from "@/services/emailLifecycle.service";
import { renderWelcomeEmail } from "@/services/emailTemplates/welcome";
import { sendEmail } from "@/server/email/email.service";

type SellerCreatedEvent = {
  type: "seller_created";
  seller: {
    userId: number;
    email: string;
    name: string;
    storeName?: string | null;
    email_welcome_sent_at?: string | null;
    email_activation_sent_at?: string | null;
    email_week1_sent_at?: string | null;
  };
};

export type OnboardingEvent = SellerCreatedEvent;

function getWelcomeUrl(): string {
  return `${getAppBaseUrl()}/seller/onboarding`;
}

async function handleSellerCreated(event: SellerCreatedEvent) {
  const stage: EmailStage = "welcome";

  if (hasSentLifecycleEmail(event.seller, stage)) {
    return { ok: true, skipped: "already_sent" as const };
  }

  if (getLifecycleEmailCount(event.seller) >= 3) {
    return { ok: true, skipped: "email_limit_reached" as const };
  }

  const html = renderWelcomeEmail({
    sellerName: event.seller.name,
    ctaUrl: getWelcomeUrl(),
  });

  const subject = `Bienvenido a Flowjuyu${event.seller.storeName ? `, ${event.seller.storeName}` : ""}`;
  const result = await sendEmail(event.seller.email, subject, html);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export async function handleOnboardingEvent(event: OnboardingEvent) {
  switch (event.type) {
    case "seller_created":
      return handleSellerCreated(event);
    default:
      return { ok: true, skipped: "unknown_event" as const };
  }
}
