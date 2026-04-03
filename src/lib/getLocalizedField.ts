import type { SupportedLanguage } from "@/i18n/config";

type LocalizedValue = string | null | undefined;

function normalizeValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getLocalizedField<T extends object, K extends string>(
  obj: T | null | undefined,
  field: K,
  language: SupportedLanguage,
): string | null {
  if (!obj) return null;
  const source = obj as Record<string, unknown>;

  if (language !== "es") {
    const localizedKey = `${field}_${language}`;
    const localizedValue = normalizeValue(
      source[localizedKey] as LocalizedValue,
    );
    if (localizedValue) return localizedValue;
  }

  return normalizeValue(source[field] as LocalizedValue);
}
