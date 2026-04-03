"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_LANGUAGE, type SupportedLanguage } from "../config";
import esDictionary, { type Dictionary } from "../dictionaries/es";
import { LANGUAGES, type LanguageMeta } from "../languages";
import { getDictionary } from "../utils/getDictionary";
import {
  getHasChosenLanguage,
  getStoredLanguage,
  setHasChosenLanguage,
  setStoredLanguage,
} from "../utils/storage";

export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  dictionary: Dictionary;
  isHydrated: boolean;
  hasChosenLanguage: boolean;
  meta: LanguageMeta;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [dictionary, setDictionary] = useState<Dictionary>(esDictionary);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasChosenLanguage, setHasChosenLanguageState] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const stored = getStoredLanguage();
    const chosen = getHasChosenLanguage();

    setLanguageState(stored);
    setHasChosenLanguageState(chosen);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (language === DEFAULT_LANGUAGE) {
      setDictionary(esDictionary);
      return;
    }

    let cancelled = false;

    getDictionary(language)
      .then((nextDictionary) => {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        setDictionary(nextDictionary);
      })
      .catch(() => {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        setDictionary(esDictionary);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    requestIdRef.current += 1;
    setLanguageState(lang);
    setStoredLanguage(lang);
    setHasChosenLanguage();
    setHasChosenLanguageState(true);

    if (lang === DEFAULT_LANGUAGE) {
      setDictionary(esDictionary);
    }
  }, []);

  const meta = LANGUAGES[language];

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      dictionary,
      isHydrated,
      hasChosenLanguage,
      meta,
    }),
    [language, setLanguage, dictionary, isHydrated, hasChosenLanguage, meta],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
