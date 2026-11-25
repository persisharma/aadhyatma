/**
 * Mahadasha guide (design.md §51e): index → five steps → back, and every action
 * the steps carry. The model is the real `buildDashaGuide` over a fixed chart;
 * only navigation, the profile hook and remote artwork are stubbed.
 */
import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { GRAHA_BEEJ_JAPA_ID } from '@/data/japam/grahaBeej';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { buildDashaGuide } from '@/panchang/dashaGuide';
import { computeKundali, getCurrentDasha } from '@/panchang/kundali';

const mockChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});

// The Panchang stack mounts the guide's practice routes (RULEBOOK §6.0.1), so
// the doors push in place and Back returns to the guide.
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  getState: () => ({ routeNames: ['DashaGuide', 'JapamCounter', 'ChalisaReader', 'AshtakamReader', 'KavachamReader', 'VishnuSahasranamaChapters', 'DaanPunya'] }),
};
let mockPreventEnabled = false;
let mockPreventCallback: ((event: { data: { action: unknown } }) => void) | null = null;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  usePreventRemove: (enabled: boolean, callback: (event: { data: { action: unknown } }) => void) => {
    mockPreventEnabled = enabled;
    mockPreventCallback = callback;
  },
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
// Remote paintings go through the shared cache; the frame, not the fetch, is under test.
jest.mock('@/components/CachedArtwork', () => ({
  __esModule: true,
  default: (props: { style?: any }) => mockReact.createElement(mockView, { testID: 'cached-artwork', style: props.style }),
}));

let mockHasChart = true;
jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => ({ chart: mockHasChart ? mockChart : null, hydrated: true, loadState: mockHasChart ? 'saved' : 'guest' }),
}));

const DashaGuideScreen = jest.requireActual<typeof import('../DashaGuideScreen')>('../DashaGuideScreen').default;

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
  mockNavigation.navigate.mockClear();
  mockNavigation.goBack.mockClear();
  mockNavigation.dispatch.mockClear();
  mockHasChart = true;
});

function render(lord: string, lang: 'en' | 'hi' = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <DashaGuideScreen navigation={mockNavigation as any} route={{ key: 'DashaGuide-test', name: 'DashaGuide', params: { lord } } as any} />
      </GitaLanguageProvider>
    );
  });
  trees.push(tree);
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root.findAllByType(Text).map((node) => {
    const children = node.props.children;
    return Array.isArray(children) ? children.filter((child) => typeof child === 'string' || typeof child === 'number').join('') : typeof children === 'string' || typeof children === 'number' ? String(children) : '';
  }).join('\n');
}

const press = (tree: TestRenderer.ReactTestRenderer, testID: string) =>
  act(() => tree.root.findByProps({ testID }).props.onPress());

const mahaLord = getCurrentDasha(mockChart, new Date())!.maha.lord;
const nextLord = mockChart.vimshottari[mockChart.vimshottari.findIndex((period) => period.lord === mahaLord) + 1].lord;
const endedLord = mockChart.vimshottari[0].lord;

test('the index leads with the period, then five numbered steps; Start opens step 1', () => {
  const tree = render(nextLord);
  const guide = buildDashaGuide(mockChart, nextLord, new Date())!;
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-index-view' }));
  let text = textOf(tree);
  assert.ok(text.includes('Upcoming period'));
  assert.ok(text.includes(guide.datesEn));
  for (let step = 1; step <= 5; step += 1) assert.ok(tree.root.findByProps({ testID: `dasha-guide-step-row-${step}` }));
  assert.equal(mockPreventEnabled, false, 'Back on the index leaves the guide');
  press(tree, 'dasha-guide-start');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-step-1' }));
  text = textOf(tree);
  assert.ok(text.includes('Step 1 of 5'));
  assert.ok(text.includes('nine teachers'));
  assert.equal(mockPreventEnabled, true, 'on a step, Back returns to the index');
});

test('Next walks all five steps, Back steps back, Done leaves for the Dasha tab', () => {
  const tree = render(nextLord);
  press(tree, 'dasha-guide-start');
  for (let step = 2; step <= 5; step += 1) {
    press(tree, 'dasha-guide-next');
    assert.ok(tree.root.findByProps({ testID: `dasha-guide-step-${step}` }), `step ${step}`);
  }
  assert.equal(tree.root.findAllByProps({ testID: 'dasha-guide-next' }).length, 0);
  press(tree, 'dasha-guide-prev');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-step-4' }));
  press(tree, 'dasha-guide-next');
  press(tree, 'dasha-guide-done');
  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  // The leave is let through even though a step is open.
  act(() => mockPreventCallback!({ data: { action: { type: 'GO_BACK' } } }));
  expect(mockNavigation.dispatch).toHaveBeenCalledWith({ type: 'GO_BACK' });
});

test('every Back on a step means "to the index", and the index marks read steps', () => {
  const tree = render(nextLord);
  press(tree, 'dasha-guide-step-row-3');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-step-3' }));
  // Android back / iOS swipe arrive through usePreventRemove.
  act(() => mockPreventCallback!({ data: { action: { type: 'GO_BACK' } } }));
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-index-view' }));
  expect(mockNavigation.dispatch).not.toHaveBeenCalled();
  assert.match(tree.root.findByProps({ testID: 'dasha-guide-step-row-3' }).props.accessibilityLabel, /, read$/);
  press(tree, 'dasha-guide-step-row-2');
  press(tree, 'dasha-guide-back');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-index-view' }));
  press(tree, 'dasha-guide-step-row-4');
  press(tree, 'dasha-guide-index');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-index-view' }));
  press(tree, 'dasha-guide-back');
  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
});

test('step 4 carries the day, daan, seva and mantra, and opens japa, paath and Daan-Punya', () => {
  const tree = render(nextLord);
  const guide = buildDashaGuide(mockChart, nextLord, new Date())!;
  press(tree, 'dasha-guide-step-row-4');
  const text = textOf(tree);
  for (const item of [...guide.daanItems.en, ...guide.sevaItems.en, guide.upay.mantraHi, guide.upay.mantraEn]) {
    assert.ok(text.includes(item), item);
  }
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-day-on' }));
  assert.ok(text.includes('not a fix or a guarantee'));
  for (const cause of guide.daanCauses) assert.ok(text.includes(cause.name.en), cause.id);

  // Every practice door pushes in place on the guide's own stack, so Back
  // returns to step 4 instead of Home's root (owner report, Nov 2026).
  press(tree, 'dasha-guide-chant');
  const beej = library.find((entry) => entry.id === GRAHA_BEEJ_JAPA_ID[nextLord])!;
  const beejTarget = buildEntryStartTarget(beej)!;
  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(beejTarget.screen, beejTarget.params);
  press(tree, 'dasha-guide-paath');
  const paath = library.find((entry) => entry.id === guide.upay.practiceSourceId)!;
  const paathTarget = buildEntryStartTarget(paath)!;
  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(paathTarget.screen, paathTarget.params);
  // The daan door opens the educate-first home, never the directory (RULEBOOK §27.1, §27.13).
  press(tree, 'dasha-guide-open-daan');
  expect(mockNavigation.navigate).toHaveBeenLastCalledWith('DaanPunya', undefined);
  expect(mockNavigation.navigate).not.toHaveBeenCalledWith('HomeTab', expect.anything());
});

test('step 5 answers why, quotes this chart, and opens Prashna only when a purpose fits', () => {
  const tree = render(nextLord);
  const guide = buildDashaGuide(mockChart, nextLord, new Date())!;
  press(tree, 'dasha-guide-step-row-5');
  const text = textOf(tree);
  for (const item of guide.why) assert.ok(text.includes(item.q.en), item.q.en);
  assert.ok(text.includes(guide.chartQuestion.q.en));
  assert.ok(text.includes(guide.chartQuestion.quote.en));
  assert.ok(text.includes(guide.chartQuestion.caveat.en));
  const doors = tree.root.findAll((node) => node.props.testID === 'dasha-guide-prashna' && typeof node.props.onPress === 'function');
  assert.equal(doors.length, guide.chartQuestion.prashnaPurpose ? 1 : 0);
  if (guide.chartQuestion.prashnaPurpose) {
    act(() => doors[0].props.onPress());
    expect(mockNavigation.navigate).toHaveBeenLastCalledWith('Prashna', { purposeId: guide.chartQuestion.prashnaPurpose });
  }
  assert.equal(tree.root.findAllByProps({ testID: 'dasha-guide-basis' }).length, 0);
  press(tree, 'dasha-guide-basis-toggle');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-basis' }));
});

test('the running period shows its progress and its nine Antardashas', () => {
  const tree = render(mahaLord);
  assert.ok(textOf(tree).includes('Current period'));
  assert.ok(tree.root.findAllByProps({ accessibilityRole: 'progressbar' }).length >= 1);
  press(tree, 'dasha-guide-start');
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-antars' }));
  assert.ok(tree.root.findByProps({ testID: `dasha-guide-turn-${mahaLord}` }).props.accessibilityLabel.includes('this period'));
});

test('Hindi renders the same steps in Devanagari', () => {
  const tree = render(nextLord, 'hi');
  assert.ok(textOf(tree).includes('इस मार्गदर्शिका में'));
  press(tree, 'dasha-guide-step-row-2');
  assert.ok(textOf(tree).includes('परम्परा में'));
});

test('an ended period, or no saved chart, shows a plain way back instead of a guide', () => {
  let tree = render(endedLord);
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-unavailable' }));
  assert.equal(tree.root.findAllByProps({ testID: 'dasha-guide-index-view' }).length, 0);
  act(() => trees.splice(0).forEach((entry) => entry.unmount()));
  mockHasChart = false;
  tree = render(nextLord);
  assert.ok(tree.root.findByProps({ testID: 'dasha-guide-unavailable' }));
  press(tree, 'dasha-guide-back');
  expect(mockNavigation.goBack).toHaveBeenCalled();
});
