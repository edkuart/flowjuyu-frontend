export interface CommunicationPreferences {
  operationalEmail: boolean;
  marketingEmail: boolean;
  operationalWhatsapp: boolean;
  marketingWhatsapp: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function parseCommunicationPreferences(
  payload: unknown,
): CommunicationPreferences | null {
  if (!isRecord(payload)) return null;

  const source = isRecord(payload.preferences) ? payload.preferences : payload;

  if (
    typeof source.operationalEmail !== "boolean" ||
    typeof source.marketingEmail !== "boolean" ||
    typeof source.operationalWhatsapp !== "boolean" ||
    typeof source.marketingWhatsapp !== "boolean"
  ) {
    return null;
  }

  return {
    operationalEmail: source.operationalEmail,
    marketingEmail: source.marketingEmail,
    operationalWhatsapp: source.operationalWhatsapp,
    marketingWhatsapp: source.marketingWhatsapp,
  };
}
