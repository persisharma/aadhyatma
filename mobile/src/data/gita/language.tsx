import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The app-wide reading language. 'hi'/'en' render the authored bilingual fields;
 * 'gu'/'kn' derive their script from the Devanagari at runtime (utils/localize.ts,
 * utils/transliterate.ts). One shared context for every section — RULEBOOK §3.
 */
export type Lang = 'hi' | 'en' | 'gu' | 'kn';
/** The user's chosen regional script — never 'en'. */
export type RegionalLang = 'hi' | 'gu' | 'kn';

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
  /** User's chosen regional language (hi/gu/kn). Used by the 2-segment reader toggle. */
  regionalLang: RegionalLang;
  setLang: (next: Lang) => void;
};

const GitaLanguageContext = createContext<GitaLanguageContextValue | null>(null);

const LANG_STORAGE_KEY = '@vedansh/language';
const REGIONAL_LANG_STORAGE_KEY = '@vedansh/regionalLanguage';

function isRegionalLang(v: unknown): v is RegionalLang {
  return v === 'hi' || v === 'gu' || v === 'kn';
}

type ProviderProps = {
  initialLang?: Lang;
  children: React.ReactNode;
};

export function GitaLanguageProvider({ initialLang = 'hi', children }: ProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [regionalLang, setRegionalLangState] = useState<RegionalLang>(
    initialLang !== 'en' ? initialLang : 'hi'
  );

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(LANG_STORAGE_KEY),
      AsyncStorage.getItem(REGIONAL_LANG_STORAGE_KEY),
    ])
      .then(([storedLang, storedRegional]) => {
        if (isLang(storedLang)) setLangState(storedLang);
        if (isRegionalLang(storedRegional)) setRegionalLangState(storedRegional);
      })
      .catch(() => undefined);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next);
    if (next !== 'en') {
      setRegionalLangState(next);
      AsyncStorage.setItem(REGIONAL_LANG_STORAGE_KEY, next);
    }
  };

  const value = useMemo<GitaLanguageContextValue>(
    () => ({ lang, regionalLang, setLang }),
    [lang, regionalLang]
  );
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
