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
    version:
      typeof value.version === "string"
        ? value.version
        : typeof value.versionCode === "string"
          ? value.versionCode
          : null,
    url: typeof value.url === "string" ? value.url : null,
    label:
      typeof value.label === "string"
        ? value.label
        : typeof value.versionLabel === "string"
          ? value.versionLabel
          : null,
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

  const access = isRecord(payload.access) ? payload.access : null;
  const accessConsent = access && isRecord(access.consent) ? access.consent : null;

  if (access && accessConsent) {
    const gates = isRecord(access.gates) ? access.gates : null;
    const currentVersion = toPolicyInfo(accessConsent.currentVersion);
    const missingConsents = normalizeMissingConsents(accessConsent.missing);
    const needsConsent =
      typeof accessConsent.needsAcceptance === "boolean"
        ? accessConsent.needsAcceptance
        : gates?.consent === "required" || missingConsents.length > 0;

    return {
      compliant: !needsConsent,
      needsConsent,
      termsAccepted: !missingConsents.includes("terms"),
      privacyAccepted: !missingConsents.includes("privacy"),
      missingConsents,
      currentVersion: currentVersion?.version ?? null,
      policies: {
        terms: currentVersion,
        privacy: currentVersion,
      },
    };
  }

  if (isRecord(payload.consent)) {
    const missingConsents = normalizeMissingConsents(payload.consent.missingPolicies);
    const policies = isRecord(payload.consent.activeVersions)
      ? payload.consent.activeVersions
      : {};
    const needsConsent =
      typeof payload.consent.needsConsent === "boolean"
        ? payload.consent.needsConsent
        : missingConsents.length > 0;

    return {
      compliant: !needsConsent,
      needsConsent,
      termsAccepted: !missingConsents.includes("terms"),
      privacyAccepted: !missingConsents.includes("privacy"),
      missingConsents,
      currentVersion: toPolicyInfo(policies.terms)?.version ?? null,
      policies: {
        terms: toPolicyInfo(policies.terms),
        privacy: toPolicyInfo(policies.privacy),
      },
    };
  }

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
  if (!isRecord(payload)) {
    return null;
  }

  const access = isRecord(payload.access) ? payload.access : null;
  const accessConsent = access && isRecord(access.consent) ? access.consent : null;

  if (access && accessConsent) {
    const gates = isRecord(access.gates) ? access.gates : null;
    const currentVersion = toPolicyInfo(accessConsent.currentVersion);
    const missingConsents = normalizeMissingConsents(accessConsent.missing);
    const needsConsent =
      typeof accessConsent.needsAcceptance === "boolean"
        ? accessConsent.needsAcceptance
        : gates?.consent === "required" || missingConsents.length > 0;

    return {
      needsConsent,
      currentVersion: currentVersion?.version ?? null,
    };
  }

  if (isRecord(payload.consent)) {
    return {
      needsConsent:
        typeof payload.consent.needsConsent === "boolean"
          ? payload.consent.needsConsent
          : normalizeMissingConsents(payload.consent.missingPolicies).length > 0,
      currentVersion:
        toPolicyInfo(
          isRecord(payload.consent.activeVersions)
            ? payload.consent.activeVersions.terms
            : null,
        )?.version ?? null,
    };
  }

  if (typeof payload.needsConsent !== "boolean") {
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
