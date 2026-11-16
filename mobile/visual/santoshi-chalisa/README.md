# A3 actual reader component render

From `mobile`: `npm ci --prefix visual/sanatan`, then `node visual/santoshi-chalisa/build.mjs` and serve `visual/santoshi-chalisa/dist`.

This imports the real `ChalisaReaderScreen`, registry, VersePage, theme/fonts, language toggle, artwork resolver and UI components. It is not a hand-drawn mockup. Native services (storage, audio, sharing, navigation, routine actions, read dwell) use inert browser adapters; it is **not an installed iOS/Android screenshot or native acceptance**. Artwork uses the production manifest URL via the preview cache adapter.

Parameters: `lang=hi|en|gu|kn`, `size=M|L`, `width=320|390`, `page=0..41`. The page index is zero-based. Native flows and saved-state/export/playback tests remain required.

Capture with a locally installed Playwright Chromium: `node visual/santoshi-chalisa/capture.cjs` (set `PLAYWRIGHT_MODULE` to a nonstandard Playwright module path if needed). It uses a UTF-8 loopback server on port 8768, waits for fonts/images, and records four languages × Standard/Large × opening/body-25/closing in `captures/`. These generated captures are not committed automatically and must be visually inspected. The current task environment could build but could not run the browser; actual screenshot acceptance remains pending.
