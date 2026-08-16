import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, Text } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeContext';
import { CITIES, MAJOR_CITIES, type City } from '@/panchang/locations';
import { RAJASTHAN_TEHSILS } from '@/panchang/rajasthanTehsils';
import LocationPickerModal from '../LocationPickerModal';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const mockSelectCity = jest.fn();
const mockSelectPincode = jest.fn((_pincode: string) => true);
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: { cityId: 'ujjain', labelHi: 'उज्जैन', labelEn: 'Ujjain' },
    gpsStatus: 'idle',
    selectCity: (id: string) => mockSelectCity(id),
    selectPincode: (pin: string) => mockSelectPincode(pin),
    requestDeviceLocation: () => Promise.resolve('granted'),
  }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

// Every rendered tree is unmounted after its test: the picker's FlatList
// (VirtualizedList) schedules cell-batching timeouts, and a timer that outlives
// the suite fires into the next one as "Cannot log after tests are done" —
// which fails the whole Jest run even with every test passing (the CI red on
// PR #241). Unmounting clears VirtualizedList's pending timeout.
const trees: TestRenderer.ReactTestRenderer[] = [];

afterEach(async () => {
  for (const tree of trees) {
    await act(async () => {
      tree.unmount();
    });
  }
  trees.length = 0;
});

async function renderPicker(lang: 'hi' | 'en' = 'en') {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang={lang}>
          <LocationPickerModal visible onClose={() => {}} />
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  trees.push(tree!);
  return tree!;
}

/** The picker's row data, in render order — headers included. */
function rows(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findByType(FlatList).props.data as (
    | { kind: 'header'; en: string }
    | { kind: 'city'; city: City }
    | { kind: 'pincode'; entry: { pincode: string; districtEn: string; stateEn: string } }
    | { kind: 'pincode-missing'; query: string }
  )[];
}

/**
 * Type into the search field. Narrowing the list is also how a test reaches a row the
 * FlatList would otherwise leave unmounted — the tehsils start ~50 rows down. The
 * async act() drains VirtualizedList's own deferred cell update.
 */
async function search(tree: TestRenderer.ReactTestRenderer, query: string) {
  const input = tree.root.findAll((n) => typeof n.props.onChangeText === 'function')[0];
  await act(async () => {
    input.props.onChangeText(query);
  });
}

describe('LocationPickerModal', () => {
  beforeEach(() => {
    mockSelectCity.mockReset();
    mockSelectPincode.mockReset();
    mockSelectPincode.mockReturnValue(true);
  });

  test('renders both tiers under group headers, national first', async () => {
    const tree = await renderPicker();
    const data = rows(tree);
    const headerIndexes = data.flatMap((r, i) => (r.kind === 'header' ? [i] : []));
    expect(headerIndexes).toEqual([0, MAJOR_CITIES.length + 1]);
    expect(data.filter((r) => r.kind === 'header').map((r) => (r as { en: string }).en)).toEqual([
      'Major cities',
      'Rajasthan · tehsils',
    ]);
    expect(data.filter((r) => r.kind === 'city')).toHaveLength(CITIES.length);
  });

  test('a query that only matches tehsils drops the empty cities header', async () => {
    const tree = await renderPicker();
    await search(tree, 'nathdwara');
    const data = rows(tree);
    expect(data.filter((r) => r.kind === 'header').map((r) => (r as { en: string }).en)).toEqual([
      'Rajasthan · tehsils',
    ]);
    expect(data.filter((r) => r.kind === 'city')).toHaveLength(1);
  });

  test('searching a district name surfaces every tehsil in it', async () => {
    const tree = await renderPicker();
    await search(tree, 'alwar');
    const matched = rows(tree).flatMap((r) => (r.kind === 'city' ? [r.city] : []));
    const expected = RAJASTHAN_TEHSILS.filter((c) => c.districtEn === 'Alwar');
    expect(expected.length).toBeGreaterThan(15);
    expect(matched.map((c) => c.id)).toEqual(expect.arrayContaining(expected.map((c) => c.id)));
  });

  test('tehsil rows are labelled with their district; national rows are not', async () => {
    const tree = await renderPicker();
    const label = (needle: string) =>
      tree.root.findAll(
        (n) =>
          typeof n.props.accessibilityLabel === 'string' &&
          n.props.accessibilityLabel.startsWith(needle) &&
          typeof n.props.onPress === 'function'
      )[0].props.accessibilityLabel;
    expect(label('Ujjain')).toBe('Ujjain, selected');
    await search(tree, 'mount abu');
    expect(label('Mount Abu')).toBe('Mount Abu, Sirohi district');
  });

  test('the district suffix renders in the reading language, not mixed scripts', async () => {
    const tree = await renderPicker('hi');
    await search(tree, 'माउंट आबू');
    const texts = tree.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .filter((c): c is string => typeof c === 'string');
    expect(texts).toContain('माउंट आबू');
    expect(texts).toContain('· सिरोही');
  });

  test('picking a tehsil selects it by its rj- id', async () => {
    const tree = await renderPicker();
    await search(tree, 'pokaran');
    const row = tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Pokaran, Jaisalmer district'
    )[0];
    act(() => row.props.onPress());
    expect(mockSelectCity).toHaveBeenCalledWith('rj-pokaran');
  });

  test('a 6-digit query replaces the city list with the resolved pincode', async () => {
    const tree = await renderPicker();
    await search(tree, '416001');
    const data = rows(tree);
    // The whole browse list gives way — a pincode is an exact answer, not a filter.
    expect(data.filter((r) => r.kind === 'city')).toHaveLength(0);
    expect(data.filter((r) => r.kind === 'header').map((r) => (r as { en: string }).en)).toEqual([
      'Pincode',
    ]);
    const entry = data.find((r) => r.kind === 'pincode') as { entry: { districtEn: string; stateEn: string } };
    expect(entry.entry.districtEn).toBe('Kolhapur');
    expect(entry.entry.stateEn).toBe('Maharashtra');
  });

  test('picking the pincode row selects it by its digits', async () => {
    const tree = await renderPicker();
    await search(tree, '416001');
    const row = tree.root.findAll(
      (n) => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.startsWith('Pincode 416001')
    )[0];
    act(() => row.props.onPress());
    expect(mockSelectPincode).toHaveBeenCalledWith('416001');
    expect(mockSelectCity).not.toHaveBeenCalled();
  });

  test('a well-formed but unknown pincode says so instead of showing an empty list', async () => {
    const tree = await renderPicker();
    await search(tree, '999999');
    const data = rows(tree);
    expect(data).toHaveLength(1);
    expect(data[0].kind).toBe('pincode-missing');
  });

  test('the pincode row shows district and taluka, and Devanagari digits in Hindi', async () => {
    const tree = await renderPicker('hi');
    await search(tree, '781001');
    const texts = tree.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .filter((c): c is string => typeof c === 'string');
    // Guwahati is a taluka of Kamrup district; both show, because neither alone is the
    // name every user recognises.
    expect(texts).toContain('Kamrup · Guwahati');
    expect(texts).toContain('७८१००१ · असम');
  });
});
