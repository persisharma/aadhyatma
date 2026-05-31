# Plan: NEW Chip on Categories & Library Cards

## Summary
Add a "NEW" pill badge that highlights recently-added content on both category tiles (HomeScreen) and library cards (CategoryList / DeityList). The badge mirrors the existing "SOON" badge styling but uses green tokens, appears only on **active** items that are new to the user, and dismisses when the user taps into the content. A new `NewContentContext` tracks "new since you last updated" via a stored version baseline in AsyncStorage.

## User Story
As a returning user who just updated the app,
I want recently-added prayers/stotrams to be visually flagged as NEW,
So that I can discover fresh content instead of it blending in with everything I've already seen.

## Problem → Solution
Today new content (e.g. Krishna Stotram, Bajrang Baan, Ram Stuti) appears silently alongside existing entries with no signal → A green "NEW" chip marks content added since the user's previously-seen app version, clearing per-item on tap.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.context/attachments/ooOaZN/pasted_text_2026-05-28_23-13-12.txt` (user-provided base plan)
- **PRD Phase**: N/A (standalone)
- **Estimated Files**: 11 (3 new, 8 edits) + 2 test files + 1 maestro flow

---

## UX Design

### Before
```
HomeScreen tiles                 CategoryList cards
┌──────────┐ ┌──────────┐        ┌─────────────────────────┐
│  ग्रन्थ    │ │ स्तोत्रम्    │        │ [कृ] कृष्ण स्तोत्रम्        › │
│Sacred Bks│ │Hymns&Pra │        │     Krishna Stotram      │
└──────────┘ └──────────┘        └─────────────────────────┘
(no signal that Hymns has new content)   (no signal this is new)
```

### After
```
HomeScreen tiles                 CategoryList cards
┌──────────┐ ┌────[NEW]─┐        ┌──────────────────[NEW]──┐
│  ग्रन्थ    │ │ स्तोत्रम्    │        │ [कृ] कृष्ण स्तोत्रम्        › │
│Sacred Bks│ │Hymns&Pra │        │     Krishna Stotram      │
└──────────┘ └──────────┘        └─────────────────────────┘
(Hymns tile shows NEW because it     (NEW chip top-right; tap →
 contains ≥1 new entry)               chip clears for that entry)
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Home category tile | active tile, no badge | active tile + NEW badge if category has ≥1 new entry | green pill, top-right |
| Library card (active) | thumb + meta + chevron | same + NEW badge top-right when `isNew(id)` | chevron stays; badge is absolute top-right |
| Tap into reader (3 screens) | navigates | navigates **and** `markSeen(id)` clears that entry's NEW state | persists across restarts |
| Screen reader | "Krishna Stotram. … Tap to open." | "Krishna Stotram. … **New.** Tap to open." (only when new) | label unchanged when not-new → existing Maestro selectors keep working |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `mobile/src/contexts/ReadingProgressContext.tsx` | 1-133 | Canonical context+AsyncStorage pattern to mirror exactly |
| P0 | `mobile/src/components/CategoryCard.tsx` | 1-159 | SOON-badge pattern + active-vs-inactive branch structure |
| P0 | `mobile/src/components/LibraryCard.tsx` | 1-248 | SOON-badge + chevron layout; where NEW badge slots in |
| P0 | `mobile/src/data/texts.ts` | 28-40, 141-217 | `LibraryEntry` type + entries to tag |
| P1 | `mobile/src/theme/colors.ts` | 1-47 | token shape; `ColorPalette = typeof lightColors` |
| P1 | `mobile/src/theme/ThemeContext.tsx` | 1-37 | confirms new tokens auto-flow via `useTheme().colors` |
| P1 | `mobile/App.tsx` | 117-143 | provider tree insertion point |
| P1 | `mobile/src/screens/HomeScreen.tsx` | 36-62, 130-142 | tile construction + render |
| P1 | `mobile/src/screens/CategoryListScreen.tsx` | 29-40 | handlePress for markSeen |
| P1 | `mobile/src/screens/DeityListScreen.tsx` | 31-42 | handlePress for markSeen |
| P1 | `mobile/src/screens/SearchScreen.tsx` | 125-165 | openSection/openVerse/openDeity for markSeen |
| P2 | `mobile/.maestro/sanskar-smoke.yaml` | all | accessibilityLabel selector conventions for e2e |
| P2 | `mobile/.maestro/_launch.yaml` | all | shared boot subflow |

## External Documentation
| Topic | Source | Key Takeaway |
|---|---|---|
| App version at runtime | `expo-constants` (v18.0.13, installed) | `Constants.expoConfig?.version` returns app.json `version`. Add to package.json explicitly (currently transitive-only). |
| OTA + runtimeVersion | app.json `runtimeVersion.policy: "appVersion"` | OTA updates are scoped to a native version and **cannot change `version`**. Version-based "new" detection therefore fires on native-build (store) releases, not pure-JS OTA pushes. Documented as a known limitation. |

---

## Patterns to Mirror

### CONTEXT_PROVIDER + ASYNCSTORAGE
```ts
// SOURCE: mobile/src/contexts/ReadingProgressContext.tsx:25-133
const Ctx = createContext<Value>({ /* safe no-op defaults */ });
export function Provider({ children }) {
  const [state, setState] = useState(initial);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => { if (raw) { try { /* parse */ } catch { /* leave empty */ } } })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);
  const persist = useCallback((next) => { setState(next); AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined); }, []);
  return <Ctx.Provider value={{ ...state, isLoading, ... }}>{children}</Ctx.Provider>;
}
export function useReadingProgress() { return useContext(Ctx); }
```

### STORAGE_KEY_CONVENTION
```ts
// SOURCE: mobile/src/contexts/ReadingProgressContext.tsx:6  & BookmarksContext.tsx:5 & SearchScreen.tsx:40
const STORAGE_KEY = '@vedansh/reading-progress';  // '@vedansh/bookmarks', '@vedansh/search-recent'
// → NEW: '@vedansh/new-content-state'
```

### BADGE_RENDER (SOON)
```tsx
// SOURCE: mobile/src/components/CategoryCard.tsx:102-116  (inactive branch)
<View style={[styles.badge, { backgroundColor: colors.goldTint, borderRadius: radii.pill }]}>
  <Text style={[styles.badgeText, { color: colors.inkMuted, letterSpacing: 1.6 }]}>SOON</Text>
</View>
// styles.badge: { position:'absolute', top:8, right:8, paddingHorizontal:8, paddingVertical:2 }
// styles.badgeText: { fontSize:9, fontWeight:'600', textTransform:'uppercase' }
```

### ACTIVE_PRESSABLE_EXPLICIT_LABEL
```tsx
// SOURCE: mobile/src/components/CategoryCard.tsx:66-67
accessibilityRole="button"
accessibilityLabel={`${nameEn}. Tap to open.`}   // explicit → iOS does NOT merge child badge text
```

### TEST_STRUCTURE
```tsx
// SOURCE: mobile/src/screens/__tests__/SanskarReaderScreen.test.tsx (jest preset react-native)
// testMatch: '<rootDir>/src/screens/__tests__/**/*.test.tsx'  (jest.config.js:3)
// Uses react-test-renderer. moduleNameMapper '@/...' -> src/...
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `mobile/src/utils/semverCompare.ts` | CREATE | Pure `compareSemver(a,b) → -1|0|1`; no dep |
| `mobile/src/contexts/NewContentContext.tsx` | CREATE | Provider + `useNewContent()` hook (`isNew`, `hasNewInCategory`, `markSeen`, `isLoading`) |
| `mobile/src/data/texts.ts` | UPDATE | Add `addedInVersion?: string` to `LibraryEntry`; tag krishna-stotram, bajrang-baan, ram-stuti with `'1.3.0'` |
| `mobile/src/theme/colors.ts` | UPDATE | Add `newBadgeBg`, `newBadgeText` tokens |
| `mobile/App.tsx` | UPDATE | Insert `<NewContentProvider>` after `UserActivityProvider` |
| `mobile/src/components/CategoryCard.tsx` | UPDATE | `hasNew?` prop + NEW badge in active branch; conditional " New." in label |
| `mobile/src/components/LibraryCard.tsx` | UPDATE | consume `useNewContent()`; NEW badge for active+isNew; conditional " New." in label |
| `mobile/src/screens/HomeScreen.tsx` | UPDATE | `useNewContent()`; pass `hasNew={hasNewInCategory(c.id)}` to category tiles |
| `mobile/src/screens/CategoryListScreen.tsx` | UPDATE | `markSeen(entry.id)` in handlePress |
| `mobile/src/screens/DeityListScreen.tsx` | UPDATE | `markSeen(entry.id)` in handlePress |
| `mobile/src/screens/SearchScreen.tsx` | UPDATE | `markSeen(sourceId)` in openSection/openVerse |
| `mobile/package.json` | UPDATE | add `expo-constants` to dependencies (explicit) |
| `mobile/src/utils/__tests__/...` & `src/contexts/__tests__/...` & `src/screens/__tests__/...` | CREATE | Jest tests (see Testing Strategy — testMatch handling) |
| `mobile/.maestro/new-content-badge-smoke.yaml` | CREATE | e2e: nav still works through tagged path + no badge on fresh install |

## NOT Building
- Dark-mode variant of NEW tokens (ThemeProvider is light-only today).
- A "What's New" changelog screen / modal.
- NEW badge on the **By Deity** Home tile (key `'deity'` is not a `ContentCategory`; `hasNewInCategory('deity')` returns false by design — documented edge case).
- NEW badge inside Search results rows (markSeen is wired there, but no badge rendered — out of scope).
- ID-set-based "new content" detection for pure-OTA drops (future enhancement; see Risks).
- Bumping app.json `version` (no native release in this change).

---

## Core Design: content-ID-set diffing (REVISED per adversarial review v1)

> **Why this replaces the version-comparison model from the base plan:** Codex adversarial review (iteration 1) found three high-severity flaws in version-based detection: (a) a version bump dropped un-tapped older badges; (b) OTA content drops — the plan's OWN stated use case — can never bump `version` under `runtimeVersion.policy: appVersion`, so they'd never be flagged; (c) the frozen-snapshot/dismissed-clear dance was fragile. **Content-ID-set diffing** fixes all three: "new" = a library entry the user has not yet acknowledged, detected by diffing the current library against a stored `knownIds` set — fully version-agnostic, OTA-safe, and persists-until-tapped with no snapshot to drop.

**Persisted shape** at `@vedansh/new-content-state`:
```ts
type NewContentState = { knownIds: string[] };   // ids the user has already "seen" (tapped or pre-acknowledged at debut)
```
`addedInVersion` is retained on `LibraryEntry` purely as a human-readable **debut marker** (documents when content shipped) and to seed the debut state; runtime detection does NOT compare versions.

**Constants:**
- `STORAGE_KEY = '@vedansh/new-content-state'`
- `CURRENT_VERSION = Constants.expoConfig?.version ?? '0.0.0'` (used only for the debut seed gate)
- `PRE_FEATURE_BASELINE = '1.2.0'` — debut-new gate: an entry counts as "debut-new" only if `addedInVersion > PRE_FEATURE_BASELINE` (prevents very old tagged content from ever showing).
- `UPGRADER_SIGNAL_KEYS = ['@vedansh/bookmarks','@vedansh/reading-progress','@vedansh/search-recent','@vedansh/japam-counter','@vedansh/language']` — **user-action-only** keys. Each is written ONLY after a deliberate user action in a *prior* session (bookmark / open-a-reader / search / japam / language-toggle) and is NEVER written during a fresh cold-start mount. (Deliberately EXCLUDES `@vedansh/notif-meta`, `@vedansh/notif-prefs`, `@vedansh/user-activity`, which providers may write on mount — see adversarial finding #5.)
- `discoverableIds = library.filter(e => e.status === 'active' && !e.hidden).map(e => e.id)` — only user-discoverable entries (finding #6).
- `debutNewIds = library.filter(e => e.status === 'active' && !e.hidden && e.addedInVersion && compareSemver(e.addedInVersion, PRE_FEATURE_BASELINE) > 0).map(e => e.id)` → `['krishna-stotram','bajrang-baan','ram-stuti']`

**On mount (load effect):**
1. `stored = JSON.parse(getItem(KEY))` (corrupt/missing → `null`).
2. **`stored == null`** (first run of this feature — debut OR genuine fresh install):
   - `keys = await AsyncStorage.getAllKeys()` (copy to a mutable array before `.some`).
   - `isUpgrader = UPGRADER_SIGNAL_KEYS.some(k => keys.includes(k))` — race-proof: none of these keys can be created during this same launch, so a genuine fresh install is never misclassified (protects the fresh-install/Maestro invariant). Residual false-negative (returning user who never bookmarked/read/searched/japam/toggled-language) is rare and accepted.
   - `knownIds = isUpgrader ? discoverableIds.filter(id => !debutNewIds.includes(id)) : discoverableIds`
     - **upgrader** → all discoverable known EXCEPT debut-new → the 3 tagged entries show NEW.
     - **fresh install** → all discoverable known → nothing shows NEW.
   - persist `{ knownIds }`.
3. **`stored != null`**: use `stored.knownIds` as-is. Any **discoverable** entry NOT in `knownIds` is automatically NEW — this flags content added after the user's last run (OTA or native), AND a previously hidden/`coming` entry only enters `discoverableIds` once it goes active, so it is correctly flagged the first time it becomes visible (finding #6).

**API (all reads gated on `!isLoading`):**
- `isNew(id) = !isLoading && discoverableIds.includes(id) && !knownIds.includes(id)`
- `hasNewInCategory(categoryId) = !isLoading && library.some(e => e.category === categoryId && e.status === 'active' && !e.hidden && isNew(e.id))`
- `markSeen(id)`: if `isLoading` or `knownIds.includes(id)` → no-op; else persist `{ knownIds: [...knownIds, id] }`. Marks the id "known" → badge gone permanently, persists across restarts.
- `devSimulateUpgrade()` — **`__DEV__`-only test hook (Decision 2 = B).** Body is a no-op unless `__DEV__`. When invoked: sets in-memory `knownIds = discoverableIds.filter(id => !debutNewIds.includes(id))` (the upgrader seed) AND persists it, so badges appear live (no reload) and survive restart. Lets Maestro reach the positive (upgrader) state on-device. Never wired into any production UI.

**Why this satisfies every requirement (and the adversarial findings):**
- *Persist-until-tapped (finding #1):* an un-tapped new id stays out of `knownIds`, so it keeps showing across any number of restarts AND future upgrades (knownIds only ever GROWS, and only via `markSeen`).
- *OTA-safe (finding #2):* a content drop adds discoverable ids absent from `knownIds` → NEW, regardless of whether `version` changed.
- *Fresh install:* none of `UPGRADER_SIGNAL_KEYS` exist → `knownIds = discoverableIds` → nothing new. Brand-new users never see old content as "new."
- *No resurrection:* tapped ids stay in `knownIds` forever. No dismissed-clear step exists.
- *Race-proof upgrader detection (finding #5):* `UPGRADER_SIGNAL_KEYS` are user-action-only and cannot be written during a fresh cold start, so no provider can race a fresh install into upgrader state — this also keeps fresh-install accessibilityLabels stable so existing Maestro flows pass.
- *Hidden/coming-safe (finding #6):* seed and diff use `discoverableIds` (active && !hidden) only, so a prelanded hidden/`coming` entry is flagged the first time it becomes visible+active, not silently pre-acknowledged.

---

## Step-by-Step Tasks

### Task 1: semverCompare util
- **ACTION**: Create `mobile/src/utils/semverCompare.ts`.
- **IMPLEMENT**: `export function compareSemver(a: string, b: string): -1 | 0 | 1` — split each on `.`, map to `parseInt(seg,10) || 0`, pad shorter to equal length with 0, compare segment-by-segment, return -1/0/1.
- **MIRROR**: `mobile/src/utils/clamp.ts` (pure util style).
- **USED BY**: the debut-seed gate only (`addedInVersion > PRE_FEATURE_BASELINE` → `debutNewIds`). Runtime detection is ID-set based and does not call this.
- **GOTCHA**: Does NOT handle semver pre-release suffixes (`1.3.0-beta`); app.json versions are plain `x.y.z`. Note in a comment.
- **VALIDATE**: unit test.

### Task 2: NewContentContext (ID-set model)
- **ACTION**: Create `mobile/src/contexts/NewContentContext.tsx`.
- **IMPLEMENT**: the REVISED Core Design above — `{ knownIds }` persisted; load effect computes debut seed via `UPGRADER_SIGNAL_KEYS` scan; `useNewContent()` exposes `isNew(id)/hasNewInCategory(categoryId)/markSeen(id)/isLoading` **and `devSimulateUpgrade()` (`__DEV__`-only test hook, Decision 2=B — no-op in production)**.
- **MIRROR**: `ReadingProgressContext.tsx` structure (createContext safe defaults, useState, useEffect load, persist callback, useContext hook).
- **IMPORTS**: `AsyncStorage`, `Constants from 'expo-constants'`, `{ library } from '@/data/texts'`, `{ compareSemver } from '@/utils/semverCompare'`.
- **GOTCHA**: guard `markSeen` on `isLoading` AND already-known; wrap all AsyncStorage in `.catch(()=>undefined)`; corrupt JSON → treat as null (debut path); `getAllKeys()` may return readonly array — copy before `.some`. Default context value must be safe (isLoading:true, isNew:()=>false, hasNewInCategory:()=>false, markSeen:()=>{}).
- **VALIDATE**: context tests (fresh, upgrader, markSeen-persist, OTA-add-while-known-state-exists, restart persistence).

### Task 3: Tag data + type
- **ACTION**: Edit `mobile/src/data/texts.ts`.
- **IMPLEMENT**: add `addedInVersion?: string;` to `LibraryEntry` (after `hidden?`). Add `addedInVersion: '1.3.0'` to krishna-stotram, bajrang-baan, ram-stuti objects.
- **GOTCHA**: `library` is `readonly`; just add the field literal — no structural change.
- **VALIDATE**: `tsc --noEmit`.

### Task 4: Color tokens
- **ACTION**: Edit `mobile/src/theme/colors.ts`.
- **IMPLEMENT**: add `newBadgeBg: 'rgba(56, 142, 60, 0.14)'` and `newBadgeText: '#2E7D32'` to `lightColors`.
- **MIRROR**: existing `goldTint` / `saffronTint` token style.
- **VALIDATE**: auto-typed via `ColorPalette = typeof lightColors`; `tsc`.

### Task 5: Provider wiring
- **ACTION**: Edit `mobile/App.tsx`.
- **IMPLEMENT**: import `NewContentProvider`; wrap `<ReadingProgressProvider>` with `<NewContentProvider>` (i.e. directly inside `UserActivityProvider`).
- **GOTCHA**: keep JSX nesting balanced; placement is above `NavigationContainer` so every screen can consume.
- **VALIDATE**: `tsc`; existing tests still pass.

### Task 6: CategoryCard badge
- **ACTION**: Edit `mobile/src/components/CategoryCard.tsx`.
- **IMPLEMENT**: add `hasNew?: boolean` to `Props`. In the **active** Pressable, after `{content}`, render `{hasNew && <View style={[styles.badge,{backgroundColor:colors.newBadgeBg,borderRadius:radii.pill}]} pointerEvents="none"><Text style={[styles.badgeText,{color:colors.newBadgeText,letterSpacing:1.6}]}>NEW</Text></View>}`. Change active label to `` `${nameEn}.${hasNew ? ' New.' : ''} Tap to open.` ``.
- **MIRROR**: BADGE_RENDER pattern (reuse `styles.badge`/`styles.badgeText`).
- **GOTCHA**: active card has `overflow:'hidden'` + `radii 16` — badge at top:8/right:8 fits. `pointerEvents="none"` so it never eats the press.
- **VALIDATE**: component test.

### Task 7: LibraryCard badge
- **ACTION**: Edit `mobile/src/components/LibraryCard.tsx`.
- **IMPLEMENT**: `const { isNew } = useNewContent();` `const showNew = isActive && isNew(entry.id);`. In `body`, after the chevron/SOON block, render NEW badge when `showNew` (absolute top-right, `newBadge*` tokens). Append `${showNew ? ' New.' : ''}` into `accessibilityLabel` before " Tap to open.".
- **MIRROR**: inactive SOON badge block (top:12/right:12).
- **GOTCHA**: chevron is vertically-centered inline; NEW badge is absolute top-right → no overlap (validate visually in Phase 5). Badge needs `pointerEvents="none"`. Card has `overflow:'hidden'`.
- **VALIDATE**: component test.

### Task 8: HomeScreen wiring + dev test hook (Decision 2=B)
- **ACTION**: Edit `mobile/src/screens/HomeScreen.tsx`.
- **IMPLEMENT**:
  - `const { hasNewInCategory, devSimulateUpgrade } = useNewContent();` add `hasNew?: boolean` to `TileItem`; set `hasNew: hasNewInCategory(c.id)` on category tiles (NOT the deity tile); pass `hasNew={tile.hasNew}` to `<CategoryCard>`.
  - At the bottom of the scroll (after the footer mantra), render a `__DEV__`-only muted Pressable with `testID="dev-seed-new-content"`, label e.g. "🔧 DEV: simulate update", that calls `devSimulateUpgrade()`. Gate with `{__DEV__ && (...)}` so it is stripped from production bundles.
- **GOTCHA**: deity tile has no `hasNew` → undefined → falsy → no badge (intended). The dev control must NOT render in production (`__DEV__` guard) and must not alter any existing accessibilityLabel/selector used by current Maestro flows.
- **VALIDATE**: `tsc`; component test asserts the dev control is absent when `__DEV__` is false (mock) and present when true; Maestro positive flow taps it.

### Task 9: markSeen in CategoryListScreen (navigation branches only — finding #7)
- **ACTION**: Edit `mobile/src/screens/CategoryListScreen.tsx`.
- **IMPLEMENT**: `const { markSeen } = useNewContent();` Call `markSeen(entry.id)` ONLY where the user actually opens content, NOT at the top of `handlePress`:
  - `handlePress` `isLoading` branch (immediately before `navigateToEntryStart`).
  - `handlePress` no-progress branch (before `navigateToEntryStart`).
  - `ResumeReadingSheet` `onResume` (the resume entry's id, before `navigateToProgress`).
  - `ResumeReadingSheet` `onStartOver` (before `navigateToEntryStart`).
  - Do NOT call when only showing the resume sheet (`setPendingEntry`) or on `onDismiss`.
- **GOTCHA**: tapping a card with saved progress shows the resume sheet; dismissing it must leave NEW intact. Safe pre-load (no-op while isLoading); fire-and-forget.
- **VALIDATE**: integration test — pressing a new card that has progress, then dismissing the sheet, leaves it NEW; resuming/start-over clears it.

### Task 10: markSeen in DeityListScreen (navigation branches only — finding #7)
- **ACTION**: Edit `mobile/src/screens/DeityListScreen.tsx` — same branch placement as Task 9 (handlePress isLoading + no-progress; ResumeReadingSheet onResume + onStartOver).

### Task 11: markSeen in SearchScreen
- **ACTION**: Edit `mobile/src/screens/SearchScreen.tsx`.
- **IMPLEMENT**: `const { markSeen } = useNewContent();` call `markSeen(sourceId)` in `openSection`, `markSeen(hit.sourceId)` in `openVerse`.

### Task 12: package.json — DROPPED (not needed)
- **OUTCOME**: `expo-constants` is NOT required. The ID-set model does not read the app version at runtime (the debut gate uses the `PRE_FEATURE_BASELINE` constant via `compareSemver`, and "discoverable ⟹ shipped" makes a version cap redundant). No `package.json` change, no new dependency, and the "transitive-dep" risk is eliminated.

---

## Testing Strategy

### Unit / Logic Tests (Jest)
| Test | Input | Expected | Edge? |
|---|---|---|---|
| compareSemver equal | `('1.3.1','1.3.1')` | `0` | |
| compareSemver less/greater | `('1.3.0','1.3.1')`/`('1.4.0','1.3.9')` | `-1` / `1` | |
| compareSemver diff length | `('1.3','1.3.0')` / `('1.3.1','1.3')` | `0` / `1` | ✓ |
| compareSemver non-numeric | `('1.x.0','1.0.0')` | `0` (NaN→0) | ✓ |
| context fresh install | no stored, no `@vedansh/*` keys | `isNew` all false; `knownIds=currentIds` persisted | ✓ |
| context upgrader debut | no stored, `@vedansh/user-activity` present | `isNew('krishna-stotram')` true; `isNew('hanuman-chalisa')` false | ✓ |
| context markSeen persists | upgrader → markSeen(id) | `isNew(id)` false; reload from storage still false | |
| context OTA add (finding #2) | stored `knownIds` lacking a new id while same version | that id `isNew` true | ✓ |
| context survive upgrade (finding #1) | upgrader, tap krishna only, then a NEW id appears | bajrang-baan & ram-stuti still `isNew`; krishna not | ✓ |
| context corrupt blob | stored = `"{bad json"` | treated as debut, no throw | ✓ |
| context fresh + mount-key race (finding #5) | no stored, but `@vedansh/notif-meta` present (no user-action keys) | classified FRESH → nothing new | ✓ |
| context hidden→active (finding #6) | seed knownIds = discoverable excluding a `coming` entry; flip it active | that entry `isNew` true | ✓ |
| hasNewInCategory | upgrader | `'stotram'` true, `'granth'` false, `'deity'` false | ✓ |
| badge render present | render card with `isNew→true` | NEW text present | |
| badge render absent | not-new / inactive | NEW text absent | ✓ |

### Integration Tests (Jest — addresses adversarial finding #4)
Render the REAL `<NewContentProvider>` wrapping a screen, with the AsyncStorage jest mock pre-seeded, then flush the hydration promise (`await act(async () => {})`). This exercises provider hydration + screen wiring + badge rendering + dismissal + persistence — the integrated path a component-only test misses.
| Test | Setup | Assert |
|---|---|---|
| HomeScreen upgrader | seed `@vedansh/user-activity`, render `NewContentProvider>HomeScreen` | "Hymns & Praise" tile has NEW; "Sacred Books" does not |
| CategoryList upgrader | same seed, render CategoryList(stotram) | Krishna/Bajrang/Ram cards show NEW; others don't; labels include " New." |
| markSeen via tap | render CategoryList(stotram), press Krishna card (no progress) | after press+flush, AsyncStorage `knownIds` contains `krishna-stotram` |
| resume-sheet keeps NEW (finding #7) | seed reading-progress for krishna + upgrader; press Krishna → resume sheet shown → dismiss | krishna still NEW; `knownIds` unchanged |
| resume → clears NEW (finding #7) | same, then tap Resume | krishna no longer NEW; `knownIds` has it |
| restart persistence | seed `knownIds` already containing krishna | Krishna card NOT new on mount |
| fresh install screen | no `UPGRADER_SIGNAL_KEYS` | no NEW anywhere; labels unchanged |

**testMatch handling (GOTCHA):** `jest.config.js` `testMatch` is `src/screens/__tests__/**/*.test.tsx` only. **Decision: widen testMatch to `src/**/__tests__/**/*.test.tsx`** so util/context/integration tests live next to their code (`src/utils/__tests__/`, `src/contexts/__tests__/`). Verify the 3 existing tests still match after the change. AsyncStorage mock: `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))` (ships with the package).

### E2E (Maestro)
- **Regression ("nothing breaks") — PRIMARY:** run all existing flows (`granth-`, `stotram-`, `chalisa-`, `japam-`, `aarti-`, `sanskar-smoke.yaml`). On a fresh Expo Go install the context is in fresh-install state → no badges → accessibilityLabels unchanged → all selectors still match. This is the core "nothing breaks" guarantee the user asked for.
- **New flow `new-content-badge-smoke.yaml` (full positive + negative, via the Decision-2=B dev hook):**
  1. boot → assert `"NEW"` NOT visible on Home (fresh-install negative).
  2. scroll to + `tapOn: { id: "dev-seed-new-content" }` → simulates the upgrader state live.
  3. assert the "Hymns & Praise" tile now exposes its NEW state (tile accessibilityLabel becomes `"Hymns & Praise. New. Tap to open."`; also assert visible text `"NEW"`).
  4. `tapOn: "Hymns & Praise. New. Tap to open."` → CategoryList(stotram) → assert Krishna/Bajrang/Ram cards show NEW; non-tagged cards do not.
  5. tap Krishna card → dismiss resume sheet if present → reader opens → back.
  6. assert Krishna card NEW is gone; Bajrang/Ram still NEW (markSeen dismissal).
  7. back to Home → assert "Hymns & Praise" tile still NEW (Bajrang/Ram remain).
  8. `stopApp` + `runFlow: _launch.yaml` → assert state persisted (Krishna still not-new, Bajrang/Ram still NEW) — restart-persistence.
- **Positive path now on-device:** the `__DEV__` dev hook (Task 8) makes the upgrader state reachable in Expo Go, so Maestro verifies the integrated path end-to-end (hydration → tile + card render → dismissal → restart persistence → selector compatibility). Jest integration tests remain as the CI-reliable backstop.
- **Env note:** prior run recorded Maestro execution blocked (Expo Go Hermes vs SDK 54). If still blocked, validate flow YAML, run the Jest suite as the binding gate, and report honestly — never claim a Maestro pass that did not execute.

---

## Validation Commands
```bash
cd mobile
npx tsc --noEmit                                   # EXPECT zero errors
npx jest --config jest.config.js --runInBand       # EXPECT all pass (3 existing + new)
npx expo lint                                       # EXPECT zero errors
maestro test .maestro/                              # EXPECT pass OR documented env-block
```

### Manual Validation (Phase 5 simulator)
- [ ] Fresh install → no NEW badges anywhere (DevTools clear storage).
- [ ] Simulate upgrade (seed `@vedansh/bookmarks` then launch) → Hymns tile + Krishna/Bajrang/Ram cards show NEW.
- [ ] Tap a NEW card → back → that card's NEW gone, others remain.
- [ ] Kill + relaunch → dismissed stays dismissed, undismissed NEW persists.
- [ ] Badge does not overlap chevron on LibraryCard; legible on tile.

---

## Acceptance Criteria
- [ ] AC1: `LibraryEntry` has `addedInVersion?`; krishna-stotram, bajrang-baan, ram-stuti tagged `'1.3.0'`.
- [ ] AC2: `compareSemver` returns correct -1/0/1 incl. unequal lengths + non-numeric.
- [ ] AC3: `NewContentContext` — fresh install (no `@vedansh/*` keys) shows nothing new; upgrader (any `@vedansh/*` key) shows the 3 debut-tagged entries as new.
- [ ] AC4: `markSeen(id)` marks the entry known → its NEW clears and persists across restarts (reload from storage stays not-new).
- [ ] AC5: Content present in `library` but absent from the user's stored `knownIds` is flagged NEW regardless of app version (OTA-safe); un-tapped NEW entries survive app upgrades; tapped entries never resurrect.
- [ ] AC6: CategoryCard renders NEW (green) on active tile when `hasNew`; HomeScreen passes `hasNewInCategory(c.id)`.
- [ ] AC7: LibraryCard renders NEW on active+`isNew(id)` cards, top-right, no chevron collision.
- [ ] AC8: NEW tokens are SAFFRON (on-theme per design.md — primary/active accent) and visually distinct from the muted gold SOON. (Revised from green per user feedback 2026-05-29; design.md updated.)
- [ ] AC9: accessibilityLabel includes "New." only when new; unchanged otherwise (existing Maestro selectors intact).
- [ ] AC10: All existing Jest tests pass; new Jest unit+integration tests pass; `tsc` + lint clean.
- [ ] AC11: Existing Maestro flows pass (or env-blocked + documented); new flow added.
- [ ] AC12: A fresh install is never misclassified as an upgrader even if a provider writes a `@vedansh/*` mount-key during the same launch (upgrader scan = user-action-only keys).
- [ ] AC13: A `hidden`/`coming` entry later flipped to active+visible is flagged NEW the first time it becomes discoverable (seed/diff use discoverable ids only).
- [ ] AC14: `markSeen` fires only on actual content-open paths; showing/dismissing the ResumeReadingSheet does not clear NEW.
- [ ] AC15: The `devSimulateUpgrade` hook + HomeScreen `dev-seed-new-content` control render/run only under `__DEV__` (absent from production); Maestro positive flow exercises seed → badge → dismiss → restart-persist.

## Completion Checklist
- [ ] Follows ReadingProgressContext pattern (no-op defaults, isLoading, persist, catch)
- [ ] Reuses badge styles; green tokens; `pointerEvents="none"`
- [ ] No hardcoded version strings outside the two named constants
- [ ] Tests follow react-test-renderer pattern
- [ ] No unnecessary scope (Search badge, deity tile, dark mode all excluded)
- [ ] Self-contained

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Debut release shows nothing for upgraders | High (if unhandled) | Feature invisible at launch | RESOLVED: ID-set + `getAllKeys()` upgrader seed → debut-tagged ids start un-known → NEW |
| OTA content drop never flagged | High (if version-based) | Defeats stated use case | RESOLVED: ID-set diffing is version-agnostic — new ids absent from `knownIds` show NEW |
| Upgrader false-negative (returning user, zero `@vedansh/*` keys) | Very low | That user misses NEW once | Broad `getAllKeys()` scan; `@vedansh/user-activity` written early; bias to upgrader (missed upgrader worse than fresh user seeing 3 chips) |
| `knownIds` grows unbounded over years | Very low | Tiny storage | Library is ~30 entries; bounded by catalog size |
| Widening jest testMatch breaks/over-matches | Low | CI churn | Verify 3 existing tests still match; scope glob to `__tests__` dirs |
| NEW badge overlaps chevron on LibraryCard | Low | Visual glitch | Absolute top-right vs centered chevron; verify in simulator |
| Appending "New." breaks Maestro selectors | Low | e2e false-fail | Only appended when new; fresh-install state keeps labels stable |
| `expo-constants` transitive-only | Low | Clean-install break | Add to package.json explicitly (Task 12) |
| Green badge clashes with warm parchment palette | Low | Design nit | Per base-plan intent (contrast vs gold); confirm in Phase 5 |
| Maestro positive path needs a dev seed hook | Med | On-device positive untested | Jest integration covers positive path; optional `__DEV__` deep-link seed (user decision) |

## Notes
- **User decisions (confirmed 2026-05-29):** **(1)** Use the seen-items (content-ID-set) approach — version comparison rejected because it fails the OTA use case. **(2) = B** — add the `__DEV__`-only test hook (`devSimulateUpgrade` + HomeScreen `dev-seed-new-content` control) so Maestro verifies the badge end-to-end on-device ("complete testing").
- The dev hook is `__DEV__`-gated and never wired into any production UI path → absent from release bundles.
- `markSeen` is wired in Search even though no badge renders there — keeps "seen" state consistent regardless of entry path.
