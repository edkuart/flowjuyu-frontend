import type { SupportedLanguage } from "./config";

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  shortCode: string;
  direction: "ltr" | "rtl";
}

export const LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  es: {
    code: "es",
    label: "Español",
    nativeLabel: "Español",
    shortCode: "ES",
    direction: "ltr",
  },
  kiche: {
    code: "kiche",
    label: "K'iche'",
    nativeLabel: "K'iche'",
    shortCode: "KI",
    direction: "ltr",
  },
  kaqchikel: {
    code: "kaqchikel",
    label: "Kaqchikel",
    nativeLabel: "Kaqchikel",
    shortCode: "KA",
    direction: "ltr",
  },
  qeqchi: {
    code: "qeqchi",
    label: "Q'eqchi'",
    nativeLabel: "Q'eqchi'",
    shortCode: "QE",
    direction: "ltr",
  },
};
