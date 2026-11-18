# A2 actual reader component render

From `mobile`: `npm ci --prefix visual/sanatan`, then `node visual/vaishno-chalisa/build.mjs` and serve `visual/vaishno-chalisa/dist`.

This imports the real `ChalisaReaderScreen`, registry, VersePage, theme/fonts, language toggle, artwork resolver and UI components. It is not a hand-drawn mockup. Native services (storage, audio, sharing, navigation, routine actions, read dwell) use inert browser adapters; it is **not an installed iOS/Android screenshot or native acceptance**. Artwork uses the production manifest URL via the preview cache adapter.

Parameters: `lang=hi|en|gu|kn`, `size=M|L`, `width=320|390`, `page=0..41`. The page index is zero-based. Native flows and saved-state/export/playback tests remain required.
