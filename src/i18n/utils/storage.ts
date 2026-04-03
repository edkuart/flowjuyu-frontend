import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CHOSEN_KEY,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../config";

export function getStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // localStorage unavailable (SSR or restricted env)
  }
  return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // no-op
  }
}

export function getHasChosenLanguage(): boolean {
  try {
    return localStorage.getItem(LANGUAGE_CHOSEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHasChosenLanguage(): void {
  try {
    localStorage.setItem(LANGUAGE_CHOSEN_KEY, "true");
  } catch {
    // no-op
  }
}
