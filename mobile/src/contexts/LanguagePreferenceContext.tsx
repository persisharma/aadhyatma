import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@vedansh/language';

type Lang = 'hi' | 'en';

type LanguagePreferenceContextValue = {
  defaultLang: Lang;
  setDefaultLang: (lang: Lang) => void;
};

const LanguagePreferenceContext = createContext<LanguagePreferenceContextValue>({
  defaultLang: 'hi',
  setDefaultLang: () => {},
});

export function LanguagePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [defaultLang, setLang] = useState<Lang>('hi');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw === 'en' || raw === 'hi') setLang(raw);
    });
  }, []);

  const setDefaultLang = useCallback((lang: Lang) => {
    setLang(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return (
    <LanguagePreferenceContext.Provider value={{ defaultLang, setDefaultLang }}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
}

export function useLanguagePreference() {
  return useContext(LanguagePreferenceContext);
}
