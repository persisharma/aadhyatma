import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import FestiveReminderScheduler from '../FestiveReminderScheduler';
import { ensurePakshaWindowAsync, hydrateSmaranSolves, persistSmaranSolves } from '@/panchang/pitruSmaranSolves';
import { schedulePitruPakshaReminders } from '@/notifications/pitruPakshaScheduler';
import { scheduleFestiveReminders } from '@/notifications/festiveScheduler';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';

jest.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: () => ({ remove: jest.fn() }) },
  InteractionManager: { runAfterInteractions: (fn: () => void) => { fn(); return { cancel: jest.fn() }; } },
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ prefs: { festiveRemindersEnabled: true }, permissionStatus: 'granted', isLoading: false }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/panchang/usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant'] }));
jest.mock('@/panchang/vratCatalog', () => ({
  getRuleById: jest.fn(() => undefined),
  getNextOccurrences: jest.fn(() => []),
  getNextOccurrence: jest.fn(() => null),
}));
const mockVrat = {
  follows: [] as unknown[],
  reminderDefault: { advanceDays: 1, dayOf: true, dayOfTime: { hour: 7, minute: 0 } },
};
jest.mock('@/contexts/VratFollowContext', () => ({ useVratFollows: () => mockVrat }));
jest.mock('@/notifications/festiveScheduler', () => ({ scheduleFestiveReminders: jest.fn(async () => 0), cancelAllFestiveReminders: jest.fn(async () => {}) }));
jest.mock('@/notifications/pitruPakshaScheduler', () => ({ schedulePitruPakshaReminders: jest.fn(async () => 0), cancelAllPitruPakshaReminders: jest.fn(async () => {}) }));
jest.mock('@/panchang/pitruSmaranSolves', () => ({
  hydrateSmaranSolves: jest.fn(async () => {}),
  ensurePakshaWindowAsync: jest.fn(),
  persistSmaranSolves: jest.fn(async () => {}),
}));

let tree: TestRenderer.ReactTestRenderer | undefined;
const window = { purnima: new Date(2026, 8, 26), start: new Date(2026, 8, 27), end: new Date(2026, 9, 10) };
beforeEach(() => { jest.clearAllMocks(); mockVrat.follows = []; (ensurePakshaWindowAsync as jest.Mock).mockResolvedValue(window); });
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

test('tells the festive planner which dates a followed vrat already announces (BEH-05)', async () => {
  const occ = new Date();
  occ.setHours(0, 0, 0, 0);
  occ.setDate(occ.getDate() + 3);
  const key = `${occ.getFullYear()}-${`${occ.getMonth() + 1}`.padStart(2, '0')}-${`${occ.getDate()}`.padStart(2, '0')}`;
  (getRuleById as jest.Mock).mockReturnValue({ id: 'janmashtami', nameHi: 'जन्माष्टमी', nameEn: 'Janmashtami' });
  (getNextOccurrence as jest.Mock).mockReturnValue({ date: occ });
  mockVrat.follows = [{ ruleId: 'janmashtami', order: 0, reminder: { advanceDays: 0, dayOf: true, dayOfTime: { hour: 7, minute: 0 } } }];
  await act(async () => { tree = TestRenderer.create(<FestiveReminderScheduler />); });
  const covered = (scheduleFestiveReminders as jest.Mock).mock.calls[0][3] as Set<string>;
  expect([...covered]).toEqual([`janmashtami:${key}`]);

  // An advance-only follow leaves the festive notice alone.
  jest.clearAllMocks();
  act(() => { tree?.unmount(); tree = undefined; });
  mockVrat.follows = [{ ruleId: 'janmashtami', order: 0, reminder: { advanceDays: 1, dayOf: false, dayOfTime: { hour: 7, minute: 0 } } }];
  await act(async () => { tree = TestRenderer.create(<FestiveReminderScheduler />); });
  expect([...((scheduleFestiveReminders as jest.Mock).mock.calls[0][3] as Set<string>)]).toEqual([]);
});
