import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The app-wide reading language. 'hi'/'en' render the authored bilingual fields;
 * 'gu'/'kn' derive their script from the Devanagari at runtime (utils/localize.ts,
 * utils/transliterate.ts). One shared context for every section — RULEBOOK §3.
 */
export type Lang = 'hi' | 'en' | 'gu' | 'kn';

/** Historic alias — the hook predates the multi-language model. */
export type GitaLang = Lang;

export type LangScript = 'devanagari' | 'latin' | 'gujarati' | 'kannada';

export type LanguageMeta = {
  value: Lang;
  /** Full self-named label (settings radios). */
  nativeLabel: string;
  /** Compact label for the reader's segmented toggle. */
  shortLabel: string;
  /** English name, used for accessibility labels. */
  a11yLabel: string;
  script: LangScript;
};

/** Display metadata for every supported language, in toggle order. */
export const LANGUAGES: readonly LanguageMeta[] = [
  { value: 'hi', nativeLabel: 'हिन्दी', shortLabel: 'हिं', a11yLabel: 'Hindi', script: 'devanagari' },
  { value: 'en', nativeLabel: 'English', shortLabel: 'En', a11yLabel: 'English', script: 'latin' },
  { value: 'gu', nativeLabel: 'ગુજરાતી', shortLabel: 'ગુ', a11yLabel: 'Gujarati', script: 'gujarati' },
  { value: 'kn', nativeLabel: 'ಕನ್ನಡ', shortLabel: 'ಕನ', a11yLabel: 'Kannada', script: 'kannada' },
];

export function scriptOf(lang: Lang): LangScript {
  return (LANGUAGES.find((l) => l.value === lang) as LanguageMeta).script;
}

function isLang(v: unknown): v is Lang {
  return LANGUAGES.some((l) => l.value === v);
}

type GitaLanguageContextValue = {
  lang: Lang;
  setLang: (next: Lang) => void;
};

const GitaLanguageContext = createContext<GitaLanguageContextValue | null>(null);

const LANG_STORAGE_KEY = '@vedansh/language';

type ProviderProps = {
  initialLang?: Lang;
  children: React.ReactNode;
};

export function GitaLanguageProvider({ initialLang = 'hi', children }: ProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY)
      .then((stored) => {
        if (isLang(stored)) setLangState(stored);
      })
      .catch(() => undefined);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next);
  };

  const value = useMemo<GitaLanguageContextValue>(() => ({ lang, setLang }), [lang]);
  return <GitaLanguageContext.Provider value={value}>{children}</GitaLanguageContext.Provider>;
}

export function useGitaLanguage(): GitaLanguageContextValue {
  const ctx = useContext(GitaLanguageContext);
  if (!ctx) {
    throw new Error(
      'useGitaLanguage must be used inside <GitaLanguageProvider>. Check App.tsx wiring.'
    );
  }
  return ctx;
}
