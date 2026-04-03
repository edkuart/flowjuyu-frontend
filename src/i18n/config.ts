export const SUPPORTED_LANGUAGES = [
  "es",
  "kiche",
  "kaqchikel",
  "qeqchi",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type Locale = SupportedLanguage;

export const DEFAULT_LANGUAGE: SupportedLanguage = "es";
export const defaultLocale: Locale = DEFAULT_LANGUAGE;

export const LANGUAGE_STORAGE_KEY = "flowjuyu.language";
export const LANGUAGE_CHOSEN_KEY = "flowjuyu.languageChosen";
