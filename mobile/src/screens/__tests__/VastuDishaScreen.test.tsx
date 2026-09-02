/**
 * वास्तु दिशा screen (PRD-24, RULEBOOK §22.6/§22.10): the sensor-unavailable
 * path — the exact path simulators and CI can see — must open manual mode with
 * every guidance surface fully rendered, and a chip tap must surface that
 * direction's guidance. Harness follows MuhuratFinderScreens.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import VastuDishaScreen from '@/screens/VastuDishaScreen';
import { getMandirGuidance } from '@/data/vastu/mandirGuidance';
import { getVastuRoomEntries } from '@/data/vastu/roomGuidance';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

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

const navigation = { goBack: jest.fn() };

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
