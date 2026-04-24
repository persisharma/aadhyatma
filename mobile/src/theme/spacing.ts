export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screenGutter: 28,
  cardGap: 12,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

export type SpacingScale = typeof spacing;
export type RadiiScale = typeof radii;
