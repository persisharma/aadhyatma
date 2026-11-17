# A4 actual reader component render

From `mobile`: `npm ci --prefix visual/sanatan`, then `node visual/kali-chalisa/build.mjs` and serve `visual/kali-chalisa/dist`.

This imports the real `ChalisaReaderScreen`, registry, VersePage, theme/fonts, language toggle, artwork resolver and UI components. It is not a hand-drawn mockup. Native services (storage, audio, sharing, navigation, routine actions, read dwell) use inert browser adapters; it is **not an installed iOS/Android screenshot or native acceptance**. Artwork uses the production manifest URL via the preview cache adapter.

Parameters: `lang=hi|en|gu|kn`, `size=M|L`, `width=320|390`, `page=0..56`. The page index is zero-based. Native flows and saved-state/export/playback tests remain required.

Capture with `PLAYWRIGHT_MODULE=/path/to/playwright node mobile/visual/kali-chalisa/capture.cjs` from the repository root after building. The PR workflow uses Playwright 1.56.1 and captures opening/middle/closing pages in all four languages at 390px Standard and 320px Large. Capture tooling is not proof that captures have run.
