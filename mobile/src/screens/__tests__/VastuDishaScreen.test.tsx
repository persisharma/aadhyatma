/**
 * वास्तु दिशा screen (PRD-24, RULEBOOK §22.6/§22.10): the sensor-unavailable
 * path — the exact path simulators and CI can see — must open manual mode with
 * every guidance surface fully rendered, and a chip tap must surface that
 * direction's guidance. Harness follows MuhuratFinderScreens.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import VastuDishaScreen from '@/screens/VastuDishaScreen';
import { getMandirGuidance } from '@/data/vastu/mandirGuidance';
import { getVastuRoomEntries } from '@/data/vastu/roomGuidance';
import { VASTU_HOMES_STORAGE_KEY, type HomeRecord, type HomeRoster } from '@/vastu/homeRecord';
import { __resetHomeRosterStoreForTests } from '@/vastu/homeRecordStore';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

// ListCard (the मेरे घर door) renders a gradient thumb.
jest.mock('expo-linear-gradient', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const r = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(View, p, children) };
});

jest.mock('react-native-svg', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Circle: mk(),
    G: mk(),
    Line: mk(),
    Polygon: mk(),
    Text: mk(),
  };
});

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: {
      cityId: 'ujjain',
      labelHi: 'उज्जैन',
      labelEn: 'Ujjain',
      latitude: 23.1765,
      longitude: 75.7885,
      elevation: 494,
      source: 'default',
    },
    gpsStatus: 'idle',
    selectCity: jest.fn(),
    requestDeviceLocation: jest.fn(),
  }),
}));

// The simulator/CI truth: no magnetometer. The unavailable → manual path is
// the one this suite can honestly pin (RULEBOOK §22.6).
jest.mock('expo-sensors', () => ({
  Magnetometer: {
    isAvailableAsync: jest.fn(async () => false),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn() };

async function renderScreen() {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <VastuDishaScreen navigation={navigation} />
      </GitaLanguageProvider>
    );
  });
  return renderer;
}

const texts = (renderer: TestRenderer.ReactTestRenderer): string => JSON.stringify(renderer.toJSON());

test('sensor unavailable → manual mode with every guidance surface rendered', async () => {
  const r = await renderScreen();
  const body = texts(r);

  // The honest degraded state names itself…
  expect(body).toContain('दिक्सूचक उपलब्ध नहीं');
  // …and the content never depends on the sensor: all verified rooms + mandir
  // entries render, the draft ancestor-photos entry does not.
  for (const entry of getVastuRoomEntries()) {
    r.root.findByProps({ testID: `vastu-room-${entry.id}` });
  }
  for (const entry of getMandirGuidance()) {
    r.root.findByProps({ testID: `vastu-mandir-${entry.id}` });
  }
  expect(r.root.findAllByProps({ testID: 'vastu-mandir-ancestor-photos' })).toHaveLength(0);
  // All 8 manual chips are offered.
  for (const dik of ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast']) {
    r.root.findByProps({ testID: `vastu-disha-${dik}` });
  }
  act(() => r.unmount());
});

// ——— Hold (PRD-24 Phase 2 §A4/US-03) ———

test('the Hold pill is disabled when the sensor is unavailable — nothing to hold', async () => {
  const r = await renderScreen();
  const hold = r.root.findByProps({ testID: 'vastu-hold' });
  expect(hold.props.accessibilityState).toEqual({ selected: false, disabled: true });
  act(() => r.unmount());
});

test('the Hold pill is disabled in manual mode — a chip already froze the dial', async () => {
  const r = await renderScreen();
  await act(async () => {
    r.root.findByProps({ testID: 'vastu-disha-east' }).props.onPress();
  });
  const hold = r.root.findByProps({ testID: 'vastu-hold' });
  expect(hold.props.accessibilityState.disabled).toBe(true);
  act(() => r.unmount());
});

// ——— मेरे घर door (PRD-24 Phase 2 §C4) ———

const gharHome = (over: Partial<HomeRecord> = {}): HomeRecord => ({
  id: 'h1',
  version: 1,
  label: 'हमारा घर',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  rooms: [],
  createdAt: '2026-09-06T10:00:00.000Z',
  updatedAt: '2026-09-06T10:00:00.000Z',
  ...over,
});

async function seedRoster(homes: HomeRecord[]) {
  __resetHomeRosterStoreForTests();
  const roster: HomeRoster = { version: 1, homes, livingId: null };
  await AsyncStorage.setItem(VASTU_HOMES_STORAGE_KEY, JSON.stringify(roster));
}

test('मेरे घर door: NEW badge on an empty roster, tap opens setup', async () => {
  await seedRoster([]);
  const r = await renderScreen();
  const door = r.root.findByProps({ testID: 'vastu-mere-ghar-door' });
  expect(JSON.stringify(r.toJSON())).toContain('NEW');
  await act(async () => door.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('GharVastuSetup');
  act(() => r.unmount());
});

test('मेरे घर door: one saved home opens its reading directly, no NEW badge', async () => {
  await seedRoster([gharHome()]);
  const r = await renderScreen();
  const door = r.root.findByProps({ testID: 'vastu-mere-ghar-door' });
  await act(async () => door.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('GharVastu', { homeId: 'h1' });
  expect(JSON.stringify(r.toJSON())).not.toContain('NEW');
  act(() => r.unmount());
});

test('मेरे घर door: several homes open the roster', async () => {
  await seedRoster([gharHome(), gharHome({ id: 'h2' }), gharHome({ id: 'h3' })]);
  const r = await renderScreen();
  await act(async () => r.root.findByProps({ testID: 'vastu-mere-ghar-door' }).props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('GharVastuRoster');
  act(() => r.unmount());
});

test('a manual chip tap surfaces that direction’s guidance first', async () => {
  const r = await renderScreen();

  expect(texts(r)).not.toContain('इस दिशा में'); // nothing faced yet
  await act(async () => {
    r.root.findByProps({ testID: 'vastu-disha-southeast' }).props.onPress();
  });
  const body = texts(r);
  expect(body).toContain('इस दिशा में');
  expect(body).toContain('रसोई'); // the आग्नेय kitchen entry leads
  // Manual mode on a sensorless device names its state.
  expect(body).toContain('दिशा स्वयं चुनी गई है');
  act(() => r.unmount());
});
