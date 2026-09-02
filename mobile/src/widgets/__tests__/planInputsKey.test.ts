import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { widgetPlanInputsKey, type WidgetPlanInputs } from '../planInputsKey';
import { DEFAULT_LOCATION } from '@/panchang/locations';

const base: WidgetPlanInputs = {
  buildFingerprint: 'embedded|1.4.6|1.4.6|46',
  locale: 'hi',
  location: DEFAULT_LOCATION,
  calendarSystem: 'purnimant',
  deviceTimeZone: 'Asia/Kolkata',
  // 06:30 UTC = 12:00 IST on 10 Aug.
  generatedAt: new Date('2026-08-10T06:30:00Z'),
  activity: {},
  lastUsedMantraId: undefined,
};

test('the same inputs at a different instant of the same civil day fingerprint identically', () => {
  const a = widgetPlanInputsKey(base);
  const b = widgetPlanInputsKey({ ...base, generatedAt: new Date('2026-08-10T15:00:00Z') });
  assert.equal(a, b);
  // Compact enough to live in one AsyncStorage value indefinitely.
  assert.ok(a.length < 200, `key is ${a.length} chars`);
});

test('every input the planner reads moves the key', () => {
  const key = widgetPlanInputsKey(base);
  const variants: Partial<WidgetPlanInputs>[] = [
    { buildFingerprint: 'ota-abc|1.4.6|1.4.6|46' },
    { locale: 'en' },
    { location: { ...DEFAULT_LOCATION, cityId: 'delhi', latitude: 28.6139, longitude: 77.209 } },
    { calendarSystem: 'amanta' },
    { deviceTimeZone: 'America/Los_Angeles' },
    // Past midnight IST (18:30 UTC = 00:00 IST next day) — the panchang window moves.
    { generatedAt: new Date('2026-08-10T18:30:00Z') },
    { activity: { '2026-08-10': { reads: {}, japa: { 'om-namah-shivaya': { beads: 5, rounds: 0 } } } } },
    { lastUsedMantraId: 'hare-krishna' },
  ];
  for (const variant of variants) {
    assert.notEqual(widgetPlanInputsKey({ ...base, ...variant }), key, JSON.stringify(Object.keys(variant)));
  }
});

test('a device-zone midnight moves the key even when the IST day has not', () => {
  // 17:00 UTC 10 Aug = 22:30 IST 10 Aug = 10:00 PDT 10 Aug.
  const before = widgetPlanInputsKey({ ...base, deviceTimeZone: 'America/Los_Angeles', generatedAt: new Date('2026-08-10T17:00:00Z') });
  // 08:00 UTC 11 Aug = 13:30 IST 11 Aug = 01:00 PDT 11 Aug — both days rolled.
  // Hold IST still instead: 06:00 UTC 11 Aug = 11:30 IST 11 Aug = 23:00 PDT 10 Aug.
  const istRolledOnly = widgetPlanInputsKey({ ...base, deviceTimeZone: 'America/Los_Angeles', generatedAt: new Date('2026-08-11T06:00:00Z') });
  assert.notEqual(before, istRolledOnly);
  // 07:30 UTC 11 Aug = 13:00 IST 11 Aug = 00:30 PDT 11 Aug — device day rolled, IST day unchanged from the line above.
  const deviceRolled = widgetPlanInputsKey({ ...base, deviceTimeZone: 'America/Los_Angeles', generatedAt: new Date('2026-08-11T07:30:00Z') });
  assert.notEqual(istRolledOnly, deviceRolled);
});

test('the coordinator consults the inputs key before importing the planner', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/widgets/WidgetCoordinator.tsx'), 'utf8');
  const skip = source.indexOf('widgetPlanInputsKey(');
  const plan = source.indexOf("await import('./planPayload')");
  assert.ok(skip > 0 && plan > 0 && skip < plan, 'the inputs key must be computed and compared before the dynamic import');
  // Written only once native holds the payload — a failed/absent write must keep re-planning.
  assert.match(source, /if \(result !== 'native'[^)]*\) return;\s*\n\s*await AsyncStorage\.setItem\(LAST_PLAN_KEY/);
});
