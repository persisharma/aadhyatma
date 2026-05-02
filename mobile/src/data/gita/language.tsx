import React, { createContext, useContext, useMemo, useState } from 'react';

export type GitaLang = 'hi' | 'en';

type GitaLanguageContextValue = {
  lang: GitaLang;
  setLang: (next: GitaLang) => void;
};

const GitaLanguageContext = createContext<GitaLanguageContextValue | null>(null);

type ProviderProps = {
  initialLang?: GitaLang;
  children: React.ReactNode;
};

export function GitaLanguageProvider({ initialLang = 'hi', children }: ProviderProps) {
  const [lang, setLang] = useState<GitaLang>(initialLang);
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
