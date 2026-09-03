// कुल परम्परा (PRD-29 Part B) — pure record model + export envelope.
// Runs under `tsx --test` (npm run test:engine, TZ=Asia/Kolkata).
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildKulParamparaExport,
  EMPTY_KUL_RECORD,
  isEmptyKulRecord,
  kuldevDisplayName,
  normalizeKulRecord,
  parseKulRecord,
  serializeKulRecord,
  type KulRecord,
} from '../kulParampara';
import { relationLabels, type SmaranEntry } from '../pitruSmaran';
import type { PersonProfile } from '../birthProfiles';

const knowsNavratri = (id: string) => id === 'navratri-ashtami';

test('normalize keeps registry ids, drops unknown ids, and trims free text', () => {
  const record = normalizeKulRecord(
    {
      kuldev: { kind: 'kuldevi', deityId: 'durga' },
      temple: { templeId: 'no-such-temple', customName: '  श्री ज्वाला जी  ' },
      gotra: '  भारद्वाज ',
      kulVrat: { ruleId: 'retired-rule', customText: ' नवरात्रि अष्टमी ' },
      notes: '  घर की पहली रोटी गाय की।  ',
    },
    knowsNavratri
  );
  assert.deepEqual(record.kuldev, { kind: 'kuldevi', deityId: 'durga' });
  // Unknown temple id degrades to the free-text half — never a crash, never a lie.
  assert.deepEqual(record.temple, { customName: 'श्री ज्वाला जी' });
  assert.equal(record.gotra, 'भारद्वाज');
  assert.deepEqual(record.kulVrat, { customText: 'नवरात्रि अष्टमी' });
  assert.equal(record.notes, 'घर की पहली रोटी गाय की।');
});

test('normalize drops an unknown deity id and empty sub-records', () => {
  const record = normalizeKulRecord(
    {
      kuldev: { kind: 'kuldevta', deityId: 'no-such-deity' as never },
      temple: { customName: '   ' },
      kulVrat: {},
    },
    knowsNavratri
  );
  assert.equal(record.kuldev, undefined);
  assert.equal(record.temple, undefined);
  assert.equal(record.kulVrat, undefined);
  assert.equal(isEmptyKulRecord(record), true);
});

test('serialize → parse round-trips a full record', () => {
  const record: KulRecord = {
    kuldev: { kind: 'kuldevi', deityId: 'durga' },
    temple: { customName: 'श्री ज्वाला जी' },
    gotra: 'भारद्वाज',
    kulVrat: { ruleId: 'navratri-ashtami' },
    notes: 'तीन पीढ़ी की मन्नत।',
  };
  const parsed = parseKulRecord(serializeKulRecord(record), knowsNavratri);
  assert.deepEqual(parsed, record);
});

test('parse degrades corruption and version drift to the empty record', () => {
  assert.deepEqual(parseKulRecord(null, knowsNavratri), EMPTY_KUL_RECORD);
  assert.deepEqual(parseKulRecord('not-json', knowsNavratri), EMPTY_KUL_RECORD);
  assert.deepEqual(parseKulRecord('{"version":99,"record":{}}', knowsNavratri), EMPTY_KUL_RECORD);
  // A rule id a later release retired degrades field-wise, keeping the rest.
  const stale = serializeKulRecord({ gotra: 'कश्यप', kulVrat: { ruleId: 'navratri-ashtami' } });
  const parsed = parseKulRecord(stale, () => false);
  assert.equal(parsed.gotra, 'कश्यप');
  assert.equal(parsed.kulVrat, undefined);
});

test('kuldevDisplayName prefers the registry name and falls back to the family word', () => {
  assert.equal(kuldevDisplayName({ kind: 'kuldevi', deityId: 'durga' }, 'hi'), 'माँ दुर्गा');
  assert.equal(kuldevDisplayName({ kind: 'kuldevi', deityId: 'durga' }, 'en'), 'Maa Durga');
  assert.equal(kuldevDisplayName({ kind: 'kuldevta', customName: 'खेतला जी' }, 'hi'), 'खेतला जी');
});

test('the export envelope is versioned, denormalized, and carries no device ids', () => {
  const people: PersonProfile[] = [
    { id: 'p-internal-1', name: 'मधुसूदन', date: '1988-11-12', time: '06:40', cityId: 'jaipur' },
    { id: 'p-internal-2', date: '2019-01-23', time: '09:15', cityId: 'ujjain' },
  ];
  const smaranEntries: SmaranEntry[] = [
    {
      id: 'smaran-internal-1',
      relation: 'dadaji',
      tithiRule: { lunarMonth: 7, paksha: 'krishna', tithi: 10 },
      createdAtMs: 1,
    },
  ];
  const envelope = buildKulParamparaExport({
    record: {
      kuldev: { kind: 'kuldevi', deityId: 'durga' },
      temple: { customName: 'श्री ज्वाला जी' },
      gotra: 'भारद्वाज',
      kulVrat: { ruleId: 'navratri-ashtami' },
    },
    people,
    smaranEntries,
    appVersion: '1.4.7',
    now: new Date(Date.UTC(2026, 7, 31, 12, 0, 0)),
    ruleNames: (ruleId) =>
      ruleId === 'navratri-ashtami' ? { nameHi: 'नवरात्रि अष्टमी', nameEn: 'Navratri Ashtami' } : null,
    relationLabelEn: (entry) => relationLabels(entry.relation).labelEn,
  });

  assert.equal(envelope.format, 'vedansh-kul-parampara');
  assert.equal(envelope.version, 1);
  assert.equal(envelope.appVersion, '1.4.7');
  assert.equal(envelope.kul.kuldev?.nameEn, 'Maa Durga');
  assert.equal(envelope.kul.kulVrat?.nameHi, 'नवरात्रि अष्टमी');
  assert.equal(envelope.people.length, 2);
  assert.equal(envelope.people[0].name, 'मधुसूदन');
  assert.ok(envelope.people[0].janmaTithiHi, 'the janma tithi rides beside the birth date');
  assert.equal(envelope.people[0].birthCityEn, 'Jaipur');
  assert.equal(envelope.people[1].name, undefined);
  assert.equal(envelope.pitru[0].relationEn, 'Grandfather (paternal)');
  assert.ok(envelope.pitru[0].tithiHi.includes('कृष्ण'));

  // Device-internal ids never leave: person/entry ids are process-local keys.
  const json = JSON.stringify(envelope);
  assert.equal(json.includes('p-internal-1'), false);
  assert.equal(json.includes('smaran-internal-1'), false);
  assert.equal(json.includes('reminder'), false);
});
