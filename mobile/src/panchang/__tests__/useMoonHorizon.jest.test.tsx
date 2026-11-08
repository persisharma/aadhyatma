import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useMoonHorizon } from '../useMoonHorizon';
import { cachedMoonHorizon, computeMoonHorizon, type MoonHorizon } from '../moonHorizon';

let mockLocation = { latitude: 23.1765, longitude: 75.7885, elevation: 494 };
let mockLoading = false;
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({ location: mockLocation, isLoading: mockLoading }),
}));
jest.mock('../moonHorizon', () => ({
  ...jest.requireActual('../moonHorizon'),
  cachedMoonHorizon: jest.fn(),
  computeMoonHorizon: jest.fn(),
}));

const start = new Date('2026-10-28T17:51:00+05:30');
const fixture: MoonHorizon = { previousRise: null, previousSet: null, nextRise: new Date('2026-10-28T20:00:00+05:30'), nextSet: null, nightRise: new Date('2026-10-28T20:00:00+05:30') };
let result: MoonHorizon | null;
let tree: TestRenderer.ReactTestRenderer;
function Probe({ nightStart }: { nightStart: Date | null }) {
  result = useMoonHorizon(nightStart);
  return null;
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(cachedMoonHorizon).mockReturnValue(null);
  jest.mocked(computeMoonHorizon).mockReturnValue(fixture);
  mockLocation = { latitude: 23.1765, longitude: 75.7885, elevation: 494 };
  mockLoading = false;
});
afterEach(() => {
  if (tree) act(() => tree.unmount());
  jest.clearAllMocks();
  jest.useRealTimers();
});
const render = (at: Date | null) => act(() => { tree = TestRenderer.create(<Probe nightStart={at} />); });

test('day/browsed headers and an unsettled location do no astronomy work', () => {
  render(null);
  act(() => jest.runOnlyPendingTimers());
  expect(computeMoonHorizon).not.toHaveBeenCalled();
  mockLoading = true;
  act(() => tree.update(<Probe nightStart={start} />));
  act(() => jest.runOnlyPendingTimers());
  expect(computeMoonHorizon).not.toHaveBeenCalled();
});

test('night solves after render and does not repeat on minute rerenders', () => {
  render(start);
  expect(computeMoonHorizon).not.toHaveBeenCalled();
  expect(result).toBeNull();
  act(() => jest.runOnlyPendingTimers());
  expect(result).toBe(fixture);
  act(() => tree.update(<Probe nightStart={new Date(start)} />));
  act(() => jest.runOnlyPendingTimers());
  expect(computeMoonHorizon).toHaveBeenCalledTimes(1);
});

test('warm night events render immediately without scheduling a solve', () => {
  jest.mocked(cachedMoonHorizon).mockReturnValue(fixture);
  render(start);
  expect(result).toBe(fixture);
  act(() => jest.runOnlyPendingTimers());
  expect(computeMoonHorizon).not.toHaveBeenCalled();
});

test('a location change cancels the pending previous-city solve', () => {
  render(start);
  mockLocation = { latitude: 12.9716, longitude: 77.5946, elevation: 920 };
  act(() => tree.update(<Probe nightStart={start} />));
  act(() => jest.runOnlyPendingTimers());
  expect(computeMoonHorizon).toHaveBeenCalledTimes(1);
  expect(computeMoonHorizon).toHaveBeenCalledWith(start, mockLocation);
});
