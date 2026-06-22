# PRD-10 — Today's Practice (आज की साधना) Redesign

| | |
|---|---|
| **Status** | Proposed — implementation in `claude/todays-practice-redesign` |
| **Target release** | Post v1.4.0 |
| **Window** | TBA |
| **T-shirt size** | M (single screen + supporting components; no new data feature) |
| **Owner** | TBA |
| **Supersedes** | The `RoutineTodayScreen` UI from PRD-07 §6 (data model & completion logic from PRD-07 are reused unchanged except for completion timestamps) |

---

**Local-first constraint (unchanged):** routines and completion state stay on-device via `AsyncStorage`. This redesign adds **no** account, no server, and no new permission. It is a presentation-layer change plus one additive field (a completion timestamp) on the existing daily done-set.

---

## 1. Problem

PRD-07 shipped the daily-routine feature, and `RoutineTodayScreen` ("आज की साधना / Today's Practice") works: it lists today's scheduled items, lets the user tap a row to read or tap a circle to mark done, shows a progress bar and a one-line streak. But the screen reads like a **utility checklist**, not a **devotional surface**. Three problems specifically:

1. **The completion moment is undersold.** Finishing the day's practice produces a thin "6/6 · done" line and a plain bar. The app already believes completion is sacred — it fires a full-screen pushpa-varsha (`RoutineCelebrationOverlay`) and shows a `LotusMark` "पूर्ण" badge on the banner — yet the Today screen itself has no persistent, dignified "complete" state.
2. **The streak is invisible as a ritual object.** It renders as `Streak · 3 days` text. The product's own metaphor is a **mala** (the prayer-bead string the banner and brand already lean on), not a number.
3. **Done items are struck through.** `RoutineTodayScreen` applies `textDecorationLine: 'line-through'` to completed items. Striking through a sacred text reads as "cancelled / deleted," the opposite of "offered." Completed practice should be honored, not crossed out.

The proposed mockup (`vedansh-practice-mockup.html`) resolves all three: a calm **completion summary card** with a fade-in **seal** at 100%, a **mala-bead streak** strip, **"offered HH:MM"** timestamps in the devotional "offered" register, and **no strikethrough** (done titles are simply muted).

## 2. Goal

Reshape `RoutineTodayScreen` so the daily practice **looks and feels like a ritual ledger**: today's readings, what has been *offered* and when, the streak as a filling mala, and a quiet seal when the day is complete — all in the app's existing parchment system, with **no new fonts or accent colors** and **no change to what counts as "done."**

Success looks like:

- A returning user opens Today's Practice and immediately reads, at a glance: how much of today is offered, the streak as a mala, and — when finished — a seal that says "complete" without a popup.
- Each offered item shows **when** it was offered (e.g. *offered 7:12 AM*), so the screen is a record of the day, not just a set of checkboxes.
- Nothing about completion *semantics* changes: auto-complete on reaching the last verse-page (or target japa rounds) and the manual mark-done fallback both behave exactly as in PRD-07.

## 3. Non-goals

- **No change to completion logic or granularity.** `isItemAutoComplete` (PRD-07 §5.3) and the section/chapter/japam model are untouched. We only *read* a timestamp that was already implicitly available (reading `updatedAt`) and *start storing* one for manual marks.
- **No change to routine creation, editing, or scheduling** (`CreateRoutineScreen`, `RoutineAddItemsScreen`, `RoutineDetailScreen`, `RoutineListScreen`, vaar). Those setup screens are out of scope for this PR; this redesign begins *from* them and changes only the Today view they feed.
- **Not the Home "Today hero."** The Home redesign (resume-reading hero) is tracked by its own handoff (`vedansh-home-handoff.md`). This PR builds a **reusable `MalaStreak`** that Home can later adopt, but does not touch `HomeScreen`.
- **No second celebration animation.** The existing app-wide pushpa-varsha (`RoutineCelebrationOverlay`) stays as the one-shot moment. The new in-card seal is a **persistent state badge**, not a competing animation.
- **No "offered" copy rename elsewhere.** The banner ("साधना पूर्ण · आज") and Profile keep their current strings; the "offered" register is introduced only on the Today screen for now.

## 4. Current state → target (gap analysis)

| Element | Current `RoutineTodayScreen` | Mockup target | Work |
|---|---|---|---|
| Progress header | `parchmentSoft` box, `doneCount/total · done`, solid saffron bar | Centered **summary card**: big "X of Y" / "X of Y offered", italic sub-line, gold→saffron gradient bar | Rebuild card |
| Completion state | None (bar just hits 100%) | **Seal** fades in; bar hidden; "Today's practice is complete" | New `PracticeSeal` (fade-in `LotusMark`, no scale pop) |
| Streak | `Streak · 3 days` text | **Mala**: lit beads + meru + "N day mala" | New `MalaStreak` component |
| Item — done state | Title **struck through**, muted | Title **muted, never struck**; copper check in filled circle | Remove `line-through`; restyle mark |
| Item — meta | `{routineName} · marked / read to end` | `{secondary-script title} · offered 7:12 AM` / `· Tap to read` | Add timestamp; reword tail |
| "Offered" time | Not stored | `offered 7:12 AM` | Add `doneAt` (manual) + use reading `updatedAt` (auto) |
| Language register | "done / पूर्ण" | "offered / अर्पित" | Copy change (this screen only) |
| Reduced motion | Not handled | Seal + bead pulse disabled under reduce-motion | New `useReducedMotion` hook |
| Empty state | "Nothing scheduled" + ghost button | Unchanged (keep) | Keep, restyle to card |

## 5. Design

Reference: `vedansh-practice-mockup.html` (open at ~390 px). It is the source of truth for **layout and hierarchy**, not for type or color — those come from the app's tokens (`theme/`), per the handoff rule "do not introduce new fonts or colors."

**Token mapping (mockup → app).** copper `#A8581C` → `colors.saffron`; copper-deep → `colors.saffronDeep`; gold → `colors.gold`; cream card → `colors.parchmentSoft`/`parchmentHighlight`; inks → `colors.ink`/`inkSoft`/`inkMuted`. Fonts: **Noto Serif Devanagari** (`cardHindi`) and **Cormorant Garamond** (`cardLatin`/`verseLatin`) — *not* the mockup's Tiro/Spectral. Radii from `radii` (card `lg`=18, pill). Shadows from `elevation.card`.

**5.1 Completion summary card.** One centered card at the top:
- Big line: partial → `{done} of {total}`; complete → `{total} of {total} offered`.
- Sub line (italic, `cardLatin`): partial → `{n} reading(s) remaining`; complete → `Today's practice is complete`.
- Progress strip: gold→saffron `LinearGradient` fill; **hidden** when complete.
- `MalaStreak` row + "N day mala" label.
- `PracticeSeal` (the `LotusMark`) **absent while partial, fades in when complete** — an opacity fade only, no scale pop (design.md §11/§30), respecting reduce-motion → appears instantly.

**5.2 Mala streak (`MalaStreak`).** Horizontal bead string built from `View` circles (gradient on lit beads), terminating in a larger gold **meru** bead. `lit = min(streak, capacity)`. Today's most-recent lit bead gently pulses (disabled under reduce-motion). Accessible label "N day streak". Streak source is the existing global `currentStreak()` — unchanged. Empty streak → all beads unlit with "Start your mala today" (mirrors the handoff's streak-0 rule).

**5.3 Item row.** Left: a tappable circle — `gold` ring when pending, filled `saffron` with a check when offered. Center: title in the active language (`cardHindi`), **muted when done, never struck**; meta line `{other-script title} · {state}`. Right: chevron (opens the reading). State tail:
- offered + known time → `offered 7:12 AM` / `7:12 पूर्वाह्न · अर्पित`
- offered + no time (auto-japam / migrated legacy mark) → `offered` / `अर्पित`
- pending → `Tap to read` / `पढ़ने के लिए टैप करें`

Tapping the row opens the unit via `navigateToRoutineItem` (unchanged). Tapping the circle marks/unmarks manual completion (unchanged API).

**5.4 Hint + empty state.** Keep the existing hint ("Open a reading… it auto-completes… tap the circle to mark it offered"). Keep the empty/no-routine state, lightly restyled into the card idiom, with the existing "Add a routine" ghost button.

All strings branch on `lang` (RULEBOOK §3). Reader/title swaps Hi/En rather than stacking.

## 6. Data & state changes

The only model change is **additive** and backward-compatible.

**6.1 Manual done-marks carry a timestamp.** PRD-07 stored `@vedansh/routine-done` as `{ date, keys: string[] }`. Change to `{ date, marks: Record<string, number> }` (key → epoch-ms). On load, a legacy `keys` array is migrated to `marks` with timestamp `0` (= "offered, time unknown"). `RoutineContext` keeps `markManualDone` / `unmarkManualDone` / `isManualDone` and gains `manualDoneAt(key): number | undefined`.

**6.2 `useRoutineToday` exposes `doneAt`.** `TodayEntry` gains `doneAt?: number`: for a manual mark, `manualDoneAt(key)`; for an auto reading-complete, the reader's `getProgress(sourceId)?.updatedAt`; for auto-japam, `undefined` (no per-round timestamp — shows "offered" without a time). Daily reset is unchanged (marks discarded when `date !== today`).

**6.3 No reader edits.** Completion stays *derived* — no per-reader changes, consistent with PRD-07 §7a.

## 7. Acceptance criteria

1. With a partial day, the card shows `{done} of {total}`, the gradient bar at the right %, the mala with `{streak}` lit beads, and **no seal**.
2. On the transition to all-done, the seal fades in (or appears instantly under reduce-motion), the bar is hidden, and the sub-line reads "Today's practice is complete." The existing pushpa-varsha still fires once.
3. A done item's title is **muted and not struck through**; its row shows `offered {time}` when a time is known.
4. Marking an item done by tapping the circle records the current time and immediately shows `offered {now}`; unmarking reverts it.
5. A legacy `{date, keys}` done-set loads without error and renders those items as `offered` (no time).
6. Streak `0` shows an all-unlit mala with the "start" copy; never a hidden component.
7. Hindi/English both render correctly via the language toggle; reduce-motion disables the seal animation and bead pulse.
8. `npm run typecheck` clean; the Jest screens/components/contexts gate green, including a new `practiceView` suite and a `RoutineContext` done-marks/migration test.

## 8. Reuse map

| Need | Existing asset |
|---|---|
| Screen shell + back bar | `components/RoutineShell.tsx` |
| "पूर्ण" achievement mark (→ seal) | `components/LotusMark.tsx` |
| Completion celebration (kept) | `components/RoutineCelebrationOverlay.tsx`, `RoutineCelebration.tsx` |
| Today composition + completion | `data/routine/useRoutineToday.ts`, `units.ts` |
| Streak | `contexts/UserActivityContext.tsx` (`currentStreak`) |
| Tokens (color/type/space/radii/elevation) | `theme/*` |
| Gradient primitive | `expo-linear-gradient` (already used by `LotusMark`, `RoutineShell`) |
| Item navigation | `navigation/entryRoutes.ts` (`navigateToRoutineItem`) |

## 9. Decisions & open questions

**Decided:**
- **Match app tokens, not mockup tokens.** Mockup's Tiro/Spectral fonts and copper hex are stand-ins; we use Noto Serif Devanagari + Cormorant and the saffron palette. (Handoff non-negotiable.)
- **Seal = `LotusMark` with an opacity fade-in, not a new Sri-Yantra SVG.** Keeps the established View+gradient vector convention (design.md §30; no decorative SVG), reuses the app's existing completion symbol, and obeys the motion rule (§11: no scale effects; §30: "no scale pops").
- **Mala is static.** The today-bead is marked with a static ring, not a pulse — ongoing scale/opacity animation would violate §11.
- **Seal is a persistent badge; the pushpa-varsha stays the one-shot animation.** No duplicate celebration.
- **"Offered" register on the Today screen only** for now; banner/Profile copy unchanged to avoid a scattered rename.
- **Timestamp is additive + migrated;** no destructive storage change.

**Open:**
- Should the "offered" register roll out to the banner and Profile for consistency? (Follow-up; out of scope here.)
- Mala capacity / wrap behavior for very long streaks (e.g. cap at one mala = 27/108 beads with a "×N" multiplier)? Phase-2 polish; this PR caps the displayed beads and keeps the numeric label authoritative.
