/**
 * Back from the Mahadasha guide's practice doors must return to the guide
 * (owner report, Nov 2026: japa → Back landed on Home). The guide lives on the
 * Panchang stack, so every screen its japa / paath / daan doors can open is
 * mounted there too (RULEBOOK §6.0.1 rule 4) and the doors push in place via
 * `navigateToHomeStackTarget`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GRAHA_BEEJ_JAPA_ID } from '@/data/japam/grahaBeej';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { GRAHA_UPAY } from '@/panchang/grahaReadingContent';

const src = (...parts: string[]) => readFileSync(join(__dirname, '..', ...parts), 'utf8');

test('every guide practice target is registered on the Panchang stack', () => {
  const panchang = src('PanchangStackNavigator.tsx');
  const ids = new Set<string>([
    ...Object.values(GRAHA_BEEJ_JAPA_ID),
    ...Object.values(GRAHA_UPAY).map((row) => row.practiceSourceId),
  ]);
  const screens = new Set<string>(['DaanPunya']);
  for (const id of ids) {
    const entry = library.find((candidate) => candidate.id === id);
    expect(entry).toBeDefined();
    const target = buildEntryStartTarget(entry!);
    expect(target).not.toBeNull();
    screens.add(target!.screen);
  }
  // Onward route inside a mounted reader.
  if (screens.has('VishnuSahasranamaChapters')) screens.add('VishnuSahasranamaReader');
  for (const screen of screens) {
    expect(panchang).toContain(`name="${screen}"`);
  }
});

test('the guide and the Dasha tab push practice in place instead of jumping to Home', () => {
  for (const screen of ['DashaGuideScreen', 'KundaliScreen']) {
    const source = src('..', 'screens', `${screen}.tsx`);
    expect(source).toContain('navigateToHomeStackTarget(rootNav, target)');
    expect(source).not.toMatch(/rootNav\.navigate\('HomeTab', target\)/);
  }
  expect(src('..', 'screens', 'DashaGuideScreen.tsx')).not.toMatch(/navigate\('HomeTab', \{ screen: 'DaanPunya' \}\)/);
});
