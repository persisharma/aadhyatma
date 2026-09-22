import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Switch, Text } from 'react-native';
import CalendarDatePicker from '@/components/CalendarDatePicker';
import { __resetSmaranSolvesForTests } from '@/panchang/pitruSmaranSolves';

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
// PRD-44: the overview's परिचय door gates on verified education content, and
// (Sept 2026) its dated rows carry the verified tithi teachings — the fortnight
// is one list, and it is this one. Lessons come from the real registry so the
// day card is pinned against the content that actually ships.
let mockHasShiksha = true;
jest.mock('@/data/pitru', () => {
  const { PITRU_LESSON_ENTRIES } = jest.requireActual('@/data/pitru/lessons');
  return {
    hasPitruShiksha: () => mockHasShiksha,
    getPitruLessons: (kind?: string) =>
      PITRU_LESSON_ENTRIES.filter(
        (l: { kind: string; status: string }) => l.status === 'verified' && (kind === undefined || l.kind === kind)
      ),
  };
});
let mockPermissionStatus: 'undetermined' | 'granted' | 'denied' = 'granted';
const mockRequestPermission = jest.fn(() => Promise.resolve<'undetermined' | 'granted' | 'denied'>('granted'));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({
    permissionStatus: mockPermissionStatus,
    requestPermission: mockRequestPermission,
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
const PitruPakshaOverviewScreen = jest.requireActual<typeof import('../PitruPakshaOverviewScreen')>(
  '../PitruPakshaOverviewScreen'
).default;

const mockedNextObservance = jest.mocked(nextObservanceForEntry);
const mockedWindow = jest.mocked(pitruPakshaWindow);
const mockedPakshaDay = jest.mocked(pakshaShraddhaDay);
const mockedDerive = jest.mocked(deriveTithiRuleFromDate);

/** Mirrors `shortDate(date, 'en')` — the form the day rows' a11y labels use. */
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortDateEn(d: Date): string {
  return `${d.getDate()} ${MONTHS_EN[d.getMonth()]}`;
}

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
  mockPermissionStatus = 'granted';
  mockHasShiksha = true;
  // The solve cache is module state that outlives a test. Without this, the
  // window mocked by one case is served to the next from memory and the mock is
  // never consulted — the same trap `__resetPanchangPrefsForTests` exists for.
  __resetSmaranSolvesForTests();
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
  test('mode selector clearly bounds the active half and exposes radio semantics', async () => {
    const tree = await render(
      <PitruSmaranEditScreen navigation={makeNav() as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    const group = tree.root.find((node) => node.props.accessibilityRole === 'radiogroup');
    expect(StyleSheet.flatten(group.props.style)).toEqual(expect.objectContaining({ gap: 3, borderWidth: 1 }));

    const tithi = byLabel(tree, 'Tithi known');
    const date = byLabel(tree, 'Only date known');
    expect(tithi.props.accessibilityRole).toBe('radio');
    expect(tithi.props.accessibilityState.selected).toBe(true);
    expect(date.props.accessibilityState.selected).toBe(false);
    expect(StyleSheet.flatten(tithi.props.style({ pressed: false })).backgroundColor).not.toBe('transparent');
    expect(StyleSheet.flatten(date.props.style({ pressed: false })).backgroundColor).toBe('transparent');

    act(() => date.props.onPress());
    expect(byLabel(tree, 'Tithi known').props.accessibilityState.selected).toBe(false);
    expect(byLabel(tree, 'Only date known').props.accessibilityState.selected).toBe(true);
    expect(StyleSheet.flatten(byLabel(tree, 'Only date known').props.style({ pressed: false })).borderColor).not.toBe('transparent');
  });

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
    expect(saved.reminderEnabled).toBe(true);
    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(nav.goBack).toHaveBeenCalled();
  });

  test('new entries request the shared permission and enable reminders when granted', async () => {
    mockPermissionStatus = 'undetermined';
    const nav = makeNav();
    const tree = await render(
      <PitruSmaranEditScreen navigation={nav as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    act(() => byLabel(tree, 'Tithi unknown, save on Sarvapitri Amavasya').props.onPress());
    await act(async () => {
      byLabel(tree, 'Save smaran').props.onPress();
      await Promise.resolve();
    });
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    expect(mockAddEntry).toHaveBeenCalledWith(expect.objectContaining({ reminderEnabled: true }));
    expect(nav.goBack).toHaveBeenCalled();
  });

  test('a refused OS grant leaves the new reminder honestly off', async () => {
    mockPermissionStatus = 'undetermined';
    mockRequestPermission.mockResolvedValueOnce('denied');
    const tree = await render(
      <PitruSmaranEditScreen navigation={makeNav() as never} route={{ key: 'e', name: 'PitruSmaranEdit', params: {} } as never} />
    );
    act(() => byLabel(tree, 'Tithi unknown, save on Sarvapitri Amavasya').props.onPress());
    await act(async () => {
      byLabel(tree, 'Save smaran').props.onPress();
      await Promise.resolve();
    });
    expect(mockAddEntry).toHaveBeenCalledWith(expect.objectContaining({ reminderEnabled: false }));
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
  test('legacy off reminder exposes its state and can be opted in per person', async () => {
    mockEntries = [FATHER];
    const tree = await render(
      <PitruSmaranDetailScreen
        navigation={makeNav() as never}
        route={{ key: 'd', name: 'PitruSmaranDetail', params: { entryId: 'smaran-father' } } as never}
      />
    );
    const toggle = tree.root.findByType(Switch);
    expect(toggle.props.value).toBe(false);
    expect(toggle.props.accessibilityValue).toEqual({ text: 'Off' });
    await act(async () => toggle.props.onValueChange(true));
    expect(mockUpdateEntry).toHaveBeenCalledWith('smaran-father', { reminderEnabled: true });
  });

  test('hero + rows render the solved dates; गीता पाठ rows deep-link the Gita reader', async () => {
    mockEntries = [FATHER];
    mockedNextObservance
      .mockReturnValueOnce(daysFromNow(173)) // next
      .mockReturnValueOnce(daysFromNow(538)); // following year
    mockedWindow.mockReturnValue({ purnima: daysFromNow(40), start: daysFromNow(41), end: daysFromNow(55) });
    const pakshaOccurrence = daysFromNow(48);
    mockedPakshaDay.mockReturnValue(pakshaOccurrence);

    const nav = makeNav();
    const tree = await render(
      <PitruSmaranDetailScreen
        navigation={nav as never}
        route={{ key: 'd', name: 'PitruSmaranDetail', params: { entryId: 'smaran-father' } } as never}
      />
    );
    // The hero solve is always usable first. React test renderer may settle the
    // nested zero-delay follow-up in this same `act` turn under a busy full-suite
    // run, so accept either scheduler boundary and then assert the final cards.
    let text = allText(tree);
    expect(text).toContain('पिताजी');
    expect(text).toContain('माघ कृष्ण अष्टमी');
    expect(text).toContain('अगला');
    expect(text).toContain('173 दिन में');
    if (!text.includes('अगले वर्ष')) {
      await flush();
      text = allText(tree);
    }

    // Stage two: next year's date and the fortnight mapping.
    expect(text).toContain('173 दिन में');
    expect(text).toContain('अगले वर्ष');
    expect(text).toContain('अष्टमी श्राद्ध');

    act(() => byLabel(tree, 'Open Tila-Tarpana remembrance guide').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('VidhiDetail', {
      vidhiId: 'shraddha-tarpan-vidhi',
      dateMs: pakshaOccurrence.getTime(),
    });

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

describe('PitruPakshaOverviewScreen', () => {
  test('opens the registered household guide for the nearest family-matched day', async () => {
    mockEntries = [FATHER];
    const start = daysFromNow(10);
    const matched = daysFromNow(12);
    mockedWindow.mockReturnValue({ purnima: daysFromNow(9), start, end: daysFromNow(24) });
    mockedPakshaDay.mockReturnValue(matched);
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={nav as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    act(() => byLabel(tree, 'Open Tila-Tarpana remembrance guide').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('VidhiDetail', {
      vidhiId: 'shraddha-tarpan-vidhi',
      dateMs: matched.getTime(),
    });
  });

  test('the परिचय door sits above the fortnight and opens the education screen (PRD-44)', async () => {
    mockedWindow.mockReturnValue({ purnima: daysFromNow(9), start: daysFromNow(10), end: daysFromNow(24) });
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={nav as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    act(() => byLabel(tree, 'Open Pitru Paksha introduction').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruPakshaShiksha');
  });

  test('no verified education content ⇒ no door, no teaser', async () => {
    mockHasShiksha = false;
    mockedWindow.mockReturnValue({ purnima: daysFromNow(9), start: daysFromNow(10), end: daysFromNow(24) });
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={nav as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    expect(byLabel(tree, 'Open Pitru Paksha introduction')).toBeUndefined();
    expect(allText(tree)).not.toContain('क्यों है');
  });

  // ── Sept 2026 UX review ────────────────────────────────────────────────
  // The screen answers "where am I in this fortnight" before it answers
  // "what are the dates", and both standing doors live in the sticky bar.

  test('mid-paksha: the hero carries today’s tithi and दिन N / M, and today’s row opens in place', async () => {
    const purnima = daysFromNow(-6);
    mockedWindow.mockReturnValue({ purnima, start: daysFromNow(-5), end: daysFromNow(8) });
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={nav as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();

    // 15 civil rows (purnima..amavasya), today is the seventh.
    expect(allText(tree)).toContain('दिन 7 / 15 · आज');
    expect(tree.root.findAll((n) => n.props.testID === 'pitru-paksha-today').length).toBeGreaterThan(0);

    // The card's guide action is dated to TODAY, not to the fortnight's start.
    const vidhiAction = tree.root.findAll(
      (n) =>
        typeof n.props.accessibilityLabel === 'string' &&
        n.props.accessibilityLabel.startsWith('Open the Tila-Tarpana remembrance guide for') &&
        typeof n.props.onPress === 'function'
    )[0];
    act(() => vidhiAction.props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('VidhiDetail', {
      vidhiId: 'shraddha-tarpan-vidhi',
      dateMs: daysFromNow(0).getTime(),
    });
  });

  test('a day with a verified teaching opens on tap and carries it; a bare day stays an inert row', async () => {
    // Today is well before the paksha, so no row is open by default.
    const purnima = daysFromNow(4);
    mockedWindow.mockReturnValue({ purnima, start: daysFromNow(5), end: daysFromNow(18) });
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={nav as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();

    // पूर्णिमा is one of the two verified tithi teachings, so its row opens.
    const purnimaKey = `${purnima.getFullYear()}-${purnima.getMonth()}-${purnima.getDate()}`;
    expect(allText(tree)).not.toContain('पक्ष का पहला दिन');
    act(() => byLabel(tree, `Open day ${shortDateEn(purnima)}`).props.onPress());
    expect(allText(tree)).toContain('पक्ष का पहला दिन');
    expect(tree.root.findAll((n) => n.props.testID === `pitru-paksha-day-${purnimaKey}`).length).toBeGreaterThan(0);

    // From that day, the hand-off lands ON the lesson that explains the mapping.
    act(() => byLabel(tree, 'Open the lesson on how a tithi is matched').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruPakshaShiksha', { lessonId: 'kis-din-kiska' });

    // A day with neither a teaching nor a family name is not a button at all.
    const bare = daysFromNow(9);
    expect(byLabel(tree, `Open day ${shortDateEn(bare)}`)).toBeUndefined();
  });

  test('before the paksha: a countdown, and no today card', async () => {
    mockedWindow.mockReturnValue({ purnima: daysFromNow(4), start: daysFromNow(5), end: daysFromNow(19) });
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={makeNav() as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    expect(allText(tree)).toContain('पितृ पक्ष आरम्भ');
    expect(allText(tree)).toContain('4 दिन शेष');
    expect(tree.root.findAll((n) => n.props.testID === 'pitru-paksha-today')).toHaveLength(0);
  });

  test('the rolled year is never silent — the hero says अगले वर्ष and names the paksha that ended', async () => {
    const endedOn = daysFromNow(-5);
    mockedWindow
      .mockReturnValueOnce({ purnima: daysFromNow(-20), start: daysFromNow(-19), end: endedOn })
      .mockReturnValue({ purnima: daysFromNow(340), start: daysFromNow(341), end: daysFromNow(355) });
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={makeNav() as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    const text = allText(tree);
    expect(text).toContain('अगले वर्ष');
    expect(text).toContain('इस वर्ष का पक्ष');
    expect(text).not.toContain('दिन शेष');
  });

  test('family days are summarised at the top; an empty ledger offers पितृ स्मरण instead', async () => {
    mockedWindow.mockReturnValue({ purnima: daysFromNow(9), start: daysFromNow(10), end: daysFromNow(24) });

    mockEntries = [];
    const empty = await render(
      <PitruPakshaOverviewScreen
        navigation={makeNav() as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    expect(byLabel(empty, 'Open Pitru Smaran list')).toBeDefined();
    expect(empty.root.findAll((n) => n.props.testID === 'pitru-paksha-family-strip')).toHaveLength(0);

    mockEntries = [FATHER];
    mockedPakshaDay.mockReturnValue(daysFromNow(12));
    const filled = await render(
      <PitruPakshaOverviewScreen
        navigation={makeNav() as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    expect(filled.root.findAll((n) => n.props.testID === 'pitru-paksha-family-strip').length).toBeGreaterThan(0);
    expect(allText(filled)).toContain('आपके परिवार के 1 दिन');
    expect(byLabel(filled, 'Open Pitru Smaran list')).toBeUndefined();
  });

  test('both standing doors live in the sticky action bar, not at the ends of the scroll', async () => {
    mockedWindow.mockReturnValue({ purnima: daysFromNow(9), start: daysFromNow(10), end: daysFromNow(24) });
    const tree = await render(
      <PitruPakshaOverviewScreen
        navigation={makeNav() as never}
        route={{ key: 'p', name: 'PitruPakshaOverview' } as never}
      />
    );
    await flush();
    const bar = tree.root.findAll((n) => n.props.testID === 'pitru-paksha-actions')[0];
    expect(bar).toBeDefined();
    const inBar = (id: string) => bar.findAll((n) => n.props.testID === id).length;
    expect(inBar('pitru-paksha-shiksha-door')).toBeGreaterThan(0);
    expect(inBar('pitru-paksha-vidhi-door')).toBeGreaterThan(0);
    expect(StyleSheet.flatten(bar.props.style).position).toBe('absolute');
  });
});
