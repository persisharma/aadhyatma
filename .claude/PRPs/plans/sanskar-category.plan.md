# Plan: Sanskar Category — Daily Rituals & Slokas for Children

## Summary
Add a new `'sanskar'` content category to Vedansh with 7 sections teaching children daily Hindu rituals (morning slokas, Surya Namaskar, Tulsi Puja, meal prayer, Gau Seva, evening lamp, bedtime slokas). Each section opens with an **intro page** explaining the essence, importance, and benefits of the practice, followed by bilingual mantras + step-by-step instructions (vidhi) + meanings/significance. Uses the multi-instance reader pattern (like Chalisa/Aarti) with a shared `SanskarReaderScreen`.

## User Story
As a Hindu parent, I want all daily sanskar rituals with correct slokas and simple instructions in one place, so that I can teach my children the practices of Sanatan Dharma from waking to sleeping.

## Problem -> Solution
No kids-oriented instructional content exists in the app (only adult recitation texts) -> Ship a new category with 7 bilingual sections covering daily rituals, each with mantra text + vidhi (instructions) + significance.

## Metadata
- **Complexity**: Large
- **Source PRD**: `.claude/plans/system-instruction-you-are-working-cuddly-dove.md` (PRD-07)
- **PRD Phase**: Phase 1 — Daily Sanskar MVP
- **Estimated Files**: ~25 new/modified

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `src/screens/AartiReaderScreen.tsx` | all | Multi-instance reader pattern to follow |
| P0 | `src/data/aarti/index.ts` | all | Typed flat collection loader pattern |
| P0 | `src/components/VersePage.tsx` | all | Generic verse page component to extend |
| P0 | `src/navigation/entryRoutes.ts` | all | Routing registration pattern |
| P0 | `src/data/texts.ts` | 1-30 | ContentCategory type + LibraryEntry shape |
| P1 | `src/data/backgrounds.ts` | all | Background registration + coverage validation |
| P1 | `src/components/CategoryIcon.tsx` | 17-33 | Icon registration by category key |
| P1 | `src/data/searchIndex.ts` | 223-330 | buildVerseEntries branching pattern |
| P1 | `src/screens/__tests__/BajrangBaanReaderScreen.test.tsx` | all | Smoke test pattern |
| P2 | `RULEBOOK.md` | all | Design contract + verification checklist |
| P2 | `src/data/gita/language.tsx` | all | Language context hook |

---

## Patterns to Mirror

### MULTI_INSTANCE_READER (Chalisa pattern — ID-based dispatch)
```typescript
// SOURCE: src/screens/ChalisaReaderScreen.tsx:40-41
const chalisaId = route.params?.chalisaId ?? 'hanuman-chalisa';
const chalisa = useMemo(() => getChalisa(chalisaId), [chalisaId]);
```

### ENTRY_ROUTES_REGISTRATION
```typescript
// SOURCE: src/navigation/entryRoutes.ts:11,44-46
const chalisaIds = new Set(['hanuman-chalisa', 'shiv-chalisa', ...]);
// Inside navigateToEntryStart:
if (chalisaIds.has(entry.id)) {
  nav.navigate('ChalisaReader', { initialIndex: 0, chalisaId: entry.id });
  return true;
}
```

### TYPED_LOADER_WITH_INVARIANTS
```typescript
// SOURCE: src/data/aarti/index.ts:71-76,78-103
export function getAarti(index: number): AartiData {
  if (index < 0 || index >= aartiCollection.length) throw new Error(...);
  return aartiCollection[index]!;
}
// Module-level assertions on import
if (aartiCollection.length !== EXPECTED_COUNT) throw new Error(...);
```

### VERSE_PAGE_GENERIC_TYPE
```typescript
// SOURCE: src/components/VersePage.tsx:9-17
export type VersePageVerse = {
  id: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};
```

### CATEGORY_ICON_REGISTRATION
```typescript
// SOURCE: src/components/CategoryIcon.tsx:17-33
{iconKey === 'aarti' && <DiyaIcon {...paint} />}
// Each icon takes { color: string; accent: string }
```

### SEARCH_INDEX_BRANCH (Path A)
```typescript
// SOURCE: src/data/searchIndex.ts:280-290
if (entry.category === 'aarti') {
  pushAarti(verses, entry);
  continue;
}
```

### SMOKE_TEST_PATTERN
```typescript
// SOURCE: src/screens/__tests__/BajrangBaanReaderScreen.test.tsx
jest.mock('expo-haptics', () => ({}));
// ... mocks ...
const { GitaLanguageProvider } = jest.requireActual('@/data/gita/language');
const Screen = jest.requireActual('../BajrangBaanReaderScreen').default;
// Render with act + TestRenderer.create, assert text content
```

### BACKGROUND_REGISTRATION
```typescript
// SOURCE: src/data/backgrounds.ts
const sourceBackgrounds: Record<string, BackgroundImage> = {
  'hanuman-chalisa': chalisaImages.Ram_hanuman,
  // ...
};
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `mobile/src/data/texts.ts` | UPDATE | Add `'sanskar'` to ContentCategory union + 7 LibraryEntry items |
| `mobile/src/data/categories.ts` | UPDATE | Add sanskar CategoryMeta |
| `mobile/src/navigation/types.ts` | UPDATE | Add `SanskarReader` route type |
| `mobile/src/navigation/HomeStackNavigator.tsx` | UPDATE | Register SanskarReaderScreen |
| `mobile/src/navigation/entryRoutes.ts` | UPDATE | Add sanskar routing (ID-based set) |
| `mobile/src/components/CategoryIcon.tsx` | UPDATE | Add SeedlingIcon for sanskar |
| `mobile/src/data/backgrounds.ts` | UPDATE | Add source backgrounds for 7 sections |
| `mobile/src/data/searchIndex.ts` | UPDATE | Add sanskar category branch |
| `mobile/src/data/sanskar/index.ts` | CREATE | Typed collection loader + invariants |
| `mobile/src/data/sanskar/types.ts` | CREATE | SanskarVerse type definition |
| `mobile/src/data/sanskar/prabhati-shloka.json` | CREATE | Morning slokas data |
| `mobile/src/data/sanskar/surya-namaskar.json` | CREATE | 12-step Surya Namaskar data |
| `mobile/src/data/sanskar/tulsi-puja.json` | CREATE | Tulsi watering ritual data |
| `mobile/src/data/sanskar/bhojan-mantra.json` | CREATE | Meal prayer data |
| `mobile/src/data/sanskar/gau-seva.json` | CREATE | Cow/bird feeding data |
| `mobile/src/data/sanskar/sandhya-deepam.json` | CREATE | Evening lamp data |
| `mobile/src/data/sanskar/ratri-shloka.json` | CREATE | Bedtime slokas data |
| `mobile/src/screens/SanskarReaderScreen.tsx` | CREATE | Multi-instance reader |
| `mobile/src/components/SanskarVersePage.tsx` | CREATE | Verse page with vidhi section |
| `mobile/src/screens/__tests__/SanskarReaderScreen.test.tsx` | CREATE | Smoke test |
| `mobile/assets/sanskar/index.ts` | CREATE | Background image exports |

## NOT Building

- Audio playback for mantras (deferred to after PRD-02)
- Age-gating or kids-only UI mode
- Gamification (stars, badges, streaks)
- Phase 2-4 content (Saraswati Vandana, Guru Vandana, etc.)
- Reminder integration for sanskar items
- Daily Bhakti verse pool integration (separate follow-up)
- New background PNG assets (use existing assets with deterministic selection for v1)

---

## Step-by-Step Tasks

### Task 1: Add 'sanskar' to ContentCategory type
- **ACTION**: Extend the union type in texts.ts
- **IMPLEMENT**: Add `| 'sanskar'` to ContentCategory union
- **MIRROR**: Existing union pattern in texts.ts
- **IMPORTS**: None needed
- **GOTCHA**: Must also update RULEBOOK.md category list reference (already done in section 6)
- **VALIDATE**: `npx tsc --noEmit` passes

### Task 2: Add category meta
- **ACTION**: Add entry to categories.ts
- **IMPLEMENT**: `{ id: 'sanskar', nameHi: 'संस्कार', nameEn: 'Good Habits', status: 'active' }`
- **MIRROR**: Existing entries in categories.ts
- **IMPORTS**: None
- **GOTCHA**: Position in array determines display order on Home
- **VALIDATE**: Category appears on Home screen

### Task 3: Create SanskarVerse type
- **ACTION**: Create `mobile/src/data/sanskar/types.ts`
- **IMPLEMENT**:
  ```typescript
  export type SanskarVerse = {
    id: string;
    number: number;
    type: 'intro' | 'mantra' | 'step' | 'vidhi';
    labelHi: string;
    labelEn: string;
    lines: string[];
    linesEn: string[];
    meaningHi: string;
    meaningEn: string;
    vidhiHi?: string;
    vidhiEn?: string;
  };
  export type SanskarData = {
    titleHi: string;
    titleEn: string;
    subtitleHi: string;
    subtitleEn: string;
    deity: string;
    language: string;
    source: { baseText: string; retrievedOn: string };
    counts: { totalVerses: number };
    verses: SanskarVerse[];
  };
  ```
- **MIRROR**: AartiVerse type in aarti/index.ts (same mandatory fields)
- **GOTCHA**: SanskarVerse extends VersePageVerse shape (lines/linesEn/meaningHi/meaningEn) — search Path A works. The `'intro'` type is the FIRST verse in every section — it contains the essence, importance, and benefits of the practice.
- **VALIDATE**: Type imports resolve in consuming files

### Task 4: Create 7 JSON data files with verified content
- **ACTION**: Create JSON files in `mobile/src/data/sanskar/`
- **IMPLEMENT**: Each file follows the SanskarData shape. Content MUST be verified against sanskritdocuments.org and Gitapress editions. **Every section's first verse MUST be type `'intro'`** with:
  - `lines`: A foundational shloka or key phrase summarizing the practice
  - `linesEn`: Romanized version
  - `meaningHi`: Full explanation covering: (a) what is this practice (सार), (b) scriptural origin and importance (महत्त्व), (c) spiritual + health/wellbeing benefits (लाभ), (d) when and how often to perform
  - `meaningEn`: English equivalent of the above
  - `labelHi`: "परिचय", `labelEn`: "Introduction"
  - `vidhiHi`/`vidhiEn`: NOT used on intro (optional field omitted)
  - Verse counts updated: prabhati-shloka=4, surya-namaskar=13, tulsi-puja=5, bhojan-mantra=3, gau-seva=4, sandhya-deepam=4, ratri-shloka=4
- **MIRROR**: hanuman-aarti.json shape (titleHi/En, subtitleHi/En, deity, source, counts, verses[])
- **GOTCHA**: Per RULEBOOK section 10 — no AI-generated Sanskrit. Cross-verify each sloka against 2+ authoritative sources. Per RULEBOOK section 11 — meaningHi/meaningEn must include significance/importance, not just translation. Intro verse is NOT searchable content — it's instructional context.
- **VALIDATE**: All JSON files parse without error; every verse has non-empty lines, linesEn, meaningHi, meaningEn; first verse of each section has type='intro'

### Task 5: Create typed collection loader (index.ts)
- **ACTION**: Create `mobile/src/data/sanskar/index.ts`
- **IMPLEMENT**: Load all 7 JSON files, export `getSanskar(id)`, `sanskarIds`, module-level invariant checks
- **MIRROR**: src/data/aarti/index.ts pattern (collection array + ID lookup + bounds checks + assertions)
- **IMPORTS**: All 7 JSON files via require/import
- **GOTCHA**: Module-level assertions must validate: correct count (7), no duplicate verse IDs, non-empty titles/meanings, lines.length === linesEn.length
- **VALIDATE**: Import the module — no thrown errors

### Task 6: Create SanskarVersePage component
- **ACTION**: Create `mobile/src/components/SanskarVersePage.tsx`
- **IMPLEMENT**: Independent verse page component (does NOT import VersePage.tsx) with 4 rendering modes based on `verse.type`:
  - `'intro'`: Pill "परिचय / Introduction", key phrase in verse typography, then full explanation in meaning section (no vidhi). The intro page is visually distinct — meaning text gets more space since it contains the essence/benefits.
  - `'mantra'`: Standard verse pill + lines + ornament + meaning + vidhi section (if present)
  - `'step'`: Step indicator pill "चरण N/T / Step N/T" at top + mantra + posture instruction in vidhi
  - `'vidhi'`: Emphasis on instructional content, pill shows "विधि / Method"
- **MIRROR**: Same layout principles as VersePage.tsx (pill, lines, ornament, meaning) but built independently
- **IMPORTS**: useTheme, useGitaLanguage, Ornament, theme tokens, getReaderBackground
- **GOTCHA**: Per RULEBOOK section 3 — all typography from theme, no hex codes. Per adversarial review — must NOT import VersePage directly. Vidhi section label: `lang === 'hi' ? 'कैसे करें' : 'How to'`.
- **VALIDATE**: Component renders without crash for each verse type (intro, mantra, step, vidhi)

### Task 7: Create SanskarReaderScreen
- **ACTION**: Create `mobile/src/screens/SanskarReaderScreen.tsx`
- **IMPLEMENT**: Multi-instance reader dispatching on route.params.sanskarId. Horizontal paged FlatList, ornament divider, dot indicators, bookmark/progress support.
- **MIRROR**: ChalisaReaderScreen.tsx (ID-based dispatch) — but use getSanskar(id) loader
- **IMPORTS**: getSanskar from data/sanskar, SanskarVersePage, useGitaLanguage, navigation types
- **GOTCHA**: sourceId for bookmarks must use sanskarId param, not a constant. Per RULEBOOK section 3 — top-bar title swaps on lang toggle.
- **VALIDATE**: Screen renders each of the 7 sections correctly

### Task 8: Register navigation route
- **ACTION**: Add SanskarReader to types.ts and HomeStackNavigator.tsx
- **IMPLEMENT**: `SanskarReader: { sanskarId: string; initialIndex?: number }` in HomeStackParamList. Register screen with `gestureEnabled: false, animation: 'fade'`.
- **MIRROR**: AartiReader registration pattern
- **IMPORTS**: SanskarReaderScreen in HomeStackNavigator
- **GOTCHA**: Must use exact name 'SanskarReader' in both types.ts and navigator
- **VALIDATE**: TypeScript resolves navigation.navigate('SanskarReader', {...})

### Task 9: Register entry routes
- **ACTION**: Add sanskar routing to entryRoutes.ts
- **IMPLEMENT**: `const sanskarIds = new Set([...7 IDs...])` + branch in ALL FIVE routing functions: navigateToEntryStart, navigateToProgress, buildProgressTarget, buildBookmarkTarget, navigateToBookmark
- **MIRROR**: chalisaIds pattern in entryRoutes.ts:11,44-46
- **IMPORTS**: None (IDs are string literals)
- **GOTCHA**: Must register in ALL FIVE functions (not just 3). Missing navigateToProgress or navigateToBookmark causes dead resume/bookmark links.
- **VALIDATE**: Tap sanskar card from CategoryList AND from DeityList — both navigate correctly. Bookmark a verse, close reader, tap bookmark in Wishlist — navigates back.

### Task 10: Add CategoryIcon for sanskar
- **ACTION**: Add SeedlingIcon component to CategoryIcon.tsx
- **IMPLEMENT**: A geometric seedling/sprout icon using Svg paths (two leaves + stem). Register with `{iconKey === 'sanskar' && <SeedlingIcon {...paint} />}`
- **MIRROR**: DiyaIcon pattern (takes color + accent props, renders with Svg)
- **IMPORTS**: Svg, Path, Circle from react-native-svg
- **GOTCHA**: Icon must be abstract/geometric per design.md — no figurative illustrations
- **VALIDATE**: Category tile shows icon on Home

### Task 11: Register backgrounds
- **ACTION**: Add source backgrounds for 7 sanskar sections in backgrounds.ts
- **IMPLEMENT**: Add entries to `sourceBackgrounds` record + `categoryBackgrounds` for 'sanskar'. For v1 reuse existing assets with deterministic mapping.
- **MIRROR**: Existing sourceBackgrounds entries
- **GOTCHA**: backgrounds.ts has a runtime coverage validator — it will throw if any active library entry lacks a background. Must add ALL 7 section IDs + the category.
- **VALIDATE**: App boots without background coverage error

### Task 12: Add search integration
- **ACTION**: Add sanskar branch to buildVerseEntries in searchIndex.ts
- **IMPLEMENT**: `if (entry.category === 'sanskar') { pushSanskar(verses, entry); continue; }` — pushSanskar iterates sanskar verses and creates SearchVerseEntry from lines/linesEn fields
- **MIRROR**: pushAarti pattern (Path A — standard lines/linesEn shape)
- **IMPORTS**: getSanskar from data/sanskar
- **GOTCHA**: searchIndex.test.ts has coverage assertion — every active non-hidden library entry must produce verse entries. This will fail automatically if we skip this step.
- **VALIDATE**: `npm run test:readers` passes; search finds sanskar content

### Task 13: Write smoke test
- **ACTION**: Create `src/screens/__tests__/SanskarReaderScreen.test.tsx`
- **IMPLEMENT**: Mock external deps, render SanskarReaderScreen with params `{ sanskarId: 'prabhati-shloka', initialIndex: 0 }`, assert first verse Hindi text renders
- **MIRROR**: BajrangBaanReaderScreen.test.tsx pattern exactly
- **GOTCHA**: Must wrap in GitaLanguageProvider + ShareProvider per test pattern
- **VALIDATE**: `npx jest --testPathPattern=SanskarReader` passes

### Task 14: Add 7 LibraryEntry items to texts.ts
- **ACTION**: Append 7 entries to the library array
- **IMPLEMENT**: Each entry with id, nameHi, nameEn, sub, thumb, status:'active', category:'sanskar', deities, verseCount
- **MIRROR**: Existing aarti entries in library array
- **GOTCHA**: Position in array affects listing order. Thumb must be single Devanagari glyph. Sub follows `<count> <unit> · अर्थ सहित` pattern.
- **VALIDATE**: All 7 appear on CategoryList when tapping sanskar tile

---

## Testing Strategy

### Unit Tests
| Test | Input | Expected | Edge Case? |
|---|---|---|---|
| Smoke render prabhati-shloka | sanskarId='prabhati-shloka', initialIndex=0 | First verse text visible | No |
| Smoke render surya-namaskar | sanskarId='surya-namaskar', initialIndex=0 | Step 1 mantra visible | No |
| Language toggle | Toggle lang to 'en' | English meaning visible | No |
| Invalid sanskarId | sanskarId='nonexistent' | Graceful fallback | Yes |
| Search index coverage | All 7 active entries | Each produces >= 1 SearchVerseEntry | No |

### Edge Cases Checklist
- [ ] Empty lines array in a verse (invariant catches it)
- [ ] Missing vidhiHi/vidhiEn (optional field — component handles gracefully)
- [ ] Surya Namaskar step 12/12 (last step)
- [ ] Language toggle on vidhi section
- [ ] Bookmark from Sanskar reader (sourceId must be the specific sanskarId)

---

## Validation Commands

### Static Analysis
```bash
cd mobile && npx tsc --noEmit
```
EXPECT: Zero type errors

### Unit Tests
```bash
cd mobile && npx jest --config jest.config.js --runInBand
```
EXPECT: All tests pass

### Manual Validation (iOS Simulator + Android Emulator)
- [ ] Home screen shows sanskar category tile with icon
- [ ] Tap tile -> CategoryList shows 7 section cards
- [ ] Open each section: content renders in Hindi
- [ ] Toggle language: content switches to English (lines, meaning, vidhi)
- [ ] Surya Namaskar: step indicator shows correctly
- [ ] Vidhi sections show proper label
- [ ] Search finds sanskar content
- [ ] By Deity: relevant deity pages show sanskar items
- [ ] Bookmark a sanskar verse -> appears in Wishlist with correct sourceId
- [ ] Both iOS and Android render identically

---

## Acceptance Criteria
- [ ] `ContentCategory` type includes `'sanskar'`
- [ ] Category tile visible on Home with custom icon
- [ ] 7 sections openable from CategoryList
- [ ] Every section opens with an intro page (type='intro') showing essence, importance, and benefits
- [ ] Intro page shows "परिचय / Introduction" pill label
- [ ] Hindi/English toggle works on ALL fields (lines, meaning, vidhi, labels, pills)
- [ ] Surya Namaskar step indicator renders correctly
- [ ] Vidhi sections render with proper label
- [ ] All content verified against authoritative Sanskrit sources (no discrepancies)
- [ ] Each meaning includes explanation + significance (not just translation)
- [ ] Search finds sanskar verses
- [ ] Smoke test passes
- [ ] `tsc --noEmit` passes with zero `as any`
- [ ] Works on both iOS Simulator and Android Emulator

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Content accuracy (wrong Sanskrit) | Medium | High | Verify each sloka against sanskritdocuments.org + Gitapress |
| Background image missing for v1 | Low | Medium | Reuse existing category/deity backgrounds with deterministic mapping |
| Type mismatch between SanskarVerse and VersePage | Low | High | SanskarVerse extends VersePageVerse mandatory fields |
| Search index test fails | Low | Medium | Add pushSanskar branch before adding LibraryEntry items |
