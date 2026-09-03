# PRD-26 — कण्ठस्थ · अभ्यास mode — memorization and recall

> *Thirty readers, read-aloud, progress, bookmarks, streaks — and no way to find out whether you actually know the verse. The app supports reading a text forever and never the thing a devotee is working toward.*

| | |
|---|---|
| **Status** | **Deferred** (product decision 2026-09-03: the Q4 2026 slate is PRD-42 + PRD-43 only) — build-ready; Q1 2027 candidate |
| **Parent** | [2026-Q4-candidates-round-2.md §2 · PRD-26](../2026-Q4-candidates-round-2.md) (candidate) · [2026-Q4-roadmap.md §2.4](../2026-Q4-roadmap.md) |
| **T-shirt size** | M — two pure modules, one reader overlay, one list screen, one routine item kind |
| **Delivery** | OTA. Pure TypeScript; no new dependency, no asset, **no sourced content** — the text is already in the binary in every language |
| **Prototype** | [`docs/memorize-abhyas-prototype.html`](../../memorize-abhyas-prototype.html) — 8 frames: reader toggle, the three mask levels, audio-cue recall, due queue, routine integration, कण्ठस्थ arrival |
| **Feasibility** | ✅ Confirmed against `main`: per-verse read-aloud (`readAloud/verseAdapter.ts`), `ReadingProgressContext`, the routine/sadhana completion path, and the hand-rolled `SINGLE_AKSHARA` matcher in `contentCorrectness.test.ts` all ship; `memoriz*`/`recall`/`quiz` appear nowhere in `src/` |
| **Backup** | `@vedansh:memorize:v1` registers in PRD-42's registry from day one (its coverage test forces it) |

**Bundle-only & private:** mastery is a per-device record of the user's own marks. Nothing is
ranked, shared, or scored; nothing leaves the device except through PRD-42's backup.

---

## 1. Problem

The devotional arc does not end at reading. Households drill children on exactly these texts —
Hanuman Chalisa, Gita 12 and 15, the Gayatri, the dohas of Sundarkand, Vishnu Sahasranama — toward
**कण्ठस्थ**, having it by heart. It is the one practice in this app that takes years and compounds,
and the app has every prerequisite for it and none of the mechanic: it can show a verse, speak a
verse, and record that a verse was *read*, but it cannot hide a verse and ask.

## 2. Goal

On any reader, a user can switch into **अभ्यास** (practice), see the page progressively masked, reveal
line by line, and mark **आया / नहीं आया** — and the app remembers, schedules what is due, and folds
"review what is due" into the daily routine the user already keeps. A verse marked recalled at the
hardest level across spaced sessions is shown as **कण्ठस्थ**, quietly.

Success (roadmap §5): ≥ 1.5 अभ्यास sessions per weekly-active user; ≥ 3 verses reaching कण्ठस्थ per
30 days among users who enabled it. Local counters only.

## 3. What ships

### 3.1 `memorize/akshara.ts` + `memorize/mask.ts` — pure

- **The splitter.** Generalise the repo's `SINGLE_AKSHARA` matcher into `splitAksharas(devanagari)`:
  a hand-rolled Devanagari cluster grammar (consonant + optional nukta + (virama + consonant)* +
  optional matra + optional anusvara/visarga/chandrabindu; independent vowels; punctuation/danda as
  their own tokens; whitespace preserved as separators). **`Intl.Segmenter` is banned** — the repo has
  recorded why (ICU/Unicode 15.1 GB9c splits conjuncts like ज्यो on older runtimes). Reuse the cluster
  rule `data/devanagariWellFormed.ts` already encodes for validation so the two cannot disagree.
  Half-day spike first (round 2 §5.1): confirm the matcher generalises to full verse lines with the
  content corpus as the fixture — every line in every content JSON must round-trip
  `join(split(line)) === line`.
- **Masking.** `maskVerse(lines, level)` — deterministic, akshara-wise:
  - **L1 · पहला शब्द** — first word of each line visible, the rest masked.
  - **L2 · पहला अक्षर** — first akshara of each line visible.
  - **L3 · पूर्ण** — everything masked; line count and each line's akshara count preserved as the mask's
    shape, so the metre is a cue but the words are not.
  Masks render as a soft parchment bar per akshara (never `•••` glyph strings — the count of a glyph
  string leaks nothing useful and looks like a form field). **Masking is computed on the source
  Devanagari and transliterated after** for gu/kn (the [[languages]] rule: offsets drift otherwise);
  `en` reading language masks the IAST/romanized line word-wise at L1 and character-cluster-wise via
  a Latin grapheme split at L2/L3.

### 3.2 `memorize/mastery.ts` — pure, persisted at `@vedansh:memorize:v1`

Per verse key (`<sourceId>::<chapter>::<verseIndex>`, the reading-progress key family):

```ts
{ level: 0 | 1 | 2 | 3, streak: number, lastReviewed: dateKey, due: dateKey, kanthastha?: dateKey }
```

**Schedule — fixed, small, stated in the UI.** A recall marked आया at the current level increments
`streak`; two consecutive successes promote the level (L1→L2→L3→कण्ठस्थ). Due intervals by level:
L1 1 day · L2 3 days · L3 7 days · कण्ठस्थ 21 days (maintenance; a miss at कण्ठस्थ drops to L3, not to
0). A नहीं आया resets `streak` to 0 and pulls `due` to tomorrow without demoting. Pure function
`dueToday(store, dateKey)` returns the queue, grouped by section. No percentages, no scores, no
"accuracy" — levels and dates only.

### 3.3 The reader overlay — अभ्यास on every reader

- Entry: an **अभ्यास** pill on the reader toggle row beside `AddToRoutineButton` (the row hosts
  `LanguageToggle` + routine today; a third control needs the §9 row spec updated — design decision
  №1). While on, the header title gains a quiet `· अभ्यास` suffix and pager dots stay.
- The verse page renders masked at the current level for that verse (L1 for a never-practised verse).
  **Tap a line to reveal it**; tap the page's mask legend to reveal all. Below the verse, two
  44-pt actions: **आया** / **नहीं आया**. Meaning and commentary are collapsed (they are the answer
  key) and openable.
- **Audio-cue recall** — when read-aloud is available for the reader, a **सुनकर** control speaks the
  first line (the shipped `expo-speech` path through `_useReaderReadAloud`, one chunk) and stops; the
  user continues aloud, then marks. No new dependency; unavailable when the language's voice is
  unavailable, exactly as read-aloud's own state.
- Swiping advances verses as in reading; the mask level follows each verse's own record. Leaving the
  reader or toggling off returns the page to normal. **Reading progress is not written in अभ्यास** — a
  practised page is not a read page (the routine's derived completion must not be fooled).
- Every reader gets it because the overlay sits on the shared verse-page contract (`toReadableVerse`
  already duck-types all 7 shapes); the fan-out table lives in a test like `readerAutoAdvance.test.tsx`.

### 3.4 The due queue — `MemorizeListScreen` + the routine item

- `More → अभ्यास · कण्ठस्थ` → a list of practised units (section/chapter) with per-unit level
  distribution and the count due today; tap → the reader in अभ्यास at the first due verse. Units the
  user has reached कण्ठस्थ on sit in a quiet **कण्ठस्थ** section with the date — the arrival state
  from the prototype, no confetti.
- **`RoutineItemKind` gains `'memorize'`** — an item meaning "review what is due" (optionally scoped
  to a `sourceId`). `resolveRoutineItem` titles it अभ्यास with the due count as its sub-line;
  `navigateToRoutineItem` opens the list (or the scoped reader in अभ्यास); `isItemAutoComplete`
  is true when today's due queue for the scope is empty **and** at least one mark happened today
  (an empty queue with no practice is "nothing due", shown as such, not "done"). The same trick
  PRD-19 used to add `'vidhi'`; Today's Practice, the celebration path and per-routine reminders
  come free.
- **Sadhana Programs**: a `memorize` unit kind lets a future program say "Gita 12 by heart in 40
  days"; v1 ships the kind and one program (`gita-12-kanthastha`) only if the schedule fits the
  15-program catalog's calendar-gate conventions without new UI — otherwise the kind ships unused.

### 3.5 Ask intents (RULEBOOK §25)

`memorize.due` ("आज अभ्यास में क्या बाकी है", "kya yaad karna hai"), `memorize.start`
("हनुमान चालीसा याद करनी है", "memorise gita 12") → the reader in अभ्यास. Both answer from the
store or abstain to the list.

## 4. Where it lands (surfaces)

Reader toggle-row pill + masked verse page + आया/नहीं आया + सुनकर · `MemorizeListScreen` (More row) ·
`memorize` routine item in Today's Practice / Add Content · optional one sadhana program · two
जिज्ञासा intents · a DISCOVER card once.

## 5. Stance guards (product stance, locked)

- **Practice, not testing.** No score, no percentage, no accuracy, no "you failed", no streak-shaming,
  no leaderboard, no sharing of mastery. The user marks their own recall and the app believes them
  (§51's refusal of verdicts, applied to the user's own memory).
- **कण्ठस्थ is a date, not a badge.** It appears as *"कण्ठस्थ · 12 नव."* in the meta register; the one
  celebration is the routine's existing pushpa-varsha when the day's practice completes, unchanged.
- **Children are served, not addressed.** No kid mode, no cartoon register; a parent drilling a
  child uses the same quiet surface.
- **Never mask the meaning into a quiz about theology.** Only the verse text is ever hidden.

## 6. Data model & backup

`@vedansh:memorize:v1` — `{ version: 1, verses: Record<verseKey, MasteryRecord>, enabledSections?:
string[] }`. Registered in PRD-42's registry as `union-by-key-latest` (the later `lastReviewed`
wins; `kanthastha` dates union). Enumerated as a non-cache key in `derivedCacheReset.test.ts`.
Verse keys survive content renames through `sourceIdMigration.ts` like bookmarks do.

## 7. Open decisions

1. **Where the pill lives** — toggle row (recommended: it is a *mode*, like language) vs the header
   `right` slot (already carries read-aloud + page counter). Needs the §9 row spec updated either way.
2. **Schedule constants** — 1/3/7/21 recommended; stated in the list screen's footer so the user can
   see the rule. Not user-configurable in v1.
3. **English reading language at L2/L3** — mask the romanization (recommended; the *sound* is what is
   memorised) vs mask the Devanagari beneath it. Prototype frame 3 shows the former.
4. **One sadhana program in v1** — only if zero new program UI is needed (§3.4).

## 8. Non-goals

- No speech recognition / auto-grading of recitation (PRD-41 Phase 4 is voice *input to search*, a
  different thing; grading a chant is out on stance as much as feasibility).
- No typing-the-verse mode. No multiple-choice. No timed drills.
- No new content, no audio recordings, no per-verse "tips".
- No sharing or social surface of any kind.

## 9. Risks

| Risk | Mitigation |
|---|---|
| The akshara splitter mis-clusters a conjunct and a mask bar lands mid-syllable | Corpus round-trip test over every content line; reuse the well-formedness grammar; the 107 quarantined malformed strings are masked word-wise (L1) only, by baseline lookup |
| gu/kn offsets drift | Mask on Devanagari, transliterate the visible spans; test on the 5,548-string transliteration corpus |
| The overlay pollutes reading progress / routine auto-completion | अभ्यास never calls `setProgress`; pinned by a test on each reader in the fan-out table |
| Toggle row overflow on small phones with three controls | Design decision №1; measured at 360 dp with `maxFontSizeMultiplier` caps per §12 |
| Feature reads as a quiz app | Copy register per §5; no numbers anywhere but dates and due counts |

## 10. Tests & release gates (RULEBOOK §0/§0.1)

- **Unit:** `akshara.test.ts` (grammar + corpus round-trip, tsx), `mask.test.ts` (levels, shape
  preservation, gu/kn/en), `mastery.test.ts` (promotion, reset, due queue, idempotent day marks),
  Jest for the overlay on Gita + Chalisa + one multi-instance reader, the list screen, the routine
  kind (resolve/navigate/auto-complete), reading-progress isolation, PRD-42 registry entry.
- **E2E:** `abhyas-smoke.yaml` — open a chalisa → अभ्यास → masked page asserted (mask legend text) →
  tap-to-reveal → आया → More → अभ्यास list shows the unit; `routine-smoke` extended with a `memorize`
  item.
- **Docs in the same PR:** `design.md` §9 (toggle row + overlay spec), §45 (routine kinds), new
  **§74 अभ्यास · कण्ठस्थ**; `RULEBOOK.md` §6/§13 routine-kind mirror and the RULEBOOK §25 intents;
  `RoutineItemKind` union mirrored in the [[routine]] wiki page.

## 11. Why it fits the moat

Every competitor can show the Hanuman Chalisa. Only an app that already holds every text, per-verse,
in four scripts, with a speech path and a daily-practice ledger can make *learning it by heart* a
zero-content feature — and a user with sixty verses at कण्ठस्थ in this app's record (backed up by
PRD-42) has a reason to stay that no catalogue can match.
