# PRD-10 — Karaoke Verse-Sync Audio (Line-Level Highlight)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.6.0 (Hanuman Chalisa karaoke pilot) → v1.6.1 (rest of chalisas + aartis) |
| **Window** | Weeks 1–7 of Q1 2027 |
| **T-shirt size** | M (~5 dev-weeks; content track parallel) |
| **Owner** | TBA |
| **Depends on** | PRD-02 (verse audio shipped) |

**Bundle-only constraint preserved.** Karaoke timing data is bundled alongside the existing `.m4a`. No streaming, no remote alignment, no first-play download.

---

## 1. Problem

PRD-02 shipped per-verse audio: tap play, the reader auto-advances when the audio crosses a verse boundary. That's "verse-sync." Users tell us they want **line-sync** — the current line glowing, the rest dim — so they can recite aloud without losing place in a multi-line verse. This is what every Bollywood karaoke and lyrics-overlay app does for film songs; no devotional app does it for chalisas.

The pain is most acute for:
- **Sundarkand** (16 sargas, multi-line chaupais + dohas + sorthas).
- **Bhagavad Gita** chapters (8-line shlokas in some chapters).
- New users who don't yet have the chalisa memorized.

PRD-02's segment manifest is per-verse only. We need per-line.

## 2. Goal

Ship line-level audio sync — a glow that walks line-by-line through the current verse, in time with the recitation. Measured by:

- ≥ 65% of audio sessions enable karaoke mode (off by default to respect existing users' muscle memory; toggleable).
- ≥ 75% of karaoke sessions play to the end of the verse vs. ≥ 60% baseline from PRD-02.
- Session length on karaoke-enabled readers: +35% vs. plain audio.
- Zero increase in app-binary size beyond +0.4 MB per section (line-timestamp JSON is ~10–20 KB/section).

## 3. Non-goals

- **Word-level highlight.** Devanagari word boundaries in recited Awadhi are ambiguous (sandhi, conjuncts); line-level is the right granularity for v1.
- **Pitch / "sing-along" feedback.** Out of scope. We're not building Smule.
- **User-generated audio.** Out by constraint.
- **Karaoke on Gita.** Bhagavad Gita audio is itself non-goal in PRD-02 (binary size). Karaoke inherits that boundary.
- **Visual translation overlay during karaoke.** When karaoke is active, only the verse lines are highlighted; meaning text stays in its tab as today. Adding translation-line-sync is a v2 question.

## 4. User stories

> As a new chalisa reciter, I want to see exactly which line is being recited so I can chant along without losing place when the verse has 4–6 lines.

> As a parent teaching a child Hanuman Chalisa, I want to point to the screen and have the child follow the glowing line.

> As a power user who has the chalisa memorized, I want to turn karaoke *off* and keep the cleaner reading view I already love.

> As an Awadhi-speaking listener, I want the line glow to follow the recitation accurately even though the romanization is pronunciation-based ASCII, not IAST.

## 5. Scope

### In scope — v1.6.0 (Hanuman Chalisa pilot)

1. **Line-timestamp manifest.** Per section, a JSON file `mobile/src/data/<section>/karaoke.ts`:
   ```ts
   export const hanumanChalisaKaraoke = {
     verses: [
       {
         verseIndex: 0,
         lines: [
           { lineIndex: 0, startMs: 0,    endMs: 2100 },
           { lineIndex: 1, startMs: 2100, endMs: 4400 },
         ],
       },
       // …
     ],
   };
   ```
   Invariant: every verse in the audio manifest has a matching karaoke entry; line timestamps fall within their parent verse's `(startMs, endMs)`; no gaps, no overlaps.

2. **`KaraokeLineHighlight` component.** Wraps each line of the verse pager. Subscribes to `VerseAudioContext` ticks (~60ms granularity), computes current line index, applies a saffron-tinted background + slight font-weight bump on the active line, ink-soft on the rest.

3. **Karaoke toggle.** A small icon in the audio player chrome (next to play/pause). State persisted in `AsyncStorage` under `vedansh:karaoke-enabled` (default `false` for existing users on upgrade, `true` for new installs).

4. **Verse-page integration.** `HanumanChalisaVersePage` already lays out each line in a stable container. We add `key={lineIndex}` + measured layout so the highlight can animate.

5. **RULEBOOK update.** Add §3 bullet: "When a section ships karaoke timing data, the karaoke manifest invariants test gates the merge."

### In scope — v1.6.1 (rollout)

6. Karaoke manifests for: 3 remaining chalisas, 7 aartis, Sundarkand (full 16 sargas).
7. No code change — same `KaraokeLineHighlight` pattern.

### Out of scope

- Gita karaoke (binary-size).
- Word-level highlight.
- Karaoke for non-audio sections (stotrams without audio yet).
- Recording-side autogeneration (whisper-derived timestamps) without manual review — quality bar too important.

## 6. UX notes

- **Default off on upgrade**, default on for new installs. Onboarding shows a 6-second demo of karaoke on the first chalisa open.
- Highlight is *additive*, not destructive: the line gets a soft saffron background; non-active lines stay readable (ink). Never dim text below a 4.5:1 contrast ratio — readability dominates the aesthetic.
- Animation duration ≤ 180ms per transition. Uses `Animated` (or `Reanimated` if performance demands).
- When user manually swipes mid-verse, karaoke jumps to the line at the new audio position; no flicker.
- Toggle off is reversible without losing playback position.
- Tap-on-line jumps audio to that line's `startMs` (advanced behaviour; ships with v1.6.0).
- Karaoke respects the language toggle: highlight is on the verse Devanagari lines regardless of language mode (meaning text is a separate tab today; future PRD may add bilingual karaoke).

## 7. Technical sketch

- **Data layer.** `karaoke.ts` per section; loaded via the existing `<section>/index.ts` pattern. Add to the section's invariant checks at boot.
- **Context.** Extend `VerseAudioContext` with `currentLineIndex` derived state. Update emission cadence to 60ms (currently coarser at verse boundaries). Use `requestAnimationFrame` or a 16ms tick guarded by `useMemo` so we don't re-render the entire reader on every tick.
- **Component.** New `KaraokeLine` wraps the existing `<Text>` per line. Memoised on `isActive`. Active line uses `theme.colors.saffronTint` background (new token).
- **Theme additions.** `theme.colors.karaokeActiveBg`, `theme.colors.karaokeInactiveText`. Defined in `mobile/src/theme/colors.ts`.
- **Tests:**
  - `mobile/src/data/__tests__/karaokeManifest.invariants.test.ts` — for every section with karaoke, line timestamps cover verse boundaries with no gaps/overlaps, line counts match the section's verse `lines.length`.
  - `mobile/src/components/__tests__/KaraokeLine.test.tsx` — snapshot the active vs. inactive states; assert contrast ratio in dark mode (once dark mode ships).
  - `mobile/src/screens/__tests__/ChalisaReaderScreen.karaoke.test.tsx` — simulate `audioVerseChanged` + `audioLineChanged`, assert the active line's `accessibilityLabel` matches the audio position.
- **A11y.** Active line gets `accessibilityState: { selected: true }` so VoiceOver announces "currently reciting: line 2."

## 8. Content & data track

- **Timestamping pipeline.**
  1. Whisper-large-v3 forced-alignment to get rough line boundaries.
  2. Manual review in Audacity (~15 min/section) — devotional pacing is irregular; whisper drifts.
  3. Native-speaker QA pass: open the chalisa, play with karaoke, eyeball drift, flag lines off by >150ms.
- **Sign-off:** content lead + one native-speaker reviewer per section before ship.
- **Versioning:** karaoke manifest carries a `schemaVersion: 1` so future per-word data can extend without breaking old timestamps.

## 9. Binary-size budget

| Section | Karaoke JSON size (gzipped at build) |
|---|---|
| Hanuman Chalisa | ~8 KB |
| Each other chalisa | ~8 KB |
| Each aarti | ~3 KB |
| Sundarkand (16 sargas) | ~85 KB |

Total v1.6.0 + v1.6.1 added bundle: well under +0.5 MB. Negligible.

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Karaoke-enabled session % | Local counter | ≥ 65% |
| Karaoke session completion rate | Local counter | ≥ 75% |
| Drift complaints in TestFlight | Manual triage | ≤ 2 per section |
| Karaoke off → on rate after demo | Local counter | ≥ 40% |
| Karaoke on → off rate (suggests too distracting) | Local counter | ≤ 10% |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Whisper-derived timestamps drift after the first few lines | Mandatory manual review pass; CI invariant test. |
| Glow distracts traditionalist users | Off-by-default on upgrade; clear toggle. |
| 60ms ticks cause re-render storms on low-end Android | Memoise `KaraokeLine`; use `Animated.Value` instead of state; profile on mid-tier Android. |
| Devanagari line-wrapping makes "line index" ambiguous when a chaupai wraps to 2 visual lines | Highlight wraps with the line; layout is measured per line, not per visual row. |
| User expects translation karaoke too | Document scope clearly; collect signal for v2. |

## 12. Definition of done

- Hanuman Chalisa karaoke ships, on for new installs.
- v1.6.1 adds all chalisas + aartis + Sundarkand with no code change.
- Karaoke invariants test green; per-section reader test still green.
- TestFlight 7-day soak: zero karaoke-related crashes; drift complaints ≤ 2 per section.
- A11y manual pass: VoiceOver announces the active line.

## 13. Open questions

1. Karaoke + dark mode interaction — does saffron tint work on parchment-dark? (Tied to dark-mode roadmap; flag for design.md update.)
2. Should tap-on-line-to-seek ship in v1.6.0 or v1.6.1?
3. Does the karaoke pulse get a haptic on line change (subtle), or is that a separate accessibility toggle?
4. Are aarti karaoke files line-grained enough given the faster tempo? Pilot on `aarti-om-jai-jagdish` first.
