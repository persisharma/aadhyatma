import test from 'node:test';
import assert from 'node:assert/strict';
import { computePanchangForDate, computePanchangForDateSteps, computeTithiAndMonth, computeTithiAndMonthSteps } from '../engine';
import { runInBackground } from '../backgroundWork';

test('cooperative calculations preserve exact dates and end times for both calendars and time zones', async () => {
  for (const calendarSystem of ['amanta', 'purnimant'] as const) {
    for (const civilTimeZone of [undefined, 'Asia/Kolkata']) {
      for (const date of [new Date(2026, 4, 22), new Date(2026, 6, 10), new Date(2026, 11, 31)]) {
        const options = { calendarSystem, civilTimeZone, location: { latitude: 12.9716, longitude: 77.5946, elevation: 920 } };
        const p = await runInBackground(computePanchangForDateSteps(date, options));
        assert.deepEqual(p, computePanchangForDate(date, options));
        const t = await runInBackground(computeTithiAndMonthSteps(date, options));
        assert.deepEqual(t, computeTithiAndMonth(date, options));
      }
    }
  }
});

test('a queued callback interrupts a numerical search spanning multiple time slices', async (t) => {
  // A fast machine may finish the real search within one legitimate 4 ms slice.
  // Advance the clock per check so this exercises interruption, not CPU speed.
  let elapsed = 0;
  t.mock.method(performance, 'now', () => (elapsed += 5));
  let completed = false;
  let cancelled = false;
  const work = computePanchangForDateSteps(new Date(2031, 7, 1));
  // Consume sunrise only: the old whole-day primitive would already be done.
  assert.equal(work.next().done, false);
  const pending = runInBackground(work, () => cancelled).then(value => { completed = true; return value; });
  await new Promise<void>(resolve => setTimeout(() => {
    assert.equal(completed, false);
    cancelled = true;
    resolve();
  }, 0));
  assert.equal(await pending, undefined);
});
