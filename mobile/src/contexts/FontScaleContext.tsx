import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONT_SCALES, DEFAULT_FONT_SCALE, fontScaleFactor, type FontScale } from '@/theme/fontScale';

const STORAGE_KEY = '@vedansh/font-scale';

type FontScaleContextValue = {
  /** Active reading-text size preset. */
  scale: FontScale;
  /** Multiplier for the active scale (e.g. 1.0 for M, 1.15 for L). */
  factor: number;
  /** False once the persisted choice has been read from storage. */
  isLoading: boolean;
  setScale: (scale: FontScale) => void;
};

const FontScaleContext = createContext<FontScaleContextValue>({
  scale: DEFAULT_FONT_SCALE,
  factor: fontScaleFactor(DEFAULT_FONT_SCALE),
  isLoading: true,
  setScale: () => {},
});

function isFontScale(value: unknown): value is FontScale {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(FONT_SCALES, value);
}

type FontScaleProviderProps = {
  children: React.ReactNode;
};

export function FontScaleProvider({ children }: FontScaleProviderProps) {
  const [scale, setScaleState] = useState<FontScale>(DEFAULT_FONT_SCALE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (mounted && isFontScale(raw)) setScaleState(raw);
      })
      .catch(() => {
        /* storage unavailable — fall back to default */
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setScale = useCallback((next: FontScale) => {
    setScaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      /* best-effort persistence */
    });
  }, []);

  const value: FontScaleContextValue = {
    scale,
    factor: fontScaleFactor(scale),
    isLoading,
    setScale,
  };

  return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
}

export function useFontScale(): FontScaleContextValue {
  return useContext(FontScaleContext);
}
