import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import CalendarDatePicker from '@/components/CalendarDatePicker';

/**
 * PRD-17 पितृ स्मरण screens — list (rows sorted soonest-first, seasonal banner,
 * empty state), add/edit (tithi pickers, date→tithi confirmation card that gates
 * Save, sarvapitri fallback), detail (hero + paksha rows + गीता पाठ deep links +
 * delete confirm), and the Panchang day chip. Engine solvers are mocked — their
 * correctness is pinned by src/panchang/__tests__/pitruSmaran.test.ts (tsx).
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
}));
jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View: RNView } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(RNView, p, children) };
});

// @react-navigation/native ships ESM the RN jest preset doesn't transform, so
// the module is fully replaced (house pattern — see KundaliExperience.test.tsx).
const mockRootNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockRootNavigate, goBack: jest.fn() }),
}));

jest.mock('@/panchang/pitruSmaran', () => {
  const actual = jest.requireActual('@/panchang/pitruSmaran');
  return {
    ...actual,
    nextObservanceForEntry: jest.fn(() => null),
    pitruPakshaWindow: jest.fn(() => null),
    pakshaShraddhaDay: jest.fn(() => null),
    deriveTithiRuleFromDate: jest.fn(),
  };
});

const mockAddEntry = jest.fn();
const mockUpdateEntry = jest.fn();
const mockRemoveEntry = jest.fn();
let mockEntries: import('@/panchang/pitruSmaran').SmaranEntry[] = [];
jest.mock('@/contexts/PitruSmaranContext', () => ({
  usePitruSmaran: () => ({
    entries: mockEntries,
    isLoading: false,
    addEntry: mockAddEntry,
    updateEntry: mockUpdateEntry,
    removeEntry: mockRemoveEntry,
    getEntry: (id: string) => mockEntries.find((e) => e.id === id) ?? null,
  }),
}));

import {
  deriveTithiRuleFromDate,
  nextObservanceForEntry,
  pakshaShraddhaDay,
  pitruPakshaWindow,
  type SmaranEntry,
} from '@/panchang/pitruSmaran';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const PitruSmaranListScreen = jest.requireActual<typeof import('../PitruSmaranListScreen')>(
  '../PitruSmaranListScreen'
).default;
const PitruSmaranEditScreen = jest.requireActual<typeof import('../PitruSmaranEditScreen')>(
  '../PitruSmaranEditScreen'
).default;
const PitruSmaranDetailScreen = jest.requireActual<typeof import('../PitruSmaranDetailScreen')>(
  '../PitruSmaranDetailScreen'
).default;

const mockedNextObservance = jest.mocked(nextObservanceForEntry);
const mockedWindow = jest.mocked(pitruPakshaWindow);
const mockedPakshaDay = jest.mocked(pakshaShraddhaDay);
const mockedDerive = jest.mocked(deriveTithiRuleFromDate);

function daysFromNow(n: number): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
}

const FATHER: SmaranEntry = {
  id: 'smaran-father',
  relation: 'pitaji',
  tithiRule: { lunarMonth: 11, paksha: 'krishna', tithi: 8 },
  createdAtMs: 1,
};
const NANAJI: SmaranEntry = {
  id: 'smaran-nanaji',
  relation: 'nanaji',
  tithiRule: 'sarvapitri',
  createdAtMs: 2,
};

function makeNav(): { navigate: jest.Mock; goBack: jest.Mock } {
  return { navigate: jest.fn(), goBack: jest.fn() };
}

function wrap(children: React.ReactNode) {
  return (
    <FontScaleProvider>
      <ThemeProvider>
        <GitaLanguageProvider initialLang="hi">{children}</GitaLanguageProvider>
      </ThemeProvider>
    </FontScaleProvider>
  );
}

// Flush the screens' deferred setTimeout(0) solve effects.
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
afterEach(() => {
  // House rule: unmount every rendered tree inside act() so no effect timer
  // outlives its suite (the "green summary, exit 1" VirtualizedList trap).
  act(() => {
    trees.splice(0).forEach((t) => t.unmount());
  });
  jest.clearAllMocks();
  mockEntries = [];
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

describe('PitruSmaranListScreen', () => {
  test('empty state renders the reverent invitation and the add action', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranListScreen navigation={nav as never} route={{ key: 'l', name: 'PitruSmaranList' } as never} />
    );
    expect(allText(tree)).toContain('अपने पितरों की तिथियाँ जोड़ें');
    act(() => byLabel(tree, 'Add smaran').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruSmaranEdit', {});
  });

  test('rows sort soonest-first with tithi caption and relative date; tap opens detail', async () => {
    mockEntries = [FATHER, NANAJI];
    // Father's annual date is farther than Nanaji's Sarvapitri Amavasya.
    mockedNextObservance.mockImplementation((entry) =>
      entry.tithiRule === 'sarvapitri' ? daysFromNow(41) : daysFromNow(173)
    );
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranListScreen navigation={nav as never} route={{ key: 'l', name: 'PitruSmaranList' } as never} />
    );
    const text = allText(tree);
    expect(text).toContain('माघ कृष्ण अष्टमी');
    expect(text).toContain('तिथि अज्ञात — सर्वपितृ अमावस्या');
    expect(text).toContain('41द');
    expect(text).toContain('173द');
    // Soonest (नानाजी) renders before पिताजी.
    expect(text.indexOf('नानाजी')).toBeLessThan(text.indexOf('पिताजी'));

    const nanajiRow = tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel?.startsWith('Smaran Grandfather (maternal),') &&
        typeof node.props.onPress === 'function'
    )[0];
    expect(nanajiRow.props.accessibilityLabel).toContain('तिथि अज्ञात — सर्वपितृ अमावस्या');
    act(() => nanajiRow.props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruSmaranDetail', { entryId: 'smaran-nanaji' });
  });

  test('the Pitru Paksha banner appears only near/within the fortnight and opens the overview', async () => {
    mockedWindow.mockReturnValue({
      purnima: daysFromNow(9),
      start: daysFromNow(10),
      end: daysFromNow(24),
    });
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranListScreen navigation={nav as never} route={{ key: 'l', name: 'PitruSmaranList' } as never} />
    );
    expect(allText(tree)).toContain('पितृ पक्ष निकट है');
    act(() => byLabel(tree, 'Open Pitru Paksha overview').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruPakshaOverview');
  });

  test('no banner when the paksha is far away', async () => {
    mockedWindow.mockReturnValue({
      purnima: daysFromNow(89),
      start: daysFromNow(90),
      end: daysFromNow(104),
    });
    const tree = await render(
      <PitruSmaranListScreen navigation={makeNav() as never} route={{ key: 'l', name: 'PitruSmaranList' } as never} />
    );
    expect(allText(tree)).not.toContain('पितृ पक्ष निकट है');
  });
});

describe('PitruSmaranEditScreen', () => {
  test('tithi mode: Save stays disabled until month+tithi are chosen, then persists the rule', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranEditScreen navigation={nav as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    const save = byLabel(tree, 'Save smaran');
    expect(save.props.accessibilityState.disabled).toBe(true);

    act(() => byLabel(tree, 'Relation Mother').props.onPress());
    act(() => byLabel(tree, 'Month Magha').props.onPress());
    act(() => byLabel(tree, 'Paksha Krishna').props.onPress());
    act(() => byLabel(tree, 'Tithi Ashtami').props.onPress());
    expect(byLabel(tree, 'Save smaran').props.accessibilityState.disabled).toBe(false);

    act(() => byLabel(tree, 'Save smaran').props.onPress());
    expect(mockAddEntry).toHaveBeenCalledTimes(1);
    const saved = mockAddEntry.mock.calls[0][0] as SmaranEntry;
    expect(saved.relation).toBe('mataji');
    expect(saved.tithiRule).toEqual({ lunarMonth: 11, paksha: 'krishna', tithi: 8 });
    expect(nav.goBack).toHaveBeenCalled();
  });

  test('unknown tithi saves as sarvapitri', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranEditScreen navigation={nav as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    act(() => byLabel(tree, 'Tithi unknown, save on Sarvapitri Amavasya').props.onPress());
    act(() => byLabel(tree, 'Save smaran').props.onPress());
    const saved = mockAddEntry.mock.calls[0][0] as SmaranEntry;
    expect(saved.tithiRule).toBe('sarvapitri');
  });

  test('date mode: the computed tithi is shown for confirmation and gates Save', async () => {
    mockedDerive.mockReturnValue({ lunarMonth: 11, paksha: 'krishna', tithi: 8 });
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranEditScreen navigation={nav as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    act(() => byLabel(tree, 'Only date known').props.onPress());
    // No date selected yet → nothing derived, Save disabled.
    expect(byLabel(tree, 'Save smaran').props.accessibilityState.disabled).toBe(true);

    act(() => byLabel(tree, 'Date of passing').props.onPress());
    const picker = tree.root.findAllByType(CalendarDatePicker).find((node) => node.props.visible)!;
    expect(picker.props.title).toBe('देहावसान तिथि चुनें');
    expect(picker.props.minDate).toBe('1800-01-01');
    await act(async () => {
      picker.props.onSelect('1998-02-03');
    });
    await flush();
    // The confirmation card shows the tithi back IN WORDS before anything saves.
    expect(allText(tree)).toContain('पंचांग से निकली तिथि — पुष्टि करें');
    expect(allText(tree)).toContain('माघ कृष्ण अष्टमी');

    expect(byLabel(tree, 'Save smaran').props.accessibilityState.disabled).toBe(false);
    act(() => byLabel(tree, 'Save smaran').props.onPress());
    const saved = mockAddEntry.mock.calls[0][0] as SmaranEntry;
    expect(saved.tithiRule).toEqual({ lunarMonth: 11, paksha: 'krishna', tithi: 8 });
    expect(saved.derivedFromDateMs).toBe(new Date(1998, 1, 3).getTime());
  });

  test('date mode: "तिथि स्वयं चुनें" switches to pickers pre-filled with the computed rule', async () => {
    mockedDerive.mockReturnValue({ lunarMonth: 11, paksha: 'krishna', tithi: 8 });
    const tree = await render(
      <PitruSmaranEditScreen navigation={makeNav() as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    act(() => byLabel(tree, 'Only date known').props.onPress());
    act(() => byLabel(tree, 'Date of passing').props.onPress());
    const picker = tree.root.findAllByType(CalendarDatePicker).find((node) => node.props.visible)!;
    await act(async () => {
      picker.props.onSelect('1998-02-03');
    });
    await flush();
    act(() => byLabel(tree, 'Choose the tithi myself').props.onPress());
    // Back in tithi mode with the computed rule selected → Save enabled.
    expect(byLabel(tree, 'Month Magha').props.accessibilityState.selected).toBe(true);
    expect(byLabel(tree, 'Tithi Ashtami').props.accessibilityState.selected).toBe(true);
    expect(byLabel(tree, 'Save smaran').props.accessibilityState.disabled).toBe(false);
  });

  test('editing an existing entry updates it in place', async () => {
    mockEntries = [FATHER];
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranEditScreen
        navigation={nav as never}
        route={{ key: 'e', name: 'PitruSmaranEdit', params: { entryId: 'smaran-father' } } as never}
      />
    );
    act(() => byLabel(tree, 'Relation Grandfather (paternal)').props.onPress());
    act(() => byLabel(tree, 'Save smaran').props.onPress());
    expect(mockUpdateEntry).toHaveBeenCalledWith(
      'smaran-father',
      expect.objectContaining({ relation: 'dadaji', tithiRule: FATHER.tithiRule })
    );
    expect(mockAddEntry).not.toHaveBeenCalled();
  });
});

describe('PitruSmaranDetailScreen', () => {
  test('hero + rows render the solved dates; गीता पाठ rows deep-link the Gita reader', async () => {
    mockEntries = [FATHER];
    mockedNextObservance
      .mockReturnValueOnce(daysFromNow(173)) // next
      .mockReturnValueOnce(daysFromNow(538)); // following year
    mockedWindow.mockReturnValue({ purnima: daysFromNow(40), start: daysFromNow(41), end: daysFromNow(55) });
    mockedPakshaDay.mockReturnValue(daysFromNow(48));

    const nav = makeNav();
    const tree = await render(
      <PitruSmaranDetailScreen
        navigation={nav as never}
        route={{ key: 'd', name: 'PitruSmaranDetail', params: { entryId: 'smaran-father' } } as never}
      />
    );
    const text = allText(tree);
    expect(text).toContain('पिताजी');
    expect(text).toContain('माघ कृष्ण अष्टमी');
    expect(text).toContain('अगला');
    expect(text).toContain('173 दिन में');
    expect(text).toContain('अगले वर्ष');
    expect(text).toContain('अष्टमी श्राद्ध');

    act(() => byLabel(tree, 'Open Gita — Adhyaya 15').props.onPress());
    expect(mockRootNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'GitaReader',
      params: { chapter: 15 },
    });
    act(() => byLabel(tree, 'Open Gita — Adhyaya 2').props.onPress());
    expect(mockRootNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'GitaReader',
      params: { chapter: 2 },
    });
  });

  test('delete requires the confirm sheet, then removes and goes back', async () => {
    mockEntries = [FATHER];
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranDetailScreen
        navigation={nav as never}
        route={{ key: 'd', name: 'PitruSmaranDetail', params: { entryId: 'smaran-father' } } as never}
      />
    );
    act(() => byLabel(tree, 'Delete smaran entry').props.onPress());
    expect(mockRemoveEntry).not.toHaveBeenCalled(); // the tap alone never deletes
    act(() => byLabel(tree, 'Confirm delete').props.onPress());
    expect(mockRemoveEntry).toHaveBeenCalledWith('smaran-father');
    expect(nav.goBack).toHaveBeenCalled();
  });

  test('edit action opens the edit screen for this entry', async () => {
    mockEntries = [FATHER];
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranDetailScreen
        navigation={nav as never}
        route={{ key: 'd', name: 'PitruSmaranDetail', params: { entryId: 'smaran-father' } } as never}
      />
    );
    act(() => byLabel(tree, 'Edit smaran').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruSmaranEdit', { entryId: 'smaran-father' });
  });
});
