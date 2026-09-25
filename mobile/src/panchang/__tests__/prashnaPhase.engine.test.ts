import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeKundali, getCurrentDasha } from '../kundali';
import { computeGocharSnapshot } from '../gochar';
import { RASHI_LORD_BY_INDEX } from '../kundaliYoga';
import { buildPrashnaReading } from '../prashnaGuidance';
import { questionsForPurpose } from '../prashnaQuestions';
import type { PurposeId } from '../prashnaPurposes';
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

test('a job-switch answer states a decision and traces both sides to this chart and date', () => {
  const current = buildPrashnaPhase(chart, 'naukri', now, 'job-switch')!;
  const later = buildPrashnaPhase(chart, 'naukri', new Date('2028-01-17T06:30:00Z'), 'job-switch')!;
  assert.equal(current.tone, 'mixed');
  assert.match(current.decision!.headline.en, /Search now/);
  assert.ok(current.decision!.inFavour.length && current.decision!.against.length);
  assert.deepEqual(current.decision!.signalIds, [...new Set([...current.decision!.inFavour, ...current.decision!.against].map(reason => reason.signalId))]);
  for (const side of [current.decision!.inFavour, current.decision!.against, later.decision!.inFavour, later.decision!.against]) {
    for (const reason of side) {
      const signal = (side === current.decision!.inFavour || side === current.decision!.against ? current : later).signals.find(s => s.id === reason.signalId);
      assert.ok(signal, reason.signalId);
      assert.ok(reason.text.en && reason.text.hi && reason.reference.en && reason.reference.hi);
      if (reason.signalId.startsWith('transit-')) assert.match(reason.reference.en, /from your Moon/);
    }
  }
  assert.equal(later.tone, 'limited');
  assert.match(later.decision!.headline.en, /No clear timing answer/);
  assert.equal(later.decision!.against[0].signalId, 'dasha-maha');
  assert.match(later.decision!.against[0].reference.en, /no direct link/);
  assert.notEqual(current.decision!.headline.en, later.decision!.headline.en);
  assert.match(buildPrashnaPhase(chart, 'naukri', now, 'job-growth')!.decision!.headline.en, /promotion/);
});

test('a supportive job-switch answer names independent period and transit support', () => {
  const isha = computeKundali({ date: new Date('1995-06-25T04:00:00Z'), latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' });
  const blocked = buildPrashnaPhase(isha, 'naukri', now, 'job-switch')!;
  assert.match(blocked.decision!.against.find(reason => reason.signalId === 'transit-saturn')!.text.en, /obstruction by Mercury/);
  const r = buildPrashnaPhase(isha, 'naukri', new Date('2026-10-30T05:45:00Z'), 'job-switch')!;
  assert.equal(r.tone, 'supportive');
  assert.match(r.decision!.headline.en, /^Yes,/);
  assert.deepEqual(r.decision!.inFavour.map(reason => reason.signalId), ['dasha-antar', 'transit-saturn']);
  assert.equal(r.decision!.against.length, 0);
  assert.match(r.decision!.nextStep.en, /in writing/);
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
  for (const purpose of ['naukri', 'vyapar', 'vidya', 'dhan', 'vivah', 'yatra'] as const) {
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

test('all adult safe questions give distinct bilingual answers with linked evidence', () => {
  const purposes: PurposeId[] = ['naukri', 'vyapar', 'vidya', 'dhan', 'vivah', 'yatra'];
  for (const purpose of purposes) {
    const seen = new Set<string>();
    for (const question of questionsForPurpose(purpose)) {
      const phase = buildPrashnaPhase(chart, purpose, now, question.id)!;
      assert.ok(phase, `${purpose}/${question.id}`);
      assert.equal(phase.questionId, question.id);
      assert.ok(phase.decision?.prompt.en && phase.decision?.prompt.hi);
      assert.ok(phase.decision?.headline.en && phase.decision?.headline.hi);
      assert.ok(phase.decision?.nextStep.en && phase.decision?.nextStep.hi);
      assert.equal(phase.directions[0].text.en, phase.decision!.nextStep.en);
      assert.ok(phase.decision!.inFavour.length || phase.decision!.against.length);
      for (const reason of [...phase.decision!.inFavour, ...phase.decision!.against]) {
        assert.ok(phase.signals.some(signal => signal.id === reason.signalId));
        assert.ok(reason.reference.en && reason.reference.hi);
        if (purpose !== 'naukri' && purpose !== 'vyapar') assert.doesNotMatch(reason.text.en, /career question|career ruler|work-related houses/);
      }
      seen.add(phase.decision!.prompt.en);
    }
    assert.equal(seen.size, questionsForPurpose(purpose).length, `${purpose}: every question has a distinct prompt`);
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

test('question priority changes the natal focus; adult expansion does not leak into minors or protected topics', () => {
  const start = buildPrashnaPhase(chart, 'vyapar', now, 'business-start')!;
  const partner = buildPrashnaPhase(chart, 'vyapar', now, 'business-partner')!;
  assert.notEqual(start.signals[0].text.en, partner.signals[0].text.en);
  assert.equal(start.signals[0].houses[0], 3);
  assert.equal(partner.signals[0].houses[0], 7);
  assert.equal(buildPrashnaPhase(chart, 'vidya', now, 'study-course')!.signals[0].houses[0], 9);
  for (const purpose of ['man', 'swasthya', 'santan'] as const) assert.equal(buildPrashnaPhase(chart, purpose, now), null);
  const child = computeKundali({ date: new Date('2013-08-10T05:00:00Z'), latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' });
  for (const purpose of ['vidya', 'yatra', 'naukri'] as const) assert.equal(buildPrashnaPhase(child, purpose, now), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', new Date('2000-01-01')), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', new Date('1990-01-01')), null);
  assert.equal(buildPrashnaPhase(chart, 'naukri', now, 'business-start')!.questionId, 'general');
});
