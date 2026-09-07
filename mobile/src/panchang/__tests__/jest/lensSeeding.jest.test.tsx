import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCityById, toPanchangLocation } from '@/panchang/locations';
import {
  LENS_SEEN_STORAGE_KEY,
  suggestedLensForLocation,
  useLensSeeding,
} from '@/panchang/lensSeeding';
import type { ObservanceLens, PanchangLocation } from '@/panchang/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const getItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const setItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const setLenses = jest.fn();
let latest: ReturnType<typeof useLensSeeding> | null = null;

function Probe({ location, lenses = [] }: { location: PanchangLocation; lenses?: readonly ObservanceLens[] }) {
  latest = useLensSeeding(location, lenses, true, setLenses);
  return null;
}

async function render(location: PanchangLocation, lenses: readonly ObservanceLens[] = []) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<Probe location={location} lenses={lenses} />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return tree;
}

beforeEach(() => {
  getItem.mockReset().mockResolvedValue(null);
  setItem.mockReset().mockResolvedValue(undefined);
  setLenses.mockReset();
  latest = null;
});

test('state mapping seeds Rajasthan and Bihar but never infers Jain', () => {
  expect(suggestedLensForLocation(toPanchangLocation(getCityById('jaipur')!, 'city'))).toBe('rajasthan');
  expect(suggestedLensForLocation(toPanchangLocation(getCityById('patna')!, 'city'))).toBe('bihar-mithila');
  expect(suggestedLensForLocation(toPanchangLocation(getCityById('ujjain')!, 'default'))).toBeNull();
});

test('untouched Ujjain does not seed or consume the first eligible opportunity', async () => {
  const tree = await render(toPanchangLocation(getCityById('ujjain')!, 'default'));
  expect(setLenses).not.toHaveBeenCalled();
  expect(setItem).not.toHaveBeenCalled();
  expect(latest?.notice).toBeNull();
  act(() => tree.unmount());
});

test('first eligible chosen city auto-adds once and exposes the city-provenance notice', async () => {
  const tree = await render(toPanchangLocation(getCityById('jaipur')!, 'city'));
  expect(setLenses).toHaveBeenCalledWith(['rajasthan']);
  expect(latest?.notice).toMatchObject({ kind: 'added', lens: 'rajasthan', cityEn: 'Jaipur' });
  expect(setItem).toHaveBeenCalledWith(
    LENS_SEEN_STORAGE_KEY,
    expect.stringContaining('"autoSeededLens":"rajasthan"')
  );
  act(() => tree.unmount());
});

test('later city only offers once; Add is explicit and prior lenses stay sticky', async () => {
  getItem.mockResolvedValue(JSON.stringify({
    version: 1,
    initialized: true,
    autoSeededLens: 'rajasthan',
    autoSeededCityId: 'jaipur',
    addedNoticeDismissed: true,
    offered: [],
  }));
  const tree = await render(toPanchangLocation(getCityById('chennai')!, 'city'), ['rajasthan']);
  expect(setLenses).not.toHaveBeenCalled();
  expect(latest?.notice).toMatchObject({ kind: 'offer', lens: 'tamil' });
  act(() => latest?.acceptOffer());
  expect(setLenses).toHaveBeenCalledWith(['rajasthan', 'tamil']);
  act(() => tree.unmount());
});

test('storage failure is non-fatal and never blocks the in-memory seed', async () => {
  getItem.mockRejectedValue(new Error('disk unavailable'));
  setItem.mockRejectedValue(new Error('disk unavailable'));
  const tree = await render(toPanchangLocation(getCityById('jaipur')!, 'city'));
  expect(setLenses).toHaveBeenCalledWith(['rajasthan']);
  expect(latest?.notice?.kind).toBe('added');
  act(() => tree.unmount());
});
