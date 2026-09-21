/** Reproducible public/synthetic fixtures only. No saved user profiles. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { computeKundali, getCurrentDasha, RASHI_NAMES_EN } from '../src/panchang/kundali';
import { computeGocharSnapshot, findNextIngress } from '../src/panchang/gochar';
import { buildPrashnaReading } from '../src/panchang/prashnaGuidance';
import { dignityOfPosition } from '../src/panchang/kundaliBasis';
import { RASHI_LORD_BY_INDEX } from '../src/panchang/kundaliYoga';

const out = fileURLToPath(new URL('../../docs/evaluations/prashna-phase-2026-09-21/', import.meta.url));
mkdirSync(out, { recursive: true });
const now = new Date('2026-09-21T06:30:00Z');
const fixtures = [
  { id: 'sample-a', label: 'Public AstroSage A', birth: '1979-04-11T12:53:24Z', latitude: 27.15, longitude: 78, source: 'https://cdn.astrosage.com/pdf/ca_report_pro_en.pdf' },
  { id: 'sample-b', label: 'Public AstroSage B', birth: '1982-09-07T01:44:25Z', latitude: 30 + 55 / 60, longitude: 74 + 35 / 60, source: 'https://www.astrosage.com/pdf/as-career-report-en.pdf' },
  { id: 'aarav', label: 'Aarav · synthetic', birth: '1992-08-14T00:12:00Z', latitude: 23 + 11 / 60, longitude: 75 + 47 / 60, source: null },
  { id: 'meera', label: 'Meera · synthetic', birth: '1988-02-20T09:15:00Z', latitude: 28.6139, longitude: 77.209, source: null },
  { id: 'kabir', label: 'Kabir · synthetic', birth: '1998-11-03T15:40:00Z', latitude: 19.076, longitude: 72.8777, source: null },
  { id: 'isha', label: 'Isha · synthetic', birth: '1995-06-25T04:00:00Z', latitude: 12.9716, longitude: 77.5946, source: null },
];
const cases = fixtures.map(f => {
  const chart = computeKundali({ date: new Date(f.birth), latitude: f.latitude, longitude: f.longitude, timezone: 'Asia/Kolkata' });
  const current = getCurrentDasha(chart, now)!;
  const edge = (current.antar ?? current.maha).end;
  const ingress = findNextIngress('jupiter', now, 400)!;
  // Daily transit convention: compare 06:00 anchors on adjacent civil days,
  // safely bracketing the ingress, rather than claiming intraday refresh.
  const dates = [
    { label: 'Current date', at: now },
    { label: 'Before dasha boundary', at: new Date(edge.getTime() - 1000) },
    { label: 'After dasha boundary', at: new Date(edge.getTime() + 1000) },
    { label: 'Before Jupiter ingress', at: new Date(ingress.at.getTime() - 86_400_000) },
    { label: 'After Jupiter ingress', at: new Date(ingress.at.getTime() + 86_400_000) },
  ];
  const readings = dates.flatMap(d => (['naukri', 'vyapar'] as const).map(purpose => {
    const start = performance.now();
    const r = buildPrashnaReading(chart, purpose, d.at, { questionId: purpose === 'naukri' ? 'job-switch' : 'business-partner', gocharScanDays: 0 });
    return { label: d.label, asOf: d.at.toISOString(), purpose, milliseconds: performance.now() - start, phase: r.phase!, previous: r.guidance! };
  }));
  return { ...f, chart: { ...chart, grahas: chart.grahas.map(g => ({ ...g, dignity: dignityOfPosition(g), sign: RASHI_NAMES_EN[g.rashiIndex] })), houseLords: chart.houses.map(r => RASHI_LORD_BY_INDEX[r]) }, ingress, readings,
    gptFacts: [now, new Date(edge.getTime() + 1000)].map(at => ({ asOf: at.toISOString(), currentDasha: getCurrentDasha(chart, at), currentGochar: computeGocharSnapshot(chart, at) })) };
});
writeFileSync(`${out}engine.json`, JSON.stringify({ generatedFor: now.toISOString(), cases }, null, 2) + '\n');
writeFileSync(`${out}gpt-input.json`, JSON.stringify(cases.map((c, i) => ({
  id: c.id, label: c.label,
  question: i % 2 === 0 ? 'Considering a job switch: how does my current phase guide my plans?' : 'Considering a business partnership: how does my current phase guide my plans?',
  purpose: i % 2 === 0 ? 'naukri' : 'vyapar',
  convention: 'Supplied Lahiri D1 whole-sign calculations. Transits at 06:00 IST. Interpret supplied positions; do not recalculate birth data. Dasha periods use exact instants, not rounded civil dates.',
  natal: { ascendant: c.chart.lagnaRashiIndex, houses: c.chart.houses, houseLords: c.chart.houseLords, planets: c.chart.grahas },
  datedFacts: c.gptFacts,
})), null, 2) + '\n');
console.log(JSON.stringify({ profiles: cases.length, readings: cases.reduce((n,c) => n+c.readings.length,0), tones: cases.map(c => ({ id: c.id, rows: c.readings.filter(r => r.label === 'Current date' || r.label === 'After dasha boundary').map(r => ({ date:r.asOf, purpose:r.purpose, tone:r.phase.tone, summary:r.phase.summary.en })) })) }, null, 2));
