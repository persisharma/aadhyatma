---
title: Audio & Read Aloud
type: subsystem
sources: [mobile/src/contexts/AudioPlayerContext.tsx, mobile/src/contexts/ReadAloudContext.tsx, mobile/src/contexts/ReadAloudPrefsContext.tsx, mobile/src/audio/audioSession.ts, mobile/src/audio/playbackArbiter.ts, mobile/src/readAloud/, mobile/src/screens/_useReaderReadAloud.ts, mobile/src/components/readAloud/ReadAloudButton.tsx, mobile/src/components/ReadAloudSettingsSheet.tsx, mobile/src/components/RateStepper.tsx, mobile/src/components/JapamAudioPlayer.tsx, mobile/src/components/audio/MiniPlayer.tsx, mobile/src/screens/audio/NowPlayingScreen.tsx, mobile/src/data/audio/tracks.ts, design.md, RULEBOOK.md]
last_verified_date: 2026-09-04
confidence: high
status: current
---

## Summary

The app makes sound three ways, and they are **mutually exclusive**:

1. **Recorded audio** — the Bhajan tab's library, played by one app-wide `expo-audio` player
   (`AudioPlayerContext`) with a root-overlay MiniPlayer + Now Playing surface. 13 catalog tracks,
   **5 real recordings**.
2. **The japam loop** — a component-scoped looping player inside `JapamAudioPlayer` that also
   drives the bead count.
3. **Read aloud (पाठ सुनें)** — on-device TTS via `expo-speech`, reader-scoped, added July 2026.
   Covers the ~15 texts that will never get a recording — for whichever reading languages the
   device actually has a voice for; it never substitutes one language for another.

Exclusivity is arbitrated by `src/audio/playbackArbiter.ts`, **not** by any context's value.

## Details

### The arbiter — `src/audio/playbackArbiter.ts`

A plain module singleton: `registerStopper(kind, stop)` returns an unregister callback suitable
for a `useEffect`, and `claimPlayback(kind)` silences every *other* source. `PlaybackKind` is
`'recorded' | 'tts' | 'japam'`.

It is a module rather than a context field on purpose: routing exclusion through
`AudioPlayerContext`'s value would force every screen test that stubs `useAudioPlayerContext` to
grow a new field (6 files). As a module, each source opts in with one line and no consumer's
contract changes.

### Audio session — `src/audio/audioSession.ts`

`ensureBackgroundAudioMode()` is idempotent behind a module flag; every player calls it on mount.
The platform branch on `interruptionMode` (`duckOthers` on Android, `mixWithOthers` on iOS) carries
a load-bearing comment — see Gotchas.

### Read aloud

**Pure layer** (`src/readAloud/`, all Jest-tested, no React):

| File | Job |
|---|---|
| `verseAdapter.ts` | `toReadableVerse(item)` — duck-typed `in`-guards over all 7 verse shapes. Returns `null` for chapter sentinels, checked first. No `as any` (RULEBOOK §3). |
| `verseScript.ts` | `buildVerseScript(verse, lang, opts)` → one chunk **per verse line**, then meaning, then commentary. Packs prose to `maxChars` at sentence/whitespace boundaries. |
| `pronounce.ts` | `prepareForSpeech` — danda → sentence stop. Touches **only** the synthesizer string. |
| `voices.ts` | `speechLangFor` / `resolveVoice` / `voicesForTarget` / `speakOptionsFor`. Where both platform traps are neutralised. |
| `prefs.ts` | `ReadAloudPrefs` shape, rate bounds, `clampRate`. |

**Contexts.** `ReadAloudPrefsContext` (persisted `@vedansh/read-aloud`; `NotificationPreferences`
template — field-by-field `parsePrefs`, `prefsRef` mirror) and `ReadAloudContext` (voice probe,
chunk loop, session bookkeeping). Split by volatility: the controller re-renders per utterance and
must not re-render the settings surfaces.

**The session contract.** A reader hands the controller `{sourceId, totalPages, chunksFor,
scrollToPage}`. The reader owns the FlatList, so it owns scrolling; the controller only asks.
`chunksFor` returning `null` means a chapter sentinel (stop); `[]` means an empty page (skip).

**Reader wiring.** `_useReaderReadAloud.ts` builds the session, owns the swipe latch, and stops on
unmount / `sourceId` change. `ReadAloudButton` renders on the language-toggle row, pinned right
(`readAloudSlot`), below the progress bar — not in `ReaderHeader`'s `right` slot. Enabled on
**every reader** (all 21 `<Pascal>ReaderScreen`s, plus `VidhiConductScreen`) since 2026-09-04;
v1 (July 2026) had shipped Gita + Chalisa only. Flat readers pass `offset: 0` and their verse
array; chaptered readers pass the sentinel-bearing `data` + `offset` (so speech stops at a chapter
card); single-chapter texts pass `chapter?.verses ?? []` with `offset: 0`; Vrat Katha passes its
`sections` under a `katha-<id>` sourceId (prose branch). **Japam is the one deliberate exception**
— it is a counter, not a reader.

**One voice per reading language, or none.** `speechLangFor` is identity: hi→hi-IN, en→en-IN,
gu→gu-IN, kn→kn-IN. The spoken text comes from the same `verseLinesByLang`/`meaningByLang` the page
renders with, authored `meaningGu`/`meaningKn` included, so **heard === seen**. A language whose
voice the device lacks reports `unavailable` (named in its own script, with an Android TTS-settings
hop) rather than being spoken by another language's voice. See design.md §56.1.

**Indian accent only; English's one exception is `en-US`.** The picker offers a single accent per
language — the Indian one (`voicesForTarget` filters to the exact `-IN` locale, so American/British/
etc. never appear as choices). `resolveVoice` is Indian-first, then the `FALLBACK_LOCALE` map allows
**English alone** to fall back to `en-US` (near-universal default) when no `en-IN` voice is installed
— to *no other accent*. So an `en-GB`-only device reports English `unavailable`, and the `en-US`
voice is only ever the invisible fallback, never a presented option. hi/gu/kn have no fallback. A
saved voice is honoured only if its locale is still accepted (the `-IN` voice, or English's `en-US`),
so a stale non-Indian preference can never resurrect a dropped accent.

## Dependencies

- [[readers]] — the reader shell the control mounts into.
- [[overview]] — stack and module map.
- `design.md` §34 (Audio tab), §35 (Japam), §56 (Read Aloud), §57 (Rate Stepper).
- `RULEBOOK.md` §3 (read-aloud bullets), §11.15 (synthetic recitation is assistive).
- `docs/roadmap/prds/02-verse-audio.md` — the bundled-recitation plan read-aloud complements.

## Gotchas

- **Never substitute a voice across languages, and never let the engine do it for you.** This is
  the whole point of the per-language design: reading Gujarati with only a Hindi voice installed must
  be *silent*, not Gujarati-read-as-Hindi. Three guards, all needed — `resolveVoice` returns `null`
  instead of falling back (and rejects a saved identifier whose language no longer matches the
  target), `start()`/`speakPreview()` refuse when `availability === 'unavailable'`, and the probe
  gates the UI. Dropping any one of them re-opens the failure below.
- **Both platforms fail SILENTLY for a missing voice — `onError` never fires.** iOS leaves
  `utterance.voice = nil` and uses the system default; Android's `speakOut` falls back to
  `Locale.getDefault()`. Availability therefore comes from a `getAvailableVoicesAsync()` probe
  (raced against a 4 s timeout — Android's engine binds slowly) plus a **3 s `onStart` watchdog**
  for the OEM engine that reports a language then emits nothing. Never gate on `onError`.
- **Never pass `'hi-IN'` as Android's `language`.** `SpeechModule.kt` does `Locale(options.language)`
  and Java's single-arg `Locale` treats the whole string as the language, so `'hi-IN'` becomes
  `"hi-in"` → `LANG_NOT_SUPPORTED` → silent device-default fallback. `speakOptionsFor()` omits
  `language` entirely when a probed `voice` identifier exists (`setVoice` runs after it anyway) and
  otherwise passes the bare primary subtag (`'hi'`, `'gu'`, `'kn'`, `'en'`). Note `getVoices()`
  *returns* the `hi-IN` form — the format you read back is not the format Android accepts.
- **`Speech.pause`/`resume` do not exist on Android** — the native module defines only
  `isSpeaking`/`getVoices`/`stop`/`speak`. So the app never calls them on **either** platform;
  pause stops the engine and re-speaks the remembered line on resume. Granularity is one verse line.
- **iOS needs `useApplicationAudioSession: true`** or the hardware mute switch silences speech
  (`AVSpeechSynthesizer` otherwise builds its own session). Cost: under `mixWithOthers` TTS won't
  duck other apps on iOS.
- **Android `speak()` throws above ~4000 chars** (`SpeechInputIsToLongException`). The chunker caps
  at 1000 and hard-truncates a pathological no-whitespace run rather than letting it throw.
- **`expo-speech` and `expo-audio` are unparseable by Jest** — untranspiled ESM outside the RN
  preset's `transformIgnorePatterns`. Both are globally stubbed in `mobile/jest.setup.js`, because
  every reader screen now reaches them transitively (`ReaderHeader` → `ReadAloudButton` →
  `ReadAloudContext` → `audioSession` → `expo-audio`). Suites that drive playback override with
  their own `jest.mock()`. Without the global stubs, 4 reader suites fail to *run*.
- **`useReadAloud()` is a LENIENT hook** (default value, not a throw) — deliberately, so every
  reader's own smoke suite mounts without a provider. Its default reports `available: false` and
  renders no control — which also means a reader that forgot the pill looks identical to one whose
  provider is missing. The net for both is `readerReadAloud.test.tsx`, which mounts all 21 readers
  inside real providers and presses the pill on each.
- **A manual swipe re-targets, it does not stop.** The controller's own `scrollToIndex` fires the
  same `onViewableItemsChanged`/`handleScroll` a user swipe does, so a pending-page latch
  distinguishes them; a 250 ms debounce keeps a multi-page flick to one session.
- **Verify a failed scroll.** `onScrollToIndexFailed` is a no-op in every reader, so `scrollToPage`
  checks the target was reached within 600 ms and stops otherwise — else the controller speaks an
  invisible page.
- **Session token, not just a flag.** Hitting a chapter sentinel fires `navigation.replace` 400 ms
  later; a monotonic token makes any stale `onDone` from the outgoing screen instance a no-op.
- **The `interruptionMode` platform branch must not be collapsed** — expo-audio resolves
  `interruptionMode ?? interruptionModeAndroid`, so an iOS value overrides the Android one, and
  `mixWithOthers` on Android means audio focus is never requested (Android 12+ then force-mutes).
- **No OTA for read-aloud.** `expo-speech` is a native module, so it needs a store release. That
  bump drags `APP_TOUR_VERSION` + a `whatsNew[version]` entry (gated by `tourContent.jest.test.ts`).
- **The reader control is a labelled pill** — `▶︎`/`❚❚` icon + a localized "Listen"/"Pause" label
  (design.md §56.2), not a bare glyph. The `▶︎`/`❚❚` carry U+FE0E so they render monochrome —
  RULEBOOK forbids emoji. The visible label is localized; the `accessibilityLabel` stays English
  ("Read aloud" / "Pause reading aloud" / "Read aloud unavailable") for Maestro. The `♪`
  (`READ_ALOUD_GLYPH`) now only marks the More → Read Aloud settings row.
