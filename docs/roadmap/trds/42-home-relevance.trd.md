# TRD-42 — Home Relevance Pass (आज-first Home · पाठ library) — Technical Design

| | |
|---|---|
| **Companion PRD** | None yet. This TRD is written against the approved prototype. |
| **Prototype** | [`docs/home-today-first-prototype.html`](../../home-today-first-prototype.html) (rev 4) |
| **Status** | Draft — design for the Phase-1 build |
| **Feasibility** | ✅ OTA-shippable. Pure TS/JS, no new native dependency, no new asset, no new color. |
| **Numbering** | 42 is the next free id: 25 reserved (सन्ध्या वन्दन), 26–29 round-2 reservations, 30 retired, 31–40 the 2027 bets, 41 जिज्ञासा. |

> **Non-negotiables (from the prototype review):** the आज का पंचांग strip ships **unchanged** — same markup, same chips, same tap-through to the Panchang tab. The daily verse is **not** added to Home; भक्ति keeps it. The search FAB stays. Fifteen of sixteen launcher glyphs are reused verbatim from `CategoryIcon.tsx`; only वास्तु is drawn new. No emoji, no SVG, tokens from `colors.ts` (design.md §5/§42).

## 0. Scope

Home stops being a launcher for the text library and becomes a today-and-practice surface. Concretely: delete the 16-tile CATEGORIES grid and the shuffled DISCOVER carousel; add a consolidated **साधना** row, a fixed **उपकरण** row, a **पाठ** door, and a lifecycle-driven **नया** section; move the text-browse grid to a new pushed **Library** screen.

Out of scope here: the Today strip, आज के लिए, the भक्ति tab, the भजन tab, जिज्ञासा, and the पंचांग › परिवार / settings-only अन्य reorg (a separate change, §13.5).

## 1. Ground truth (verified in source, Sept 2026)

| Fact | Source | Consequence |
|---|---|---|
| Home builds 16 tiles in a `tiles` memo that splices non-content tiles into `categories` order (`if (c.id === 'japam') result.push(vratTile, kundaliTile, muhuratTile)`) | `screens/HomeScreen.tsx` | The **memo** is what dies, not `categories.ts`. The registry is untouched. |
| कुंडली and मुहूर्त carry a hardcoded `hasNew: true` | `screens/HomeScreen.tsx:120`, `:133` | A NEW badge that can never clear. Deleted with the grid; नया must not reintroduce the pattern. |
| DISCOVER renders 8 `spotlights` through `shuffleBySeed(spotlights, Date.now())`, seeded once per mount | `screens/HomeScreen.tsx` | Replaced wholesale. Four of the eight also hardcode `hasNew: true`. |
| `useRoutineToday()` → `{ entries, doneCount, total, hasRoutine }` | `data/routine/useRoutineToday.ts` | साधना cell 1. No new data layer. |
| `useSadhanaToday()` → `SadhanaTodayCard[]` carrying `{ enrollment, program, status, items, allItemsDoneToday }` | `data/sadhana/useSadhanaToday.ts` | साधना cell 2. Day number derives from the enrollment, already resolved. |
| `computeJapaStreak(activity, dateKey)` exists and is pure | `widgets/planner.ts:28` | साधना cell 3. **Reuse it; do not re-derive.** |
| `UserActivityContext` exposes only an all-activity `currentStreak()`; there is no japa-only streak on the context | `contexts/UserActivityContext.tsx:56` | Which is exactly why the planner helper exists. It must be lifted out of `widgets/`. |
| `whatsNew` is a per-version map of `{ titleHi, titleEn, bodyHi, bodyEn }` keyed to `APP_TOUR_VERSION` | `data/tour/whatsNew.ts` | नया's content source. **No fourth "is this new" registry** beside `addedInVersion`, the tour keys, and this. |
| `NewContentContext` tracks per-entry seen state and separates fresh install from upgrade via `UPGRADER_SIGNAL_KEYS` | `contexts/NewContentContext.tsx:25`, `:128` | The seen-tracking and install-detection pattern नया copies. |
| `Wishlist` and `WidgetGallery` are registered only on `MoreStackNavigator` | `navigation/MoreStackNavigator.tsx` | Library's संग्रह door needs a Home-stack registration, or back strands the user on the More tab. |
| The vidhi trio is deliberately registered on the Home, Panchang **and** More stacks so every door pushes in place | `navigation/types.ts` (VidhiStackParamList comment) | Named precedent for that double registration. |
| No Library-style screen exists; `CategoryList`, `DeityIndex` and `BrowseByPurpose` are separate drill-ins | `screens/` | The Library screen is genuinely new. |
| `getCategoryCounts()` counts **observance** rules, not library texts | `panchang/vratCatalog.ts:45` | Library needs its own pure count helper over `library`. |
| Tour steps 6–11 spotlight `categoriesGrid`, `japaTile` and `theerthTile`, registered in HomeScreen | `data/tour/steps.ts`, design.md §47 | **Hard dependency.** Deleting the grid breaks three tour steps. |
| Home's first visible frame must be its final frame; RoutineBanner shares one `minHeight 57` across its three states for exactly this reason | design.md §64, §30, `components/RoutineBanner.tsx` | साधना and उपकरण rows must reserve their height before their data lands. |
| `src/data` and `src/notifications` tests run under `tsx --test` and are excluded from Jest | `mobile/jest.config.js`, wiki overview | The नया resolver's tests go to `tsx`, not Jest. |

## 2. Architecture

```
HomeScreen
 ├── HomeWordmark · FestiveToran            (unchanged)
 ├── TodayStrip                             (unchanged — §48, not touched)
 ├── TodayRecommendationsRow                (unchanged — §50)
 ├── SadhanaRow            ← useRoutineToday + useSadhanaToday + computeJapaStreak   [NEW]
 ├── ToolsRow              ← static registry → entryRoutes helpers                   [NEW]
 ├── LibraryDoorRow        → push 'Library'                                          [NEW]
 ├── NewFeaturesSection    ← useNewFeatures()  (pure resolver + seen store)          [NEW]
 └── SearchFloatingButton                    (unchanged)

LibraryScreen  [NEW ROUTE, Home stack]
 ├── TextField variant="search"      → push 'Search'
 ├── ResumeCard                      → navigateToProgress()      (§13.2 — needs sign-off)
 ├── Deity rail    ← deities + DeityIcon     → push 'DeityIndex' / 'DeityDetail'
 ├── Purpose chips ← purposes                → push 'PurposeList'
 └── 12 launcher tiles ← categories + libraryCounts()  → push 'CategoryList' | 'TheerthMap'
                                                       | 'Wishlist' | AudioTab
```

Everything above the उपकरण row is untouched shipped code. The three new components are presentational over hooks that already exist; the only new logic in the change is the नया resolver (§4).

## 3. Data model

```ts
// src/data/home/tools.ts — fixed order, no shuffle, no lifecycle badge
export type HomeTool = {
  id: 'panchang'|'vrat'|'muhurat'|'kundali'|'vidhi'|'japam'|'vastu'|'theerth';
  nameHi: string; nameEn: string;
  iconKey: CategoryIconKey | 'vastu' | 'danda' | 'calendar';
  open: (nav: HomeNav, rootNav: RootNav) => void;
};

// src/data/home/featureFeed.ts — what नया can surface
export type FeatureFeedEntry = {
  id: string;                 // stable; never reused after removal
  version: string;            // the app version that introduced it — same keys as whatsNew
  titleHi: string; titleEn: string;
  descHi: string;  descEn: string;
  iconKey: CategoryIconKey | 'ask' | 'widget';
  target: FeatureTarget;      // typed route, resolved through entryRoutes
};

// src/contexts/FeatureSeenContext.tsx
type FeatureSeenMap = Record<string /* FeatureFeedEntry.id */, string /* version seen at */>;
```

Storage key: `@vedansh/feature-seen`. Additive and independent of `@vedansh/new-content-*`; an absent map means "nothing seen yet", which §4 then interprets by install type.

## 4. Core logic — the नया resolver (pure)

The only algorithm in this change. Lives in `data/home/featureFeed.ts`, pure, `tsx`-testable.

```ts
export function pendingFeatures(
  feed: readonly FeatureFeedEntry[],
  seen: FeatureSeenMap,
  appVersion: string,      // APP_TOUR_VERSION
  limit = 3,
): FeatureFeedEntry[] {
  return feed
    .filter((f) => semverCompare(f.version, appVersion) <= 0)  // never advertise unshipped work
    .filter((f) => seen[f.id] === undefined)
    .sort((a, b) => semverCompare(b.version, a.version) || feed.indexOf(a) - feed.indexOf(b))
    .slice(0, limit);
}
```

Rules that make it behave:

1. **A fresh install shows nothing.** Everything would otherwise be "new" to a first-time user, who is already getting the 24-step tour. On first launch, when `TourContext` classifies the session as a fresh install (the existing `UPGRADER_SIGNAL_KEYS` check), seed the seen map with every feed entry at the current version. Only genuine upgrades accumulate pending entries.
2. **Opening clears it.** The card's `onPress` writes `seen[id] = appVersion` **before** the awaited AsyncStorage write, the same optimistic order `NotificationPreferences.persistMeta` and `TourContext` already use, so the card cannot bounce back on the next render.
3. **Skipped versions still cap at three.** A user on 1.4.6 opening 1.5.0 has every intervening feature pending; newest-version-first ordering plus the cap keeps Home stable.
4. **A removed feature must be removed from the feed.** Ids are never reused. A stale id left in a user's seen map is inert and harmless.
5. `semverCompare` already exists (`utils/semverCompare.ts`, unit-tested for the OTA prompt). Reuse it.

**Why not a fourth registry.** `whatsNew` already curates "what shipped in version X" in the user's two languages, and is already required to be updated on every release that bumps `APP_TOUR_VERSION`. `featureFeed.ts` carries only what the What's-New sheet cannot: a stable id, an icon, and a route target. A test pins that every feed entry's `version` exists as a key in `whatsNew`, so the two cannot drift.

## 5. Surfaces

### 5.1 SadhanaRow (`components/SadhanaRow.tsx`)

One `parchment-soft` card, `radii.lg`, `elevation.card`, three equal cells split by 1 px `divider` rules. Per cell: a 10.5 pt `ink-muted` label, a 15 pt `ink` value in the title face, and either a 4 pt progress strip or an 10.5 pt `ink-soft` sub-line.

| Cell | Value | Source | Empty state |
|---|---|---|---|
| नित्य साधना | `{doneCount}/{total}` + progress strip | `useRoutineToday()` | no routine → "बनाएँ" nudge, the wording `routineBannerView.bannerLine` already returns |
| संकल्प | `दिन {n}/{total}` + program name | `useSadhanaToday()[0]` | none running → cell omitted, row becomes 2-up |
| जप | `{n} दिन` + श्रृंखला caption | `computeJapaStreak` | 0 → `0 दिन`, never hidden |

**Reserved height (§64).** Every variant — three cells, two cells, and the all-empty nudge — shares one `minHeight`, exactly as `RoutineBanner` does at 57. The row must not grow when routine or sadhana state hydrates from AsyncStorage after the first frame.

**All three empty** (fresh install) → render the existing `RoutineBanner variant="inline"` nudge instead, full width. The user has nothing to report yet and should be invited to create a routine, which is what that component already says.

### 5.2 ToolsRow (`components/ToolsRow.tsx`)

Eight `CategoryCard variant="launcher"` tiles, four across, label below, **fixed order, no shuffle, no NEW badge**. Targets are all existing routes:

| Tile | Target | Exists |
|---|---|---|
| पंचांग | `rootNav.navigate('PanchangTab')` | yes — but see §13.1 |
| व्रत-पर्व | `panchangTabTarget('ObservanceList', { category: 'vrat' })` | yes |
| मुहूर्त | `panchangTabTarget('MuhuratFinder', undefined)` | yes |
| कुंडली | `panchangTabTarget('PanchangHome', { initialTab: 'jyotish' })` | yes |
| पूजा विधि | `navigation.navigate('VidhiCatalog')` | yes, Home stack |
| जप | `navigation.navigate('CategoryList', { categoryId: 'japam' })` | yes |
| वास्तु | `moreTabTarget('VastuDisha')` | yes, More stack |
| तीर्थ | `navigation.navigate('TheerthMap', {})` | yes |

`panchangTabTarget` / `moreTabTarget` carry `initial: false`, which is load-bearing: without it a lazily-mounted tab adopts the pushed screen as its initial route (the bug `home-today-smoke.yaml` already guards).

### 5.3 LibraryScreen (`screens/LibraryScreen.tsx`)

`ReaderHeader variant="index"` with a back circle, per the shared header contract — hand-rolling a top bar is a RULEBOOK §3 reject. Search uses `TextField variant="search"`, the only sanctioned content-search field.

Counts come from a new pure helper:

```ts
// src/data/libraryCounts.ts
export function libraryCounts(): Record<ContentCategory, number>;  // active, non-hidden entries only
```

`संग्रह` needs `Wishlist` registered on `HomeStackNavigator` so back returns to Library (§1, vidhi precedent). `भजन` cross-navigates to `AudioTab`, which has no back; that is the same accepted behaviour the Panchang-bound Home tiles have today.

### 5.4 Icon work

| Glyph | Change | Notes |
|---|---|---|
| 13 existing category glyphs | none | move to Library unchanged |
| `granth` | open variant | palm-leaf pothi splayed from a centre spine |
| `sanskar` | open variant | codex splayed, squarer and taller than the pothi so the two stay distinct at tile size |
| `vastu` | **new** | dik-chakra: ring, four direction ticks, needle, bindu |

All three follow the shipped grammar: `View` compositions with borders, radii and rotations. The splay uses the `LotusMark` technique of rotating a full-size wrapper about its own centre rather than setting `transformOrigin`, which composites inconsistently on Android — that gotcha is recorded in `LotusMark.tsx` and applies here verbatim.

## 6. Navigation

```ts
// navigation/types.ts
export type HomeStackParamList = VidhiStackParamList & {
  // …existing
  Library: undefined;
  Wishlist: undefined;   // ALSO on MoreStack; registered here so Library → back → Library
};
```

`HomeStackNavigator` gains `<Stack.Screen name="Library" …>` and `<Stack.Screen name="Wishlist" …>`. `entryRoutes.test.ts` must keep passing: every route named in a target has to resolve.

## 7. Launch discipline

Nothing in this change may touch the launch path.

- `SadhanaRow` reads two hooks that already mount on Home today (`RoutineBanner` uses one of them), so no new storage read is introduced at startup.
- `computeJapaStreak` walks a `Record` already hydrated by `UserActivityContext`. It is O(streak length), not O(history), and runs in render.
- `pendingFeatures` is a filter over a bundled array of a dozen entries. It must not import anything from `ask/`, `panchang/` or a reader — `launchPath.test.ts` already walks the static import graph from `index.ts` and fails on engine reachability.
- `LibraryScreen` is a pushed screen and never evaluates at launch.

## 8. Edge cases

| Case | Behaviour |
|---|---|
| Routine hydrates after first paint | Row already occupies its final height; only text swaps (§64) |
| Sankalp completes mid-session | Cell drops, row reflows to 2-up — accepted, it is below the fold and user-initiated |
| Japa logged today, streak still 0 | `computeJapaStreak` counts today when active; verified by its existing tests |
| नया feed entry with a version above `APP_TOUR_VERSION` | Filtered out. Guards a feed entry landing before its release |
| Every feed entry seen | Section renders nothing, not an empty state. Present-or-absent, the §69 शुभ योग convention |
| User reinstalls | Fresh-install seeding applies; नया stays empty, tour runs |
| Category added via `add-section` | Appears on Library automatically from `categories.ts`; no Home change. RULEBOOK mirror updated (§11) |

## 9. Testing

| Suite | Runner | Covers |
|---|---|---|
| `data/home/__tests__/featureFeed.test.ts` | **tsx** (`src/data` is excluded from Jest) | version filter, seen filter, ordering, cap, fresh-install seeding, feed ⇄ `whatsNew` key parity |
| `data/__tests__/libraryCounts.test.ts` | tsx | counts match `library` for every active category; hidden/inactive excluded |
| `components/__tests__/SadhanaRow.test.tsx` | Jest | three-cell, two-cell and empty variants; one shared height across all three |
| `components/__tests__/ToolsRow.test.tsx` | Jest | fixed order; eight targets dispatch the right route; no NEW badge rendered |
| `screens/__tests__/LibraryScreen.test.tsx` | Jest | sections render; counts bind; back returns to Home |
| `screens/__tests__/HomeScreen.test.tsx` | Jest | grid and carousel gone; new rows present; **no hardcoded `hasNew`** |
| `components/__tests__/CategoryIcon.test.tsx` | Jest | the two open variants and वास्तु render their parts |
| `.maestro/library-smoke.yaml` | Maestro | Home पाठ row → Library → a category → back lands on Home |
| `.maestro/home-today-smoke.yaml` | Maestro | **update** — the व्रत tile moved from the grid to the tools row |
| `.maestro/new-content-badge-home-smoke.yaml` | Maestro | **rewrite** — the Home NEW badge it asserts no longer exists |
| `.maestro/discovery-purpose-smoke.yaml` | Maestro | **update** — उद्देश्य moved from Home to Library |
| `.maestro/feature-tour-e2e.yaml` | Maestro | **update** — see §10 |

Jest suites rendering a `FlatList` must unmount their trees in `afterEach` + `act`, or a late cell-batch timer turns a green run into exit 1 (recorded in the wiki overview). `npm run lint` must report 0 — the font-family, `shadowColor` and `fontSize < 10` rules are lint-enforced because all three fail silently in React Native.

## 10. Tour dependency (blocking)

`data/tour/steps.ts` steps 6–11 ring `categoriesGrid`, `japaTile` and `theerthTile`. Those `useTourTarget` registrations live in `HomeScreen` and are deleted with the grid. A step whose target cannot be measured falls back to ringing the destination tab, so the tour will not crash — it will silently describe things that are not there.

Same change must: repoint step 7 at the उपकरण row, repoint the Japa and Theerth steps at their tools tiles or into the Library screen, and add a step for the पाठ door. Then bump `APP_TOUR_VERSION` with a `whatsNew` entry, since a returning user needs to be told the library moved.

## 11. Doc compliance (`.claude/rules/design-doc-sync.md`)

Same PR, not a follow-up:

| Doc | Change |
|---|---|
| design.md §18 | Home structure rewritten: grid and carousel out, three new rows in |
| design.md §19 | `CategoryCard variant="launcher"` now serves Library and the tools row, not Home's grid |
| design.md §30 | RoutineBanner keeps the docked Daily-Bhakti variant; its Home inline variant is superseded by SadhanaRow except in the empty state |
| design.md §32 | DISCOVER retired → नया; record the retirement the way §49 records the continue-reading card |
| design.md §47 | tour steps 6–11 |
| design.md — new § | Library screen |
| design.md — new § | नया lifecycle |
| RULEBOOK §1 rows 6–7, §12 | a new category now surfaces on Library, not Home — update the integration checklist |

## 12. Module inventory

**New:** `components/SadhanaRow.tsx` · `components/ToolsRow.tsx` · `components/NewFeaturesSection.tsx` · `screens/LibraryScreen.tsx` · `data/home/tools.ts` · `data/home/featureFeed.ts` · `data/libraryCounts.ts` · `contexts/FeatureSeenContext.tsx` · the three glyphs in `components/CategoryIcon.tsx`.

**Changed:** `screens/HomeScreen.tsx` (grid + carousel deleted, rows wired) · `navigation/HomeStackNavigator.tsx` + `types.ts` (Library, Wishlist) · `data/tour/steps.ts` + `whatsNew.ts` · `widgets/planner.ts` (lift `computeJapaStreak` to a shared module; the widget planner imports it from there).

**Untouched, deliberately:** `components/TodayStrip.tsx` · `components/TodayRecommendationsRow.tsx` · `screens/DailyBhaktiScreen.tsx` · `data/versePool.ts` · `data/categories.ts` · the whole `panchang/` tree.

## 13. Open technical questions

1. **The पंचांग tool tile is redundant.** It opens the tab the Today strip already opens, two rows above, and the tab bar carries. Drop it for seven tools, or keep it so the row reads as a uniform eight?
2. **जारी रखें on Library reintroduces a retired pattern.** design.md §49 records the continue-reading card being deleted by product decision in July 2026, and warns that a recency-refresh write broke routine/sadhana completion timestamps, because both derive "latest" from `getProgress()`'s max-`updatedAt`. Putting it on Library rather than Home does not contradict that decision, but it needs an explicit yes, and the implementation must not bump `updatedAt` on a mere re-open.
3. **How much of the library actually leaves Home.** The reviewer's own pushback: the app's core journey is open → tap चालीसा → read, and this design taxes it by one tap. The hybrid is to keep चालीसा · आरती · स्तोत्रम् · ग्रन्थ · जप on Home as one row and send only the thin parity forms plus देवता and उद्देश्य to Library. This costs about one row of height and removes ten tiles instead of twelve. **There is no analytics to settle it** — the app ships none by design — so this is a product call, not a measurement.
4. **नया on a fresh install.** §4 proposes suppressing it entirely. The alternative is showing the three newest features to a new user as a mini-tour, which duplicates the real tour.
5. **Sequencing of the पंचांग › परिवार and settings-only अन्य reorg.** Independent of this change and carries its own doc updates. Ship after, or together with a single migration notice.
