"use client";

import { Globe } from "lucide-react";

import { useLanguage } from "../context/useLanguage";
import { useLanguageSelector } from "../context/useLanguageSelector";
import { SUPPORTED_LANGUAGES } from "../config";
import { LANGUAGES } from "../languages";

export function LanguageSelectorModal() {
  const { isHydrated, shouldShowSelector } = useLanguageSelector();
  const { language, setLanguage } = useLanguage();

  if (!isHydrated || !shouldShowSelector) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-selector-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f2e22]/10 text-[#0f2e22]">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="language-selector-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Elige tu idioma
            </h2>
            <p className="text-sm text-neutral-500">
              Puedes cambiarlo nuevamente desde el encabezado.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = language === lang;

            return (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-[#0f2e22] bg-[#0f2e22]/5 text-[#0f2e22]"
                    : "border-neutral-200 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span className="font-medium">
                  {LANGUAGES[lang].nativeLabel}
                </span>
                <span className="text-xs tracking-[0.2em] text-neutral-400 uppercase">
                  {LANGUAGES[lang].shortCode}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
