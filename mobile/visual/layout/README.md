# Screen clipping browser regressions

Run from `mobile/` after `npm ci`:

```sh
npm install --prefix visual/kundali --ignore-scripts --no-audit --no-fund
node visual/kundali/node_modules/playwright/cli.js install chromium
LAYOUT_BASE_REF=e759b98122fd3cc6e863e7df4f879f2b2cf74d08 node visual/layout/check.mjs
node visual/layout/check.mjs
```

The baseline is a read-only `git show` projection of ReaderHeader, NowPlayingScreen
and CityPicker. The working tree is never overwritten. Its 72 cases record the
known failures; the fixed 144 cases assert complete header text, contained search,
scroll-to-repeat with Minimize still visible, repeat callbacks, city filtering,
selection and dismissal. Four languages × M/L × three portrait viewports are
covered. The fixed run also stresses text at 1.6× browser magnification. This is
not an OS accessibility-scale test. Output is `visual-output/layout/{before,after}`.

ReaderHeader, theme, fonts, localization, TextField and NowPlayingScreen come from
production source. CityPicker and its full StyleSheet are extracted unchanged
from KundaliScreen, with four fixture cities. Native adapters provide read-only
language/size/audio state, zero safe-area insets and dimension-preserving icons/art.
Browser script-fallback faces replace Linux's missing OS Indic fallback. The
full Kundali journey and audio callback contract are separately tested in Jest.

Optional execution overrides: `LAYOUT_BROWSER_MODULES` (directory containing
vite/react-native-web/react-dom), `LAYOUT_PLAYWRIGHT_MODULE` (Playwright module),
`CHROMIUM_EXECUTABLE_PATH`, `LAYOUT_PORT`. Default port: 4178.

Native iOS/Android font rasterization, keyboard/gesture/permission behavior,
real audio playback and actual device safe areas still require Maestro/device QA.
The touched native flows record header, city-field and repeat-control screenshots.
No screenshot here is an installed-app screenshot.
