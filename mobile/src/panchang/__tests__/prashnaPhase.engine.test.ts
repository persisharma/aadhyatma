import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeKundali, getCurrentDasha } from '../kundali';
import { computeGocharSnapshot } from '../gochar';
import { RASHI_LORD_BY_INDEX } from '../kundaliYoga';
import { buildPrashnaReading } from '../prashnaGuidance';
import { buildPrashnaPhase, phaseAspectHouses, phaseTransitStatus, resolvePhaseTone, type PhaseSignal } from '../prashnaPhase';

const chart = computeKundali({ date: new Date('1992-08-14T00:12:00Z'), latitude: 23.1833333333, longitude: 75.7833333333, timezone: 'Asia/Kolkata' });
const now = new Date('2026-09-21T06:30:00Z');

test('same chart changes its reading across Jupiter-Rahu and Saturn-Saturn', () => {
  const a = buildPrashnaPhase(chart, 'naukri', now, 'job-switch')!;
  const b = buildPrashnaPhase(chart, 'naukri', new Date('2028-01-17T06:30:00Z'), 'job-switch')!;
  assert.equal(a.currentPeriod!.antar, 'rahu');
  assert.equal(b.currentPeriod!.maha, 'saturn');
  assert.notEqual(a.summary.en, b.summary.en);
  assert.notDeepEqual(a.directions, b.directions);
  assert.notDeepEqual(a.signals.filter(s => s.layer === 'gochar'), b.signals.filter(s => s.layer === 'gochar'));
});

test('node occupancy establishes relevance without inheriting difficult-house polarity', () => {
  const r = buildPrashnaPhase(chart, 'naukri', now)!;
  const rahu = r.signals.find(s => s.id === 'dasha-antar')!;
  assert.equal(rahu.graha, 'rahu');
  assert.deepEqual(rahu.houses, [6]);
  assert.equal(rahu.support, false);
  assert.equal(rahu.challenge, false);
  assert.ok(rahu.text.en.includes('sign ruler'));
});

test('every emitted lord, occupant and transit reference agrees with the chart', () => {
  for (const purpose of ['naukri', 'vyapar'] as const) {
    const r = buildPrashnaReading(chart, purpose, now, { gocharScanDays: 0 });
    const snapshot = computeGocharSnapshot(chart, now);
    const nodes = [...r.analysis.windows.flatMap(w => w.basis), ...r.phase!.signals.flatMap(s => s.basis)];
    for (const n of nodes) {
      if (n.kind === 'lord') assert.equal(n.graha, RASHI_LORD_BY_INDEX[chart.houses[n.ofHouse - 1]]);
      if (n.kind === 'graha') assert.equal(n.house, chart.grahas.find(p => p.graha === n.graha)!.house);
      if (n.kind === 'gochar') {
        const t = snapshot.transits.find(t => t.graha === n.graha)!;
        assert.equal(n.fromMoonHouse, t.houseFromMoon);
        assert.equal(n.fromLagnaHouse, t.houseFromLagna);
      }
    }
    assert.ok(r.phase!.signals.every(s => s.basis.length && s.ruleIds.length && s.meaning.hi && s.meaning.en));
    assert.ok(r.phase!.directions.every(d => d.signalIds.length && d.signalIds.every(id => r.phase!.signals.some(s => s.id === id))));
    assert.deepEqual(JSON.parse(JSON.stringify(r.phase)), r.phase);
  }
});

test('the next boundary crosses into a new Mahadasha and uses half-open exact instants', () => {
  const current = getCurrentDasha(chart, now)!;
  const boundary = current.maha.end;
  const before = buildPrashnaPhase(chart, 'vyapar', new Date(boundary.getTime() - 1), 'business-partner')!;
  const at = buildPrashnaPhase(chart, 'vyapar', boundary, 'business-partner')!;
  assert.equal(before.next!.at, boundary.toISOString());
  assert.equal(before.currentPeriod!.maha, 'jupiter');
  assert.equal(at.currentPeriod!.maha, 'saturn');
  assert.equal(at.currentPeriod!.antar, 'saturn');
  assert.ok(before.next!.basis.some(n => n.kind === 'dasha' && n.level === 'maha' && n.lord === 'saturn'));
  assert.ok(at.next!.at > boundary.toISOString());
});

test('a fast Ask reading retains the same current phase as a full screen reading', () => {
  const fast = buildPrashnaReading(chart, 'naukri', now, { gocharScanDays: 0 });
  const full = buildPrashnaReading(chart, 'naukri', now, { gocharScanDays: 2 });
  assert.deepEqual(fast.phase, full.phase);
  assert.equal(fast.phase!.signals.filter(s => s.layer === 'gochar').length, 2);
});

test('vedha removes support and Saturn keeps the Sun exception', () => {
  const original = computeGocharSnapshot(chart, now);
  const snapshot = { ...original, transits: original.transits.map(t => ({ ...t, houseFromMoon: t.graha === 'saturn' ? 3 : t.graha === 'sun' ? 12 : 1 })) };
  assert.equal(phaseTransitStatus(snapshot, 'saturn').support, true);
  const blocked = { ...snapshot, transits: snapshot.transits.map(t => ({ ...t, houseFromMoon: t.graha === 'venus' ? 12 : t.houseFromMoon })) };
  assert.equal(phaseTransitStatus(blocked, 'saturn').support, false);
  assert.deepEqual(phaseTransitStatus(blocked, 'saturn').blockers.map(b => b.graha), ['venus']);
  const jupiter = { ...snapshot, transits: snapshot.transits.map(t => ({ ...t, houseFromMoon: t.graha === 'jupiter' ? 9 : t.graha === 'mars' ? 10 : 1 })) };
  assert.equal(phaseTransitStatus(jupiter, 'jupiter').vedhaHouse, 10);
  assert.equal(phaseTransitStatus(jupiter, 'jupiter').support, false);
});

test('special transit aspects are counted from the transit house, not from the Moon', () => {
  assert.deepEqual(phaseAspectHouses(1, 'jupiter'), [5, 7, 9]);
  assert.deepEqual(phaseAspectHouses(9, 'saturn'), [11, 3, 6]);
  assert.deepEqual(phaseAspectHouses(12, 'jupiter'), [4, 6, 8]);
});

test('duplicate natal support cannot manufacture a favourable current period; contradictions remain', () => {
  const seed = buildPrashnaPhase(chart, 'vyapar', now)!.signals[0];
  const signal = (layer: PhaseSignal['layer'], support: boolean, challenge: boolean): PhaseSignal => ({ ...seed, layer, support, challenge, houses: [10] });
  assert.equal(resolvePhaseTone([signal('natal', true, false)]), 'limited');
  assert.equal(resolvePhaseTone([signal('dasha', true, false), signal('dasha', true, false)]), 'active');
  assert.equal(resolvePhaseTone([signal('dasha', true, false), signal('gochar', true, false)]), 'supportive');
  assert.equal(resolvePhaseTone([signal('dasha', true, true), signal('gochar', true, false)]), 'mixed');
});

test('question priority changes the natal focus; pilot never leaks into minors or protected topics', () => {
  const start = buildPrashnaPhase(chart, 'vyapar', now, 'business-start')!;
  const partner = buildPrashnaPhase(chart, 'vyapar', now, 'business-partner')!;
  assert.notEqual(start.signals[0].text.en, partner.signals[0].text.en);
  assert.equal(start.signals[0].houses[0], 3);
  assert.equal(partner.signals[0].houses[0], 7);
  for (const purpose of ['man', 'swasthya', 'santan', 'vidya'] as const) assert.equal(buildPrashnaPhase(chart, purpose, now), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', new Date('2000-01-01')), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', new Date('1990-01-01')), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', now, 'business-start')!.questionId, 'general');
});
