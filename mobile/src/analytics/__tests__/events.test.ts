import assert from 'node:assert/strict';

import {
  ENTRY_POINTS,
  MAX_EVENTS,
  appendEvent,
  countByEntryPoint,
  parseStoredLog,
  serializeLog,
  sharedScreenView,
  type AnalyticsEvent,
  type EntryPoint,
} from '../events';

// ── The four entry points are the contract (handover §5) ───────────────────
// Pinned as a set: dropping or renaming one silently makes a month of logged
// data unanswerable, which is the whole reason the field exists.
assert.deepEqual([...ENTRY_POINTS], ['tab', 'segment_swipe', 'notification', 'deeplink']);

// Every source builds a well-formed event for every section.
for (const entryPoint of ENTRY_POINTS) {
  for (const section of ['panchang', 'vrat', 'jyotish'] as const) {
    const event = sharedScreenView(section, entryPoint, 1_700_000_000_000);
    assert.deepEqual(event, {
      name: 'shared_screen_view',
      at: 1_700_000_000_000,
      entry_point: entryPoint,
      section,
    });
  }
}

// ── Ring buffer ────────────────────────────────────────────────────────────
let log: readonly AnalyticsEvent[] = [];
assert.equal(log.length, 0);

log = appendEvent(log, sharedScreenView('panchang', 'tab', 1));
log = appendEvent(log, sharedScreenView('vrat', 'segment_swipe', 2));
assert.equal(log.length, 2);
assert.equal(log[0].section, 'panchang');
assert.equal(log[1].entry_point, 'segment_swipe');

// append does not mutate its input.
const before = appendEvent([], sharedScreenView('vrat', 'tab', 1));
const after = appendEvent(before, sharedScreenView('jyotish', 'tab', 2));
assert.equal(before.length, 1);
assert.equal(after.length, 2);

// The bound holds, and it drops from the FRONT (oldest first).
let full: readonly AnalyticsEvent[] = [];
for (let i = 0; i < MAX_EVENTS + 25; i += 1) {
  full = appendEvent(full, sharedScreenView('panchang', 'tab', i));
}
assert.equal(full.length, MAX_EVENTS);
assert.equal(full[0].at, 25, 'oldest events fall off the front');
assert.equal(full[full.length - 1].at, MAX_EVENTS + 24);

// ── Serialize / parse round trip ───────────────────────────────────────────
const sample: readonly AnalyticsEvent[] = [
  sharedScreenView('panchang', 'tab', 10),
  sharedScreenView('vrat', 'notification', 20),
  sharedScreenView('jyotish', 'deeplink', 30),
];
assert.deepEqual(parseStoredLog(serializeLog(sample)), sample);

// ── Parse is lenient per-row, never fatal ──────────────────────────────────
// Nothing renders this log, so one unreadable row from an older build must not
// cost the rows around it.
assert.deepEqual(parseStoredLog(null), []);
assert.deepEqual(parseStoredLog(''), []);
assert.deepEqual(parseStoredLog('not json'), []);
assert.deepEqual(parseStoredLog('null'), []);
assert.deepEqual(parseStoredLog('[]'), [], 'a bare array is not the record shape');
assert.deepEqual(parseStoredLog('{"version":1}'), []);
assert.deepEqual(parseStoredLog('{"version":1,"events":"nope"}'), []);

const mixed = JSON.stringify({
  version: 1,
  events: [
    { name: 'shared_screen_view', at: 1, entry_point: 'tab', section: 'panchang' },
    { name: 'some_future_event', at: 2, entry_point: 'tab', section: 'vrat' },
    { name: 'shared_screen_view', at: 3, entry_point: 'telepathy', section: 'vrat' },
    { name: 'shared_screen_view', at: 4, entry_point: 'tab', section: 'muhurat' },
    { name: 'shared_screen_view', at: 'soon', entry_point: 'tab', section: 'vrat' },
    { name: 'shared_screen_view', at: Number.NaN, entry_point: 'tab', section: 'vrat' },
    null,
    'row',
    { name: 'shared_screen_view', at: 9, entry_point: 'deeplink', section: 'jyotish' },
  ],
});
const survivors = parseStoredLog(mixed);
assert.equal(survivors.length, 2, 'only the two well-formed rows survive');
assert.deepEqual(
  survivors.map((e) => e.at),
  [1, 9]
);

// A stored log longer than the current ceiling is trimmed on READ, so the bound
// holds from the first append onward rather than one append later.
const oversized = JSON.stringify({
  version: 1,
  events: Array.from({ length: MAX_EVENTS + 10 }, (_, i) => ({
    name: 'shared_screen_view',
    at: i,
    entry_point: 'tab',
    section: 'panchang',
  })),
});
const trimmed = parseStoredLog(oversized);
assert.equal(trimmed.length, MAX_EVENTS);
assert.equal(trimmed[0].at, 10);

// ── countByEntryPoint answers §5's question ────────────────────────────────
const month: readonly AnalyticsEvent[] = [
  sharedScreenView('vrat', 'tab', 1),
  sharedScreenView('vrat', 'segment_swipe', 2),
  sharedScreenView('vrat', 'segment_swipe', 3),
  sharedScreenView('vrat', 'notification', 4),
  sharedScreenView('jyotish', 'tab', 5),
  sharedScreenView('panchang', 'deeplink', 6),
];

// Scoped to one section: "did the व्रत tab earn its slot, or do swipes do the work?"
assert.deepEqual(countByEntryPoint(month, 'vrat'), {
  tab: 1,
  segment_swipe: 2,
  notification: 1,
  deeplink: 0,
});
assert.deepEqual(countByEntryPoint(month, 'jyotish'), {
  tab: 1,
  segment_swipe: 0,
  notification: 0,
  deeplink: 0,
});

// Unscoped: every row counted exactly once.
const all = countByEntryPoint(month);
assert.deepEqual(all, { tab: 2, segment_swipe: 2, notification: 1, deeplink: 1 });
assert.equal(
  (Object.values(all) as number[]).reduce((sum, n) => sum + n, 0),
  month.length
);

// Every entry point is a key even when unused, so a reader can divide without
// guarding for undefined.
const empty = countByEntryPoint([]);
for (const entryPoint of ENTRY_POINTS) {
  assert.equal(empty[entryPoint as EntryPoint], 0);
}
