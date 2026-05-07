import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GitaLang = 'hi' | 'en';

type GitaLanguageContextValue = {
  lang: GitaLang;
  setLang: (next: GitaLang) => void;
};

const GitaLanguageContext = createContext<GitaLanguageContextValue | null>(null);

const LANG_STORAGE_KEY = '@vedansh/language';

type ProviderProps = {
  initialLang?: GitaLang;
  children: React.ReactNode;
};

export function GitaLanguageProvider({ initialLang = 'hi', children }: ProviderProps) {
  const [lang, setLangState] = useState<GitaLang>(initialLang);

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((stored) => {
      if (stored === 'hi' || stored === 'en') setLangState(stored);
    });
  }, []);

  const setLang = (next: GitaLang) => {
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
