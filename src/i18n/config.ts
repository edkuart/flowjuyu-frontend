export type Locale = (typeof locales)[number];

export const locales = ["es"] as const;
export const defaultLocale: Locale = "es";
