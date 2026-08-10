import assert from 'node:assert/strict';

import type { BookmarkRef } from '@/contexts/BookmarksContext';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import {
  buildEntryStartTarget,
  buildBookmarkTarget,
  buildProgressTarget,
  navigateToBookmark,
  navigateToProgress,
} from './entryRoutes';
import type { HomeStackParamList } from './types';

type NavCall = { name: string; params: unknown };

function makeNav(): { nav: { navigate: (name: keyof HomeStackParamList, params?: unknown) => void }; calls: NavCall[] } {
  const calls: NavCall[] = [];
  return {
    calls,
    nav: {
      navigate: ((name: keyof HomeStackParamList, params?: unknown) => {
        calls.push({ name: String(name), params });
      }) as never,
    },
  };
}

const bm = (overrides: Partial<BookmarkRef>): BookmarkRef => ({
  id: 'x',
  sourceId: 'x',
  verseIndex: 0,
  savedAt: 0,
  previewHi: '',
  previewEn: '',
  ...overrides,
});

// Sundarkand chaptered bookmark routes to SundarkandReader with chapter+initialIndex.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'sundarkand:12:4',
    sourceId: 'sundarkand',
    chapter: 12,
    verseIndex: 4,
  }));
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'SundarkandReader', params: { chapter: 12, initialIndex: 4 } }]);
}

// Hanuman Chalisa flat bookmark routes to ChalisaReader with chalisaId.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'hanuman-chalisa::7',
    sourceId: 'hanuman-chalisa',
    verseIndex: 7,
  }));
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'ChalisaReader', params: { initialIndex: 7, chalisaId: 'hanuman-chalisa' } }]);
}

// Shiv Chalisa bookmark routes to ChalisaReader with shiv-chalisa.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'shiv-chalisa::3',
    sourceId: 'shiv-chalisa',
    verseIndex: 3,
  }));
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'ChalisaReader', params: { initialIndex: 3, chalisaId: 'shiv-chalisa' } }]);
}

// Aarti canonical sourceId routes to AartiReader.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'aarti:0:5',
    sourceId: 'om-jai-jagdish',
    verseIndex: 5,
  }));
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'AartiReader', params: { aartiIndex: 0, initialIndex: 5 } }]);
}

// Legacy aarti-N sourceId is migrated on the fly to canonical.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'aarti:3:1',
    sourceId: 'aarti-3',
    verseIndex: 1,
  }));
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'AartiReader', params: { aartiIndex: 3, initialIndex: 1 } }]);
}

// Ramcharitmanas/Vishnu/HanumanAshtak/RamStuti chaptered bookmarks all route correctly.
for (const sourceId of [
  'ramcharitmanas',
  'vishnu-sahasranama',
  'hanuman-ashtak',
  'ram-stuti',
  'valmiki-ramayan',
  'durga-stotram',
  'ganesh-stotram',
  'shiva-strotam',
  'bhagavad-gita',
] as const) {
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: `${sourceId}:2:0`,
    sourceId,
    chapter: 2,
    verseIndex: 0,
  }));
  assert.equal(ok, true, `expected route for ${sourceId}`);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0]!.params, { chapter: 2, initialIndex: 0 });
}

// Unknown sourceId returns false and does not navigate.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'who-knows:1:1',
    sourceId: 'who-knows',
    verseIndex: 0,
  }));
  assert.equal(ok, false);
  assert.deepEqual(calls, []);
}

// Chaptered bookmark with no chapter is a no-op (returns false), not a wrong-screen.
{
  const { nav, calls } = makeNav();
  const ok = navigateToBookmark(nav as never, bm({
    id: 'sundarkand-no-chapter',
    sourceId: 'sundarkand',
    verseIndex: 4,
  }));
  assert.equal(ok, false);
  assert.deepEqual(calls, []);
}

// buildBookmarkTarget returns a nested-navigator descriptor.
{
  const target = buildEntryStartTarget({
    id: 'vishnu-sahasranama',
    nameHi: 'विष्णु सहस्रनाम अंश',
    nameEn: 'Vishnu Sahasranama Excerpt',
    sub: '',
    subEn: '',
    thumb: '',
    status: 'active',
    category: 'stotram',
    deities: ['vishnu'],
  });
  assert.deepEqual(target, {
    screen: 'VishnuSahasranamaChapters',
    params: {},
  });
}

{
  const target = buildBookmarkTarget(bm({
    id: 'shiv-chalisa::3',
    sourceId: 'shiv-chalisa',
    verseIndex: 3,
  }));
  assert.deepEqual(target, {
    screen: 'ChalisaReader',
    params: { initialIndex: 3, chalisaId: 'shiv-chalisa' },
  });
}

{
  const target = buildBookmarkTarget(bm({
    id: 'aarti:3:1',
    sourceId: 'aarti-3',
    verseIndex: 1,
  }));
  assert.deepEqual(target, {
    screen: 'AartiReader',
    params: { aartiIndex: 3, initialIndex: 1 },
  });
}

{
  const target = buildBookmarkTarget(bm({
    id: 'unknown:1',
    sourceId: 'unknown',
    verseIndex: 0,
  }));
  assert.equal(target, null);
}

// Resume from progress for legacy aarti-N migrates to canonical.
{
  const { nav, calls } = makeNav();
  const progress: ReadingProgress = {
    sourceId: 'aarti-2',
    verseIndex: 3,
    updatedAt: 0,
  };
  const ok = navigateToProgress(nav as never, progress);
  assert.equal(ok, true);
  assert.deepEqual(calls, [{ name: 'AartiReader', params: { aartiIndex: 2, initialIndex: 3 } }]);
}

// Resume into a chaptered source pushes the chapter index under the reader so
// back lands on the subsection list.
{
  const { nav, calls } = makeNav();
  const progress: ReadingProgress = {
    sourceId: 'sundarkand',
    chapter: 3,
    verseIndex: 7,
    updatedAt: 0,
  };
  const ok = navigateToProgress(nav as never, progress);
  assert.equal(ok, true);
  assert.deepEqual(calls, [
    { name: 'SundarkandChapters', params: undefined },
    { name: 'SundarkandReader', params: { chapter: 3, initialIndex: 7 } },
  ]);
}

// buildProgressTarget routes a chaptered notification payload correctly.
{
  const target = buildProgressTarget({
    sourceId: 'bhagavad-gita',
    chapter: 2,
    verseIndex: 46,
  });
  assert.deepEqual(target, {
    screen: 'GitaReader',
    params: { chapter: 2, initialIndex: 46 },
  });
}

// buildProgressTarget routes a chalisa notification payload.
{
  const target = buildProgressTarget({
    sourceId: 'hanuman-chalisa',
    verseIndex: 8,
  });
  assert.deepEqual(target, {
    screen: 'ChalisaReader',
    params: { initialIndex: 8, chalisaId: 'hanuman-chalisa' },
  });
}

// buildProgressTarget returns null when a chaptered source has no chapter.
{
  const target = buildProgressTarget({
    sourceId: 'sundarkand',
    verseIndex: 4,
  });
  assert.equal(target, null);
}

// ── Single-chapter texts open their reader, not a one-row chapters index ─────
// Regression: every "open this text" surface (Home FOR TODAY row, By-Purpose
// discovery lists, search, category/deity lists) routes through
// buildEntryStartTarget. Sending a single-chapter text to its chapters screen
// showed a list with exactly one row, so opening the text took two taps.
{
  const entry = (id: string): Parameters<typeof buildEntryStartTarget>[0] => ({
    id,
    nameHi: '',
    nameEn: '',
    sub: '',
    subEn: '',
    thumb: '',
    status: 'active',
    category: 'stotram',
    deities: [],
  });

  // One chapter → straight into the reader at its first verse.
  for (const [id, screen] of [
    ['hanuman-ashtak', 'HanumanAshtakReader'],
    ['bajrang-baan', 'BajrangBaanReader'],
    ['ram-stuti', 'RamStutiReader'],
    // ram-aarti reuses the Ram Stuti content, so it inherits the same route.
    ['ram-aarti', 'RamStutiReader'],
    ['ramcharitmanas', 'RamcharitmanasReader'],
  ] as const) {
    assert.deepEqual(
      buildEntryStartTarget(entry(id)),
      { screen, params: { chapter: 1, initialIndex: 0 } },
      `${id} should open its reader directly`
    );
  }

  // More than one chapter → the index still leads, because there is a choice.
  for (const [id, screen] of [
    ['sundarkand', 'SundarkandChapters'],
    ['bhagavad-gita', 'GitaChapters'],
    ['vishnu-sahasranama', 'VishnuSahasranamaChapters'],
    ['shiva-strotam', 'ShivaStrotamChapters'],
    ['durga-stotram', 'DurgaStotramChapters'],
    ['ganesh-stotram', 'GaneshStotramChapters'],
    ['saraswati-stotram', 'SaraswatiStotramChapters'],
    ['krishna-stotram', 'KrishnaStotramChapters'],
    ['valmiki-ramayan', 'ValmikiRamayanChapters'],
  ] as const) {
    assert.deepEqual(
      buildEntryStartTarget(entry(id)),
      { screen, params: {} },
      `${id} should keep its chapters index`
    );
  }
}

// Resuming a single-chapter text goes straight to its reader — no one-row
// chapters index pushed underneath (pressing back would strand the user on it).
{
  const { nav, calls } = makeNav();
  const ok = navigateToProgress(nav as never, {
    sourceId: 'bajrang-baan',
    chapter: 1,
    verseIndex: 6,
    updatedAt: 0,
  });
  assert.equal(ok, true);
  assert.deepEqual(calls, [
    { name: 'BajrangBaanReader', params: { chapter: 1, initialIndex: 6 } },
  ]);
}

// A multi-chapter text keeps the index under the reader (sibling chapters).
{
  const { nav, calls } = makeNav();
  const ok = navigateToProgress(nav as never, {
    sourceId: 'vishnu-sahasranama',
    chapter: 2,
    verseIndex: 3,
    updatedAt: 0,
  });
  assert.equal(ok, true);
  assert.deepEqual(calls, [
    { name: 'VishnuSahasranamaChapters', params: undefined },
    { name: 'VishnuSahasranamaReader', params: { chapter: 2, initialIndex: 3 } },
  ]);
}
