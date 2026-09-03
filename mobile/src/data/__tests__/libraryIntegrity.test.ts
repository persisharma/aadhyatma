import assert from 'node:assert/strict';

import { categories } from '../categories';
import { deities } from '../deities';
import { japamMantras } from '../japam';
import { library } from '../texts';
import { navigateToEntryStart } from '../../navigation/entryRoutes';
import type { HomeStackParamList } from '../../navigation/types';

// Structural / routing integrity of the library — complements the content
// validation in contentCorrectness.test.ts. Ensures a new LibraryEntry can't
// ship a card that's a silent no-op or leaks into the wrong listing.
// Run: npx tsx src/data/__tests__/libraryIntegrity.test.ts

type NavCall = { name: string; params: unknown };

function makeNav(): {
  nav: { navigate: (name: keyof HomeStackParamList, params?: unknown) => void };
  calls: NavCall[];
} {
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

const deityIds = new Set(deities.map((d) => d.id));
const categoryIds = new Set(categories.map((c) => c.id));
const japamIds = new Set(japamMantras.map((m) => m.id));

// 1. Library ids are unique — duplicates silently collide in bookmarks/progress.
{
  const seen = new Set<string>();
  for (const e of library) {
    assert.equal(seen.has(e.id), false, `duplicate library id: ${e.id}`);
    seen.add(e.id);
  }
}

// 2. Every active, visible entry resolves to a reader route. An unregistered
//    entry leaves its card on Home but tapping it is a silent no-op (RULEBOOK §3,
//    the PR #31 Balkand-crash regression). This is the core enforcement.
for (const e of library) {
  if (e.status !== 'active' || e.hidden) continue;
  const { nav, calls } = makeNav();
  const ok = navigateToEntryStart(nav as never, e);
  assert.equal(
    ok,
    true,
    `entry "${e.id}" is not registered in entryRoutes — its Home card is a silent no-op`
  );
  assert.equal(calls.length, 1, `entry "${e.id}" must navigate exactly once (got ${calls.length})`);
}

// 3. Every deity referenced by an entry exists in the deity registry, else the
//    deity chip/listing filter never matches and the entry is unreachable by deity.
for (const e of library) {
  for (const d of e.deities) {
    assert.equal(deityIds.has(d), true, `entry "${e.id}" references unknown deity "${d}"`);
  }
}

// 4. Every category referenced exists in the category registry.
for (const e of library) {
  assert.equal(categoryIds.has(e.category), true, `entry "${e.id}" has unknown category "${e.category}"`);
}

// 5. Japam exclusion (non-negotiable): every mantra entry is category 'japam' so
//    the `category !== 'japam'` filter in DeityListScreen/DeityIndexScreen keeps it
//    out of deity listings. A mantra mis-categorized here leaks into deity chips.
for (const e of library) {
  if (japamIds.has(e.id)) {
    assert.equal(
      e.category,
      'japam',
      `mantra "${e.id}" must be category 'japam' to stay out of deity listings`
    );
  }
}

// 6. Content sanity — bilingual names and a thumbnail glyph are always present.
for (const e of library) {
  assert.ok(e.nameHi.trim().length > 0, `entry "${e.id}" missing nameHi`);
  assert.ok(e.nameEn.trim().length > 0, `entry "${e.id}" missing nameEn`);
  assert.ok(e.thumb.trim().length > 0, `entry "${e.id}" missing thumb`);
}

console.log(`libraryIntegrity: ${library.length} entries — all invariants hold`);
