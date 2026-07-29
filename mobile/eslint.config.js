// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Design-system guards (mobile design review, Jul 2026 — findings M-3, M-5, H-1).
//
// These three antipatterns all fail *silently* in React Native, which is why
// they kept landing: a font-family string naming an unloaded face renders in the
// system font with no warning (exactly how the NotoSansDevanagari bug survived
// four call sites), a hand-typed shadow colour drifts a shade per file, and
// sub-10px chrome can never be enlarged because the font-scale system
// deliberately never scales UI chrome.
//
// Each message names the token that replaces the literal, so the error is the
// fix. `src/theme/` is exempt — that is where the tokens are defined.
const designSystemRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector:
        "Literal[value=/^(NotoSerif(Devanagari|Gujarati|Kannada)|NotoSans|CormorantGaramond|Inter)_/]",
      message:
        'Raw font-family string. Import from @/theme/typography (fontFamilies.*) — a typo or unloaded face falls back to the system font silently.',
    },
    {
      selector: "Property[key.name='shadowColor'] > Literal[value=/^#/]",
      message:
        'Raw shadowColor hex. Spread a token from @/theme/elevation (elevation.card / elevation.raised) so cards do not float at different heights.',
    },
    {
      selector: "Property[key.name='fontSize'] > Literal[value<10]",
      message:
        'fontSize below the 10pt floor. UI chrome is never font-scaled, so this can never be enlarged — grow the control or drop the label (design.md §3).',
    },
  ],
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/theme/**", "**/__tests__/**"],
    rules: designSystemRules,
  },
]);
