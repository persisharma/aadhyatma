/**
 * Baked illustration palette for the deity avatar glyphs.
 *
 * These are deliberate illustration colors baked into the art — NOT theme
 * tokens — per the sanctioned exception in design.md §42. The glyphs sit on
 * the fixed warm `cardThumbActiveFrom → cardThumbActiveTo` medallion gradient,
 * so they keep a hand-painted miniature look instead of adapting to theme.
 *
 * On the cool hues: `leafGreen`, `teal` and `deepBlue` are the peacock/water
 * family (Krishna's feather, Kartikeya's plume, Ganga's waves). They are a
 * deliberate, bounded exception to the warm-manuscript "never green/red" rule in
 * theme/colors.ts, which governs theme colour and UI chrome. They are painted
 * attributes, never signals: nothing here may be imported into chrome — no
 * badge, chip, border, state colour or icon tint outside these glyph files.
 * Chrome takes its colour from theme/colors.ts only.
 */
export const ink = '#733207';
export const gold = '#D49A35';
export const goldSoft = '#F4C872';
export const cream = '#FFF7E7';
export const leafGreen = '#17715D';
export const teal = '#0B7D82';
export const deepBlue = '#064D5E';
export const featherYellow = '#E5BE2E';
export const featherRim = '#6DAF29';
export const flame = '#E0701F';
