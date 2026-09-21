import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { computeKundali } from '../kundali';
import { buildPrashnaReading, composePrashnaGuidance } from '../prashnaGuidance';
import { PRASHNA_PURPOSES } from '../prashnaPurposes';
import { questionsForPurpose } from '../prashnaQuestions';
import type { PrashnaFactor } from '../prashna';

const now = new Date('2026-09-18T06:30:00Z');
const input = { latitude: 23.1833333333, longitude: 75.7833333333, timezone: 'Asia/Kolkata' as const };
const adult = computeKundali({ ...input, date: new Date('1992-08-14T00:12:00Z') });
const child = computeKundali({ ...input, date: new Date('2013-08-10T05:00:00Z') });
const options = { gocharScanDays: 0 };

test('all nine topics and all questions have deterministic, traceable bilingual readings', () => {
  for (const purpose of PRASHNA_PURPOSES) for (const q of questionsForPurpose(purpose.id)) {
    const result = buildPrashnaReading(adult, purpose.id, now, { ...options, questionId: q.id });
    assert.deepEqual(result, buildPrashnaReading(adult, purpose.id, now, { ...options, questionId: q.id }));
    assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
    const g = result.guidance!;
    assert.equal(g.questionId, q.id);
    assert.ok(g.insights.length >= 1 && g.insights.length <= 2);
    assert.ok(g.actions.length >= 2 && g.actions.length <= 3);
    const factors = [...result.analysis.supports, ...result.analysis.resists, ...result.analysis.qualifies];
    for (const insight of g.insights) {
      assert.ok(insight.basis.length > 0);
      assert.ok(insight.factorIds.every(id => factors.some(f => f.id === id)));
      assert.equal(insight.source.verified, false);
      assert.ok(insight.meaning.hi && insight.meaning.en);
    }
    for (const action of g.actions) {
      assert.equal(action.origin, 'editorial');
      assert.ok(action.insightIds.every(id => g.insights.some(i => i.id === id)));
    }
    assert.ok(g.timing.windowIds.every(id => result.analysis.windows.some(w => w.id === id && w.relevant)));
  }
});

test('question context changes actions without changing chart evidence; foreign or unknown question resets', () => {
  const first = buildPrashnaReading(adult, 'naukri', now, { ...options, questionId: 'job-first' });
  const change = buildPrashnaReading(adult, 'naukri', now, { ...options, questionId: 'job-switch' });
  assert.deepEqual(first.guidance!.insights, change.guidance!.insights);
  assert.notDeepEqual(first.guidance!.actions, change.guidance!.actions);
  assert.doesNotMatch(JSON.stringify(first.guidance!.actions), /manager|promotion|leaving/i);
  assert.equal(buildPrashnaReading(adult, 'vidya', now, { ...options, questionId: 'job-switch' }).guidance!.questionId, 'general');
});

test('minors have no gated reading and open readings address parents', () => {
  for (const p of PRASHNA_PURPOSES) {
    const r = buildPrashnaReading(child, p.id, now, { ...options, questionId: 'study-exam' });
    if (p.minAge > 13) assert.equal(r.guidance, null);
    else {
      assert.ok(r.guidance!.parentNote!.en.startsWith('For a parent:'));
      assert.ok(r.guidance!.actions.every(a => a.id.startsWith('parent-')));
    }
  }
});

test('contradictions survive theme grouping including several houses mapped to one theme', () => {
  const a = buildPrashnaReading(adult, 'swasthya', now, options).analysis;
  const f = (house: number, polarity: PrashnaFactor['polarity']): PrashnaFactor => ({ id: `lord-${house}-test`, polarity, weight: 1, group: `lord-${house}`, textHi: 'आधार', textEn: 'basis', basis: [{ kind: 'lord', graha: 'saturn', ofHouse: house, inHouse: 10 }] });
  const g = composePrashnaGuidance({ ...a, supports: [f(1, 'support')], resists: [f(6, 'resist')], qualifies: [] })!;
  assert.equal(g.insights[0].tone, 'mixed');
  assert.deepEqual(g.insights[0].factorIds, ['lord-1-test', 'lord-6-test']);
  assert.equal(g.timing.status, 'insufficient');
  assert.deepEqual(g.timing.windowIds, []);
});

test('timing relevance does not add favourable strength or require waiting', () => {
  const r = buildPrashnaReading(adult, 'naukri', now);
  assert.ok(!r.analysis.supports.some(f => f.id.startsWith('gochar-') || f.id === 'dasha-relevant'));
  assert.ok(r.guidance!.timing.text.en.includes('Relevance does not establish favourability'));
  const g = composePrashnaGuidance({ ...r.analysis, windows: [] })!;
  assert.equal(g.timing.status, 'insufficient');
  assert.ok(g.timing.text.en.includes('do not require waiting'));
});

test('different charts produce different connections, not just a different strength label', () => {
  const other = computeKundali({ ...input, date: new Date('1982-09-07T01:44:25Z') });
  const a = buildPrashnaReading(adult, 'naukri', now, options).guidance!;
  const b = buildPrashnaReading(other, 'naukri', now, options).guidance!;
  assert.notDeepEqual(a.insights.map(i => i.meaning.en), b.insights.map(i => i.meaning.en));
});

test('guidance has no network, randomness, personal case data or certain-outcome copy', () => {
  for (const file of ['prashnaGuidance.ts', 'prashnaQuestions.ts']) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\bfetch\s*\(|Math\.random|new Date\(|1992|1982|2013/);
    assert.doesNotMatch(source, /will happen|guaranteed|certainly|निश्चित रूप से|अवश्य होगा/);
  }
});
