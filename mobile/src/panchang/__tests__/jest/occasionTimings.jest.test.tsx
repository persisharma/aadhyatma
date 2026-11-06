import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useOccasionTimings } from '@/panchang/useOccasionTimings';
import { __resetPanchangDayStore } from '@/panchang/panchangDayStore';
let mockFail = false, mockHydrated = true;
const mockLocation = { isLoading: false, location: { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 } };
jest.mock('@/contexts/PanchangLocationContext', () => ({ usePanchangLocation: () => mockLocation }));
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarHydrated: () => mockHydrated }));
jest.mock('@/panchang/useLenses', () => ({ useLenses: () => ({ lenses: new Set(), hydrated: true }) }));
jest.mock('@/panchang/panchangDayCache', () => ({ hydratePanchangDays: async () => { if (mockFail) throw Error('disk'); }, persistPanchangDays: async () => {} }));
jest.mock('react-native', () => ({ InteractionManager: { runAfterInteractions: (fn: () => void) => { fn(); return { cancel() {} }; } } }));
let latest: ReturnType<typeof useOccasionTimings>;
function Probe({ date }: { date: Date }) { latest = useOccasionTimings(date, 'purnimant'); return null; }
const trees: TestRenderer.ReactTestRenderer[] = [];
function mount(date: Date) { let tree!: TestRenderer.ReactTestRenderer; act(() => { tree = TestRenderer.create(<Probe date={date} />); }); trees.push(tree); return tree; }
async function settle() { await act(async () => { await jest.runAllTimersAsync(); }); }
beforeEach(() => { jest.useFakeTimers(); mockFail = false; mockHydrated = true; mockLocation.isLoading = false; mockLocation.location = { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 }; __resetPanchangDayStore(); });
afterEach(() => { act(() => trees.splice(0).forEach(t => t.unmount())); jest.useRealTimers(); });
test('real rule matcher → shared inputs → location-specific window and next-day parana', async () => {
  mount(new Date(2026, 10, 6)); await settle();
  expect(latest.loading).toBe(false);
  expect(latest.items.some(i => i.ruleId === 'dhanteras' && i.windows.length)).toBe(true);
  expect(latest.items.find(i => i.ruleId === 'rama-ekadashi')?.windows[0].start.getDate()).toBe(6);
});
test('city/date changes suppress stale results before background work finishes', async () => {
  const tree = mount(new Date(2026, 10, 8)); await settle(); const start = +latest.items[0].windows[0].start;
  mockLocation.location = { cityId: 'bengaluru', latitude: 12.9716, longitude: 77.5946, elevation: 920 };
  act(() => tree.update(<Probe date={new Date(2026, 10, 8)} />)); expect(latest.items).toEqual([]); await settle();
  expect(+latest.items[0].windows[0].start).not.toBe(start);
  act(() => tree.update(<Probe date={new Date(2026, 10, 12)} />)); expect(latest.items).toEqual([]); await settle(); expect(latest.items).toEqual([]);
});
test('hydration gates work, disk error offers retry and successful retry clears the error', async () => {
  mockHydrated = false; const tree = mount(new Date(2026, 10, 8)); await settle(); expect(latest.items).toEqual([]);
  mockHydrated = true; mockFail = true; act(() => tree.update(<Probe date={new Date(2026, 10, 8)} />)); await settle(); expect(latest.error).toBe(true);
  mockFail = false; act(() => latest.retry()); expect(latest.loading).toBe(true); await settle(); expect(latest.error).toBe(false); expect(latest.items.length).toBeGreaterThan(0);
});
test('rapid navigation cancels old work and unmount does not publish', async () => {
  const tree = mount(new Date(2026, 10, 8)); act(() => tree.update(<Probe date={new Date(2026, 10, 12)} />)); await settle(); expect(latest.items).toEqual([]);
  act(() => tree.unmount()); trees.pop(); await settle();
});
