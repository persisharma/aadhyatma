/**
 * मेरा घर screens (PRD-24 Phase 2 §6/§7): the sensor-free path a simulator can
 * honestly pin. Guardrails named by the PRD: the frozen finding-group order,
 * five class pills always rendered (a zero included), registry order within a
 * group, and NO composite score anywhere — no `n of m`, no percent (RULEBOOK
 * §22 amended rule 5). Harness follows VastuDishaScreen.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text as RNText, View as mockView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import GharVastuScreen from '@/screens/GharVastuScreen';
import GharVastuRosterScreen from '@/screens/GharVastuRosterScreen';
import GharVastuSetupScreen from '@/screens/GharVastuSetupScreen';
import { FINDING_CLASS_ORDER } from '@/vastu/assessHome';
import { VASTU_HOMES_STORAGE_KEY, type HomeRecord, type HomeRoster } from '@/vastu/homeRecord';
import { __resetHomeRosterStoreForTests } from '@/vastu/homeRecordStore';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn() };

const home = (over: Partial<HomeRecord> = {}): HomeRecord => ({
  id: 'h1',
  version: 1,
  label: 'देखा गया 3BHK',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  rooms: [
    { roomId: 'main-door', ordinal: 1, zone: 'east', via: 'manual', recordedAt: '2026-09-06T10:00:00.000Z' },
    { roomId: 'kitchen', ordinal: 1, zone: 'southeast', via: 'manual', recordedAt: '2026-09-06T10:00:00.000Z' },
    { roomId: 'toilet', ordinal: 1, zone: 'northeast', via: 'manual', recordedAt: '2026-09-06T10:00:00.000Z' },
    { roomId: 'puja-room', ordinal: 1, zone: null, via: null, recordedAt: null },
  ],
  createdAt: '2026-09-06T10:00:00.000Z',
  updatedAt: '2026-09-06T10:00:00.000Z',
  ...over,
});

async function seedRoster(homes: HomeRecord[], livingId: string | null = null) {
  const roster: HomeRoster = { version: 1, homes, livingId };
  await AsyncStorage.setItem(VASTU_HOMES_STORAGE_KEY, JSON.stringify(roster));
}

async function render(element: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<GitaLanguageProvider>{element}</GitaLanguageProvider>);
  });
  return renderer;
}

const texts = (renderer: TestRenderer.ReactTestRenderer): string[] => {
  const found: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      found.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === 'object' && 'children' in node) {
      walk((node as { children: unknown }).children);
    }
  };
  walk(renderer.toJSON());
  return found;
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetHomeRosterStoreForTests();
});

describe('GharVastuScreen — the assessment reading', () => {
  test('groups render in the frozen order with the door/kitchen/toilet fixture', async () => {
    await seedRoster([home()]);
    const r = await render(<GharVastuScreen navigation={navigation} route={{ params: { homeId: 'h1' } }} />);

    // Frozen order (§0.2): the rendered group testIDs appear in FINDING_CLASS_ORDER order.
    const rendered = r.root
      .findAll((node) => typeof node.props.testID === 'string' && node.props.testID.startsWith('ghar-group-'))
      .map((node) => (node.props.testID as string).replace('ghar-group-', ''));
    const orderIndex = (cls: string) => FINDING_CLASS_ORDER.indexOf(cls as never);
    expect(rendered.length).toBeGreaterThanOrEqual(3); // forbidden, in-keeping, unmeasured at minimum
    expect([...rendered].sort((a, b) => orderIndex(a) - orderIndex(b))).toEqual(rendered);
    // The fixture's specific findings land in their classes.
    expect(rendered[0]).toBe('forbidden'); // toilet in ईशान leads the reading
    r.root.findByProps({ testID: 'ghar-finding-toilet-1' });
    r.root.findByProps({ testID: 'ghar-finding-kitchen-1' });
    act(() => r.unmount());
  });

  test('five class pills always render — a zero is information', async () => {
    await seedRoster([home()]);
    const r = await render(<GharVastuScreen navigation={navigation} route={{ params: { homeId: 'h1' } }} />);
    for (const cls of ['forbidden', 'differs', 'preferred-unmet', 'alternate', 'in-keeping']) {
      r.root.findByProps({ testID: `ghar-pill-${cls}` });
    }
    // The fixture has zero `differs` findings — the pill still renders, with 0.
    const differs = r.root.findByProps({ testID: 'ghar-pill-differs' });
    const flat = (v: unknown): string =>
      Array.isArray(v) ? v.map(flat).join('') : typeof v === 'string' || typeof v === 'number' ? String(v) : '';
    const pillText = differs
      .findAllByType(RNText)
      .map((node) => flat(node.props.children))
      .join('');
    expect(pillText).toContain('0');
    act(() => r.unmount());
  });

  test('no composite score anywhere: no "n of m", no percent, no rating', async () => {
    await seedRoster([home()]);
    const r = await render(<GharVastuScreen navigation={navigation} route={{ params: { homeId: 'h1' } }} />);
    for (const text of texts(r)) {
      expect(text).not.toMatch(/\d+\s?(of|में से)\s?\d+/);
      expect(text).not.toMatch(/%/);
      expect(text).not.toMatch(/score|rating|अंक/i);
    }
    act(() => r.unmount());
  });

  test('accommodation follows a forbidden finding; weight word renders', async () => {
    await seedRoster([home()]);
    const r = await render(<GharVastuScreen navigation={navigation} route={{ params: { homeId: 'h1' } }} />);
    const body = JSON.stringify(r.toJSON());
    expect(body).toContain('जहाँ संभव न हो'); // toilet's accommodation line
    expect(body).toContain('विधान'); // the weight word (vidhana default)
    act(() => r.unmount());
  });

  test('a home no longer on the roster degrades honestly', async () => {
    await seedRoster([home()]);
    const r = await render(<GharVastuScreen navigation={navigation} route={{ params: { homeId: 'gone' } }} />);
    expect(JSON.stringify(r.toJSON())).toContain('यह घर अब सूची में नहीं है');
    act(() => r.unmount());
  });
});

describe('GharVastuSetupScreen — the sensor-free capture path', () => {
  test('3BHK completes by hand: facing chip → tap-a-cell placement → finish', async () => {
    const r = await render(<GharVastuSetupScreen navigation={navigation} route={{ params: undefined }} />);

    // Step 0 → step 1 (flat-3bhk is the seeded default).
    await act(async () => r.root.findByProps({ testID: 'ghar-setup-next-type' }).props.onPress());
    // Facing from the brochure — no sensor involved.
    await act(async () => r.root.findByProps({ testID: 'ghar-facing-east' }).props.onPress());
    await act(async () => r.root.findByProps({ testID: 'ghar-setup-next-facing' }).props.onPress());

    // Step 2: the next unplaced chip is pre-selected — tapping a cell places it.
    await act(async () => r.root.findByProps({ testID: 'mandala-cell-southeast' }).props.onPress());

    // Facing already placed the door, so one placed room reaches the 2-capture floor.
    const finish = r.root.findByProps({ testID: 'ghar-setup-finish' });
    expect(finish.props.disabled).toBe(false);
    await act(async () => finish.props.onPress());
    expect(navigation.replace).toHaveBeenCalledWith('GharVastu', { homeId: expect.any(String) });
    act(() => r.unmount());
  });

  test('a living-role door opens the setup with role living (US-16)', async () => {
    const r = await render(
      <GharVastuSetupScreen navigation={navigation} route={{ params: { role: 'living' } }} />
    );
    // The role chip reflects the param — the griha-pravesh door's promise.
    const chip = r.root.findByProps({ testID: 'ghar-role-living' });
    expect(chip.props.accessibilityState).toEqual({ selected: true });
    act(() => r.unmount());
  });
});

describe('GharVastuRosterScreen — the saved homes', () => {
  test('lists saved homes and routes: card → reading, new → setup', async () => {
    await seedRoster([home(), home({ id: 'h2', label: 'दूसरा घर' })]);
    const r = await render(<GharVastuRosterScreen navigation={navigation} />);

    await act(async () => r.root.findByProps({ testID: 'ghar-roster-h1' }).props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('GharVastu', { homeId: 'h1' });
    await act(async () => r.root.findByProps({ testID: 'ghar-roster-new' }).props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('GharVastuSetup');
    act(() => r.unmount());
  });

  test('empty roster shows the empty state, never a crash', async () => {
    const r = await render(<GharVastuRosterScreen navigation={navigation} />);
    r.root.findByProps({ testID: 'ghar-roster-empty' });
    act(() => r.unmount());
  });
});
