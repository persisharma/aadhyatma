/** Desktop diagnostic, NOT a Hermes/device latency claim.
 * TZ=Asia/Kolkata node --import tsx scripts/profile-home-startup.mts widget
 * Modes: widget, pitru, pitru-sync (old caller), home, parity.
 * Run each timing mode in a fresh process, without concurrent test runners.
 */
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { planWidgetPayload } from '../src/widgets/planPayload';
import { CITIES, toPanchangLocation } from '../src/panchang/locations';
import { pitruPakshaWindow, pitruPakshaWindowAsync } from '../src/panchang/pitruSmaran';
import { cachedDayInputsAsync } from '../src/panchang/panchangDayStore';
import { computePanchangForDate } from '../src/panchang/engine';

const mode = process.argv[2] ?? 'widget';
const location = toPanchangLocation(CITIES.find(city => city.id === 'bengaluru')!, 'city');

if (mode === 'parity') {
  const hash = createHash('sha256');
  let cases = 0;
  for (const calendarSystem of ['purnimant', 'amanta'] as const) {
    for (const civilTimeZone of [undefined, 'Asia/Kolkata']) {
      for (const city of [location, toPanchangLocation(CITIES.find(c => c.id === 'ujjain')!, 'city')]) {
        for (const [month, day] of [[1, 1], [3, 19], [5, 22], [7, 10], [9, 21], [9, 26], [10, 10], [12, 31]]) {
          hash.update(JSON.stringify(computePanchangForDate(new Date(2026, month - 1, day, 12), { location: city, calendarSystem, civilTimeZone })));
          cases++;
        }
      }
    }
  }
  console.log(JSON.stringify({ cases, sha256: hash.digest('hex') }));
} else {
  let previous = performance.now();
  const start = previous;
  const gaps: number[] = [];
  const timer = setInterval(() => { const now = performance.now(); gaps.push(now - previous); previous = now; }, 1);
  try {
    if (mode === 'widget') {
      await planWidgetPayload({ generatedAt: new Date('2026-09-21T05:00:00Z'), locale: 'hi', location, calendarSystem: 'purnimant', deviceTimeZone: 'Asia/Kolkata', activity: {} });
    } else if (mode === 'pitru-sync') {
      pitruPakshaWindow(2026); pitruPakshaWindow(2027);
    } else if (mode === 'pitru') {
      await pitruPakshaWindowAsync(2026); await pitruPakshaWindowAsync(2027);
    } else if (mode === 'home') {
      const map = new Map();
      for (let offset = -1; offset <= 7; offset++) await cachedDayInputsAsync(map, new Date(2026, 8, 21 + offset), { location, calendarSystem: 'purnimant' });
    } else throw new Error(`Unknown mode: ${mode}`);
    const totalMs = performance.now() - start;
    await new Promise(resolve => setTimeout(resolve, 2));
    console.log(JSON.stringify({ mode, totalMs: Math.round(totalMs), maxEventLoopGapMs: Math.round(Math.max(...gaps)), gapsOver16ms: gaps.filter(gap => gap > 16).length }));
  } finally { clearInterval(timer); }
}
