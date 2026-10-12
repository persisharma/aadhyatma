# Reader artwork placement correction — 11 October 2026

The user reported that the illustration on every reader card pushes text down and adds scrolling.
Changed paginated readers to show artwork on the opening reading card only. For chaptered
readers this means the first actual verse of each chapter/theme, excluding chapter-navigation
transition cards. Katha and Pitru introduction readers show it on section zero only.

Later cards keep the existing parchment and gold divider without a banner, manuscript fallback,
reserved banner height or banner cache subscription. A bookmark/deep link to a later verse does
not make that verse an opening card. Single continuous prose and standalone detail/daily/guide
screens retain their one opening illustration; Vidhi conduct already used first-step-only art.

## Implementation scope

- Seven canonical verse layouts accept an optional `showIllustration` prop, default false.
- All 21 paginated verse screens explicitly select the first actual verse. The nine chaptered
  screens use their existing offset-adjusted verse index. See `screen-map.json`.
- `KathaSectionPage` selects section zero for both Vrat Katha and Pitru introduction.
- Reading text, meanings, typography, chapter transitions, read-aloud and share layouts are
  unchanged by this correction. Existing standalone artwork remains available.

## Fresh verification

| Check | Result |
| --- | --- |
| Regression reproduced before changes | 8 failing placement tests, 1 passing standalone-prose test |
| Focused suites | 4 suites, 47 tests passed |
| Complete mobile Jest suite | 239 suites, 2,201 tests passed |
| TypeScript | `tsc --noEmit` passed |
| ESLint | 30 touched code files, zero errors/warnings |
| Release simulator build | Passed, zero build errors |
| Native Chalisa | Opening banner retained; card 2 has no image/frame; full verse and meaning visible without vertical scrolling |
| Native Katha | Opening banner retained; section 2 starts with prose; vertical scrolling reaches its complete final paragraph |

The actual native before/after comparison is Durga Chalisa card 2 of 41, Hindi Standard,
on the same iPhone 17 Pro / iOS 26.5 simulator. No screenshot crop, compositing or pixel edit.
`index.html` includes that pair, both opening cards, and Katha section 2 before/after scrolling.
Native captures and build metadata are saved here; `native-snapshots.json` records page counters
and source text. The simulator UDID is `5AD7B853-9A21-4247-98C6-47BAE046E16E`.

The installed QA Release app disables OTA so its displayed JavaScript is the newly built
source. The ignored generated native Expo.plist was restored byte-for-byte immediately after
building. Production configuration was not edited.

Native visual inspection for this correction covers Chalisa and Katha at Hindi Standard,
not a fresh walkthrough of every reader, language or size. Long prose can still require
scrolling because of its text length. This is not a frame-rate, CPU or physical-device benchmark.

## Preserved R2 and cache contract

SHA-256 checks confirm these three files are byte-for-byte unchanged from before this correction:

- `mobile/src/utils/backgroundAssetCache.ts`:
  `ba114dc0f23e75a14aac39aefd8a1569aceef8392c00d2f4650c62cb79b791eb`
- `mobile/src/data/readerIllustrationManifest.json`:
  `1475994bb2719bfb0cda8e46421148b6487f72cc27011278479c3cd0354f19fc`
- `mobile/src/data/backgroundAssetManifest.json`:
  `81f9bc292b4bef8c631228aee126fa9891241a4800c8798e2ce8b1ab03ae022f`

No asset upload, remote manifest change, cache clearing, release or native dependency change
was needed. Opening artwork uses the same R2 persistent content-hash cache. Earlier native
download-once, restart, outage fallback and TLS environment evidence remains in
`../r2-loading-followup/review.md`. This correction avoids mounting redundant banners
on continuation cards; it does not establish a numerical speed improvement.
