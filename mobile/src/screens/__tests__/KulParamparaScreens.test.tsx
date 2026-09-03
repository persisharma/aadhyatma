import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';

/**
 * PRD-29 Part B कुल परम्परा screens — view (empty state, saved record, export
 * door), edit (deity chosen from the registry grid — never inferred — with
 * free-text fallbacks for temple/vrat), export (what-leaves-the-device summary
 * and the one share action). Stores run real against the in-memory AsyncStorage
 * mock; the share glue is mocked (expo-file-system stays out of Jest).
 */

jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View: RNView } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(RNView, p, children) };
});

const mockRootNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockRootNavigate, goBack: jest.fn(), getState: () => ({ routeNames: [] }) }),
}));

jest.mock('@/panchang/kulParamparaShare', () => ({
  kulParamparaExportFilename: jest.fn(() => 'vedansh-kul-parampara-test.json'),
  shareKulParamparaFile: jest.fn(() => Promise.resolve(true)),
}));

let mockEntries: import('@/panchang/pitruSmaran').SmaranEntry[] = [];
jest.mock('@/contexts/PitruSmaranContext', () => ({
  usePitruSmaran: () => ({ entries: mockEntries, isLoading: false }),
}));

let mockRoster: { hydrated: boolean; roster: { activeId: string | null; people: unknown[] }; error: boolean } = {
  hydrated: true,
  roster: { activeId: null, people: [] },
  error: false,
};
jest.mock('@/panchang/useKundali', () => ({
  useBirthProfileRoster: () => mockRoster,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { __resetKulRecordStoreForTests, getKulRecordSnapshot, saveKulRecord } from '@/panchang/kulParamparaStore';
import { shareKulParamparaFile } from '@/panchang/kulParamparaShare';
import type { PersonProfile } from '@/panchang/birthProfiles';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const KulParamparaScreen = jest.requireActual<typeof import('../KulParamparaScreen')>(
  '../KulParamparaScreen'
).default;
const KulParamparaEditScreen = jest.requireActual<typeof import('../KulParamparaEditScreen')>(
  '../KulParamparaEditScreen'
).default;
const KulParamparaExportScreen = jest.requireActual<typeof import('../KulParamparaExportScreen')>(
  '../KulParamparaExportScreen'
).default;

function wrap(children: React.ReactNode) {
  return (
    <FontScaleProvider>
      <ThemeProvider>
        <GitaLanguageProvider initialLang="hi">{children}</GitaLanguageProvider>
      </ThemeProvider>
    </FontScaleProvider>
  );
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(async () => {
  act(() => {
    trees.splice(0).forEach((t) => t.unmount());
  });
  jest.clearAllMocks();
  mockEntries = [];
  mockRoster = { hydrated: true, roster: { activeId: null, people: [] }, error: false };
  await AsyncStorage.clear();
  __resetKulRecordStoreForTests();
});

async function render(node: React.ReactElement): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(wrap(node));
  });
  trees.push(tree);
  await flush();
  return tree;
}

describe('KulParamparaScreen', () => {
  test('empty record renders the invitation and the create door', async () => {
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(
      <KulParamparaScreen navigation={nav as never} route={{ key: 'k', name: 'KulParampara' } as never} />
    );
    expect(allText(tree)).toContain('जो एक पीढ़ी में खो जाता है');
    act(() => byLabel(tree, 'Create kul parampara record').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('KulParamparaEdit');
  });

  test('a saved record renders kuldev, gotra and the export door; the privacy line stands', async () => {
    await saveKulRecord({
      kuldev: { kind: 'kuldevi', deityId: 'durga' },
      gotra: 'भारद्वाज',
      temple: { customName: 'श्री ज्वाला जी' },
    });
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(
      <KulParamparaScreen navigation={nav as never} route={{ key: 'k', name: 'KulParampara' } as never} />
    );
    const text = allText(tree);
    expect(text).toContain('माँ दुर्गा');
    expect(text).toContain('भारद्वाज');
    expect(text).toContain('श्री ज्वाला जी');
    expect(text).toContain('कहीं भेजा नहीं जाता');
    act(() => byLabel(tree, 'Hand the record on').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('KulParamparaExport');
  });
});

describe('KulParamparaEditScreen', () => {
  const route = { key: 'e', name: 'KulParamparaEdit' } as never;

  test('choosing a registry deity plus free-text gotra saves the normalized record', async () => {
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<KulParamparaEditScreen navigation={nav as never} route={route} />);
    act(() => byLabel(tree, 'Choose Maa Durga').props.onPress());
    const gotra = tree.root.findAll(
      (n) => n.type === TextInput && n.props.accessibilityLabel === 'Gotra, free text'
    )[0];
    act(() => gotra.props.onChangeText('  भारद्वाज '));
    await act(async () => {
      byLabel(tree, 'Save kul parampara record').props.onPress();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(nav.goBack).toHaveBeenCalled();
    expect(getKulRecordSnapshot().record).toEqual({
      kuldev: { kind: 'kuldevi', deityId: 'durga' },
      gotra: 'भारद्वाज',
    });
  });

  test('temple search links a registry temple; typed text with no match saves as free text', async () => {
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<KulParamparaEditScreen navigation={nav as never} route={route} />);
    const templeInput = tree.root.findAll(
      (n) => n.type === TextInput && n.props.accessibilityLabel === 'Family temple, search or free text'
    )[0];
    act(() => templeInput.props.onChangeText('Kashi'));
    const row = tree.root.findAll(
      (n) => typeof n.props.accessibilityLabel === 'string'
        && n.props.accessibilityLabel.startsWith('Link temple ')
        && typeof n.props.onPress === 'function'
    )[0];
    expect(row).toBeTruthy();
    act(() => row.props.onPress());
    await act(async () => {
      byLabel(tree, 'Save kul parampara record').props.onPress();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const saved = getKulRecordSnapshot().record;
    expect(saved.temple?.templeId).toBeTruthy();
    expect(saved.temple?.customName).toBeUndefined();
  });

  test('the stance guard line is on the screen: never inferred, no classification', async () => {
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<KulParamparaEditScreen navigation={nav as never} route={route} />);
    expect(allText(tree)).toContain('गोत्र से कुलदेवता का अनुमान कभी नहीं लगाया जाता');
  });
});

describe('KulParamparaExportScreen', () => {
  const route = { key: 'x', name: 'KulParamparaExport' } as never;

  test('summarizes exactly what leaves the device and shares the versioned envelope', async () => {
    await saveKulRecord({ kuldev: { kind: 'kuldevi', deityId: 'durga' }, gotra: 'भारद्वाज' });
    const people: PersonProfile[] = [
      { id: 'p-1', name: 'मधुसूदन', date: '1988-11-12', time: '06:40', cityId: 'jaipur' },
    ];
    mockRoster = { hydrated: true, roster: { activeId: 'p-1', people }, error: false };
    mockEntries = [
      { id: 'e-1', relation: 'dadaji', tithiRule: { lunarMonth: 7, paksha: 'krishna', tithi: 10 }, createdAtMs: 1 },
    ];
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<KulParamparaExportScreen navigation={nav as never} route={route} />);
    const text = allText(tree);
    expect(text).toContain('कुलदेवी');
    expect(text).toContain('1 सदस्य');
    expect(text).toContain('1 प्रविष्टि');

    await act(async () => {
      byLabel(tree, 'Share kul parampara file').props.onPress();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const mocked = jest.mocked(shareKulParamparaFile);
    expect(mocked).toHaveBeenCalledTimes(1);
    const envelope = JSON.parse(mocked.mock.calls[0][0]);
    expect(envelope.format).toBe('vedansh-kul-parampara');
    expect(envelope.version).toBe(1);
    expect(envelope.kul.gotra).toBe('भारद्वाज');
    expect(envelope.people).toHaveLength(1);
    expect(envelope.pitru).toHaveLength(1);
  });

  test('an unavailable share sheet reports itself instead of failing silently', async () => {
    jest.mocked(shareKulParamparaFile).mockResolvedValueOnce(false);
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<KulParamparaExportScreen navigation={nav as never} route={route} />);
    await act(async () => {
      byLabel(tree, 'Share kul parampara file').props.onPress();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(allText(tree)).toContain('साझा-पत्रक उपलब्ध नहीं');
  });
});
