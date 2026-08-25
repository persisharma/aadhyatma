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

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>
    );
  });
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
  assert.ok(text.includes('CURRENT PERIOD'));
  assert.ok(text.includes('elapsed'));
  assert.ok(text.includes('left'));
  assert.ok(text.includes('Now'));
  assert.ok(tree.root.findByProps({ testID: 'dasha-progress' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Full Mahadasha timeline' }));
  const currentDashaLabel = tree.root.findAll((node) =>
    typeof node.props.accessibilityLabel === 'string'
    && node.props.accessibilityLabel.startsWith('Current Dasha,')
  );
  assert.ok(currentDashaLabel.length > 0);

  // The current-period card is headlined by the Antardasha, so its dates and
  // progress must describe that sub-period — never the Mahadasha span it sits
  // inside (a Rahu Antardasha once read as the full 17-year Mercury window).
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
  const shownProgress = tree.root.findByProps({ testID: 'dasha-progress' }).props
    .accessibilityValue.now as number;
  const antarProgress = Math.round(spanOf(dasha.antar!) * 100);
  assert.ok(Math.abs(shownProgress - antarProgress) <= 1);
  // A Mahadasha always spans all nine of its Antardashas, so the two progress
  // readings are different measurements — the bar must report the shorter one.
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

test('Panchang mode selector stays fixed above contextual controls', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');
  const selector = source.indexOf('ref={panchangSegmentRef}');
  const contextualHeader = source.indexOf(
    "{panchangTab !== 'jyotish' && <View style={styles.systemHeader}>"
  );

  assert.ok(selector >= 0, 'Panchang mode selector exists');
  assert.ok(contextualHeader >= 0, 'contextual Panchang controls remain hidden in Jyotish');
  assert.ok(
    selector < contextualHeader,
    'primary mode selector renders before contextual controls and cannot jump between modes'
  );
});
