import assert from 'node:assert/strict';
import { test } from 'node:test';

import { categories } from '../categories';
import { deities } from '../deities';
import { library, type LibraryEntry } from '../texts';
import { bhajanCatalog, bhajanIds, BHAJAN_REGIONS, type BhajanGroupId } from '../bhajan/ids';
import { bhajanLoaders, getBhajan, type BhajanData } from '../bhajan';
import { bhajanShelfEntries, groupBhajanShelf } from '../bhajan/shelf';
import {
  buildBookmarkTarget,
  buildEntryStartTarget,
  buildProgressTarget,
} from '../../navigation/entryRoutes';

// Bhajan text shelf (design.md §34.1, RULEBOOK §34). The registry invariants
// hold for whatever is shipped — today an empty catalog, so they also prove
// nothing unverified slipped in. Run: npx tsx src/data/__tests__/bhajanLibrary.test.ts

const deityIds = new Set<string>(deities.map((d) => d.id));
const regionIds = new Set<string>(BHAJAN_REGIONS.map((r) => r.id));
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

test('the bhajan category lives in the Bhajan tab, never on the Home grid', () => {
  const meta = categories.find((c) => c.id === 'bhajan');
  assert.ok(meta, 'bhajan category is registered');
  assert.equal(meta.placement, 'bhajan-tab');
  assert.equal(meta.status, 'active');
  const homeTiles = categories.filter((c) => c.placement !== 'bhajan-tab');
  assert.equal(homeTiles.some((c) => c.id === 'bhajan'), false);
});

test('catalog ids are unique, stable-looking and loader-backed one-to-one', () => {
  const seen = new Set<string>();
  for (const row of bhajanCatalog) {
    assert.equal(seen.has(row.id), false, `duplicate bhajan id ${row.id}`);
    seen.add(row.id);
    assert.match(row.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${row.id} must be kebab-case`);
    assert.ok(deityIds.has(row.group) || regionIds.has(row.group), `${row.id}: unknown group ${row.group}`);
  }
  assert.deepEqual([...Object.keys(bhajanLoaders)].sort(), [...seen].sort());
  assert.equal(bhajanIds.size, bhajanCatalog.length);
});

test('every catalog row has exactly one active bhajan library entry, and vice versa', () => {
  const entries = library.filter((e) => e.category === 'bhajan');
  assert.deepEqual(entries.map((e) => e.id).sort(), bhajanCatalog.map((r) => r.id).sort());
  for (const entry of entries) {
    assert.equal(entry.status, 'active', `${entry.id}: only verified bhajans are catalogued`);
    const row = bhajanCatalog.find((r) => r.id === entry.id)!;
    if (deityIds.has(row.group)) {
      assert.ok(entry.deities.includes(row.group as LibraryEntry['deities'][number]), `${entry.id}: group deity missing from deities`);
    }
    for (const id of library.filter((e) => e.category !== 'bhajan').map((e) => e.id)) {
      assert.notEqual(id, entry.id, `${entry.id} duplicates another section's id (RULEBOOK §11.11)`);
    }
  }
});

test('every shipped payload is complete, sourced twice and matches its entry', () => {
  for (const row of bhajanCatalog) {
    const data = getBhajan(row.id) as BhajanData;
    const entry = library.find((e) => e.id === row.id)!;
    assert.ok(data, `${row.id}: payload loads`);
    assert.equal(data.id, row.id);
    assert.equal(data.group, row.group, `${row.id}: payload group matches catalog`);
    assert.equal(data.titleHi, entry.nameHi);
    assert.equal(data.titleEn, entry.nameEn);
    assert.ok(data.attributionHi.trim() && data.attributionEn.trim(), `${row.id}: attribution`);
    // RULEBOOK §11.1/§11.2: two independent sources actually read, dated.
    assert.ok(data.source.baseText.trim(), `${row.id}: source.baseText`);
    assert.ok(data.source.referenceUrls.length >= 2, `${row.id}: two reference URLs`);
    assert.match(data.source.retrievedOn, ISO_DATE, `${row.id}: retrievedOn is an ISO date`);
    // RULEBOOK §11.10: counts agree everywhere.
    assert.ok(data.verses.length > 0, `${row.id}: has verses`);
    assert.equal(data.counts.totalVerses, data.verses.length, `${row.id}: counts.totalVerses`);
    assert.equal(entry.verseCount, data.verses.length, `${row.id}: texts.ts verseCount`);
    const verseIds = new Set<string>();
    for (const v of data.verses) {
      assert.equal(verseIds.has(v.id), false, `${row.id}: duplicate verse id ${v.id}`);
      verseIds.add(v.id);
      assert.ok(v.lines.length > 0, `${row.id}/${v.id}: lines`);
      assert.equal(v.lines.length, v.linesEn.length, `${row.id}/${v.id}: one romanized line per line`);
      assert.ok(v.lines.every((l) => l.trim()) && v.linesEn.every((l) => l.trim()), `${row.id}/${v.id}: blank line`);
      assert.ok(v.meaningHi.trim() && v.meaningEn.trim(), `${row.id}/${v.id}: Hindi and English meaning`);
      assert.ok(v.labelHi.trim() && v.labelEn.trim(), `${row.id}/${v.id}: labels`);
    }
  }
});

test('every catalogued bhajan routes to BhajanReader from start, resume and bookmark', () => {
  for (const row of bhajanCatalog) {
    const entry = library.find((e) => e.id === row.id)!;
    assert.deepEqual(buildEntryStartTarget(entry), { screen: 'BhajanReader', params: { bhajanId: row.id, initialIndex: 0 } });
    assert.deepEqual(buildProgressTarget({ sourceId: row.id, verseIndex: 2 }), {
      screen: 'BhajanReader',
      params: { bhajanId: row.id, initialIndex: 2 },
    });
    assert.deepEqual(buildBookmarkTarget({ id: `${row.id}:1`, sourceId: row.id, verseIndex: 1, savedAt: 0, previewHi: '', previewEn: '' }), {
      screen: 'BhajanReader',
      params: { bhajanId: row.id, initialIndex: 1 },
    });
  }
});

test('an unknown bhajan id loads nothing and routes nowhere', () => {
  assert.equal(getBhajan('not-a-bhajan'), null);
  assert.equal(buildProgressTarget({ sourceId: 'not-a-bhajan', verseIndex: 0 }), null);
});

// ── Pure shelf logic, on synthetic entries (no real lyrics) ──────────────────

function fixture(id: string, deityList: LibraryEntry['deities'], extra: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id,
    nameHi: id,
    nameEn: id,
    sub: '',
    subEn: '',
    thumb: 'भ',
    status: 'active',
    category: 'bhajan',
    deities: deityList,
    ...extra,
  };
}

test('shelf entries are visible, active, catalogued bhajans only', () => {
  const ids = new Set(['a', 'b', 'c', 'd']);
  const source = [
    fixture('a', ['krishna']),
    fixture('b', ['shiva'], { hidden: true }),
    fixture('c', ['shiva'], { status: 'coming' }),
    fixture('d', ['rama'], { category: 'aarti' }),
    fixture('e', ['rama']),
  ];
  assert.deepEqual(bhajanShelfEntries(source, ids).map((e) => e.id), ['a']);
});

test('groups follow deities.ts order, then regions; empty and unknown groups drop', () => {
  const groupOf: Record<string, BhajanGroupId> = {
    folk: 'lok-bhajan',
    shiv1: 'shiva',
    raj: 'rajasthani',
    krishna1: 'krishna',
    shiv2: 'shiva',
  };
  const entries = ['folk', 'shiv1', 'raj', 'krishna1', 'shiv2', 'orphan'].map((id) => fixture(id, []));
  const groups = groupBhajanShelf(entries, (id) => groupOf[id]);
  assert.deepEqual(groups.map((g) => g.id), ['krishna', 'shiva', 'rajasthani', 'lok-bhajan']);
  assert.deepEqual(groups[1].entries.map((e) => e.id), ['shiv1', 'shiv2'], 'library order within a group');
  assert.equal(groups[0].nameHi, deities.find((d) => d.id === 'krishna')!.nameHi);
  assert.equal(groups[3].nameEn, 'Folk Bhajans');
});

test('the shipped shelf groups every visible bhajan exactly once', () => {
  const visible = bhajanShelfEntries();
  const grouped = groupBhajanShelf(visible).flatMap((g) => g.entries.map((e) => e.id));
  assert.deepEqual(grouped.sort(), visible.map((e) => e.id).sort());
});
