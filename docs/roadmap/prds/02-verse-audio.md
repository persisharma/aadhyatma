# PRD-02 — Verse Audio for Chalisas & Aartis

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.5.0 |
| **Window** | Weeks 28–33 (8 Jul – 21 Aug 2026) |
| **T-shirt size** | L (~6 dev-weeks; content / licensing parallel) |
| **Owner** | TBA |

---

## 1. Problem

Audio is the most-requested missing capability in this segment: chalisas and aartis are recited aloud, often along with a phone playing the recitation. Today Vedansh has:

- Japam audio (shipped PR #40), proving the engineering scaffolding works.
- No audio on any reader page (chalisa / aarti / stotram / granth).

A user who wants to recite Hanuman Chalisa with the app must open YouTube. That session is permanently lost — and so is every conversion from "I read the verses" to "I read along to the recitation."

## 2. Goal

Ship per-verse, gapless, low-bandwidth audio recitation on a pilot section (Hanuman Chalisa), then extend the same player to all 4 chalisas and 7 aartis. Measured by:

- ≥ 40% of chalisa-reader sessions trigger audio playback.
- ≥ 60% of audio sessions play to completion or to the last visible verse.
- D7 return rate for users with ≥ 1 audio session: +12 pp vs. text-only readers.
- < 5 MB additional app bundle per chalisa (audio streamed, not bundled).

## 3. Non-goals

- Audio for the Bhagavad Gītā (~3 hours of audio; deferred to Q4 — content cost is the constraint, not engineering).
- User-uploaded audio.
- Audio for granths beyond what the chalisa player covers.
- Variable-speed audio (Japam player already has it; verse audio v1 = 1.0× only — speed control deferred to v2 if data justifies).
- Background-mode playback in v1 (App audio session continues when the screen is locked, but no notification-style media controls until v2).

## 4. User stories

> As a chalisa reciter, I want to tap a play button on the chalisa reader and hear the verses while the page auto-advances with the audio.

> As someone learning Sanskrit pronunciation, I want to pause on a verse, replay it, and only then swipe forward.

> As someone on a metered connection, I want to know how much I'll download before I start playing.

## 5. Scope

### In scope (v1.5.0)

1. **Audio player UI on chalisa reader.** Play / pause / skip-back-one-verse / skip-forward-one-verse, with a small progress strip below the verse text. Reuse the Japam player's visual treatment for consistency.
2. **Verse-anchored playback.** Each verse maps to a `(startMs, endMs)` segment in a single per-section audio file. When the user swipes forward, audio seeks. When audio crosses a verse boundary, the reader advances the page automatically.
3. **Per-section audio manifest.** New `mobile/src/data/<section>/audio.json`:
   ```ts
   { audioUrl: 'https://cdn.../hanuman-chalisa.m4a', segments: [{ verseIndex: 0, startMs: 0, endMs: 8200 }, ...] }
   ```
4. **Streaming-first.** Audio is downloaded on first play, cached to device cache directory (not bundled in app). Cache cap: 50 MB across all sections, LRU eviction.
5. **Pilot scope:** Hanuman Chalisa. Once the player ships and metrics validate, extend to the other 3 chalisas and 7 aartis in the same release window (audio files only; no code change).
6. **Offline mode.** If audio file already cached, no network needed. Indicator on the player shows "Downloaded ✓".

### Out of scope

- Bhagavad Gītā audio.
- Per-verse audio (one file per chapter / section is the unit; the segment manifest does the verse mapping).
- Karaoke-style word-highlighting.
- Pitch shift / instrumentation choice.
- Lock-screen media controls (deferred to v1.6 if used heavily).

## 6. UX notes

- Player floats at bottom of reader screen, above the ornament divider, behind the parchment overlay. Saffron play icon; ink-soft for inactive controls.
- On first launch after install, the first tap on play shows a one-line consent line: "Audio downloads ~3 MB on first play. Continue?" (Hi / En toggle aware.)
- If the reader page is on verse 9 and the audio jumps to verse 10, the page advances visually with the same easing as a manual swipe — never a jarring snap.
- When user manually swipes, audio seeks to that verse's `startMs` without pause-flicker.
- If audio is loading > 1.5 s, show a small "..." in the play button position (not a full-screen spinner — the verse remains readable).

## 7. Technical sketch

- Use `expo-audio` (already in deps for Japam) — confirm verse-segment seek behaves smoothly. If not, fall back to `expo-av` for segment work.
- New context `VerseAudioContext` (parallel to `JapamCounterContext`). Holds: current section, current verse, playback state, cached file paths.
- Reader integration: each `*ReaderScreen` exposes an `onVerseChange` callback to the context so audio knows what page is showing; conversely, the context emits `audioVerseChanged` events that the reader subscribes to via a ref to its `FlatList`.
- Audio file hosting: existing CDN (or new bucket) with `Cache-Control: public, max-age=31536000, immutable`; filenames versioned (`hanuman-chalisa-v1.m4a`).
- Crash analytics + telemetry hooked through PRD-06's Sentry layer.
- New tests:
  - `mobile/src/contexts/__tests__/VerseAudioContext.test.tsx` — boundary advance, manual seek wins, cache LRU.
  - `mobile/src/screens/__tests__/ChalisaReaderScreen.audio.test.tsx` — mounts with audio mock, simulates `audioVerseChanged`, asserts FlatList scrolls.

## 8. Content & licensing track (runs in parallel)

- Commission a single 40-chaupai recitation of Hanuman Chalisa in a clear, slow-tempo pandit style (~12 min). Estimated cost / timeline owned by Content Ops.
- Generate the segment manifest by either:
  - Manual annotation in Audacity (12 min × 2× = 24 min/section), or
  - Whisper-based timestamping + manual cleanup (faster but needs validation).
- Approval: native-speaker review of pronunciation + timing alignment before ship.
- Aartis are shorter (~2–3 min each); batch recording session covers all 7 in one day.

**Licensing assumption:** all recordings are work-for-hire with a commercial-use license. Stock recordings (e.g. from open-source archives) must be vetted by Legal before ship.

## 9. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Audio-trigger rate per chalisa session | Sentry event | ≥ 40% |
| Audio-completion rate | `(verses listened / total verses)` per session | ≥ 60% |
| Cache hit rate after first play | Local count | ≥ 90% |
| Audio crash rate | Sentry crash group `audio` | < 0.1% |
| Bundle size delta | EAS build artifact | ≤ +200 KB (manifest only; audio is streamed) |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Audio-verse segment drift over time (recitation pace not constant) | Pilot on a single, tightly-edited file. Don't auto-generate segments from random sources. |
| Background audio battery drain | Disable screen-wake; rely on iOS audio session category `playback`. |
| Apple rejecting "downloads on tap" without progress indicator | Use a clear download progress bar on the first tap (Apple's audio guidelines require this). |
| User uses Bluetooth headset and seek behaves erratically | QA on iOS device with AirPods. Document supported behavior. |

## 11. Definition of done (v1.5.0)

- Hanuman Chalisa reader plays audio end-to-end, segment-aligned, on iPhone (last 3 OS versions).
- Other 3 chalisas and 7 aartis ship audio in the same release; if content isn't ready, ship Hanuman Chalisa alone and flag the rest behind the `audioUrl` being present in the manifest.
- Cache + offline replay works with airplane mode after first play.
- Tests pass. RULEBOOK §4.10 smoke-test for every audio-enabled reader.
- Metrics dashboard populated.

## 12. Open questions

1. Single voice across all sections, or section-appropriate voice (male pandit for chalisas, mixed-gender for aartis)?
2. Should the audio be looping (chalisas are commonly recited 11× / 108×) or single-pass v1? Recommend single-pass v1; add loop in v1.5.1 if data justifies — loop count is a natural extension of the japam mala metaphor.
3. Do we want a "download all" affordance in settings for fully-offline use, or rely on per-section first-tap downloads? v1 = per-section.
