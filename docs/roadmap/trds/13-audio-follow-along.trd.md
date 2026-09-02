# TRD-13 — Audio Follow-Along (साथ-साथ) — Technical Design

| | |
|---|---|
| **Companion PRD** | [PRD-13](../prds/13-audio-follow-along.md) |
| **Status** | Draft — design for the Phase-1 pilot (Hanuman Chalisa) |
| **Author** | Eng |
| **Prerequisite** | A real recitation for the pilot text is bundled (`hasRealAudio(trackId) === true`) — PRD-02 Phase 2 |

---

## 0. Purpose & scope

Turn the already-shipped audio player and reader into a synced experience: as a recitation plays, **auto-page the reader to the verse being chanted** and wash its active line; **tapping a verse seeks the audio** to that verse. Pure-data, feature-detected, on-device.

This TRD covers the Phase-1 pilot (one text, one recitation) and calls out where Phase-2 (multi-chapter, multi-track) extends each decision. It does **not** cover producing the recordings (PRD-02) or word-level alignment (explicitly out of scope).

## 1. Ground truth (verified in source)

| Fact | Source | Design consequence |
|---|---|---|
| Reader is a **horizontal one-verse-per-page `FlatList`**; `getItemLayout` = `{length: width, offset: width*index, index}`; page changes tracked via `onViewableItemsChanged` → `currentIndex`. | `src/screens/ChalisaReaderScreen.tsx` | Follow-along = `listRef.scrollToIndex({index})`, not line scrolling. |
| `AudioPlayerContext` exposes `positionSec`, `durationSec`, `currentTrack`, `seekTo(seconds)`, `isPlaying`. Position ticks at **500 ms** (`createAudioPlayer(null,{updateInterval:500})`). | `src/contexts/AudioPlayerContext.tsx` | Active-cue lookup runs on each 500 ms tick; verse/line granularity only. |
| Track↔text link is `AudioTrack.linkedTextId`; audio presence gated by `hasRealAudio(trackId)`. | `src/data/audio/tracks.ts`, `@assets/audio-library` | Follow-along data keyed by `trackId`, feature-detected the same way. |
| Reader writes resume position via `setProgress({sourceId, verseIndex, updatedAt})` in a `useEffect` on `currentIndex`. | `ReadingProgressContext` | Auto-paging flows through the **same** `currentIndex` path → resume semantics unchanged (PRD-13 §10.5). |
| Asset registries map an id → bundled `require()` (or later `{uri}`). | `assets/audio-library/index.ts`, `assets/japam-audio/index.ts` | Cue sheets follow the identical registry pattern. |

## 2. Architecture overview

```
                       AudioPlayerContext (positionSec @500ms, seekTo, currentTrack)
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        │ subscribe                │ seekTo(atSec)               │ currentTrack.id
        ▼                          │                             ▼
  useFollowAlong(textId)  ◀── getFollowAlongTrack(trackId) ── src/data/audio/followAlong/
        │   (pure lookup: cues × positionSec → activeIndex)      (cue registry + data)
        │
        ├── activeVerseIndex ──▶ Reader: scrollToIndex (auto-scroll effect)
        ├── isActive(line) ────▶ VersePage: active-line wash
        └── seekToVerse(i) ◀──── Reader: tap-to-seek handler
```

Three new units + three edits. All logic that can be pure (cue lookup) is isolated in a `tsx`-testable module; React glue is thin.

## 3. Data model

New directory `src/data/audio/followAlong/` (mirrors the audio-library registry pattern).

```ts
// src/data/audio/followAlong/types.ts
export type FollowAlongCue = {
  /** Playback time (seconds) at which this unit becomes active. Sorted ascending. */
  atSec: number;
  /** Reader verse index within its chapter (0-based) — the SAME index the pager uses. */
  verseIndex: number;
  /** Present for chaptered sources; absent for flat readers (Chalisa pilot). */
  chapter?: number;
};

export type FollowAlongTrack = {
  trackId: string;      // === AudioTrack.id
  linkedTextId: string; // === AudioTrack.linkedTextId
  cues: readonly FollowAlongCue[];
};
```

```ts
// src/data/audio/followAlong/index.ts  — the registry (feature-detection point)
const REGISTRY: Record<string, FollowAlongTrack> = {
  'hanuman-chalisa-recitation': hanumanChalisaCues, // Phase 1
};
export function getFollowAlongTrack(trackId: string): FollowAlongTrack | null {
  return REGISTRY[trackId] ?? null;
}
export function hasFollowAlong(trackId: string): boolean {
  return trackId in REGISTRY;
}
```

**Invariants** (asserted by a data test, mirroring `contentCorrectness.test.ts`):
- `cues` strictly ascending by `atSec`; `cues[0].atSec >= 0`.
- Every `verseIndex` is in range for its text/chapter (cross-checked against `getChalisa(...).verses.length` etc.).
- `linkedTextId` resolves to a real `LibraryEntry`; `trackId` resolves to an `AudioTrack` with `hasRealAudio === true`.

## 4. Core algorithm — active-cue lookup (pure)

```ts
// src/data/audio/followAlong/resolve.ts
/**
 * Index into `cues` of the greatest cue whose atSec <= positionSec, or -1 if
 * playback is before the first cue. O(log n) binary search — runs every 500 ms.
 */
export function activeCueIndex(cues: readonly FollowAlongCue[], positionSec: number): number {
  let lo = 0, hi = cues.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].atSec <= positionSec) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}

/** The cue's atSec for a given verse (for tap-to-seek). Returns null if unmapped. */
export function seekTargetFor(cues: readonly FollowAlongCue[], verseIndex: number, chapter?: number): number | null {
  const c = cues.find((x) => x.verseIndex === verseIndex && x.chapter === chapter);
  return c ? c.atSec : null;
}
```

Both functions are pure, dependency-free → `tsx --test`, wired into `npm run test:data`.

## 5. React integration — `useFollowAlong`

```ts
// src/data/audio/followAlong/useFollowAlong.ts
export type FollowAlongState = {
  enabled: boolean;                 // a linked track with cues is loaded
  activeVerseIndex: number | null;  // null before first cue / when disabled
  activeChapter?: number;
  isActiveVerse: (verseIndex: number, chapter?: number) => boolean;
  seekToVerse: (verseIndex: number, chapter?: number) => void;
};

export function useFollowAlong(textId: string): FollowAlongState {
  const { currentTrack, positionSec, seekTo } = useAudioPlayerContext();
  const track = currentTrack && currentTrack.linkedTextId === textId
    ? getFollowAlongTrack(currentTrack.id)
    : null;
  const idx = track ? activeCueIndex(track.cues, positionSec) : -1;
  const active = idx >= 0 ? track!.cues[idx] : null;
  // ...memoised; seekToVerse maps verse→atSec via seekTargetFor and calls seekTo.
}
```

- Re-renders only when `positionSec` (500 ms) or `currentTrack` change — matches the existing player consumers.
- Returns `enabled:false` (all no-ops) when no linked track/cues → **feature detection is a null-check**, satisfying PRD-13 §10.4.

## 6. Reader wiring (per reader; Chalisa first)

Minimal additions to `ChalisaReaderScreen` (Phase 1), then lifted to the shared `VersePage` path for other readers (Phase 2):

1. `const follow = useFollowAlong(chalisaId);`
2. **Auto-scroll effect** — the crux:
   ```ts
   useEffect(() => {
     if (!follow.enabled || !autoScroll) return;
     if (follow.activeVerseIndex == null) return;
     if (follow.activeVerseIndex === currentIndex) return;
     programmaticScrollRef.current = true;         // mark the next viewability change as ours
     listRef.current?.scrollToIndex({ index: follow.activeVerseIndex, animated: true });
   }, [follow.activeVerseIndex, follow.enabled, autoScroll, currentIndex]);
   ```
3. **Manual-vs-programmatic disambiguation** in `onViewableItemsChanged`: if `programmaticScrollRef` is set, consume it (this change is our auto-scroll). Otherwise it's a **user swipe** → if audio is playing, **suspend** auto-scroll (`setAutoScroll(false)`) and reveal a "▶ resume follow-along" chip. This is the grace window (PRD-13 §10.6) — the user and the player never fight.
4. **Tap-to-seek**: `VersePage`'s existing press target calls `follow.seekToVerse(index)` when `follow.enabled`.
5. **Active-line wash**: `VersePage` receives `isActive={follow.isActiveVerse(index)}` and applies a parchment-warm background (design.md token), not a hard bar.

`setProgress` is untouched — auto-paging updates `currentIndex` exactly like a manual swipe, so resume position stays consistent (§1, PRD-13 §10.5).

### Auto-scroll state machine

```
        play + linked cues            user swipes (audio playing)
 IDLE ───────────────────────▶ TRACKING ───────────────────────▶ SUSPENDED
   ▲                              │  ▲                                │
   │ track ends / unlinked        │  └──────── tap "resume" ──────────┘
   └──────────────────────────────┘         (or audio paused → TRACKING on resume)
```

## 7. Cue authoring pipeline

A dev-time Node ESM tool (`scripts/tap-along.mjs`, consistent with the "scripts are manual" convention):

- Input: `trackId`, its bundled audio path, and the text's verse list (from `src/data/...`).
- Playback in the terminal (or a timestamp-paste mode): operator presses a key at each verse boundary; the tool records `atSec` per `verseIndex`.
- Output: `src/data/audio/followAlong/<textId>.cues.ts` exporting a `FollowAlongTrack` literal.
- A `--verify` mode re-checks invariants (§3) and prints total drift vs. `durationSec`.

Cost: ~40 cues for the Chalisa, a few minutes per track — paid once at content time, not runtime. Forced-alignment auto-generation is a possible future enhancement, explicitly not a Phase-1 dependency.

## 8. Edge cases & handling

| Case | Handling |
|---|---|
| No cues for the loaded track | `useFollowAlong` returns `enabled:false` → reader behaves as today. |
| Audio paused / different track than the open reader | `currentTrack.linkedTextId !== textId` → disabled; highlight cleared. |
| `positionSec` before first cue (`atSec>0` intro) | `activeCueIndex` returns −1 → no highlight/scroll until the first cue. |
| User seeks via the now-playing scrubber | `positionSec` jumps; next tick re-resolves `activeVerseIndex` and pages there. |
| `scrollToIndex` on an unmeasured index | Safe — `getItemLayout` gives exact offsets, so no `onScrollToIndexFailed`; still register a no-op handler defensively. |
| Rapid cue crossings (fast recitation) at 500 ms tick | At most one page-jump per tick; `animated:true` coalesces. Acceptable at verse granularity. |
| Chaptered source (Phase 2) | Cues carry `chapter`; the chapter reader filters cues to its chapter; cross-chapter advance defers to Phase 2 (auto-advance already exists in readers). |
| Follow-along + share/bookmark mid-play | Independent; no interaction. |

## 9. Performance

- Lookup is O(log n) over ≤ ~200 cues, once per 500 ms → negligible.
- No new timers/subscriptions: piggybacks the existing `playbackStatusUpdate` stream.
- No extra re-renders beyond the player consumers that already re-render at 500 ms.
- Cue data is a few KB/track, bundled — no cold-start or memory concern.

## 10. Testing

| Layer | Test | Runner |
|---|---|---|
| `activeCueIndex` / `seekTargetFor` | boundary cases: before first cue, exact `atSec`, between cues, past last, empty list | `tsx --test` → `test:data` |
| Cue data invariants | ascending, in-range verse indices, valid track/text links | `tsx --test` |
| `useFollowAlong` | enabled/disabled by track match; active index vs. position; seek maps correctly | Jest (`react-test-renderer`, mock `AudioPlayerContext`) |
| Reader smoke | renders in follow-along mode without throwing; no-op without cues | Jest (RULEBOOK §4.10) |
| Auto-scroll suspend/resume | programmatic vs. user swipe transitions | Jest (state-machine unit around the reader's handler, extracted pure) |
| E2E (optional) | play → verse pages advance; tap → seeks | Maestro (`mobile/.maestro/`) |

## 11. Rollout

- **No runtime flag needed** — presence of a `FollowAlongTrack` in the registry *is* the flag. Ship the Chalisa cue sheet to enable the pilot; add more `<text>.cues.ts` entries to expand (Phase 2).
- OTA-safe: cue data is JS bundle, ships via `expo-updates`; audio bytes are not (store release), so a cue sheet must not reference a track whose audio isn't yet in the build — the `hasRealAudio` gate + invariant test enforce this.

## 12. Module inventory

**New**
- `src/data/audio/followAlong/types.ts`
- `src/data/audio/followAlong/resolve.ts` (+ `resolve.test.ts`)
- `src/data/audio/followAlong/index.ts` (registry)
- `src/data/audio/followAlong/hanuman-chalisa.cues.ts` (pilot data)
- `src/data/audio/followAlong/useFollowAlong.ts`
- `scripts/tap-along.mjs` (dev-time authoring)

**Edited**
- `src/screens/ChalisaReaderScreen.tsx` (follow hook + auto-scroll effect + tap-to-seek + resume chip)
- `src/components/VersePage.tsx` (`isActive` wash + press → seek passthrough)
- `src/navigation/entryRoutes.ts` (now-playing → reader "read along" deep-link, Phase 2)
- `package.json` (`test:data` gains `resolve.test.ts`)

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Auto-scroll fights the user | Programmatic-vs-manual disambiguation + suspend/resume state machine (§6). |
| Cue drift vs. recording (edits/re-encodes) | `--verify` mode + invariant test; cues versioned alongside the track; re-author on re-encode. |
| Generalizing to 14 readers is invasive | Land logic in the shared `VersePage` + a hook so per-reader edits are 1–2 lines (Phase 2). |
| Progress-position surprise | Reuse the existing `currentIndex → setProgress` path; no separate write (§1). |

## 14. Open technical questions

1. **Auto-scroll default** (mirrors PRD-13 open #2) — default ON with an easy suspend, or OFF behind the chip? Recommend **ON** for the pilot.
2. **Resume-follow affordance placement** — inline chip over the pager vs. reader top-bar toggle.
3. **Authoring tool form** — terminal key-tap capture vs. import a CSV of timestamps. Recommend key-tap for the single pilot track; revisit for batch Phase-2 authoring.
