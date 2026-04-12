import {
  parseCommunicationPreferences,
  type CommunicationPreferences,
} from "@/lib/communicationPreferences";

export type MarketingPromptKey =
  | "seller_marketing_email_dashboard"
  | "buyer_marketing_email_favorites";

export type MarketingPromptStatus =
  | "shown"
  | "accepted"
  | "dismissed"
  | "snoozed";

export interface MarketingPromptSnapshot {
  prompt: {
    key: MarketingPromptKey;
    status: MarketingPromptStatus | null;
    shownAt: string | null;
    actedAt: string | null;
    metadata: Record<string, unknown> | null;
    shouldShow: boolean;
    cooldownUntil: string | null;
  };
  preferences: CommunicationPreferences;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function parseMarketingPromptSnapshot(
  payload: unknown,
): MarketingPromptSnapshot | null {
  if (!isRecord(payload) || !isRecord(payload.prompt)) return null;

  const preferences = parseCommunicationPreferences(payload);
  if (!preferences) return null;

  const prompt = payload.prompt;
  const key = prompt.key;
  const status = prompt.status;

  if (
    (key !== "seller_marketing_email_dashboard" &&
      key !== "buyer_marketing_email_favorites") ||
    (status !== null &&
      status !== "shown" &&
      status !== "accepted" &&
      status !== "dismissed" &&
      status !== "snoozed") ||
    typeof prompt.shouldShow !== "boolean"
  ) {
    return null;
  }

  return {
    prompt: {
      key,
      status,
      shownAt: typeof prompt.shownAt === "string" ? prompt.shownAt : null,
      actedAt: typeof prompt.actedAt === "string" ? prompt.actedAt : null,
      metadata: isRecord(prompt.metadata) ? prompt.metadata : null,
      shouldShow: prompt.shouldShow,
      cooldownUntil:
        typeof prompt.cooldownUntil === "string" ? prompt.cooldownUntil : null,
    },
    preferences,
  };
}
