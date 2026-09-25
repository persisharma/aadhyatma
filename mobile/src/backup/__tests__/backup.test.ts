import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupFilename,
  buildBackupEnvelope,
  countItems,
  decodeStoredValue,
  encodeStoredValue,
  parseBackupText,
  planRestoreWrites,
  summarizeEnvelope,
} from '../envelope';
import { BACKUP_KEYS, isBackupKey, isExcludedKey } from '../registry';

// ─────────────────────────────────────────────────────────────────────────────
// Registry completeness (RULEBOOK §29): every `@vedansh…` key literal declared
// anywhere in src/ is either backed up or named as deliberately excluded. A
// new store that forgets to register fails here instead of silently dropping
// out of every user's backup.
// ─────────────────────────────────────────────────────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === '__tests__' || name === 'node_modules') continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const SRC = join(__dirname, '..', '..');
const KEY_LITERAL = /['"`](@vedansh[/:][A-Za-z0-9_./:-]*)['"`]?/g;
const declared = new Set<string>();
for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(KEY_LITERAL)) {
    const key = match[1];
    // Prefix roots (`@vedansh:panchang-days:`) and template stems
    // (`@vedansh/tour-completed-v`) are declared without their suffix; the
    // exclusion list covers them with a trailing `*`.
    declared.add(key);
  }
}
assert.ok(declared.size > 30, `key scan found only ${declared.size} keys — scanner broken?`);

const unaccounted = [...declared].filter((key) => {
  if (isBackupKey(key)) return false;
  if (isExcludedKey(key)) return false;
  // A bare prefix root: covered when an exclusion prefix starts with it.
  if (isExcludedKey(`${key}x`)) return false;
  return true;
});
assert.deepEqual(
  unaccounted,
  [],
  `AsyncStorage keys neither backed up nor listed in BACKUP_EXCLUDED_KEYS: ${unaccounted.join(', ')}`
);

// No key is both backed up and excluded, and no duplicates in the registry.
for (const entry of BACKUP_KEYS) {
  assert.equal(isExcludedKey(entry.key), false, `${entry.key} is both backed up and excluded`);
}
assert.equal(new Set(BACKUP_KEYS.map((e) => e.key)).size, BACKUP_KEYS.length, 'duplicate registry key');

// The lens pair travels together (derivedCacheReset.ts explains why).
assert.ok(isBackupKey('@vedansh:panchang-lenses') && isBackupKey('@vedansh:panchang-lenses-seeded'));
// The user-authored pitru ledger is in; its derived solves are out.
assert.ok(isBackupKey('@vedansh/pitru-smaran'));
assert.ok(isExcludedKey('@vedansh:pitru-solves:v3:win:2026'));
// Every date the family typed is in.
for (const key of ['@vedansh:kundali-profiles:v1', '@vedansh:janma-tithi:v1', '@vedansh:kul-parampara:v1', '@vedansh:guna-milan-draft:v1', '@vedansh:namkaran-session:v1', '@vedansh:vastu-homes:v1', '@vedansh/daan-ledger:v1']) {
  assert.ok(isBackupKey(key), `${key} must be backed up`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Value encoding round-trips.
// ─────────────────────────────────────────────────────────────────────────────
assert.deepEqual(encodeStoredValue('{"a":1}'), { json: { a: 1 } });
assert.deepEqual(encodeStoredValue('hi'), { raw: 'hi' });
assert.deepEqual(encodeStoredValue('42'), { json: 42 });
assert.equal(decodeStoredValue({ raw: 'hi' }), 'hi');
assert.equal(decodeStoredValue({ json: { a: 1 } }), '{"a":1}');
assert.equal(decodeStoredValue(encodeStoredValue('{"a":[1,2]}')), '{"a":[1,2]}');

assert.equal(backupFilename(new Date(2026, 8, 25)), 'vedansh-backup-2026-09-25.json');
assert.equal(backupFilename(new Date(2027, 0, 3)), 'vedansh-backup-2027-01-03.json');

// ─────────────────────────────────────────────────────────────────────────────
// Build: registry-only, unset keys omitted, foreign keys dropped.
// ─────────────────────────────────────────────────────────────────────────────
const now = new Date('2026-09-25T06:30:00.000Z');
const envelope = buildBackupEnvelope(
  [
    ['@vedansh/bookmarks', '[{"id":"bhagavad-gita:1:0"},{"id":"hanuman-chalisa::3"}]'],
    ['@vedansh/pitru-smaran', '{"version":1,"entries":[{"id":"a"},{"id":"b"},{"id":"c"}]}'],
    ['@vedansh:kundali-profiles:v1', '{"activeId":"p1","people":[{"id":"p1"}]}'],
    ['@vedansh/language', 'hi'],
    ['@vedansh/reading-progress', null],
    ['@vedansh/notif-meta', '{"appOpenCount":9}'],
    ['@vedansh:panchang-days:v4:ujjain:2026-09-25', '{"x":1}'],
  ],
  { now, appVersion: '1.4.6' }
);
assert.equal(envelope.format, BACKUP_FORMAT);
assert.equal(envelope.version, BACKUP_VERSION);
assert.equal(envelope.exportedAt, '2026-09-25T06:30:00.000Z');
assert.equal(envelope.appVersion, '1.4.6');
assert.deepEqual(Object.keys(envelope.entries).sort(), [
  '@vedansh/bookmarks',
  '@vedansh/language',
  '@vedansh/pitru-smaran',
  '@vedansh:kundali-profiles:v1',
].sort());
assert.equal('@vedansh/notif-meta' in envelope.entries, false, 'OS-mirror bookkeeping must not be exported');
assert.equal('@vedansh/reading-progress' in envelope.entries, false, 'unset keys are omitted, never written empty');
assert.deepEqual(envelope.entries['@vedansh/language'], { raw: 'hi' });

// ─────────────────────────────────────────────────────────────────────────────
// Parse: the file the export wrote comes back identical; every failure mode
// is named, never thrown.
// ─────────────────────────────────────────────────────────────────────────────
const text = JSON.stringify(envelope, null, 2);
const parsed = parseBackupText(text);
assert.ok(parsed.ok);
if (parsed.ok) assert.deepEqual(parsed.envelope, envelope);

assert.deepEqual(parseBackupText('not json'), { ok: false, reason: 'corrupt' });
assert.deepEqual(parseBackupText('[]'), { ok: false, reason: 'corrupt' });
assert.deepEqual(parseBackupText('{"hello":"world"}'), { ok: false, reason: 'not-a-backup' });
assert.deepEqual(parseBackupText('{"format":"vedansh-kul-parampara","version":1}'), { ok: false, reason: 'kul-parampara-file' });
assert.deepEqual(parseBackupText(JSON.stringify({ ...envelope, version: 2 })), { ok: false, reason: 'newer-version' });
assert.deepEqual(parseBackupText(JSON.stringify({ ...envelope, version: '1' })), { ok: false, reason: 'corrupt' });
assert.deepEqual(parseBackupText(JSON.stringify({ ...envelope, entries: [] })), { ok: false, reason: 'corrupt' });
assert.deepEqual(parseBackupText(JSON.stringify({ ...envelope, entries: {} })), { ok: false, reason: 'empty' });

// A hand-edited file cannot plant keys the app does not own, nor malformed values.
const tampered = parseBackupText(
  JSON.stringify({
    ...envelope,
    entries: {
      ...envelope.entries,
      '@vedansh/install-id': { json: 'stolen' },
      'some-other-app-key': { raw: 'x' },
      '@vedansh/routines': 'not-a-value',
      '@vedansh/font-scale': { neither: 1 },
    },
  })
);
assert.ok(tampered.ok);
if (tampered.ok) {
  assert.equal('@vedansh/install-id' in tampered.envelope.entries, false);
  assert.equal('some-other-app-key' in tampered.envelope.entries, false);
  assert.equal('@vedansh/routines' in tampered.envelope.entries, false);
  assert.equal('@vedansh/font-scale' in tampered.envelope.entries, false);
  assert.equal(Object.keys(tampered.envelope.entries).length, 4);
}
// Missing metadata degrades, never fails.
const bare = parseBackupText(JSON.stringify({ format: BACKUP_FORMAT, version: 1, entries: envelope.entries }));
assert.ok(bare.ok);
if (bare.ok) {
  assert.equal(bare.envelope.exportedAt, '');
  assert.equal(bare.envelope.appVersion, 'unknown');
}

// ─────────────────────────────────────────────────────────────────────────────
// Restore plan: the multiSet pairs, strings identical to what the stores wrote.
// ─────────────────────────────────────────────────────────────────────────────
const writes = planRestoreWrites(envelope);
assert.equal(writes.length, 4);
const byKey = new Map(writes);
assert.equal(byKey.get('@vedansh/language'), 'hi');
assert.equal(byKey.get('@vedansh/bookmarks'), '[{"id":"bhagavad-gita:1:0"},{"id":"hanuman-chalisa::3"}]');
assert.equal(byKey.get('@vedansh/pitru-smaran'), '{"version":1,"entries":[{"id":"a"},{"id":"b"},{"id":"c"}]}');
for (const [key] of writes) assert.ok(isBackupKey(key), `restore may only write registry keys, got ${key}`);

// ─────────────────────────────────────────────────────────────────────────────
// Summary counts for the screen.
// ─────────────────────────────────────────────────────────────────────────────
assert.equal(countItems({ json: [1, 2, 3] }), 3);
assert.equal(countItems({ json: { version: 1, entries: [{}, {}] } }), 2);
assert.equal(countItems({ json: { activeId: 'p1', people: [{}] } }), 1);
assert.equal(countItems({ json: { 'bhagavad-gita': {}, 'sundarkand': {} } }), 2, 'a per-source map counts its keys');
assert.equal(countItems({ json: { version: 1 } }), 1, 'a versioned scalar-ish blob counts as one setting');
assert.equal(countItems({ json: 'L' }), 1);
assert.equal(countItems({ raw: 'hi' }), 1);

const summary = summarizeEnvelope(envelope);
assert.deepEqual(summary.map((s) => s.group), ['family', 'practice', 'follows', 'preferences']);
const family = summary.find((s) => s.group === 'family')!;
assert.equal(family.stores, 2);
assert.equal(family.items, 3 + 1);
const practice = summary.find((s) => s.group === 'practice')!;
assert.deepEqual([practice.stores, practice.items], [1, 2]);
const follows = summary.find((s) => s.group === 'follows')!;
assert.deepEqual([follows.stores, follows.items], [0, 0]);
const prefs = summary.find((s) => s.group === 'preferences')!;
assert.deepEqual([prefs.stores, prefs.items], [1, 1]);

console.log('backup.test.ts: all assertions passed');
