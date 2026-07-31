---
title: Audio & Read Aloud
type: subsystem
sources: [mobile/src/contexts/AudioPlayerContext.tsx, mobile/src/contexts/ReadAloudContext.tsx, mobile/src/contexts/ReadAloudPrefsContext.tsx, mobile/src/audio/audioSession.ts, mobile/src/audio/playbackArbiter.ts, mobile/src/readAloud/, mobile/src/screens/_useReaderReadAloud.ts, mobile/src/components/readAloud/ReadAloudButton.tsx, mobile/src/components/ReadAloudSettingsSheet.tsx, mobile/src/components/RateStepper.tsx, mobile/src/components/JapamAudioPlayer.tsx, mobile/src/components/audio/MiniPlayer.tsx, mobile/src/screens/audio/NowPlayingScreen.tsx, mobile/src/data/audio/tracks.ts, design.md, RULEBOOK.md]
last_verified_date: 2026-07-31
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
   The universal fallback for the ~15 texts that will never get a recording.

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
unmount / `sourceId` change. `ReadAloudButton` renders in `ReaderHeader`'s `right` slot. Enabled on
**Gita + Chalisa** in v1; the adapter already covers every other shape, so fan-out is wiring only.

**Two speech locales, not four.** `hi`/`gu`/`kn` all speak the **Devanagari source and
`meaningHi`** with a `hi` voice; only `en` differs. gu/kn on-screen text is runtime script
conversion, and a Hindi voice cannot read Gujarati glyphs at all — so gu/kn read their script and
hear Hindi, disclosed in the settings sheet. See design.md §53.1.

## Dependencies

- [[readers]] — the reader shell the control mounts into.
- [[overview]] — stack and module map.
- `design.md` §34 (Audio tab), §35 (Japam), §53 (Read Aloud), §54 (Rate Stepper).
- `RULEBOOK.md` §3 (read-aloud bullets), §11.14 (synthetic recitation is assistive).
- `docs/roadmap/prds/02-verse-audio.md` — the bundled-recitation plan read-aloud complements.

## Gotchas

- **Both platforms fail SILENTLY for a missing voice — `onError` never fires.** iOS leaves
  `utterance.voice = nil` and uses the system default; Android's `speakOut` falls back to
  `Locale.getDefault()`. Availability therefore comes from a `getAvailableVoicesAsync()` probe
  (raced against a 4 s timeout — Android's engine binds slowly) plus a **3 s `onStart` watchdog**
  for the OEM engine that reports a language then emits nothing. Never gate on `onError`.
- **Never pass `'hi-IN'` as Android's `language`.** `SpeechModule.kt` does `Locale(options.language)`
  and Java's single-arg `Locale` treats the whole string as the language, so `'hi-IN'` becomes
  `"hi-in"` → `LANG_NOT_SUPPORTED` → silent device-default fallback. `speakOptionsFor()` omits
  `language` entirely when a probed `voice` identifier exists (`setVoice` runs after it anyway) and
  otherwise passes the bare `'hi'`. Note `getVoices()` *returns* `hi-IN` form — the format you read
  back is not the format Android accepts.
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
- **`useReadAloud()` is a LENIENT hook** (default value, not a throw) — deliberately, so the 18
  readers without read-aloud and their test suites need no provider. Its default reports
  `available: false` and renders no control. The net for "provider forgotten" is
  `readerReadAloud.test.tsx`, which mounts real readers inside real providers.
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
- **`♪︎` carries U+FE0E** so it renders monochrome — RULEBOOK forbids emoji.
