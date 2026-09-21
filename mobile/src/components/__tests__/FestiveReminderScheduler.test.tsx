import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import FestiveReminderScheduler from '../FestiveReminderScheduler';
import { ensurePakshaWindowAsync, hydrateSmaranSolves, persistSmaranSolves } from '@/panchang/pitruSmaranSolves';
import { schedulePitruPakshaReminders } from '@/notifications/pitruPakshaScheduler';

jest.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: () => ({ remove: jest.fn() }) },
  InteractionManager: { runAfterInteractions: (fn: () => void) => { fn(); return { cancel: jest.fn() }; } },
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ prefs: { festiveRemindersEnabled: true }, permissionStatus: 'granted', isLoading: false }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant'] }));
jest.mock('@/panchang/vratCatalog', () => ({ getRuleById: () => undefined, getNextOccurrences: jest.fn() }));
jest.mock('@/notifications/festiveScheduler', () => ({ scheduleFestiveReminders: jest.fn(async () => 0), cancelAllFestiveReminders: jest.fn(async () => {}) }));
jest.mock('@/notifications/pitruPakshaScheduler', () => ({ schedulePitruPakshaReminders: jest.fn(async () => 0), cancelAllPitruPakshaReminders: jest.fn(async () => {}) }));
jest.mock('@/panchang/pitruSmaranSolves', () => ({
  hydrateSmaranSolves: jest.fn(async () => {}),
  ensurePakshaWindowAsync: jest.fn(),
  persistSmaranSolves: jest.fn(async () => {}),
}));

let tree: TestRenderer.ReactTestRenderer | undefined;
const window = { purnima: new Date(2026, 8, 26), start: new Date(2026, 8, 27), end: new Date(2026, 9, 10) };
beforeEach(() => { jest.clearAllMocks(); (ensurePakshaWindowAsync as jest.Mock).mockResolvedValue(window); });
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });

test('hydrates annual answers before solving cooperatively and persists before scheduling', async () => {
  await act(async () => { tree = TestRenderer.create(<FestiveReminderScheduler />); });
  expect(hydrateSmaranSolves).toHaveBeenCalledWith([], expect.any(Date));
  const today = (hydrateSmaranSolves as jest.Mock).mock.calls[0][1] as Date;
  expect(ensurePakshaWindowAsync).toHaveBeenNthCalledWith(1, today.getFullYear(), expect.any(Function));
  expect(ensurePakshaWindowAsync).toHaveBeenNthCalledWith(2, today.getFullYear() + 1, expect.any(Function));
  expect(persistSmaranSolves).toHaveBeenCalledTimes(1);
  expect(schedulePitruPakshaReminders).toHaveBeenCalledWith([
    { year: today.getFullYear(), window }, { year: today.getFullYear() + 1, window },
  ], expect.any(Date), 'hi');
  expect((hydrateSmaranSolves as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((ensurePakshaWindowAsync as jest.Mock).mock.invocationCallOrder[0]);
  expect((persistSmaranSolves as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((schedulePitruPakshaReminders as jest.Mock).mock.invocationCallOrder[0]);
});

test('unmount cancels the in-flight scan and prevents stale reminder publication', async () => {
  let finish!: (value: typeof window) => void;
  (ensurePakshaWindowAsync as jest.Mock).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  await act(async () => { tree = TestRenderer.create(<FestiveReminderScheduler />); });
  const cancelled = (ensurePakshaWindowAsync as jest.Mock).mock.calls[0][1];
  expect(cancelled()).toBe(false);
  act(() => { tree?.unmount(); tree = undefined; });
  await act(async () => { finish(window); });
  expect(cancelled()).toBe(true);
  expect(ensurePakshaWindowAsync).toHaveBeenCalledTimes(1);
  expect(schedulePitruPakshaReminders).not.toHaveBeenCalled();
});
