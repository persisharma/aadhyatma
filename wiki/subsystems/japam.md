---
title: Japam Counter & Sloka Japa
type: subsystem
sources: [mobile/src/components/JapamMandala.tsx, mobile/src/components/japamMandalaLayout.ts, mobile/src/components/JapamInfinityLoop.tsx, mobile/src/components/KaraokeText.tsx, mobile/src/components/karaokeTiming.ts, mobile/src/components/japamRecitationTiming.ts, mobile/src/components/JapamMantraRing.tsx, mobile/src/components/japamMantraRingLayout.ts, mobile/src/components/japamInfinityPlayback.ts, mobile/src/components/JapamInfinity.tsx, mobile/src/components/japamInfinityGeometry.ts, mobile/src/utils/useJapamStyle.ts, mobile/src/data/japam/index.ts, mobile/src/data/japam/grahaBeej.ts, mobile/src/components/GrahaReadingList.tsx, mobile/src/screens/KundaliScreen.tsx, mobile/src/data/backgrounds.ts, mobile/src/data/devotionalShareArt.ts, mobile/src/data/discoveryMeta.ts, mobile/.maestro/japam-smoke.yaml, mobile/src/data/japam/sloka.ts, mobile/src/data/japam/japam.json, mobile/src/contexts/JapamCounterContext.tsx, mobile/src/screens/JapamCounterScreen.tsx, mobile/src/components/StartJapaButton.tsx, mobile/src/components/JapamMala.tsx, mobile/src/components/JapamAudioPlayer.tsx, mobile/src/data/__tests__/slokaJapa.test.ts, mobile/src/screens/__tests__/JapamCounterMala.test.tsx, design.md, RULEBOOK.md]
last_verified_date: 2026-11-07
confidence: high
status: current
---

## Summary

The JapaMala counter (`JapamCounterScreen`, Home stack, route `JapamCounter { mantraId, autoPlay? }`)
counts 108-bead rounds of one counter entry. An entry is either a **mantra** (`japam.json`, 22 today, incl. the nine Navagraha beej mantras)
or, since Oct 2026, a **sloka** — any shloka of a `category: 'stotram'` text, chanted exactly like a
mantra (one bead per recitation of that shloka). Both are `JapamMantra` objects resolved by
`findJapamMantra(id)`, so every id-keyed consumer treats them alike. design.md §35 / §35.1,
RULEBOOK §3 "Every stotram shloka is startable as japa".

## Details

- **Display styles**: Mala (default) and Infinity share this same counter/player/route. The radio row is outside the counting target, so switching never counts a bead or restarts playback. `useJapamStyle` hydrates `@vedansh/japam-style` (`"mala"` / `"infinity"` JSON strings), then enables selection; no default write on load, serialized writes and corrupt/offline fallback to Mala. This is a global visual preference, independent of mantra IDs.
- **Infinity**: first tap starts full-utterance loops (`japamRecitationTiming.ts`: canonical text at the user-approved fast preset, or the active recording’s average cadence), next pauses, another resumes. Each completed silent cycle adds one bead via the shared provider; `japaAutoCountSource` gives audio sole ownership while it plays and suppresses both sources when paused. The driver's per-cycle consumed guard prevents duplicate counts and late/cancelled callbacks never count. Loop callbacks use the latest handler without restarting animation on count changes. Mantra keys isolate stale sessions. Reduced Motion keeps the marker still while count cycles continue. Background/blur/unmount suspend/cancel without elapsed-time catch-up; opening/style/mantra change are paused. The approved seamless parchment stage has no fill, border or card shadow. `saffronDeep` path/outlined jyoti and `inkSoft` numbers retain contrast on cream; enlarged numbers still move below. Eight native interpolation nodes and the side-ring elements are reused across count updates; continuous animations use `isInteraction: false`. **Ornamental mandala**: the approved animation now uses one full lotus/beaded frame, two 56s/72s native turns and a smaller central ∞; a tight inner region moves the loop below. `JapamMandala` measures complete native-shaped script syllables once and `japamMandalaLayout` fits their full rectangles and angular sectors. Virama-linked consonants, reph, signs and joiners stay together; no SVG textPath, WebView or bitmap renderer. Longer passages span both bands and, when needed, native opacity windows on the existing reading phase. Primary karaoke text is complete and scrollable below; counters are always readable below the frame. Pause/background/blur/unmount rest all decorative motion; cancelled callbacks cannot restart it. Count updates reuse the frame, band nodes and loop graph. Fixed decorative type stays separate from accessible reading sizes. The 384-run budget affects decoration only. Native visual/low-end Android evidence remains pending; font-metric tests are not native screenshots.
- **Catalogue additions (7 Nov 2026)**: `mahalakshmi-mantra` (ॐ श्रीं महालक्ष्म्यै नमः) and `kubera-mantra` (35-syllable). Reference hosts (drikpanchang, shubhpanchang) were blocked in the cloud build, so both are search-verified only — re-read before release. `japam/index.ts` `validDeities` gained `lakshmi`/`kubera`; each new id also needs `backgrounds.ts`, `devotionalShareArt.ts` and `discoveryMeta.ts` rows (widget heritage falls back to `prayer`). Lakshmi Gayatri was held back: sources disagree on श्री/visarga/closing ॐ. Mahalakshmi Ashtakam shlokas are not sloka-japa yet (ashtakam readers have no जप pill).
- **Completion beat**: naam japa pulses 1.14 → 1 on every chanted bead; in Infinity all other mantras/shlokas pulse 1.04 → 1 per completed loop (Nov 2026 user report: only Radha "felt" complete). Vibration was never per-mantra, but Light ticks seconds apart went unfelt on iPhone 14 for shlokas/long mantras (expo-haptics creates and fires a new generator per call, so a cold Taptic Engine after a long gap); automatic counts (Infinity loop, audio repetition) now use Medium, taps stay Light, mala completion stays Success. The beat skips loading, restored counts and mantra/style switches.
- **Karaoke**: Infinity uses the shared [[concepts/karaoke]] renderer. The screen supplies the same phase to words and jyoti; word colours advance in order, hold on pause and reset for each loop/new mantra/style. Existing script type and full text remain; Reduced Motion is static. The renderer never counts. Other readers remain unchanged until their later integration.
- **Cadence and tempo**: 1× examples are Radha 880ms, Jai Shri Ram 880ms and Gayatri 4000ms; the whole canonical mantra or shloka determines the duration, with the requested up-to-three-word cap of 1000ms at 1×. The existing 0.5–1.5× tempo also works for silent Infinity with no recording. While audio is playing, decoded duration divided by repetitions supplies its natural average; rate is applied once. Previous-mantra timing is rejected. Changing tempo preserves the remaining phase and never increments by itself. Estimates do not measure actual spoken completion.
- **Counter footer**: both styles show completed malas and reset, without the redundant daily-count label; current beads stay in the visualization. The screen no longer directly subscribes to the activity ledger for that label. Native device performance remains unverified.
- **Counts**: `JapamCounterContext` persists `{count, rounds, updatedAt}` per id at
  `@vedansh/japam-counter`; `increment` rolls over at `JAPAM_BEADS_PER_ROUND = 108` and logs
  `logJapaBead`/`logJapaRound` to `UserActivityContext` (today's tally, Profile, widget totals).
- **Two lookups, two audiences.** `japamMantras` is the *list* (library, search, Ask, versePool,
  backgrounds coverage, the alarm picker). `findJapamMantra`/`getJapamMantra` is the *id resolver*
  (counter, alarm scheduler/native/deep link, widget deep link, routine units, wishlist,
  AddToRoutineSheet, Profile labels) and falls back to `findSlokaJapa`. Slokas never join the list.
- **Sloka registry** (`data/japam/sloka.ts`): `SOURCES` = the 12 stotram-category sources. Id
  `sloka.<sourceId>.<chapter>.<number>` (verse `number`, not page index; registry texts chapter 1).
  A built entry carries `sloka: { sourceId, chapter, number }`, the verse's lines/meaning, and a name
  `<stotra> · <label>` (`unit: 'each'` → chapter title; `'whole'` → section title, plus the part when
  it spans chapters; label = the verse's `labelHi/En`, else `श्लोक N`). Memoised (stable identity).
- **Entry**: `StartJapaButton` (`repeat` icon + `जप` pill) on the nine stotram readers' toggle
  row, absolutely pinned left (`japaSlot`), mirroring read-aloud on the right. It takes the reader's
  `navigation` prop rather than `useNavigation()` so reader tests stay navigator-free, and the
  reader's `currentIndex` as `verseIndex`; the id is resolved on press.
- **Shloka = list mantra.** `LIST_MANTRA` in `sloka.ts` maps a sloka id to a `japam.json` mantra with the
  same text (today `sloka.shiva-strotam.3.1` → `mahamrityunjaya-mantra`); `slokaJapaId` returns the
  mantra id, so the reader pill and the JapMala tile share one count. The sloka id still resolves.
- **Counter** for a sloka: the §35 counter, with the name as the caption under the lines (naam japa's
  caption), `हर श्लोक एक मनका` hint, no separate daily tally, the section's sketch as background.

## Dependencies

[[readers]] · [[panchang]] · [[japam-alarms]] · [[audio]] · [[home-widgets]] · [[routine]] · [[notifications]]

## Gotchas

- **`japam.json` bytes count against the launch-graph budget** (`launchGraph.test.ts`, 4,090,000). The
  Oct 2026 batch of 14 mantras left only ~3 KB headroom; keep per-mantra `baseText` short and put shared notes
  in the file-level `source`. Never raise the budget to fit content.
- **`data/japam` is on the launch graph** (`texts.ts` → `japam`). `sloka.ts` reaches the stotram
  corpora only through `require()` thunks inside functions; a static import of any stotram
  `index.ts` (stuti's imports four JSON payloads eagerly) would put them on every cold start —
  `launchGraph.test.ts` gates it.
- **Title cards.** Chaptered stotram JSON (`sanskrit` shape) opens each chapter with a `number: 0`
  title/benefits card — not a shloka; the pill on it starts the chapter's first shloka. Bajrang
  Baan's `number: 0` (`lines` shape) is the opening doha and *is* a shloka. The rule is
  `number === 0 && sanskrit !== undefined`.
- **Ids must stay URL-safe** — the Japam widget deep link and its native `exactLink` validators
  carry `lastUsedMantraId`; that's why sloka ids use `.` separators.
- **Ids key on verse `number`, not page index** — counts and alarms persist by id, so an inserted
  verse must not silently move a user's count to another shloka.
- **New stotram-category text** → add it to `SOURCES` and render `StartJapaButton` (with
  `verseIndex`) in its reader; `slokaJapa.test.ts` fails while the registry and the library
  category disagree.
- **Navagraha beej japa.** `GRAHA_BEEJ_JAPA_ID` (`data/japam/grahaBeej.ts`, type-only import of `Graha`)
  maps each graha to its beej entry; the entry's line must equal the `GRAHA_UPAY` mantra
  (`grahaBeejJapa.test.ts`). `GrahaReadingList`'s upay panel (`Chant on the mala`) and the Kundali Dasha tab
  (`dasha-beej-japa`, Mahadasha lord only) open them via `buildEntryStartTarget`. Beej entries are skipped by `versePool.ts`
  (never a verse of the day / Daily Bhakti card). Don't import `GRAHA_UPAY`
  into `data/japam` — that file is the whole Kundali copy and `data/japam` is on the launch graph.
- **Adding a mantra** touches `japam.json` (per-mantra `source`, URLs rolled into the file's list),
  `backgrounds.ts` `sourceBackgrounds` (a module-load throw if missing), `devotionalShareArt.ts`,
  optionally `discoveryMeta.ts`, and `japam-smoke.yaml`. A new deity tag must be in `validDeities`
  (`japam/index.ts`). Ids/`nameEn` must not contain "ashtak" — `contentCorrectness` reads that as an
  Ashtakam text (why Ganesh's is `ganapati-gam-mantra`), and must not reuse an Audio-library track id. If its text is also a stotram shloka, add it to
  `LIST_MANTRA`. The Audio-library `mahamrityunjay-mantra` recording is CDN-only, so the japam entry is
  a silent manual counter (bundling it would grow the binary).
- The audio row shows the generic "इस मंत्र की ध्वनि उपलब्ध नहीं है" notice for slokas (no recordings).
- History: the first cut (20 Oct) counted one bead per *complete paath* with a full-text sheet; replaced
  the next day by sloka japa after an A/B prototype.
