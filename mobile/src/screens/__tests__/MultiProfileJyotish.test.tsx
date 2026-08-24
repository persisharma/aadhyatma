/**
 * Multi-person Jyotish — the "whose chart is this" switcher (design.md §51a).
 *
 * These run against the REAL roster store (only navigation and the share
 * pipeline are mocked), because the behaviour worth pinning is the join between
 * the store and the screens: that a second person does not overwrite the first,
 * that switching person moves the chart AND the daily guidance, and that removing
 * one of several people lands on a survivor instead of the blank create form.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import {
  computeKundali,
  RASHI_NAMES_EN,
  type KundaliChart,
} from '@/panchang/kundali';
import {
  addPerson,
  __resetBirthProfileStoreForTests,
} from '@/panchang/birthProfileStore';
import { MAX_PEOPLE, birthProfileToInput, type BirthProfile } from '@/panchang/birthProfiles';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn(), addListener: jest.fn(() => jest.fn()) };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => {
  const react = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      react.createElement(View, props, children),
  };
});

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('file://jyotish-share.png')),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

const KundaliScreen = jest.requireActual<typeof import('../KundaliScreen')>('../KundaliScreen').default;
const RashifalScreen = jest.requireActual<typeof import('../RashifalScreen')>('../RashifalScreen').default;

const AARAV: BirthProfile = { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' };
const MEERA: BirthProfile = { name: 'Meera', date: '1996-02-03', time: '19:10', cityId: 'jaipur' };

const moonSign = (profile: BirthProfile): string => {
  const chart: KundaliChart = computeKundali(birthProfileToInput(profile));
  const moon = chart.grahas.find((position) => position.graha === 'moon')!;
  return RASHI_NAMES_EN[moon.rashiIndex];
};

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>
    );
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

async function press(tree: TestRenderer.ReactTestRenderer, accessibilityLabel: string) {
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel }).props.onPress();
  });
}

const kundaliScreen = (
  <KundaliScreen
    navigation={mockNavigation as never}
    route={{ key: 'Kundali-test', name: 'Kundali' } as never}
  />
);

const rashifalScreen = (
  <RashifalScreen
    navigation={mockNavigation as never}
    route={{ key: 'Rashifal-test', name: 'Rashifal', params: undefined } as never}
  />
);

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetBirthProfileStoreForTests();
  mockNavigation.navigate.mockClear();
});

test('the two fixtures really have different Moon signs — otherwise the switch proves nothing', () => {
  expect(moonSign(AARAV)).not.toBe(moonSign(MEERA));
});

test('Kundali: the switcher lists every saved person and moves the chart between them', async () => {
  await addPerson(AARAV);
  await addPerson(MEERA); // adding selects, so Meera's chart is the one open

  const tree = render(kundaliScreen);
  expect(tree.root.findByProps({ accessibilityLabel: 'Person switcher' })).toBeTruthy();
  const meeraChip = tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Meera' });
  expect(meeraChip.props.accessibilityState.selected).toBe(true);
  expect(textOf(tree)).toContain('Meera');

  await press(tree, 'Show Kundali for Aarav');
  expect(
    tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Aarav' }).props.accessibilityState
      .selected
  ).toBe(true);
  const body = textOf(tree);
  expect(body).toContain('Aarav');
  expect(body).toContain(moonSign(AARAV));
  act(() => tree.unmount());
});

test('Kundali: + Add opens a BLANK form beside the saved people and cancels back to the chart', async () => {
  await addPerson(AARAV);
  const tree = render(kundaliScreen);
  expect(textOf(tree)).toContain('Aarav');

  await press(tree, 'Add another person');
  const adding = textOf(tree);
  // Distinct copy: this is an additional chart, not a rewrite of the saved one.
  expect(adding).toContain('Add another Kundali');
  expect(adding).toContain('The charts you already saved stay as they are');
  // A blank form — the active person's details must not be copied in.
  expect(tree.root.findByProps({ testID: 'kundali-date-input' }).props.children).toBeTruthy();
  expect(tree.root.findByProps({ accessibilityLabel: 'Birth name' }).props.value).toBe('');
  // No selected chip while the draft belongs to nobody yet.
  expect(
    tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Aarav' }).props.accessibilityState
      .selected
  ).toBe(false);
  // Removal is not offered for a person who does not exist yet.
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Remove saved birth details' })).toHaveLength(0);

  await press(tree, 'Cancel editing');
  expect(textOf(tree)).toContain('Aarav');
  expect(
    tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Aarav' }).props.accessibilityState
      .selected
  ).toBe(true);
  act(() => tree.unmount());
});

test('Kundali: removing one of two people lands on the survivor, not the blank form', async () => {
  await addPerson(AARAV);
  await addPerson(MEERA);
  const tree = render(kundaliScreen);

  await press(tree, 'Edit birth details');
  await press(tree, 'Remove saved birth details');

  const body = textOf(tree);
  expect(body).toContain('Aarav');
  expect(body).not.toContain('Create your Kundali');
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Show Kundali for Meera' })).toHaveLength(0);
  expect(
    tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Aarav' }).props.accessibilityState
      .selected
  ).toBe(true);
  act(() => tree.unmount());
});

test('Kundali: removing the LAST person returns the blank create form', async () => {
  await addPerson(AARAV);
  const tree = render(kundaliScreen);

  await press(tree, 'Edit birth details');
  await press(tree, 'Remove saved birth details');

  expect(textOf(tree)).toContain('Create your Kundali');
  // Nobody left to switch to, so the switcher disappears with them.
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Person switcher' })).toHaveLength(0);
  act(() => tree.unmount());
});

test('Rashifal: switching person adopts THAT person’s natal Moon sign and says whose it is', async () => {
  await addPerson(AARAV);
  await addPerson(MEERA);

  const tree = render(rashifalScreen);
  let body = textOf(tree);
  expect(body).toContain('From Meera’s Kundali');
  expect(body).toContain(moonSign(MEERA));

  await press(tree, 'Show Rashifal for Aarav');
  body = textOf(tree);
  expect(body).toContain('From Aarav’s Kundali');
  expect(body).toContain(moonSign(AARAV));
  // Still guidance, never certainty — the shipped framing survives the switch.
  expect(body).toContain('not a certain prediction');
  act(() => tree.unmount());
});

test('Kundali: at the cap the add chip is replaced by a sentence, not a failing save', async () => {
  for (let index = 0; index < MAX_PEOPLE; index += 1) {
    await addPerson({ ...AARAV, name: `Person ${index + 1}` });
  }
  const tree = render(kundaliScreen);

  expect(tree.root.findAllByProps({ accessibilityLabel: 'Add another person' })).toHaveLength(0);
  expect(textOf(tree)).toContain(`Up to ${MAX_PEOPLE} people can be saved`);
  // Everyone saved is still reachable — the cap hides the door, not the roster.
  expect(tree.root.findByProps({ accessibilityLabel: 'Show Kundali for Person 1' })).toBeTruthy();
  expect(tree.root.findByProps({ accessibilityLabel: `Show Kundali for Person ${MAX_PEOPLE}` })).toBeTruthy();
  act(() => tree.unmount());
});

/**
 * PanchangScreen is not rendered under Jest (it is source-inspected in
 * KundaliExperience for the same reason — it pulls the whole panchang stack), so
 * the landing's switcher position is pinned structurally: the chips must sit
 * ABOVE the Rashifal block they change, not below it.
 */
test('Jyotish landing: the switcher renders above the guidance it changes', () => {
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'PanchangScreen.tsx'), 'utf8');

  const switcher = source.indexOf('labelEn="Whose Jyotish"');
  const rashifalBlock = source.indexOf("sectionLabel('आज का राशिफल', 'Today’s Rashifal')");
  const glanceCard = source.indexOf("sectionLabel('आपकी कुंडली', 'Your Kundali')");

  expect(switcher).toBeGreaterThan(-1);
  expect(rashifalBlock).toBeGreaterThan(switcher);
  expect(glanceCard).toBeGreaterThan(switcher);
  // The landing's + जोड़ें chip opens the blank add form, never the edit form.
  expect(source).toContain("rootNav.navigate('Kundali', { newPerson: true })");
});

test('Rashifal: with a single person the switcher is absent and the wording stays "your Kundali"', async () => {
  await addPerson(AARAV);
  const tree = render(rashifalScreen);
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Person switcher' })).toHaveLength(0);
  const body = textOf(tree);
  expect(body).toContain('From your Kundali');
  expect(body).not.toContain('From Aarav’s Kundali');
  act(() => tree.unmount());
});
