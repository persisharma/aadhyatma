import React, { createContext, useContext, useMemo } from 'react';
import { lightColors, type ColorPalette } from './colors';
import { typography, type TypographyScale } from './typography';
import { spacing, radii, type SpacingScale, type RadiiScale } from './spacing';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radii: RadiiScale;
};

const defaultTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  radii,
};

const ThemeContext = createContext<Theme>(defaultTheme);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo<Theme>(() => defaultTheme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
