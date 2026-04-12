export type ConsentType = "terms" | "privacy";

export interface ConsentPolicyInfo {
  version: string | null;
  url: string | null;
  label: string | null;
}

export interface ConsentStatus {
  compliant: boolean;
  needsConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  missingConsents: ConsentType[];
  currentVersion: string | null;
  policies: Record<ConsentType, ConsentPolicyInfo | null>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function toPolicyInfo(value: unknown): ConsentPolicyInfo | null {
  if (!isRecord(value)) return null;

  return {
    version: typeof value.version === "string" ? value.version : null,
    url: typeof value.url === "string" ? value.url : null,
    label: typeof value.label === "string" ? value.label : null,
  };
}

function normalizeMissingConsents(value: unknown): ConsentType[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is ConsentType => item === "terms" || item === "privacy",
  );
}

export function parseConsentStatus(payload: unknown): ConsentStatus | null {
  if (!isRecord(payload)) return null;

  const compliance = isRecord(payload.compliance) ? payload.compliance : payload;
  const policies = isRecord(payload.policies) ? payload.policies : {};

  const missingConsents = normalizeMissingConsents(compliance.missingConsents);
  const termsAccepted =
    typeof compliance.terms === "boolean"
      ? compliance.terms
      : !missingConsents.includes("terms");
  const privacyAccepted =
    typeof compliance.privacy === "boolean"
      ? compliance.privacy
      : !missingConsents.includes("privacy");
  const compliant =
    typeof compliance.compliant === "boolean"
      ? compliance.compliant
      : termsAccepted && privacyAccepted;
  const currentVersion =
    typeof payload.currentVersion === "string"
      ? payload.currentVersion
      : toPolicyInfo(policies.terms)?.version ?? null;

  return {
    compliant,
    needsConsent: !compliant,
    termsAccepted,
    privacyAccepted,
    missingConsents,
    currentVersion,
    policies: {
      terms: toPolicyInfo(policies.terms),
      privacy: toPolicyInfo(policies.privacy),
    },
  };
}

export function parseConsentHints(payload: unknown): Pick<
  ConsentStatus,
  "needsConsent" | "currentVersion"
> | null {
  if (!isRecord(payload) || typeof payload.needsConsent !== "boolean") {
    return null;
  }

  return {
    needsConsent: payload.needsConsent,
    currentVersion:
      typeof payload.currentVersion === "string" ? payload.currentVersion : null,
  };
}

export function fallbackConsentStatus(
  hints?: Pick<ConsentStatus, "needsConsent" | "currentVersion"> | null,
): ConsentStatus {
  const needsConsent = hints?.needsConsent ?? false;

  return {
    compliant: !needsConsent,
    needsConsent,
    termsAccepted: !needsConsent,
    privacyAccepted: !needsConsent,
    missingConsents: needsConsent ? ["terms", "privacy"] : [],
    currentVersion: hints?.currentVersion ?? null,
    policies: {
      terms: null,
      privacy: null,
    },
  };
}
