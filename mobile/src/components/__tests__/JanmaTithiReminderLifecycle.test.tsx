import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationPreferencesProvider } from '@/contexts/NotificationPreferencesContext';
import { getJanmaPrefsSnapshot, setJanmaReminder } from '@/panchang/janmaTithiPrefs';
import JanmaTithiReminderScheduler from '../JanmaTithiReminderScheduler';

const mockPeople = [{ id: 'p1', date: '1988-11-12', name: 'Sita', time: '06:40', cityId: 'jaipur' }];
jest.mock('@/panchang/useKundali', () => ({
  useBirthProfileRoster: () => ({ roster: { people: mockPeople }, hydrated: true }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/utils/runWhenIdle', () => ({
  runWhenIdle: (work: () => void) => { work(); return { cancel: jest.fn() }; },
}));
jest.mock('@/panchang/pitruSmaranSolves', () => ({
  hydrateSmaranSolves: async () => undefined,
  persistSmaranSolves: async () => undefined,
  ensureOccurrencesAsync: async (_rule: unknown, today: Date) =>
    [new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)],
}));
jest.mock('@/notifications/scheduler', () => ({
  cancelAllDailyVerseNotifications: jest.fn().mockResolvedValue(undefined),
}));
const mockPending = new Set<string>();
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(), requestPermissionsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: async () => [...mockPending].map(identifier => ({ identifier })),
  scheduleNotificationAsync: jest.fn(async ({ identifier }) => mockPending.add(identifier)),
  cancelScheduledNotificationAsync: async (id: string) => mockPending.delete(id),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

test('returning from Settings rechecks permission and arms only a still opted-in person', async () => {
  const permission = Notifications.getPermissionsAsync as jest.Mock;
  permission.mockResolvedValue({ status: 'denied', canAskAgain: false });
  const subscriptions = jest.spyOn(AppState, 'addEventListener');
  const returnFromSettings = () => act(async () => {
    for (const state of ['background', 'active'] as const) {
      for (const [event, handler] of subscriptions.mock.calls) {
        if (event === 'change') handler(state);
      }
    }
  });
  let tree!: TestRenderer.ReactTestRenderer;
  try {
    await setJanmaReminder('p1', true, ['p1']);
    await act(async () => {
      tree = TestRenderer.create(
        <NotificationPreferencesProvider><JanmaTithiReminderScheduler /></NotificationPreferencesProvider>
      );
    });
    expect(mockPending.size).toBe(0);
    permission.mockResolvedValue({ status: 'granted', canAskAgain: true });
    await returnFromSettings();
    await returnFromSettings();
    expect(mockPending.size).toBe(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    permission.mockResolvedValue({ status: 'denied', canAskAgain: false });
    await returnFromSettings();
    expect(mockPending.size).toBe(0);
    expect(getJanmaPrefsSnapshot().prefs.reminders.p1).toBe(true);
    await act(async () => setJanmaReminder('p1', false, ['p1']));
    permission.mockResolvedValue({ status: 'granted', canAskAgain: true });
    await returnFromSettings();
    expect(mockPending.size).toBe(0);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  } finally {
    act(() => tree?.unmount());
    subscriptions.mockRestore();
  }
});
