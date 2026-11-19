import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import TimelyTagsResolver from '../TimelyTagsResolver';
import { setStoredObservanceYear } from '@/panchang/observanceStore';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import type { ObservanceLens } from '@/panchang/lenses';
const mockUnsafeLookup = jest.fn((..._args: unknown[]) => { throw new Error('Sharing must not start a calendar solve'); });
let mockDay = new Date(2040, 0, 1).toDateString();
let mockLocation = { cityId: 'share-performance-test', latitude: 23.17, longitude: 75.78, timezone: 'Asia/Kolkata' };
let mockLenses = new Set<ObservanceLens>();
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant', jest.fn()], useObservancesForDate: (...args: unknown[]) => mockUnsafeLookup(...args) }));
jest.mock('@/panchang/festivalEngine', () => ({
 ...jest.requireActual('@/panchang/festivalEngine'),
 getObservancesForDate: (...args: unknown[]) => mockUnsafeLookup(...args),
 resolveObservancesForYearLive: (...args: unknown[]) => mockUnsafeLookup(...args),
}));
jest.mock('@/contexts/PanchangLocationContext', () => ({ usePanchangLocation: () => ({ location: mockLocation }) }));
jest.mock('@/panchang/useLenses', () => ({ useLenses: () => ({ lenses: mockLenses }) }));
jest.mock('@/utils/useTodayKey', () => ({ useTodayKey: () => mockDay }));
let tree: ReactTestRenderer;
const resolved = jest.fn();
beforeEach(() => {
 mockDay = new Date(2040, 0, 1).toDateString(); mockLocation = { ...mockLocation, cityId: 'share-performance-test' };
 mockLenses = new Set(); resolved.mockClear(); mockUnsafeLookup.mockClear();
 setStoredObservanceYear(mockLocation.cityId, 'purnimant', 2040, []);
});
afterEach(() => { if (tree) act(() => tree.unmount()); });
const mount = () => { act(() => { tree = create(<TimelyTagsResolver onResolve={resolved} />); }); };
it('never starts astronomy on a cache miss outside the table, retaining weekday tags', () => {
 mockLocation = { ...mockLocation, cityId: 'share-performance-cold-city' };
 mount(); expect(mockUnsafeLookup).not.toHaveBeenCalled();
 expect(resolved).toHaveBeenLastCalledWith(expect.objectContaining({ occasions: [], weekday: new Date(mockDay).getDay() }));
 expect(resolved.mock.calls.at(-1)![0].weekdayDeity).toBeTruthy();
});
it('updates from an existing scan while mounted and unsubscribes on close', () => {
 mount(); resolved.mockClear();
 act(() => setStoredObservanceYear(mockLocation.cityId, 'purnimant', 2040, [['diwali', '2040-01-01']]));
 expect(resolved.mock.calls.at(-1)![0].occasions).toEqual([expect.objectContaining({ nameEn: 'Diwali' })]);
 act(() => tree.unmount()); resolved.mockClear();
 act(() => setStoredObservanceYear(mockLocation.cityId, 'purnimant', 2040, [])); expect(resolved).not.toHaveBeenCalled();
});
it('preserves regional filtering and removes stale day/location tags', () => {
 const regional = OBSERVANCE_RULES.find(r => r.lens?.length)!;
 setStoredObservanceYear(mockLocation.cityId, 'purnimant', 2040, [['diwali', '2040-01-01'], [regional.id, '2040-01-01']]);
 mount(); expect(resolved.mock.calls.at(-1)![0].occasions).toHaveLength(1);
 mockLenses = new Set(regional.lens!); act(() => tree.update(<TimelyTagsResolver onResolve={resolved} />));
 expect(resolved.mock.calls.at(-1)![0].occasions).toHaveLength(2);
 mockDay = new Date(2040, 0, 2).toDateString(); act(() => tree.update(<TimelyTagsResolver onResolve={resolved} />));
 expect(resolved.mock.calls.at(-1)![0].occasions).toEqual([]);
 mockLocation = { ...mockLocation, cityId: 'share-performance-cold-city' }; act(() => tree.update(<TimelyTagsResolver onResolve={resolved} />));
 expect(resolved.mock.calls.at(-1)![0].occasions).toEqual([]); expect(mockUnsafeLookup).not.toHaveBeenCalled();
});
