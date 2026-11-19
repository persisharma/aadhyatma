/**
 * The Panchang must not depend on the phone's time zone.
 *
 * Every location is in India, so a civil date and a clock time mean India's
 * (`civilTime.ts`). Before Nov 2026 the engine anchored a date to the DEVICE's
 * midnight: on a phone set to a US zone that instant is already past the Indian
 * sunrise, so each date showed the NEXT day's tithi and nakshatra, and clock
 * times were printed in the phone's zone. The rest of this suite runs under
 * `TZ=Asia/Kolkata` and could never see it.
 *
 * This runs one probe per device zone in a child process (`TZ` cannot be
 * changed inside a running process) and requires identical output.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';

const PROBE = path.resolve(process.cwd(), 'src/panchang/__tests__/fixtures/deviceTimeZoneProbe.ts');

type Probe = {
  days: Record<string, { solve: { tithi: { nameEn: string }; nakshatra: { nameEn: string } }; sunriseClock: string }>;
  observances: Record<string, string[]>;
  pitru: Record<string, unknown>;
  today: { iso: string; key: string; label: string; msToNextDay: number }[];
};

function probe(timeZone: string): Promise<Probe> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ['--import', 'tsx', PROBE],
      { env: { ...process.env, TZ: timeZone }, maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) reject(new Error(`${timeZone}: ${error.message}\n${stderr}`));
        else resolve(JSON.parse(stdout) as Probe);
      }
    );
  });
}

// West of India (the reported case), the prime meridian, and the far east,
// where the phone's date is already a day ahead of India's for most of the day.
const DEVICE_ZONES = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Pacific/Kiritimati'];

test('the Panchang is identical on a phone set to any time zone', async () => {
  const [india, ...others] = await Promise.all(['Asia/Kolkata', ...DEVICE_ZONES].map(probe));

  // The audited day, pinned so the reference itself cannot drift.
  const audited = india.days['ujjain 2026-11-17'];
  assert.equal(audited.solve.tithi.nameEn, 'Ashtami');
  assert.equal(audited.solve.nakshatra.nameEn, 'Dhanishta');
  assert.equal(audited.sunriseClock, '06:41');
  assert.ok(india.observances['ujjain 2026 purnimant'].length > 100, 'the live year resolved');
  assert.deepEqual(india.today.map((t) => t.key), ['2026-11-17', '2026-11-18', '2026-11-18', '2027-01-01']);

  DEVICE_ZONES.forEach((zone, i) => {
    const device = others[i];
    for (const key of Object.keys(india.days)) {
      assert.deepEqual(device.days[key], india.days[key], `${zone}: day ${key}`);
    }
    for (const key of Object.keys(india.observances)) {
      assert.deepEqual(device.observances[key], india.observances[key], `${zone}: observances ${key}`);
    }
    assert.deepEqual(device.pitru, india.pitru, `${zone}: Pitru Paksha`);
    assert.deepEqual(device.today, india.today, `${zone}: civil today`);
  });
});
