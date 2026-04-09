import type { SupportedLanguage } from "@/i18n/config";

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

  const encodedMessage = message ? encodeURIComponent(message) : "";
  return encodedMessage
    ? `https://wa.me/${normalized}?text=${encodedMessage}`
    : `https://wa.me/${normalized}`;
}

type ProductWhatsAppMessageParams = {
  language: SupportedLanguage;
  sellerName?: string | null;
  productName: string;
  productCode?: string | null;
  productUrl?: string | null;
};

function getSellerPhrase(sellerName?: string | null): string {
  return sellerName ? ` ${sellerName}` : "";
}

function buildSpanishProductMessage({
  sellerName,
  productName,
  productCode,
  productUrl,
}: Omit<ProductWhatsAppMessageParams, "language">): string {
  const lines = [
    `Hola${getSellerPhrase(sellerName)}, me interesa esta pieza: ${productName}.`,
    productCode ? `Código: ${productCode}` : "",
    productUrl ? `Enlace: ${productUrl}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildKicheProductMessage({
  sellerName,
  productName,
  productCode,
}: Omit<ProductWhatsAppMessageParams, "language" | "productUrl">): string {
  const lines = [
    `Saqarik${getSellerPhrase(sellerName)}, k'ut inwajo' we b'anikil re: ${productName}.`,
    productCode ? `Retal: ${productCode}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildKaqchikelProductMessage({
  sellerName,
  productName,
  productCode,
}: Omit<ProductWhatsAppMessageParams, "language" | "productUrl">): string {
  const lines = [
    `Ütz awäch${getSellerPhrase(sellerName)}, ninwajo' nintz'ët más ruwi' re b'anik re: ${productName}.`,
    productCode ? `Retal: ${productCode}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildQeqchiProductMessage({
  sellerName,
  productName,
  productCode,
}: Omit<ProductWhatsAppMessageParams, "language" | "productUrl">): string {
  const lines = [
    `Ma sa sa' li wan${getSellerPhrase(sellerName)}, nawaj inwetam li usilal re li b'aanuhem re: ${productName}.`,
    productCode ? `Retal: ${productCode}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildProductWhatsAppMessage({
  language,
  sellerName,
  productName,
  productCode,
  productUrl,
}: ProductWhatsAppMessageParams): string {
  const spanishMessage = buildSpanishProductMessage({
    sellerName,
    productName,
    productCode,
    productUrl,
  });

  if (language === "es") {
    return spanishMessage;
  }

  const mayanMessage =
    language === "kiche"
      ? buildKicheProductMessage({ sellerName, productName, productCode })
      : language === "kaqchikel"
        ? buildKaqchikelProductMessage({ sellerName, productName, productCode })
        : buildQeqchiProductMessage({ sellerName, productName, productCode });

  return `${mayanMessage}\n\n---\n\n${spanishMessage}`;
}
