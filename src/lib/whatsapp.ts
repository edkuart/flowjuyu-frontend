export function extractWhatsAppPhone(raw: unknown): string | null {
  if (raw == null) return null;

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const cc = String(obj.country_code ?? "").replace(/\D/g, "");
    const num = String(obj.number ?? "").replace(/\D/g, "");
    const digits = `${cc}${num}`;
    return digits.length >= 8 ? digits : null;
  }

  const str = String(raw).trim();
  if (!str) return null;

  const waMatch = str.match(/wa\.me\/(\d{6,})/);
  if (waMatch) return waMatch[1];

  const digits = str.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function buildWhatsAppHref(phone: string, message?: string): string {
  const normalized = extractWhatsAppPhone(phone);
  if (!normalized) return "";

  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
