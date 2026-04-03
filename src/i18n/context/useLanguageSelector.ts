"use client";

import { useLanguage } from "./useLanguage";

export interface LanguageSelectorState {
  /** True once localStorage has been read on the client — safe to render language-dependent UI */
  isHydrated: boolean;
  /** True when the user has never explicitly chosen a language */
  shouldShowSelector: boolean;
}

/**
 * Returns the state needed to conditionally render a first-visit language
 * selection UI. Decoupled from the UI itself so the logic is testable.
 */
export function useLanguageSelector(): LanguageSelectorState {
  const { isHydrated, hasChosenLanguage } = useLanguage();
  return {
    isHydrated,
    shouldShowSelector: isHydrated && !hasChosenLanguage,
  };
}
