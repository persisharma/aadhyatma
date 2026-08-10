import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import { calculateGunaMilanFromLongitudes } from '@/panchang/gunaMilan';
import { localizedKootaInput, localizedNakshatraList } from '@/panchang/gunaMilanDisplay';
import { buildGunaMilanShareModel } from '@/panchang/gunaMilanShare';
import {
  GUNA_MILAN_DRAFT_STORAGE_KEY,
  GUNA_MILAN_METRICS_STORAGE_KEY,
  clearRememberedGunaMilanDraft,
  incrementGunaMilanMetric,
  parseStoredGunaMilanDraft,
  saveRememberedGunaMilanDraft,
} from '@/panchang/gunaMilanState';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
const mockProfile = { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' };

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve('file://guna-milan.png')) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(() => Promise.resolve(true)), shareAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-svg', () => {
  const Svg = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => mockReact.createElement(mockView, props, children);
  return { __esModule: true, default: Svg, Circle: (props: Record<string, unknown>) => mockReact.createElement(mockView, props) };
});
jest.mock('@/panchang/useKundali', () => ({ useKundali: () => ({ profile: mockProfile, chart: null, hydrated: true, loadState: 'saved' }) }));

const GunaMilanScreen = jest.requireActual<typeof import('../GunaMilanScreen')>('../GunaMilanScreen').default;

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <GunaMilanScreen navigation={mockNavigation as any} route={{ key: 'GunaMilan-test', name: 'GunaMilan' } as any} />
      </GitaLanguageProvider>
    );
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
}

test('saved Kundali details can fill either role and exact rows expose expansion state', async () => {
  const tree = render();
  const button = (label: string) => tree.root.findAll((node) => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function')[0];
  assert.ok(button('Use my saved Kundali details for Groom'));
  assert.ok(button('Use my saved Kundali details for Bride'));

  act(() => button('Use my saved Kundali details for Groom').props.onPress());
  act(() => button('Use my saved Kundali details for Bride').props.onPress());
  act(() => button('Calculate Guna Milan').props.onPress());

  assert.ok(tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && /^Guna Milan result, .* out of 36$/.test(node.props.accessibilityLabel)).length > 0);
  const expectedInputs = new Map([
    ['Varna', 'Shudra'],
    ['Vashya', 'Human'],
    ['Tara', 'Dhanishta'],
    ['Yoni', 'Lion'],
    ['Graha Maitri', 'Saturn'],
    ['Gana', 'Rakshasa'],
    ['Bhakoot', 'Kumbha'],
    ['Nadi', 'Madhya'],
  ]);
  for (const [label, expected] of expectedInputs) {
    const row = tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith(`${label},`))[0];
    assert.equal(row.props.accessibilityState.expanded, false);
    act(() => row.props.onPress());
    const openRow = tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith(`${label},`))[0];
    assert.equal(openRow.props.accessibilityState.expanded, true);
    assert.ok(textOf(tree).includes(`Groom: ${expected} · Bride: ${expected}`), label);
  }
  for (const raw of ['shudra', 'manava', 'lion', 'saturn', 'rakshasa', 'madhya', 'Groom: 22', 'Groom: 10']) {
    assert.ok(!textOf(tree).includes(raw), raw);
  }

  act(() => button('Preview privacy-safe Guna Milan share card').props.onPress());
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Share Guna Milan image preview' }));
  const text = textOf(tree);
  assert.ok(text.includes('Birth date, time, and other private details are excluded'));
  assert.ok(!text.includes('1992-08-14'));
  assert.ok(!text.includes('05:42'));
  assert.ok(!text.includes('Ujjain'));
});

test('unknown time shows a range and never exposes exact sharing', () => {
  const tree = render();
  const set = (label: string, value: string) => act(() => tree.root.findByProps({ accessibilityLabel: label }).props.onChangeText(value));
  set('Groom birth date, YYYY-MM-DD', '1968-03-13');
  set('Groom birth time, 24 hour IST', '08:00');
  set('Bride birth date, YYYY-MM-DD', '1970-01-15');
  act(() => tree.root.findByProps({ accessibilityLabel: 'Bride birth time unknown' }).props.onPress());
  act(() => tree.root.findByProps({ accessibilityLabel: 'Calculate Guna Milan' }).props.onPress());

  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Guna Milan score range, 19 to 20 out of 36' }));
  assert.ok(textOf(tree).includes('Exact time needed'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Bride possible nakshatras: Ashwini · Bharani' }));
  assert.equal(tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith('Groom possible nakshatras:')).length, 0);
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: 'Preview privacy-safe Guna Milan share card' }).length, 0);
});

test('unknown time also names possible nakshatras when every score stays exact', () => {
  const tree = render();
  const set = (label: string, value: string) => act(() => tree.root.findByProps({ accessibilityLabel: label }).props.onChangeText(value));
  set('Groom birth date, YYYY-MM-DD', '1968-03-13');
  set('Groom birth time, 24 hour IST', '08:00');
  set('Bride birth date, YYYY-MM-DD', '1970-02-07');
  act(() => tree.root.findByProps({ accessibilityLabel: 'Bride birth time unknown' }).props.onPress());
  act(() => tree.root.findByProps({ accessibilityLabel: 'Calculate Guna Milan' }).props.onPress());

  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Guna Milan result, 25.5 out of 36' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Bride possible nakshatras: Dhanishta · Shatabhisha' }));
  assert.ok(textOf(tree).includes('Same result across every checked IST time'));
  const tara = tree.root.findAll((node) => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith('Tara,'))[0];
  act(() => tara.props.onPress());
  assert.ok(textOf(tree).includes('Bride: Dhanishta · Shatabhisha'));
});

test('Guna inputs and possible nakshatras are localized in every reading script', () => {
  const classification = calculateGunaMilanFromLongitudes(303.95, 303.95).groom;
  assert.equal(localizedKootaInput('tara', classification, 'hi'), 'धनिष्ठा');
  assert.equal(localizedKootaInput('bhakoot', classification, 'en'), 'Kumbha');
  assert.match(localizedKootaInput('yoni', classification, 'gu'), /[\u0A80-\u0AFF]/);
  assert.match(localizedKootaInput('gana', classification, 'kn'), /[\u0C80-\u0CFF]/);
  assert.equal(localizedNakshatraList([0, 1], 'en'), 'Ashwini · Bharani');
  assert.equal(localizedNakshatraList([0, 1], 'hi'), 'अश्विनी · भरणी');
});

test('back control returns to Jyotish', () => {
  const tree = render();
  act(() => tree.root.findByProps({ accessibilityLabel: 'Back to Jyotish' }).props.onPress());
  assert.equal(mockNavigation.goBack.mock.calls.length > 0, true);
});

test('storage parser is versioned, opt-in only, and rejects fabricated or corrupt values', () => {
  const draft = {
    groom: { name: 'A', date: '2000-01-01', time: '12:00' },
    bride: { date: '2001-02-03', time: null },
  };
  assert.deepEqual(parseStoredGunaMilanDraft(JSON.stringify({ version: 1, remember: true, draft })), draft);
  assert.equal(parseStoredGunaMilanDraft(JSON.stringify({ version: 1, remember: false, draft })), null);
  assert.equal(parseStoredGunaMilanDraft(JSON.stringify({ version: 2, remember: true, draft })), null);
  assert.equal(parseStoredGunaMilanDraft('{bad'), null);
});

test('explicit opt-out removes a save that was already in flight', async () => {
  await clearRememberedGunaMilanDraft();
  const realSetItem = AsyncStorage.setItem.bind(AsyncStorage);
  let releaseWrite!: () => void;
  const writeGate = new Promise<void>((resolve) => { releaseWrite = resolve; });
  const setItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
  const callsBeforeBlockedWrite = setItem.mock.calls.length;
  setItem.mockImplementationOnce(async (key, value) => {
    await writeGate;
    await realSetItem(key, value);
  });
  const draft = {
    groom: { name: 'A', date: '2000-01-01', time: '12:00' },
    bride: { name: 'B', date: '2001-02-03', time: null },
  };

  const save = saveRememberedGunaMilanDraft(draft);
  while (setItem.mock.calls.length === callsBeforeBlockedWrite) await Promise.resolve();
  const optOut = clearRememberedGunaMilanDraft();
  releaseWrite();
  await Promise.all([save, optOut]);

  assert.equal(await AsyncStorage.getItem(GUNA_MILAN_DRAFT_STORAGE_KEY), null);
});

test('share model allow-list cannot serialize birth inputs', () => {
  const result = calculateGunaMilanFromLongitudes(126, 7);
  const model = buildGunaMilanShareModel(result, { groom: 'Jose', bride: 'Mini' });
  const serialized = JSON.stringify(model);
  assert.match(serialized, /Jose/);
  assert.match(serialized, /Mini/);
  assert.doesNotMatch(serialized, /date|time|city|location|profile/i);
});

test('local diagnostic increments are serialized so simultaneous events are not lost', async () => {
  await AsyncStorage.removeItem(GUNA_MILAN_METRICS_STORAGE_KEY);
  await Promise.all([
    incrementGunaMilanMetric('started'),
    incrementGunaMilanMetric('completed'),
    incrementGunaMilanMetric('started'),
  ]);
  const stored = JSON.parse((await AsyncStorage.getItem(GUNA_MILAN_METRICS_STORAGE_KEY)) ?? '{}');
  assert.deepEqual(stored, { started: 2, completed: 1 });
});
