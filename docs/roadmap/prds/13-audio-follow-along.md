# PRD-13 — Audio Follow-Along (साथ-साथ) — Synced Verse Highlight

| | |
|---|---|
| **Status** | Draft — gated on real recitation audio landing |
| **Target release** | TBD (after PRD-02 real audio, currently prototype) |
| **T-shirt size** | M — mechanism is contained; the cost is timing metadata |
| **Owner** | TBA |
| **Bet** | #3 (fast delight) — makes shipped audio 10× more valuable |

---

**Prerequisite / gate:** the audio library today is a **prototype** — `src/data/audio/tracks.ts` carries the catalog, but `hasRealAudio()` shows every track plays the same placeholder recording; real recitations are PRD-02 Phase 2. Follow-along is only meaningful over **real** recitations with known line timings, so this PRD is **gated on the real Hanuman-Chalisa recitation landing** and pilots there.

---

## 1. Problem

The app already has two strong but **disconnected** surfaces: the **reader** (paginated verse pages) and the **audio player** (`AudioPlayerContext`, an app-wide media player with a now-playing overlay). A user can *read* the Hanuman Chalisa, or *listen* to it — but not **read along while it plays**, with the current line highlighted as it is chanted.

That sync is the single biggest **learning/accessibility** unlock in the app. Millions want to chant the Chalisa or an aarti but **cannot read Devanagari at speed** — a moving highlight that tracks the recitation lets them follow, learn pronunciation, and eventually chant from memory. It is the "karaoke for paath" experience, and it turns the audio we already ship into a teaching tool rather than a background loop.

## 2. Goal

When a recitation is playing and its text is open, **highlight the line/verse currently being chanted and auto-scroll to keep it in view**; tapping a line **seeks the audio** to that line. Success looks like:

- Playing the Hanuman Chalisa recitation with the reader open, the active दोहा/चौपाई is visually highlighted and stays on screen as the audio advances.
- Tapping any line jumps the audio to that line (scrub-by-verse).
- With no follow-along data for a track, the reader and player behave **exactly as today** (graceful, additive degradation).

## 3. Non-goals

- **No word-level karaoke** (per-syllable highlight). Line/verse granularity only — it matches how the text is chanted and keeps timing authoring tractable.
- **No auto-generated timings in v1.** Timings are authored/curated per track (see §4), not produced by on-device forced alignment. (Offline forced-alignment is a possible pipeline enhancement, not a v1 dependency.)
- **No dependency on streaming.** Bundle-only: timing metadata is a small bundled JSON per track, same delivery model as the audio bytes.
- **Not gated on the full audio catalog.** Pilot on one real recitation; expand track-by-track as real recordings + timings land.

## 4. Concepts & data model

A per-track **cue sheet** mapping playback time → the verse/line index the reader already uses.

```ts
// Bundled alongside the track; resolved by track id like getAudioSource(id).
type FollowAlongCue = {
  // Start time (seconds) at which this line becomes "active".
  atSec: number;
  // Addresses the SAME unit the reader/index uses, so highlight + seek reuse
  // existing verse addressing (verseIndex / chapter) — no new coordinate system.
  verseIndex: number;
  chapter?: number;      // for chaptered sources
};

type FollowAlongTrack = {
  trackId: string;       // matches AudioTrack.id
  linkedTextId: string;  // matches AudioTrack.linkedTextId
  cues: FollowAlongCue[]; // sorted by atSec
};
```

**Active-line lookup** is a binary search over `cues` on the player's `positionSec` (already exposed by `AudioPlayerContext`). **Seek** inverts it: tapping a line finds its `atSec` and calls the player's seek. Because cues address verses by the **same `verseIndex`/`chapter`** the reader and `searchIndex` already use, highlight and seek reuse existing addressing rather than inventing a coordinate system.

**Authoring the cues** (the real cost): a small in-repo tool (a `scripts/*.mjs` "tap-along" utility, or a spreadsheet import) where a curator marks the timestamp of each line against the recording once per track. ~40 cues for the Chalisa — minutes of work per track, done at content time, not runtime.

> **Reader reality (verified in source).** The reader is a **horizontal one-verse-per-page `FlatList`** (`getItemLayout` by index; `scrollToIndex` pages between verses), *not* a vertical scroll of lines. So "follow-along" is primarily **auto-paging to the active verse** as the recitation crosses cue boundaries, with an optional **active-line wash within** a multi-line verse page. `positionSec` updates at a **500 ms** cadence (`createAudioPlayer(..., { updateInterval: 500 })`) — ample for verse/line granularity, and the reason word-level karaoke is out of scope (§3).

## 5. Surfaces

- **Reader + player together.** When `AudioPlayerContext.currentTrack.linkedTextId` matches the open reader's text **and** a `FollowAlongTrack` exists, the reader enters **follow-along mode**: the active verse page is auto-paged into view and its active line gets a warm wash (reusing the reader's existing `scrollToIndex` paging).
- **A "follow along" affordance** on the reader top-bar / now-playing surface to toggle auto-scroll (so a user can read ahead without the view yanking back).
- **Tap-to-seek** on a line while a linked track is loaded.
- **Now-playing → open text.** From the now-playing overlay, a "read along" action opens the linked reader in follow-along mode (deep-link via `entryRoutes.ts` using `linkedTextId`).
- Highlight styling follows the parchment system (a warm active-line wash, not a hard karaoke bar).

## 6. Phasing

1. **Phase 0 — Gate.** Confirm the real Hanuman-Chalisa recitation has landed (PRD-02). Build the cue-authoring utility; author the Chalisa cue sheet.
2. **Phase 1 — Pilot (Hanuman Chalisa).** `FollowAlongTrack` data + active-line binary search + highlight + auto-scroll + tap-to-seek, wired through the existing `AudioPlayerContext` position stream. Feature-detects on cue data — no cues, no behavior change.
3. **Phase 2 — Expand.** Author cue sheets for the remaining real recitations (chalisas, aartis) as their recordings land. Optionally add the "read along" entry from now-playing.

## 7. Reuse map

| Need | Existing asset |
|---|---|
| Playback position / seek / current track | `AudioPlayerContext` (`positionSec`, `currentTrack`, seek) |
| Verse addressing (highlight + seek target) | reader `verseIndex` / `chapter`; `searchIndex` addressing |
| Track ↔ text linkage | `AudioTrack.linkedTextId` (`src/data/audio/tracks.ts`) |
| Reader paging / scroll | existing reader `FlatList` paging |
| Deep-link now-playing → reader | `src/navigation/entryRoutes.ts` |
| Asset resolution pattern (cues bundled like audio) | `@assets/audio-library` `getAudioSource` pattern |

## 8. Why it won't ruin the product

- **Purely additive & feature-detected.** No cue data → reader and player behave exactly as today. Zero regression risk to the two shipped surfaces.
- **On-device / bundle-only.** Cue sheets are small bundled JSON; no network, no new runtime dependency.
- **It amplifies the moat instead of diluting it.** It makes the audio *already shipped* dramatically more useful for learners — deepening the core devotional-practice experience, not adding an unrelated surface.

## 9. Decisions & open questions

**Decided:**
- Line/verse granularity, not word-level (§3).
- Cues authored at content time; addressing reuses reader `verseIndex`/`chapter` (§4).
- Feature-detected; graceful no-op without cue data (§8).

**Open:**
1. **Cue authoring tooling** — a `scripts/*.mjs` tap-along utility vs. spreadsheet import. Default: small tap-along script.
2. **Auto-scroll default** — on or off by default, and where the toggle lives.
3. **Pilot track confirmation** — depends on which real recitation lands first from PRD-02.

## 10. Acceptance criteria

The pilot (Phase 1, Hanuman Chalisa) is done when:

1. Playing the linked recitation with the Chalisa reader open **auto-pages to the verse being chanted**, staying within ~1 update tick (≤ 500 ms) of the cue boundary.
2. **Tap-to-seek**: tapping a verse/line seeks the audio to that cue's `atSec` and playback continues from there.
3. **Auto-scroll toggle** lets the user read ahead without the view snapping back; re-enabling resumes tracking at the current position.
4. **Graceful no-op**: opening a reader whose track has no `FollowAlongTrack` (or with audio paused / a different track loaded) behaves exactly as today — no highlight, no scroll hijack, no errors.
5. **No reading-progress corruption**: entering follow-along and auto-paging must not overwrite the user's saved resume position in a way that differs from normal reading (progress semantics unchanged).
6. Manual paging **while playing** temporarily suspends auto-scroll (grace window) so the two don't fight.

## 11. Success metrics (bundle-only, local)

| Metric | Target | Measured |
|---|---|---|
| Follow-along session rate (of recitation plays with the linked reader opened) | ≥ 30% | local counter |
| Tap-to-seek usage per follow-along session | ≥ 1 (median) | local counter |
| Auto-scroll kept on (not disabled) | ≥ 70% | local flag rate |
| Crash-free follow-along sessions | ≥ 99.5% | App Store Connect + local crash log (PRD-06) |

No third-party analytics SDK — counters are read only from the in-app diagnostics surface (roadmap §3).
