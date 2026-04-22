export const lightColors = {
  background: '#FFFFFF',
  surface: '#F7F7F8',
  text: '#111827',
  textMuted: '#6B7280',
  primary: '#4F46E5',
  border: '#E5E7EB',
} as const;

export type ColorPalette = typeof lightColors;
