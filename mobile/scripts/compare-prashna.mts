/** Offline, reproducible fixtures. Run from mobile: npx tsx scripts/compare-prashna.mts */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { computeKundali, getCurrentDasha, RASHI_NAMES_EN } from '../src/panchang/kundali';
import { buildPrashnaReading } from '../src/panchang/prashnaGuidance';
import { PRASHNA_PURPOSES, type PurposeId } from '../src/panchang/prashnaPurposes';

const asOf = new Date('2026-09-18T06:30:00Z');
const out = fileURLToPath(new URL('../../docs/evaluations/kundali-guidance-2026-09-18/', import.meta.url));
mkdirSync(out, { recursive: true });
const fixtures = [
  { id: 'sample-a', label: 'Public AstroSage sample A', localBirth: '11 Apr 1979, 18:23:24 IST, Agra', date: '1979-04-11T12:53:24Z', latitude: 27.15, longitude: 78, purposeId: 'naukri', questionId: 'general', source: 'https://cdn.astrosage.com/pdf/ca_report_pro_en.pdf' },
  { id: 'sample-b', label: 'Public AstroSage sample B', localBirth: '7 Sep 1982, 07:14:25 IST, Firozpur', date: '1982-09-07T01:44:25Z', latitude: 30 + 55 / 60, longitude: 74 + 35 / 60, purposeId: 'naukri', questionId: 'general', source: 'https://www.astrosage.com/pdf/as-career-report-en.pdf' },
  { id: 'synthetic-adult', label: 'Synthetic adult', localBirth: '14 Aug 1992, 05:42 IST, Ujjain', date: '1992-08-14T00:12:00Z', latitude: 23 + 11 / 60, longitude: 75 + 47 / 60, purposeId: 'naukri', questionId: 'job-switch', source: null },
  { id: 'synthetic-minor', label: 'Synthetic adolescent', localBirth: '10 Aug 2013, 10:30 IST, Ujjain', date: '2013-08-10T05:00:00Z', latitude: 23 + 11 / 60, longitude: 75 + 47 / 60, purposeId: 'vidya', questionId: 'study-exam', source: null },
];
// Load the old composer alongside its imports, then remove it even on failure.
const baselinePath = fileURLToPath(new URL(`../src/panchang/.comparison-baseline-${process.pid}.ts`, import.meta.url));
const baselineCommit = '14861226';
writeFileSync(baselinePath, execFileSync('git', ['show', `${baselineCommit}:mobile/src/panchang/prashna.ts`]));
try {
  const { buildPrashnaAnswer: baseline } = await import(pathToFileURL(baselinePath).href);
  const cases = fixtures.map(f => {
    const chart = computeKundali({ date: new Date(f.date), latitude: f.latitude, longitude: f.longitude, timezone: 'Asia/Kolkata' });
    const start = performance.now();
    const reading = buildPrashnaReading(chart, f.purposeId as PurposeId, asOf, { questionId: f.questionId });
    const computeMs = performance.now() - start;
    const old = baseline(chart, f.purposeId, asOf);
    const current = getCurrentDasha(chart, asOf);
    const facts = {
      convention: 'Lahiri sidereal zodiac, whole-sign houses, India timezone. Interpret these supplied calculations; do not recalculate birth data.',
      ascendant: { sign: RASHI_NAMES_EN[chart.lagnaRashiIndex], longitude: chart.lagnaLongitude },
      planets: chart.grahas.map(p => ({ id: `planet-${p.graha}`, ...p, sign: RASHI_NAMES_EN[p.rashiIndex] })),
      currentDasha: current,
      age: reading.analysis.ageLabelEn,
    };
    const matrix = PRASHNA_PURPOSES.map(p => {
      const r = buildPrashnaReading(chart, p.id, asOf, { gocharScanDays: 0 });
      return { purposeId: p.id, gated: r.analysis.gated, title: r.guidance?.title.en ?? null, tones: r.guidance?.insights.map(i => i.tone) ?? [] };
    });
    return { ...f, asOf: asOf.toISOString(), computeMs, facts, before: { title: old.saarTitleEn, summary: old.saarBodyEn, actions: old.dishaEn, strength: old.strength }, reading, matrix };
  });
  writeFileSync(`${out}engine.json`, JSON.stringify({ baselineCommit, asOf: asOf.toISOString(), cases }, null, 2) + '\n');
  // GPT gets facts + question only, never our composed answer or competitor copy.
  writeFileSync(`${out}gpt-input.json`, JSON.stringify(cases.map(c => ({ id: c.id, asOf: c.asOf, question: c.reading.guidance!.question.en, purpose: c.purposeId, facts: c.facts })), null, 2) + '\n');
  console.log(cases.map(c => ({ id: c.id, ascendant: c.facts.ascendant.sign, moon: c.facts.planets.find(p => p.graha === 'moon')!.sign, computeMs: Math.round(c.computeMs), title: c.reading.guidance!.title.en, insights: c.reading.guidance!.insights.map(i => i.meaning.en) })));
} finally { unlinkSync(baselinePath); }
