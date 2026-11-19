import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { usePanchangForSelection } from '../../usePanchang';
import { cachedDayInputs, cachedDayInputsAsync } from '../../panchangDayStore';
const mockLocation = { cityId: 'jaipur', latitude: 26.9124, longitude: 75.7873, elevation: 431 };
jest.mock('@/contexts/PanchangLocationContext', () => ({ usePanchangLocation: () => ({ location: mockLocation }) }));
jest.mock('../../useLenses', () => ({ useLenses: () => ({ lenses: new Set() }) }));
jest.mock('../../panchangDayCache', () => ({ hydratePanchangDays: async () => {}, persistPanchangDays: jest.fn() }));
jest.mock('../../panchangDayStore', () => ({
  ...jest.requireActual('../../panchangDayStore'),
  cachedDayInputs: jest.fn(() => ({ inputs: { p: { date: new Date(2026, 10, 8) } } })),
  cachedDayInputsAsync: jest.fn(),
}));
let latest: ReturnType<typeof usePanchangForSelection>;
function Probe() { latest = usePanchangForSelection(new Date(2026, 10, 8), 'purnimant'); return null; }
afterEach(() => { jest.useRealTimers(); jest.clearAllMocks(); });
test('cold entry leaves input callbacks runnable while the async day solve is pending; unmount cancels publication', async () => {
  jest.useFakeTimers();
  let finish!: (value: any) => void;
  (cachedDayInputsAsync as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe />); });
  await act(async () => { await jest.runOnlyPendingTimersAsync(); });
  expect(cachedDayInputsAsync).toHaveBeenCalledTimes(1);
  expect(cachedDayInputs).not.toHaveBeenCalled();
  expect(latest.panchang).toBeNull();
  const input = jest.fn();
  setTimeout(input, 0);
  await act(async () => { await jest.runOnlyPendingTimersAsync(); });
  expect(input).toHaveBeenCalledTimes(1);
  const cancelled = (cachedDayInputsAsync as jest.Mock).mock.calls[0][3];
  expect(cancelled()).toBe(false);
  act(() => tree.unmount());
  expect(cancelled()).toBe(true);
  await act(async () => finish({ p: { date: new Date(2026, 10, 8) } }));
});
