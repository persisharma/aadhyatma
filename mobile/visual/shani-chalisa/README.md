# A1 actual reader component render

From `mobile`: `npm ci --prefix visual/sanatan`, then `node visual/shani-chalisa/build.mjs` and serve `visual/shani-chalisa/dist`.

This imports the real `ChalisaReaderScreen`, registry, VersePage, theme/fonts, language toggle, artwork resolver and UI components. It is not a hand-drawn mockup. Native services (storage, audio, sharing, navigation, routine actions, read dwell) use inert browser adapters; it is **not an installed iOS/Android screenshot or native acceptance**. Artwork uses the production manifest URL via the preview cache adapter.

Parameters: `lang=hi|en|gu|kn`, `size=M|L`, `width=320|390`, `page=0..42`. The page index is zero-based. Native flows and saved-state/export/playback tests remain required.

The scoped `A1 Shani Chalisa component preview` PR workflow builds this exact adapter and uses pinned Playwright 1.56.1 to capture opening, first chaupai and closing for all four languages at Standard/Large. Its artifact name explicitly says web, not native. Run `PLAYWRIGHT_MODULE=/path/to/playwright node mobile/visual/shani-chalisa/capture.cjs` after building. Local screenshot capture may be unavailable when Chromium sockets are restricted; CI capture is independent of native acceptance.
