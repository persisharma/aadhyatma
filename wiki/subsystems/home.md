---
title: home
type: subsystem
sources: [mobile/src/screens/HomeScreen.tsx, mobile/src/screens/LibraryScreen.tsx, mobile/src/components/SadhanaRow.tsx, mobile/src/components/ToolsRow.tsx, mobile/src/components/NewFeaturesSection.tsx, mobile/src/components/CategoryCard.tsx, mobile/src/components/CategoryIcon.tsx, mobile/src/contexts/FeatureSeenContext.tsx, mobile/src/contexts/TilePressContext.tsx, mobile/src/data/home/tools.ts, mobile/src/data/home/featureFeed.ts, mobile/src/data/libraryCounts.ts, mobile/src/data/japaStreak.ts, mobile/src/data/tour/steps.ts, mobile/src/data/tour/whatsNew.ts, mobile/src/navigation/HomeStackNavigator.tsx, mobile/src/navigation/types.ts, mobile/src/screens/__tests__/DaanTouchpoints.test.ts, mobile/src/screens/__tests__/TodayVidhanTouchpoints.test.ts, docs/roadmap/trds/42-home-relevance.trd.md, design.md]
last_verified_date: 2026-09-18
confidence: high
status: current
---

## Summary

Home answers *"what is today, and what can I do with this app"*; the **पाठ library** (`LibraryScreen`)
is the separate browse index behind it. TRD-42 (Sept 2026) split them: Home's 16-tile CATEGORIES
grid and its shuffling DISCOVER carousel were replaced by a साधना row, a fixed nine-tile **उपकरण**
row, one **पाठ** door and a per-user **नया** strip, and the grid itself moved onto the Library
screen alongside the देवता and उद्देश्य axes it used to sit beside.

## Details

**Home rows, top to bottom** (`HomeScreen.tsx`): wordmark → optional `FestiveToran` → `TodayStrip`
(§48, untouched by TRD-42) → `TodayRecommendationsRow` → `SadhanaRow` → `उपकरण` label + `ToolsRow`
→ the पाठ door `Pressable` → `NewFeaturesSection` → footer mantra; `SearchFloatingButton` stays
docked bottom-right.

- **`SadhanaRow`** — up to three cells: routine `doneCount/total` → `RoutineToday`, the running
  vow's `दिन n/total` → `SadhanaPrograms`, and the japa streak → `JapamCounter`. Falls back to
  `RoutineBanner variant="inline"` when all three are empty. Exports the pure `sankalpDayNumber`.
- **`ToolsRow`** — nine tiles from `data/home/tools.ts` (`vrat, muhurat, kundali, vidhi, japam,
  vastu, theerth, pitru, daan`), four across at a fixed cell width so the third row's single tile
  stays a quarter wide. The registry is data only; routing lives in the component because each
  tool lands on a different stack.
- **पाठ door** — subtitle `{N} पाठ · {N} देवता · {N} उद्देश्य`, all three computed at **module
  scope** from the bundled registries.
- **`NewFeaturesSection`** + `FeatureSeenContext` + `data/home/featureFeed.ts` — at most three
  unopened features, newest version first, each gone for good on tap; renders `null` (heading
  included) when nothing is pending.

**`LibraryScreen`** (Home stack `Library`, pushed from the door): `ReaderHeader variant="index"` →
search row → देवता rail (8 avatars + an `All N deities` overflow → `DeityIndex`) → उद्देश्य chips
(straight to `PurposeList` — the old Home tile's purpose *index* was these same chips, so the middle
screen is gone, not lost) → the form grid with per-category counts from `data/libraryCounts.ts` →
a संग्रह tile → `Wishlist` (registered on the Home stack so Back returns here).

**Three novelty mechanisms, deliberately separate.** `NewContentContext` (§44) tracks *texts* and
clears per text — its `NEW` badge now rides the Library grid. `whatsNew` (§47) announces a *release*
once to everyone updating into it. `FeatureSeenContext` tracks *features* per user and clears per
person. The feed carries only what the What's-New sheet cannot — a stable id, a thumb and a route —
and `featureFeed.test.ts` fails if a feed entry names a version `whatsNew` does not know.

**Icons.** `CategoryIcon` gained `calendar`, `vidhi` (a `॥` danda pair) and `vastu` (dik-chakra),
and `granth`/`sanskar` switched to open-book variants. All `View`-composition, no SVG, no emoji.

## Dependencies

- [[overview]] — provider nesting: `FeatureSeenProvider` sits inside `NewContentProvider`.
- [[routine]] — `SadhanaRow` consumes `useRoutineToday` + `useSadhanaToday`; the inline
  `RoutineBanner` is now its empty state only.
- [[panchang]] — three of the nine tools cross into the Panchang stack; `TodayStrip` is unchanged.
- [[puja-vidhi]], [[vastu-disha]], [[ask]] — each lost or moved a Home door in this pass.

## Gotchas

- **Deleting a Home surface silently orphans whatever only lived there.** Four surfaces had their
  *only* standing Home door on the deleted grid or carousel. Two were caught by existing touchpoint tests
  (`PitruSmaranTouchpoints`, `SankalpTouchpoints`) and re-homed — Pitru became a **tool**, not a
  नया card, precisely because नया clears on open and that door must persist while the ledger is
  empty. The third, आज का विधान (PRD-41), had **no** test and quietly became two taps deep behind
  the ⌕ FAB's empty state; `TodayVidhanTouchpoints.test.ts` was written afterwards. Before removing
  any Home surface, enumerate every card it carried. **दान-पुण्य (PRD-26) was the fourth**: it
  landed on `main` mid-flight with both its Home doors on the deleted surfaces, and only showed up
  in the merge conflict. Its tile is a tool (standing) and its launch badge is a नया card
  (clearing) — `DaanTouchpoints.test.ts` pins the split.
- **`data/home/tools.ts` is not driven by `categories.ts` and must not be made to be.** A new
  content category surfaces on the Library with zero Home changes. A tenth tool is a product
  decision with a doc update.
- **Launch discipline (§64) is load-bearing here.** `SadhanaRow`'s three variants share
  `ROW_MIN_HEIGHT`, the door's counts are module-scope constants, and नया renders `null` rather
  than a placeholder — all three sources hydrate from AsyncStorage *after* Home's first frame.
- **`computeJapaStreak` lives in `data/japaStreak.ts`, not `widgets/planner.ts`.** It was lifted
  out so Home does not pull the widget schema; `planner.ts` re-exports it. Today with no japa yet
  must **not** read as a broken streak — the walk starts at yesterday when today is empty.
- **The tour breaks silently, not loudly.** A `tourSteps` entry whose `targetId` cannot be measured
  falls back to ringing the destination tab, so deleting a `useTourTarget` host *describes things
  that are not there* rather than crashing. TRD-42 retargeted steps 7–9 and deleted the theerth
  tile step; `tourContent.jest.test.ts`'s `VALID_TARGET_IDS` mirror must move with `TourTargetId`.
- **Roughly twenty Maestro flows tapped a Home category tile.** They now run `_launch.yaml` then
  the shared `_open-library.yaml` subflow. `new-content-badge-home-smoke.yaml` was renamed
  `new-content-badge-library-smoke.yaml`.
- **`LibraryScreen` inherited the grid, so it inherited the iOS first-tap bug.** It mounts its own
  `useTilePressController` and wires `onScrollBeginDrag` on both the page scroll and the deity rail.
- **`CategoryCard`'s a11y label is always the full `nameEn`**, never `shortNameEn` — the Maestro
  flows tap by that string.
- **`LibraryScreen` is registered with a `getComponent` require() thunk**, not a static import: it
  is pushed, never initial, so it stays off the launch import graph. Note that
  `launchGraph.test.ts` is **already failing on `main`** (7,131,688 bytes against a 7,000,000
  budget, before this branch adds anything) — the big members are `precomputedObservances.ts`,
  `theerth/temples.ts`, `festivals.ts` and `bhogContentExtended.ts`. Do not raise the budget; the
  test's own header says to find what pulled the payload in.
