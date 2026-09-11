/**
 * Pada ring content gate (PRD-24 Phase 2 §A5/US-11): with the SHIPPED registry
 * (every side draft) the door flow is facing-only — no ring, no pada row, no
 * placeholder. This suite flips the fixture to a verified east wall via a
 * module mock and proves the surfaces appear and record the GLOBAL pada index
 * — the mechanism is live, only the content gate holds it shut.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import GharVastuSetupScreen from '@/screens/GharVastuSetupScreen';
import { VASTU_HOMES_STORAGE_KEY } from '@/vastu/homeRecord';
import { __resetHomeRosterStoreForTests } from '@/vastu/homeRecordStore';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

// The fixture flip: east wall verified (names abridged), everything else draft.
jest.mock('@/data/vastu/doorPadas', () => {
  const east = {
    side: 'east',
    status: 'verified',
    source: { referenceUrls: ['https://a.example', 'https://b.example'], verificationNote: 'test fixture' },
    padas: Array.from({ length: 8 }, (_, i) => ({
      index: 9 + i,
      nameHi: `पद${i + 1}`,
      nameEn: `Pada${i + 1}`,
      auspicious: i === 2 || i === 3,
    })),
  };
  return {
    getDoorPadasForSide: (side: string) => (side === 'east' ? east : null),
    getDoorPadaByIndex: (index: number) =>
      index >= 9 && index <= 16 ? { side: 'east', pada: east.padas[index - 9] } : null,
  };
});

const navigation = { goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn() };

async function renderSetup() {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <GharVastuSetupScreen navigation={navigation} route={{ params: undefined }} />
      </GitaLanguageProvider>
    );
  });
  // Step 0 → step 1 (facing).
  await act(async () => renderer.root.findByProps({ testID: 'ghar-setup-next-type' }).props.onPress());
  return renderer;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetHomeRosterStoreForTests();
});

test('a verified wall surfaces the manual pada row; picking one records the GLOBAL index', async () => {
  const r = await renderSetup();
  // No facing chosen yet → no row.
  expect(r.root.findAllByProps({ testID: 'ghar-pada-row' })).toHaveLength(0);
  // Facing east (the verified wall) → the row appears with that wall's names.
  await act(async () => r.root.findByProps({ testID: 'ghar-facing-east' }).props.onPress());
  r.root.findByProps({ testID: 'ghar-pada-row' });
  await act(async () => r.root.findByProps({ testID: 'ghar-pada-12' }).props.onPress());
  const stored = await AsyncStorage.getItem(VASTU_HOMES_STORAGE_KEY);
  const roster = JSON.parse(stored ?? '{}') as { homes: { doorPada: number | null }[] };
  expect(roster.homes[0]!.doorPada).toBe(12); // global index, never the 1–8 local one
  act(() => r.unmount());
});

test('a draft wall stays facing-only — no pada row, no placeholder (US-11)', async () => {
  const r = await renderSetup();
  // Facing south — draft in the fixture, as ALL walls are in the shipped app.
  await act(async () => r.root.findByProps({ testID: 'ghar-facing-south' }).props.onPress());
  expect(r.root.findAllByProps({ testID: 'ghar-pada-row' })).toHaveLength(0);
  const stored = await AsyncStorage.getItem(VASTU_HOMES_STORAGE_KEY);
  const roster = JSON.parse(stored ?? '{}') as { homes: { doorPada: number | null }[] };
  expect(roster.homes[0]!.doorPada).toBeNull();
  act(() => r.unmount());
});

test('switching the facing clears a pada recorded for the old wall', async () => {
  const r = await renderSetup();
  await act(async () => r.root.findByProps({ testID: 'ghar-facing-east' }).props.onPress());
  await act(async () => r.root.findByProps({ testID: 'ghar-pada-12' }).props.onPress());
  await act(async () => r.root.findByProps({ testID: 'ghar-facing-north' }).props.onPress());
  const stored = await AsyncStorage.getItem(VASTU_HOMES_STORAGE_KEY);
  const roster = JSON.parse(stored ?? '{}') as { homes: { doorPada: number | null }[] };
  expect(roster.homes[0]!.doorPada).toBeNull();
  act(() => r.unmount());
});
