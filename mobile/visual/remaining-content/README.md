# Actual-component review harness

Run `node mobile/visual/remaining-content/build.mjs` from the repository root after installing mobile dependencies and the existing `mobile/visual/sanatan` web dependencies. Serve the resulting `dist` folder. Example: `/?kind=stuti&id=hanuman-bahuk&page=43&lang=hi&size=L&width=320`.

The harness imports production Stuti, Suktam and Ashtakam readers. It accepts `kind`, the matching content `id`, zero-based `page`, `lang` (hi/en/gu/kn), `size` (M/L), and `width`. Native navigation, persistence, audio and sharing are adapters; this is not evidence that those services work on a device. `capture.cjs` provides first/last-page capture checks for the three small-text readers when Playwright is available.

Build passed on 17 November 2026. Actual screenshot capture is BLOCKED: Chromium cannot create its required socket (`Operation not permitted`) in this execution environment. The separate cloud browser also could not reach the local preview server (`ERR_CONNECTION_REFUSED`). No screenshot is supplied or claimed as reviewed. Native iOS/Android, long Bahuk layout, accessibility, font-scale, share/export, offline behavior and performance remain pending. Keep the PR draft until these checks and visual review are complete.

Generated dist/captures are intentionally excluded from git. These sources reproduce the preview; they are not a replacement for actual built screenshots.
