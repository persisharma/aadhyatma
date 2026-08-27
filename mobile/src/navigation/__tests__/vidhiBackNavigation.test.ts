import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * PRD-19 back-navigation contract.
 *
 * The vidhi flow used to live only on the Panchang stack, so Home's DISCOVER
 * card, the search rows and routine items all reached it with a cross-tab
 * `navigate('PanchangTab', …)`. Back from the catalog then popped to the
 * Panchang calendar — a tab the user never chose, and one whose default
 * (calendar) mode carries no vidhi door to re-enter from. Registering the three
 * screens on all three entry stacks lets every door push in place, so back retraces the
 * journey it started.
 *
 * These are source assertions rather than a mounted navigator: the Home stack
 * pulls in ~50 reader screens, and the contract worth pinning is *which stack
 * each door pushes on*, which the source states directly.
 */

const src = (...rel: string[]) => fs.readFileSync(path.resolve(__dirname, '..', ...rel), 'utf8');

const VIDHI_ROUTES = ['VidhiCatalog', 'VidhiDetail', 'VidhiConduct'] as const;

describe('vidhi back navigation', () => {
  test('all three entry stacks register the whole vidhi flow', () => {
    const home = src('HomeStackNavigator.tsx');
    const panchang = src('PanchangStackNavigator.tsx');
    const more = src('MoreStackNavigator.tsx');
    for (const route of VIDHI_ROUTES) {
      expect(home).toContain(`name="${route}"`);
      expect(panchang).toContain(`name="${route}"`);
      expect(more).toContain(`name="${route}"`);
    }
  });

  test('one shared param list keeps the three registrations in sync', () => {
    const types = src('types.ts');
    expect(types).toMatch(/export type VidhiStackParamList = \{/);
    expect(types).toMatch(/export type HomeStackParamList = VidhiStackParamList &/);
    expect(types).toMatch(/export type PanchangStackParamList = VidhiStackParamList &/);
    expect(types).toMatch(/export type MoreStackParamList = VidhiStackParamList &/);
    // The routes must be declared once, in the shared type only.
    for (const route of VIDHI_ROUTES) {
      expect(types.match(new RegExp(`^\\s*${route}:`, 'gm'))).toHaveLength(1);
    }
  });

  test('the vidhi screens type against the shared list, not one stack', () => {
    for (const screen of ['VidhiCatalogScreen', 'VidhiDetailScreen', 'VidhiConductScreen']) {
      const source = src('..', 'screens', `${screen}.tsx`);
      expect(source).toContain('NativeStackScreenProps<VidhiStackParamList,');
      expect(source).not.toContain('PanchangStackParamList');
    }
  });

  test('Home-side doors push in place instead of jumping to the Panchang tab', () => {
    const home = src('..', 'screens', 'HomeScreen.tsx');
    expect(home).toMatch(/key: 'puja-vidhi'/);
    expect(home).toMatch(/onPress: \(\) => navigation\.navigate\('VidhiCatalog'\)/);

    const search = src('..', 'screens', 'SearchScreen.tsx');
    expect(search).toMatch(/navigation\.navigate\('VidhiDetail', \{ vidhiId: sourceId \}\)/);

    const entryRoutes = src('entryRoutes.ts');
    expect(entryRoutes).toMatch(/nav\.navigate\('VidhiDetail', \{ vidhiId: item\.sourceId \}\)/);

    for (const source of [home, search, entryRoutes]) {
      expect(source).not.toMatch(/panchangTabTarget\('Vidhi/);
    }
  });

  test('the Panchang-side doors still push within the Panchang stack', () => {
    const panchang = src('..', 'screens', 'PanchangScreen.tsx');
    expect(panchang).toMatch(/navigate\('VidhiCatalog'\)/);
    expect(panchang).toMatch(/navigate\('VidhiDetail', \{ vidhiId, dateMs \}\)/);
    expect(src('..', 'screens', 'ObservanceDetailScreen.tsx')).toMatch(
      /navigation\.navigate\('VidhiDetail'/
    );
  });

  test('the personal Gita hand-off stays on More so Back returns to conduct', () => {
    const more = src('MoreStackNavigator.tsx');
    const types = src('types.ts');
    expect(more).toContain('name="GitaReader"');
    expect(more).toContain("import GitaReaderScreen from '@/screens/GitaReaderScreen'");
    expect(types).toMatch(/export type MoreStackParamList = VidhiStackParamList & \{[\s\S]*GitaReader: GitaReaderParams;/);
  });
});
