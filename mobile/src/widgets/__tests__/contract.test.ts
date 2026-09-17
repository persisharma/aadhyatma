import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { decodeWidgetPayload, stableWidgetPayloadKey, type WidgetPayloadV1 } from '../contract';

function fixture(): WidgetPayloadV1 {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'src/widgets/fixtures/widget-payload-v1.json'), 'utf8')) as WidgetPayloadV1;
}

test('decodes the committed v1 cross-language document', () => {
  const payload = fixture();
  assert.equal(decodeWidgetPayload(JSON.stringify(payload), Date.parse('2099-01-01T07:00:00Z')).kind, 'ready');
});

test('fails closed for missing, corrupt, newer schema, and expired payloads', () => {
  assert.equal(decodeWidgetPayload(null).kind, 'missing');
  assert.equal(decodeWidgetPayload('{').kind, 'corrupt');
  assert.equal(decodeWidgetPayload({ ...fixture(), schemaVersion: 2 }).kind, 'incompatible');
  assert.equal(decodeWidgetPayload(fixture(), Date.parse('2099-01-16T00:00:00Z')).kind, 'expired');
});

test('generatedAt does not defeat the valid 14-day offline window', () => {
  assert.equal(decodeWidgetPayload(fixture(), Date.parse('2099-01-10T00:00:00Z')).kind, 'ready');
});

test('rejects partially decoded dates and localizations', () => {
  const bad = fixture() as unknown as Record<string, any>;
  delete bad.panchang.days[0].tithi.kn;
  assert.equal(decodeWidgetPayload(bad, Date.parse('2099-01-01T07:00:00Z')).kind, 'corrupt');
});

test('rejects native links whose query does not exactly match the payload', () => {
  const verse = fixture() as unknown as Record<string, any>;
  verse.verses.days[0].deepLink += '&unexpected=1';
  assert.equal(decodeWidgetPayload(verse, Date.parse('2099-01-01T07:00:00Z')).kind, 'corrupt');

  const japam = fixture() as unknown as Record<string, any>;
  japam.japam.deepLink = 'vedansh://widget/japam';
  assert.equal(decodeWidgetPayload(japam, Date.parse('2099-01-01T07:00:00Z')).kind, 'corrupt');
});

// ── the tithi chain (the mid-day handover the widget refreshes on) ──────────
test('the chain decodes, and its links stay ordered, single-ended and anchored', () => {
  const ready = (mutate: (day: any) => void) => {
    const payload = fixture() as unknown as Record<string, any>;
    mutate(payload.panchang.days[0]);
    return decodeWidgetPayload(payload, Date.parse('2099-01-01T07:00:00Z')).kind;
  };
  assert.equal(ready(() => {}), 'ready');
  // A day written before the chain existed still decodes: the field is additive
  // so an OTA'd writer and an older store binary never deadlock each other.
  assert.equal(ready((day) => { delete day.tithiSegments; }), 'ready');

  assert.equal(ready((day) => { day.tithiSegments = []; }), 'corrupt');
  // Link 0 must BE the day's sunrise tithi, or the headline and the chain drift.
  assert.equal(ready((day) => { day.tithiSegments[0].name = day.tithiSegments[1].name; }), 'corrupt');
  // Only the LAST link may be open-ended — an unterminated middle link stops
  // every native reader's forward scan early.
  assert.equal(ready((day) => { delete day.tithiSegments[0].endsAt; delete day.tithiSegments[0].till; }), 'corrupt');
  // An end instant needs its rendered तक line, and vice versa.
  assert.equal(ready((day) => { delete day.tithiSegments[0].till; }), 'corrupt');
  assert.equal(ready((day) => { day.tithiSegments[1].till = day.tithiSegments[0].till; }), 'corrupt');
  // Ends must advance: a stalled chain cannot be scanned forward.
  assert.equal(ready((day) => { day.tithiSegments[1].endsAt = day.tithiSegments[0].endsAt; day.tithiSegments[1].till = day.tithiSegments[0].till; }), 'corrupt');
});

test('dedup key changes for every planner trigger', () => {
  const base = fixture(); const key = stableWidgetPayloadKey(base);
  assert.notEqual(stableWidgetPayloadKey({ ...base, locale: 'en' }), key);
  assert.notEqual(stableWidgetPayloadKey({ ...base, panchang: { ...base.panchang, cityId: 'jaipur' } }), key);
  assert.notEqual(stableWidgetPayloadKey({ ...base, japam: { ...base.japam, totalBeads: 217 } }), key);
  // A re-solve that moves only the handover instant must still bust the cache,
  // or the widget keeps refreshing on yesterday's boundaries.
  const moved = structuredClone(base);
  moved.panchang.days[0].tithiSegments![0].endsAt = '2099-01-01T10:54:00.000Z';
  assert.notEqual(stableWidgetPayloadKey(moved), key);
});
