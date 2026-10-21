---
title: Japam Counter & Sloka Japa
type: subsystem
sources: [mobile/src/data/japam/index.ts, mobile/src/data/backgrounds.ts, mobile/src/data/devotionalShareArt.ts, mobile/src/data/discoveryMeta.ts, mobile/.maestro/japam-smoke.yaml, mobile/src/data/japam/sloka.ts, mobile/src/data/japam/japam.json, mobile/src/contexts/JapamCounterContext.tsx, mobile/src/screens/JapamCounterScreen.tsx, mobile/src/components/StartJapaButton.tsx, mobile/src/components/JapamMala.tsx, mobile/src/components/JapamAudioPlayer.tsx, mobile/src/data/__tests__/slokaJapa.test.ts, mobile/src/screens/__tests__/JapamCounterMala.test.tsx, design.md, RULEBOOK.md]
last_verified_date: 2026-10-21
confidence: high
status: current
---

## Summary

The JapaMala counter (`JapamCounterScreen`, Home stack, route `JapamCounter { mantraId, autoPlay? }`)
counts 108-bead rounds of one counter entry. An entry is either a **mantra** (`japam.json`, 8 today)
or, since Oct 2026, a **sloka** — any shloka of a `category: 'stotram'` text, chanted exactly like a
mantra (one bead per recitation of that shloka). Both are `JapamMantra` objects resolved by
`findJapamMantra(id)`, so every id-keyed consumer treats them alike. design.md §35 / §35.1,
RULEBOOK §3 "Every stotram shloka is startable as japa".

## Details

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
  mantra id, so the reader pill and the Jap Mala tile share one count. The sloka id still resolves.
- **Counter** for a sloka: the §35 counter, with the name as the caption under the lines (naam japa's
  caption), `हर श्लोक एक मनका` hint, `आज N श्लोक` tally, the section's sketch as background.

## Dependencies

[[readers]] · [[japam-alarms]] · [[audio]] · [[home-widgets]] · [[routine]] · [[notifications]]

## Gotchas

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
- **Adding a mantra** touches `japam.json` (per-mantra `source`, URLs rolled into the file's list),
  `backgrounds.ts` `sourceBackgrounds` (a module-load throw if missing), `devotionalShareArt.ts`,
  optionally `discoveryMeta.ts`, and `japam-smoke.yaml`. If its text is also a stotram shloka, add it to
  `LIST_MANTRA`. The Audio-library `mahamrityunjay-mantra` recording is CDN-only, so the japam entry is
  a silent manual counter (bundling it would grow the binary).
- The audio row shows the generic "इस मंत्र की ध्वनि उपलब्ध नहीं है" notice for slokas (no recordings).
- History: the first cut (20 Oct) counted one bead per *complete paath* with a full-text sheet; replaced
  the next day by sloka japa after an A/B prototype.
