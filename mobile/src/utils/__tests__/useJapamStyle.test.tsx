import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useJapamStyle, JAPAM_STYLE_KEY } from '../useJapamStyle';

let state: ReturnType<typeof useJapamStyle>;
let tree: TestRenderer.ReactTestRenderer;
function Probe() { state = useJapamStyle(); return null; }
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });
afterEach(() => { act(() => tree?.unmount()); });
async function mount() { await act(async () => { tree = TestRenderer.create(<Probe />); }); }

test('restores the last style on a new mount', async () => {
  await mount();
  await act(async () => { state.selectStyle('infinity'); });
  expect(await AsyncStorage.getItem(JAPAM_STYLE_KEY)).toBe('"infinity"');
  act(() => tree.unmount());
  await mount();
  expect(state.style).toBe('infinity');
});

test.each(['broken', '"unknown"', '{}'])('invalid preference %s keeps mala and does not write defaults', async (raw) => {
  await AsyncStorage.setItem(JAPAM_STYLE_KEY, raw);
  jest.mocked(AsyncStorage.setItem).mockClear();
  await mount();
  expect(state.style).toBe('mala');
  expect(state.ready).toBe(true);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('does not accept a change until hydration finishes', async () => {
  let resolve!: (raw: string | null) => void;
  jest.mocked(AsyncStorage.getItem).mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
  await mount();
  expect(state.ready).toBe(false);
  await act(async () => { state.selectStyle('mala'); resolve('"infinity"'); });
  expect(state.style).toBe('infinity');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('serializes switches and keeps the final choice', async () => {
  await mount();
  await act(async () => { state.selectStyle('infinity'); state.selectStyle('mala'); state.selectStyle('infinity'); });
  expect(await AsyncStorage.getItem(JAPAM_STYLE_KEY)).toBe('"infinity"');
  expect(state.style).toBe('infinity');
});

test('storage failure leaves the session usable and allows a later write', async () => {
  jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('unavailable'));
  await mount();
  expect(state.ready).toBe(true);
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('full'));
  await act(async () => { state.selectStyle('infinity'); });
  expect(state.style).toBe('infinity');
  await act(async () => { state.selectStyle('mala'); });
  expect(await AsyncStorage.getItem(JAPAM_STYLE_KEY)).toBe('"mala"');
});
