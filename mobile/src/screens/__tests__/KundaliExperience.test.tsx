import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import {
  computeKundali,
  getCurrentDasha,
  RASHI_NAMES_EN,
  RASHI_NAMES_WESTERN,
} from '@/panchang/kundali';
import {
  birthProfileToInput,
  parseStoredBirthProfile,
  validateBirthProfile,
} from '@/panchang/useKundali';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockProfile = {
  name: 'Aarav',
  date: '1992-08-14',
  time: '05:42',
  cityId: 'ujjain',
};

const mockChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('file://jyotish-share.png')),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// One saved person — the shipped single-profile shape, now expressed as a
// one-entry roster. The multi-person behaviour is covered by
// MultiProfileJyotish.test.tsx against the real store.
const mockPerson = { id: 'p-test-1', ...mockProfile };

jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => ({
    profile: mockPerson,
    chart: mockChart,
    hydrated: true,
    loadState: 'saved',
    people: [mockPerson],
    activeId: mockPerson.id,
    activePerson: mockPerson,
    canAddPerson: true,
    saveProfile: jest.fn(),
    clearProfile: jest.fn(),
    reloadProfile: jest.fn(),
    selectPerson: jest.fn(),
    addPerson: jest.fn(),
    updatePerson: jest.fn(),
    removePerson: jest.fn(),
  }),
}));

const KundaliScreen = jest.requireActual<typeof import('../KundaliScreen')>(
  '../KundaliScreen'
).default;
const RashifalScreen = jest.requireActual<typeof import('../RashifalScreen')>(
  '../RashifalScreen'
).default;

const renderedTrees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => renderedTrees.splice(0).forEach((tree) => tree.unmount()));
  jest.useRealTimers();
});

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>
    );
  });
  renderedTrees.push(tree);
  return tree;
}

function periodDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('Kundali result leads with plain-language insights and exposes all expert tabs', () => {
  const tree = render(
    <KundaliScreen
      navigation={mockNavigation as any}
      route={{ key: 'Kundali-test', name: 'Kundali' } as any}
    />
  );

  let text = textOf(tree);
  assert.ok(text.includes('Understand your chart first'));
  assert.ok(text.includes('not certain predictions'));
  assert.ok(text.includes('Aarav'));

  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Overview tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Chart tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Grahas tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Dasha tab' }));

  act(() => {
    tree.root.findByProps({
      accessibilityLabel: `${['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'][mockChart.lagnaRashiIndex]} Lagna · ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][mockChart.lagnaRashiIndex]} rising. Learn more in chart.`,
    }).props.onPress();
  });
  assert.equal(
    tree.root.findByProps({ accessibilityLabel: 'Chart tab' }).props.accessibilityState.selected,
    true
  );

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Overview tab' }).props.onPress();
  });
  const moon = mockChart.grahas.find((position) => position.graha === 'moon')!;
  act(() => {
    tree.root.findByProps({
      accessibilityLabel: `${['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'][moon.rashiIndex]} Moon · ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][moon.rashiIndex]}. Learn more in grahas.`,
    }).props.onPress();
  });
  assert.equal(
    tree.root.findByProps({ accessibilityLabel: 'Grahas tab' }).props.accessibilityState.selected,
    true
  );

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Grahas tab' }).props.onPress();
  });
  text = textOf(tree);
  assert.ok(text.includes('Graha positions'));
  assert.ok(text.includes('House'));

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Dasha tab' }).props.onPress();
  });
  text = textOf(tree);
  assert.ok(text.includes('Vimshottari Dasha'));
  assert.ok(text.includes('not an event guarantee'));
  // PRD-20 Phase 4: the period reading sits above the timeline, structural only.
  assert.ok(text.includes('Reading this period'));
  assert.ok(text.includes('Tradition links'));
  assert.ok(text.includes('tradition reads this period’s themes through that placement'));
  assert.ok(text.includes('CURRENT PERIOD'));
  assert.ok(text.includes('elapsed'));
  assert.ok(text.includes('left'));
  assert.ok(text.includes('Now'));
  // Two levels are both "Now" at once (e.g. Rahu chip inside a Mercury
  // Mahadasha row), so each level must be visibly named or the pair reads
  // as a contradiction.
  assert.ok(text.includes('The nine Antardashas within this Mahadasha'));
  assert.ok(text.includes('MAHADASHA TIMELINE'));
  assert.ok(tree.root.findByProps({ testID: 'dasha-progress-maha' }));
  assert.ok(tree.root.findByProps({ testID: 'dasha-progress-antar' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Full Mahadasha timeline' }));
  const currentDashaLabel = tree.root.findAll((node) =>
    typeof node.props.accessibilityLabel === 'string'
    && node.props.accessibilityLabel.startsWith('Current Dasha,')
  );
  assert.ok(currentDashaLabel.length > 0);

  // Both nested periods run at once, so the card shows each with its own
  // dates and progress — a Rahu Antardasha once read as the full 17-year
  // Mercury window because a single unlabelled bar tracked the Mahadasha.
  const dasha = getCurrentDasha(mockChart, new Date())!;
  assert.ok(dasha.antar);
  const label = currentDashaLabel[0].props.accessibilityLabel as string;
  assert.ok(
    label.includes(
      `Mahadasha ${periodDate(dasha.maha.start)} to ${periodDate(dasha.maha.end)}`
    )
  );
  assert.ok(
    label.includes(
      `Antardasha ${periodDate(dasha.antar!.start)} to ${periodDate(dasha.antar!.end)}`
    )
  );
  assert.ok(text.includes(periodDate(dasha.antar!.end)));

  const spanOf = (period: { start: Date; end: Date }) =>
    (Date.now() - period.start.getTime()) / (period.end.getTime() - period.start.getTime());
  const barValue = (testID: string) =>
    tree.root.findByProps({ testID }).props.accessibilityValue.now as number;
  assert.ok(Math.abs(barValue('dasha-progress-maha') - Math.round(spanOf(dasha.maha) * 100)) <= 1);
  assert.ok(Math.abs(barValue('dasha-progress-antar') - Math.round(spanOf(dasha.antar!) * 100)) <= 1);
  // A Mahadasha always spans all nine of its Antardashas, so the two bars are
  // genuinely different measurements — each must track its own window.
  assert.ok(
    dasha.antar!.end.getTime() - dasha.antar!.start.getTime()
    < dasha.maha.end.getTime() - dasha.maha.start.getTime()
  );

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Share your Kundali' }).props.onPress();
  });
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Share your Kundali image preview' }));
  assert.ok(textOf(tree).includes('Review it before sharing'));
});

test('Daily Rashifal uses the saved Moon sign and remains guidance, not certainty', () => {
  const tree = render(
    <RashifalScreen
      navigation={mockNavigation as any}
      route={{ key: 'Rashifal-test', name: 'Rashifal', params: undefined } as any}
    />
  );

  const moon = mockChart.grahas.find((position) => position.graha === 'moon')!;
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Change Moon sign' }).props.onPress();
  });
  const selected = tree.root.findByProps({
    accessibilityLabel: `${RASHI_NAMES_EN[moon.rashiIndex]}, ${RASHI_NAMES_WESTERN[moon.rashiIndex]} Moon sign`,
  });
  assert.equal(selected.props.accessibilityState.selected, true);

  act(() => tree.root.findByProps({ testID: 'rashifal-summary-toggle' }).props.onPress());
  const text = textOf(tree);
  assert.ok(text.includes('not a certain prediction'));
  assert.ok(text.includes('Favour'));
  assert.ok(text.includes('Pause'));
  assert.ok(text.includes('Reflect'));
  assert.ok(text.includes('bhava'));
  assert.ok(text.includes('Aquarius') || text.includes('Aries') || text.includes('Taurus')
    || text.includes('Gemini') || text.includes('Cancer') || text.includes('Leo')
    || text.includes('Virgo') || text.includes('Libra') || text.includes('Scorpio')
    || text.includes('Sagittarius') || text.includes('Capricorn') || text.includes('Pisces'));

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Share today’s Rashifal' }).props.onPress();
  });
  assert.ok(
    tree.root.findAll((node) =>
      typeof node.props.accessibilityLabel === 'string'
      && node.props.accessibilityLabel.endsWith('Rashifal image preview')
    ).length > 0
  );
  assert.ok(textOf(tree).includes('No name or birth details are included'));
});

test('personal reading layers only on the natal Moon sign, never on a manual pick', () => {
  const tree = render(
    <RashifalScreen
      navigation={mockNavigation as any}
      route={{ key: 'Rashifal-test', name: 'Rashifal', params: undefined } as any}
    />
  );

  const moon = mockChart.grahas.find((position) => position.graha === 'moon')!;
  act(() => tree.root.findByProps({ testID: 'rashifal-summary-toggle' }).props.onPress());
  let text = textOf(tree);
  assert.ok(text.includes('Personal reading'), 'natal selection carries the personal chip');
  assert.ok(text.includes('Tara bala'), 'natal selection shows tara bala');
  assert.ok(text.includes('from Lagna'), 'natal selection shows dual house context');

  // Pick a different sign manually — every personal extra must disappear.
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Change Moon sign' }).props.onPress();
  });
  const otherIndex = (moon.rashiIndex + 1) % 12;
  act(() => {
    tree.root
      .findByProps({
        accessibilityLabel: `${RASHI_NAMES_EN[otherIndex]}, ${RASHI_NAMES_WESTERN[otherIndex]} Moon sign`,
      })
      .props.onPress();
  });
  text = textOf(tree);
  assert.ok(!text.includes('Personal reading'));
  assert.ok(!text.includes('Tara bala'));
  assert.ok(!text.includes('from Lagna'));
  assert.ok(!text.includes('Dasha note'));
});

test('detailed Rashifal expands life areas, explains their basis and shares the selected day without personal data', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-07T10:00:00Z'));
  const tree = render(<RashifalScreen navigation={mockNavigation as any}
    route={{ key: 'Rashifal-detail', name: 'Rashifal' } as any} />);
  const press = (testID: string) => act(() => tree.root.findByProps({ testID }).props.onPress());
  const Reading = jest.requireActual<typeof import('@/components/RashifalLifeAreas')>('@/components/RashifalLifeAreas').default;
  assert.equal(tree.root.findByProps({ testID: 'rashifal-summary-toggle' }).props.accessibilityState.expanded, false);
  assert.ok(tree.root.findByProps({ testID: 'rashifal-body-relationships' }));
  press('rashifal-area-work');
  assert.equal(tree.root.findAllByProps({ testID: 'rashifal-body-relationships' }).length, 0);
  assert.ok(tree.root.findByProps({ testID: 'rashifal-body-work' }));
  press('rashifal-basis-work');
  assert.ok(textOf(tree).includes('from Lagna'));
  const initial = tree.root.findByType(Reading).props.reading;
  assert.equal(initial.dateKey, '2026-09-07');
  press('rashifal-day-1');
  assert.equal(tree.root.findByType(Reading).props.reading.dateKey, '2026-09-08');
  assert.equal(tree.root.findAllByProps({ testID: 'rashifal-body-work' }).length, 0, 'date change resets expansion');
  act(() => tree.root.findByProps({ accessibilityLabel: 'Share selected day’s Rashifal' }).props.onPress());
  const ShareCard = jest.requireActual<typeof import('@/components/JyotishShareCard')>('@/components/JyotishShareCard').default;
  const shared = tree.root.findByType(ShareCard).props;
  assert.equal(shared.guidance.dateKey, '2026-09-08');
  assert.ok(!('taraBala' in shared.guidance));
  assert.ok(!('lagnaRashiIndex' in shared.guidance));
  press('rashifal-day--1');
  assert.equal(tree.root.findByType(Reading).props.reading.dateKey, '2026-09-06');
  assert.equal(tree.root.findAllByType(ShareCard).length, 0, 'changing day closes the share preview');
  act(() => tree.unmount());
  jest.useRealTimers();
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('detailed reading follows the %s script for prose, labels and expanded basis', (lang) => {
  const { computeDetailedRashifal } = jest.requireActual<typeof import('@/panchang/rashifalReading')>('@/panchang/rashifalReading');
  const { meaningByLang, contentByLang } = jest.requireActual<typeof import('@/utils/localize')>('@/utils/localize');
  const Reading = jest.requireActual<typeof import('@/components/RashifalLifeAreas')>('@/components/RashifalLifeAreas').default;
  const reading = computeDetailedRashifal(new Date('2026-09-07T10:00:00Z'), 4);
  const tree = render(<Reading reading={reading} lang={lang} />);
  const area = reading.areas[0];
  assert.ok(textOf(tree).includes(contentByLang(lang, area.title.hi, area.title.en)));
  assert.ok(textOf(tree).includes(meaningByLang(lang, area.body.hi, area.body.en)));
  act(() => tree.root.findByProps({ testID: 'rashifal-basis-relationships' }).props.onPress());
  assert.ok(textOf(tree).includes(meaningByLang(lang, area.evidence[0].description.hi, area.evidence[0].description.en)));
  // Danda punctuation is intentionally shared by Indic scripts.
  if (lang !== 'hi') assert.doesNotMatch(textOf(tree), /[\u0900-\u0963\u0966-\u097f]/);
  act(() => tree.unmount());
});

test('birth profile parsing is strict and converts India wall time to the correct UTC instant', () => {
  assert.deepEqual(validateBirthProfile(mockProfile), {});
  assert.equal(
    birthProfileToInput(mockProfile).date.toISOString(),
    '1992-08-14T00:12:00.000Z'
  );
  assert.equal(
    parseStoredBirthProfile(JSON.stringify({ ...mockProfile, date: '1992-02-30' })),
    null
  );
  assert.deepEqual(parseStoredBirthProfile(JSON.stringify(mockProfile)), mockProfile);
});

test('every PRD-C practice id resolves through the existing reader dispatcher', () => {
  for (const sourceId of ['navagraha-stotram', 'surya-ashtakam', 'shani-ashtakam']) {
    const entry = library.find((candidate) => candidate.id === sourceId);
    assert.ok(entry, `${sourceId} exists`);
    assert.ok(buildEntryStartTarget(entry), `${sourceId} has a reader route`);
  }
});

test('the section segment control is STICKY, above the scrolling content', () => {
  // Stronger than the original "renders first" check: the segment control now
  // sits OUTSIDE the ScrollView, so it cannot scroll away and cannot jump
  // vertically between sections. Panchang renders its own chip row immediately
  // under it, and a segment row that scrolled off would leave that chip row
  // looking like the top of the screen.
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');
  const chromeRow = source.indexOf('<View style={[styles.chromeRow');
  const selector = source.indexOf('ref={panchangSegmentRef}');
  const menuButton = source.indexOf('<AppHeaderMenuButton />');
  // Anchor on the scroller's own ref prop, not '<ScrollView': the latter also
  // matches the `useRef<ScrollView | null>` type annotation further up the file.
  const scrollView = source.indexOf('ref={scrollRef}');
  const contextualHeader = source.indexOf(
    "{section !== 'jyotish' && <View style={styles.systemHeader}>"
  );

  assert.ok(chromeRow >= 0, 'the one row of chrome exists');
  assert.ok(selector >= 0, 'the section segment control exists');
  assert.ok(menuButton >= 0, 'अन्य rides the same chrome row');
  assert.ok(scrollView >= 0, 'the content scroller exists');
  assert.ok(contextualHeader >= 0, 'contextual Panchang controls remain hidden in Jyotish');

  assert.ok(chromeRow < selector, 'the segment control is inside the chrome row');
  assert.ok(selector < menuButton, 'segment control then अन्य — one row, in that order');
  assert.ok(
    menuButton < scrollView,
    'the whole chrome row is OUTSIDE the ScrollView, so the segment control is sticky'
  );
  assert.ok(
    scrollView < contextualHeader,
    'contextual controls scroll with the content, below the sticky chrome'
  );
});
