# PRD-02 — Bundled Verse Audio for Chalisas & Aartis

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.5.0 (Hanuman Chalisa pilot) → v1.5.1 (rest of chalisas + aartis) |
| **Window** | Weeks 28–33 (8 Jul – 21 Aug 2026) |
| **T-shirt size** | L (~6 dev-weeks; content / licensing parallel) |
| **Owner** | TBA |

**Bundle-only constraint:** every audio file is part of the app binary under `mobile/assets/audio/<section>/*.m4a`. **No streaming, no CDN, no first-play download.** The user pays the audio cost in app size, paid once at install; in exchange we work fully offline forever and have no runtime backend.

---

## 1. Problem

Audio is the most-requested missing capability in this segment: chalisas and aartis are recited aloud, often along with a phone playing the recitation. Today Vedansh has:

- Japam audio (shipped PR #40), proving the engineering scaffolding for bundled audio works (`mobile/assets/japam-audio/` ships in the binary).
- No audio on any reader page (chalisa / aarti / stotram / granth).

A user who wants to recite Hanuman Chalisa with the app must open YouTube. That session is permanently lost — and so is every conversion from "I read the verses" to "I read along to the recitation."

## 2. Goal

Ship per-verse, gapless audio recitation **bundled inside the app**, starting with Hanuman Chalisa (v1.5.0), then extending to all 4 chalisas and 7 aartis (v1.5.1). Measured by:

- ≥ 40% of chalisa-reader sessions trigger audio playback.
- ≥ 60% of audio sessions play to completion or to the last visible verse.
- D7 return rate for users with ≥ 1 audio session: +12 pp vs. text-only readers (read via local diagnostics in TestFlight cohort).
- App-binary size growth: ≤ +12 MB in v1.5.0; ≤ +50 MB total by v1.5.1 (chalisas + aartis).

## 3. Non-goals

- Audio for the Bhagavad Gītā. Bundling ~3 hours of audio (~80 MB even at 64 kbps mono) violates the binary-size budget. Defer to a separate decision once chalisa metrics validate the feature.
- Streaming / on-demand download of audio. Out by constraint.
- User-uploaded audio.
- Variable-speed audio in v1 (Japam player has it; verse audio v1 = 1.0× only; speed control deferred to v1.5.2 if data justifies).
- Background-mode playback in v1. Audio session continues when the screen is locked, but no system media-control center artwork until v1.5.2.

## 4. User stories

> As a chalisa reciter on a plane / in a tunnel / at a temple with no signal, I want to play the recitation without any download, prompt, or network check.

> As a chalisa reciter, I want to tap a play button on the chalisa reader and hear the verses while the page auto-advances with the audio.

> As someone learning Sanskrit pronunciation, I want to pause on a verse, replay it, and only then swipe forward.

> As a privacy-sensitive user, I want to know the app is not phoning home for audio. Bundle-only delivers this guarantee.

## 5. Scope

### In scope — v1.5.0 (Hanuman Chalisa pilot)

1. **Audio player UI on chalisa reader.** Play / pause / skip-back-one-verse / skip-forward-one-verse, with a small progress strip below the verse text. Reuse the Japam player's visual treatment for consistency.
2. **Bundled audio asset.** `mobile/assets/audio/hanuman-chalisa/recitation.m4a`. Format: AAC mono, 64 kbps, ≈ 12 min ≈ 5.8 MB. Loaded via `require()` + `expo-asset`, same pattern as the Japam audio files.
3. **Verse-anchored playback.** Each verse maps to a `(startMs, endMs)` segment in the single audio file. When the user swipes forward, audio seeks. When audio crosses a verse boundary, the reader advances the page automatically.
4. **Per-section audio manifest.** `mobile/src/data/<section>/audio.ts`:
   ```ts
   import recitation from '@/assets/audio/hanuman-chalisa/recitation.m4a';
   export const hanumanChalisaAudio = {
     asset: recitation,          // module ref, not URL
     segments: [
       { verseIndex: 0, startMs: 0,    endMs: 8200 },
       { verseIndex: 1, startMs: 8200, endMs: 16100 },
       // …
     ],
   };
   ```
5. **Offline by construction.** Because the asset is bundled, airplane mode is never a failure mode. No network code paths in this PRD.

### In scope — v1.5.1 (rollout)

6. Bundle audio for the remaining 3 chalisas (Shiv, Durga, Ganesh Chalisa) and 7 aartis. Estimated added size: ~28–35 MB combined.
7. No new code. Each section adds its `audio.ts` and its `.m4a`; the player UI is already live from v1.5.0.

### Out of scope

- Bhagavad Gītā audio.
- Per-verse separate audio files (one file per section is the bundling unit; the segment manifest does the verse mapping).
- Karaoke-style word-highlighting.
- Pitch shift / instrumentation choice.
- Lock-screen / Control Center media artwork (deferred to v1.5.2).
- Any "Download audio" affordance — there's nothing to download.

## 6. UX notes

- Player floats at bottom of reader screen, above the ornament divider, behind the parchment overlay. Saffron play icon; ink-soft for inactive controls.
- **No first-play consent sheet** ("audio downloads X MB") because there is no download. Tap play → audio plays.
- If the reader page is on verse 9 and the audio jumps to verse 10, the page advances visually with the same easing as a manual swipe — never a jarring snap.
- When user manually swipes, audio seeks to that verse's `startMs` without pause-flicker.
- If audio fails to load from the bundled asset (extremely rare — only on corrupted install), show "Audio unavailable — please reinstall the app" and disable the play button. **Never show a network error**; the asset is on the device.
- Provide a small "About this recitation" line under the player: voice artist name + a one-line attribution, both bundled in the audio manifest.

## 7. Technical sketch

- Use `expo-audio` (already in deps for Japam) — confirm verse-segment seek behaves smoothly. If not, fall back to `expo-av` for segment work.
- New context `VerseAudioContext` (parallel to `JapamCounterContext` in `mobile/src/contexts/`). Holds: current section, current verse, playback state. No cache, no network state — there is no cache.
- Reader integration: each `*ReaderScreen` exposes an `onVerseChange` callback to the context so audio knows what page is showing; conversely, the context emits `audioVerseChanged` events that the reader subscribes to via a ref to its `FlatList`.
- Audio assets registered via `expo-asset`'s preload list in `App.tsx` so they're decompressed once on first read.
- New tests:
  - `mobile/src/contexts/__tests__/VerseAudioContext.test.tsx` — boundary advance, manual seek wins, segment manifest invariants (no gaps, no overlaps, monotonically increasing).
  - `mobile/src/screens/__tests__/ChalisaReaderScreen.audio.test.tsx` — mounts with audio mock, simulates `audioVerseChanged`, asserts `FlatList` scrolls.
  - `mobile/src/data/__tests__/audioManifest.invariants.test.ts` — for every section that ships audio, the segments cover `[0, totalDuration]` without gaps or overlaps.

## 8. Content & licensing track (runs in parallel)

- Commission a single 40-chaupai recitation of Hanuman Chalisa in a clear, slow-tempo pandit style (~12 min). Estimated cost / timeline owned by Content Ops.
- Generate the segment manifest by either:
  - Manual annotation in Audacity (~24 min/section), or
  - Whisper-based timestamping + manual cleanup (faster but needs validation).
- Approval: native-speaker review of pronunciation + timing alignment before ship.
- Aartis are shorter (~2–3 min each); batch recording session covers all 7 in one day.

**Licensing assumption:** all recordings are work-for-hire with a commercial-use license, **with redistribution rights** (because we bundle them inside the app binary on every user device). Stock recordings (e.g. from open-source archives) must be vetted by Legal — the bundle-inside-binary model has stricter license requirements than a streaming model.

## 9. Binary-size budget

Hard ceilings, enforced via a CI check that fails if `mobile/assets/audio/` exceeds the target:

| Release | Added audio | Budget | Running app total (est.) |
|---|---|---|---|
| v1.5.0 | Hanuman Chalisa only | +6 MB | ~70 MB |
| v1.5.1 | 3 chalisas + 7 aartis | +32 MB | ~102 MB |
| Out of scope | Bhagavad Gītā | +80 MB | n/a |

Encoding: AAC, mono, 64 kbps. Lower bitrates degrade Devanagari recitation clarity; higher bitrates spend size we don't need to spend.

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Audio-trigger rate per chalisa session | Local counter in `UserActivityContext`-style ledger | ≥ 40% |
| Audio-completion rate | `(verses listened / total verses)` per session, local counter | ≥ 60% |
| Manifest invariants pass | CI test | always |
| Bundle-size growth per release | CI artifact check | within table above |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Audio-verse segment drift over time (recitation pace not constant) | Pilot on a single, tightly-edited file. Don't auto-generate segments from random sources. Manifest invariants test catches gaps. |
| Background audio battery drain | Disable screen-wake; rely on iOS audio session category `playback`. |
| Binary size explosion | CI bundle-size check + the staged rollout (v1.5.0 → v1.5.1). |
| App Store review flags audio file size | Apple permits multi-hundred-MB apps; we're well below. But mention "offline recitation included" in App Store description and "What's New" notes so it's framed as a benefit. |
| User uses Bluetooth headset and seek behaves erratically | QA on iOS device with AirPods. Document supported behavior. |
| Licensing complications because we redistribute audio inside the app | Surface up-front during commissioning; standard work-for-hire contract should include redistribution-in-app rights. Legal sign-off gates ship. |

## 12. Definition of done (v1.5.0 + v1.5.1)

- Hanuman Chalisa reader plays audio end-to-end, segment-aligned, on iPhone (last 3 OS versions). **Airplane-mode test passes** (proves no network dependency).
- v1.5.1 ships audio for 4 chalisas + 7 aartis with no code change beyond manifest registration.
- Tests pass. RULEBOOK §4.10 smoke-test for every audio-enabled reader.
- CI bundle-size check passes.
- TestFlight 7-day soak shows no audio-related crashes in App Store Connect dashboard.

## 13. Open questions

1. Single voice across all sections, or section-appropriate voice (male pandit for chalisas, mixed-gender for aartis)?
2. Should the audio be looping (chalisas are commonly recited 11× / 108×) or single-pass v1? Recommend single-pass v1; add loop in v1.5.2 if data justifies — loop count is a natural extension of the japam mala metaphor and still bundle-only.
3. Confirm CI bundle-size budget. Default to +60 MB total across the quarter; tighten or loosen?
4. Do we ship voice-artist attribution prominently (in About) or just inside the audio manifest?
