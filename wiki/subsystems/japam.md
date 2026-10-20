---
title: Japam Counter & Stotra Paath
type: subsystem
sources: [mobile/src/data/japam/index.ts, mobile/src/data/japam/paath.ts, mobile/src/data/japam/japam.json, mobile/src/contexts/JapamCounterContext.tsx, mobile/src/screens/JapamCounterScreen.tsx, mobile/src/components/StartJapaButton.tsx, mobile/src/components/JapamMala.tsx, mobile/src/components/JapamAudioPlayer.tsx, mobile/src/data/__tests__/stotramPaath.test.ts, mobile/src/screens/__tests__/JapamCounterMala.test.tsx, design.md, RULEBOOK.md]
last_verified_date: 2026-10-20
confidence: high
status: current
---

## Summary

The JapaMala counter (`JapamCounterScreen`, Home stack, route `JapamCounter { mantraId, autoPlay? }`)
counts 108-bead rounds of one counter entry. An entry is either a **mantra** (`japam.json`, 7 today)
or, since Oct 2026, a **stotra paath** — any `category: 'stotram'` text, counted **one bead per
complete recitation**. Both are `JapamMantra` objects resolved by `findJapamMantra(id)`, so every
id-keyed consumer treats them alike. design.md §35 / §35.1, RULEBOOK §3 "Every stotram is startable as japa".

## Details

- **Counts**: `JapamCounterContext` persists `{count, rounds, updatedAt}` per id at
  `@vedansh/japam-counter`; `increment` rolls over at `JAPAM_BEADS_PER_ROUND = 108` and logs
  `logJapaBead`/`logJapaRound` to `UserActivityContext` (today's tally, Profile, widget totals).
- **Two lookups, two audiences.** `japamMantras` is the *list* (library, search, Ask, versePool,
  backgrounds coverage, the alarm picker). `findJapamMantra`/`getJapamMantra` is the *id resolver*
  (counter, alarm scheduler/native/deep link, widget deep link, routine units, wishlist,
  AddToRoutineSheet, Profile labels) and falls back to `findStotramPaath`. Paaths never join the list.
- **Paath registry** (`data/japam/paath.ts`): `SOURCES` = the 12 stotram-category sources, each
  `unit: 'each'` (every chapter its own hymn → id `paath.<sourceId>.<chapter>`) or `'whole'`
  (one stotra across chapters / single text → `paath.<sourceId>`). 22 paaths. A built entry
  carries `paath: { sourceId, chapter?, verseCount, parts[] }`; `lines`/`meaning*` are the opening
  verse (used by share). Built entries are memoised (stable identity for `useMemo`).
- **Entry**: `StartJapaButton` (`repeat` icon + `जप` pill) on the nine stotram readers' toggle
  row, absolutely pinned left (`japaSlot`), mirroring read-aloud on the right. It takes the reader's
  `navigation` prop rather than `useNavigation()` so reader tests stay navigator-free.
- **Paath mode** on the counter: head = stotra name + `N पद · सम्पूर्ण पाठ`; the audio row becomes
  `पाठ पढ़ें`, which opens a sheet with the whole text and a `पाठ पूर्ण · एक मनका` button that counts
  one bead. Surface taps still count a paath. Background = the section's sketch.

## Dependencies

[[readers]] · [[japam-alarms]] · [[audio]] · [[home-widgets]] · [[routine]] · [[notifications]]

## Gotchas

- **`data/japam` is on the launch graph** (`texts.ts` → `japam`). `paath.ts` reaches the stotram
  corpora only through `require()` thunks inside functions; a static import of any stotram
  `index.ts` (stuti's imports four JSON payloads eagerly) would put them on every cold start —
  `launchGraph.test.ts` gates it.
- **Title cards.** Chaptered stotram JSON (`sanskrit` shape) opens each chapter with a `number: 0`
  title/benefits card — not recited, not counted. Bajrang Baan's `number: 0` (`lines` shape) is the
  opening doha and *is* recited. The rule is `number === 0 && sanskrit !== undefined`.
- **Ids must stay URL-safe** — the Japam widget deep link and its native `exactLink` validators
  carry `lastUsedMantraId`; that's why paath ids use `.` not `:`.
- **New stotram-category text** → add it to `SOURCES` and render `StartJapaButton` in its reader;
  `stotramPaath.test.ts` fails while the registry and the library category disagree.
- Widget "total beads" sums mantra beads and paaths together (one bead = one paath by design).
