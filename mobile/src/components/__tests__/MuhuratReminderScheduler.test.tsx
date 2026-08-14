/**
 * The claim this slice makes and cannot prove from the pure planner alone:
 * a muhurat follow stores only (occasion, civil day), and the WINDOW is
 * re-derived at plan time — so changing city re-arms the notifications with
 * different times rather than replaying a stored one.
 *
 * Asserted by counting/inspecting real `scheduleNotificationAsync` calls, the
 * same reasoning as `panchangDayRouting.jest.test.ts`: "does it re-arm?" is the
 * whole question, and a test that only checked rendered output would pass just
 * as happily while firing yesterday's times forever.
 *
 * Panchang values come from the real engine — no engine mocks.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MuhuratReminderScheduler from '@/components/MuhuratReminderScheduler';
import { MuhuratFollowProvider, followDateKey } from '@/contexts/MuhuratFollowContext';
import { computePanchangForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { computeAstaFlags, evaluateDay, getEventRule } from '@/panchang/eventMuhurat';
import { __resetPanchangDayStore } from '@/panchang/panchangDayStore';

const UJJAIN = {
  cityId: 'ujjain',
  labelHi: 'उज्जैन',
  labelEn: 'Ujjain',
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 494,
  source: 'default' as const,
};
// ~11° south and ~2° east of Ujjain: sunrise differs by tens of minutes, so a
// re-derived window CANNOT coincide with the stored-city one.
const BENGALURU = {
  cityId: 'bengaluru',
  labelHi: 'बेंगलुरु',
  labelEn: 'Bengaluru',
  latitude: 12.9716,
  longitude: 77.5946,
  elevation: 920,
  source: 'default' as const,
};

let mockLocation: typeof UJJAIN = UJJAIN;

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({ location: mockLocation }),
}));

let mockPermission = 'granted';
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ permissionStatus: mockPermission }),
}));

jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
}));

const mockScheduled: { identifier: string; date: Date; body: string }[] = [];
jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async (req: never) => {
    const r = req as unknown as {
      identifier: string;
      content: { body: string };
      trigger: { date: Date };
    };
    mockScheduled.push({ identifier: r.identifier, date: r.trigger.date, body: r.content.body });
    return r.identifier;
  }),
}));

jest.mock('@/panchang/panchangDayCache', () => ({
  hydratePanchangDays: jest.fn(async () => undefined),
  persistPanchangDays: jest.fn(async () => undefined),
}));

/**
 * First upcoming day that grades for वाहन क्रय in BOTH cities. Anchoring on a
 * real future day keeps the fire times inside the planner's rolling window
 * whatever day the suite runs on.
 */
function firstGradedDay(): Date {
  const rule = getEventRule('vahan');
  const today = new Date();
  for (let i = 2; i < 60; i += 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const graded = [UJJAIN, BENGALURU].every((loc) => {
      const p = computePanchangForDate(d, { location: loc as never });
      const next = computePanchangForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), {
        location: loc as never,
      });
      const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
      const v = evaluateDay(
        rule,
        d.getTime(),
        d.getDay(),
        p,
        m,
        computeAstaFlags(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12))
      );
      return v.tier !== 'excluded' && v.windows.length > 0;
    });
    if (graded) return d;
  }
  throw new Error('no gradeable Vahan day in the next 60 — rule tables changed?');
}

const DAY = firstGradedDay();

async function mount() {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <MuhuratFollowProvider>
        <MuhuratReminderScheduler />
      </MuhuratFollowProvider>
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
  return tree;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetPanchangDayStore();
  mockScheduled.length = 0;
  mockLocation = UJJAIN;
  mockPermission = 'granted';
  await AsyncStorage.setItem(
    '@vedansh/muhurat-follows',
    JSON.stringify([{ occasionId: 'vahan', dateKey: followDateKey(DAY), addedAt: 1 }])
  );
});

test('arms both notices for a followed day', async () => {
  const tree = await mount();
  expect(mockScheduled.map((s) => s.identifier).sort()).toEqual([
    `muhurat-reminder:vahan:advance:${followDateKey(DAY)}`,
    `muhurat-reminder:vahan:dayOf:${followDateKey(DAY)}`,
  ]);
  // The day-of body names the window — the point of a muhurat reminder.
  const dayOf = mockScheduled.find((s) => s.identifier.includes(':dayOf:'))!;
  expect(dayOf.body).toMatch(/[ऀ-ॿ]/);
  await act(async () => tree.unmount());
});

test('changing city RE-ARMS with a re-derived window, not a stored time', async () => {
  const tree = await mount();
  const ujjainDayOf = mockScheduled.find((s) => s.identifier.includes(':dayOf:'))!.date.getTime();

  mockScheduled.length = 0;
  await act(async () => {
    mockLocation = BENGALURU;
    tree.update(
      <MuhuratFollowProvider>
        <MuhuratReminderScheduler />
      </MuhuratFollowProvider>
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });

  const bengaluruDayOf = mockScheduled.find((s) => s.identifier.includes(':dayOf:'));
  expect(bengaluruDayOf).toBeTruthy();
  // Sunrise differs between the two cities, so the clamped day-of notice must
  // move. Equality here would mean the window was persisted with the follow.
  expect(bengaluruDayOf!.date.getTime()).not.toBe(ujjainDayOf);
  await act(async () => tree.unmount());
});

test('the evening-before notice does NOT move with the city', async () => {
  // It is a wall-clock 18:00 the day before, shared with the vrat planner —
  // only the window-anchored notice is location-dependent.
  const tree = await mount();
  const ujjainAdvance = mockScheduled.find((s) => s.identifier.includes(':advance:'))!.date.getTime();

  mockScheduled.length = 0;
  await act(async () => {
    mockLocation = BENGALURU;
    tree.update(
      <MuhuratFollowProvider>
        <MuhuratReminderScheduler />
      </MuhuratFollowProvider>
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });

  expect(mockScheduled.find((s) => s.identifier.includes(':advance:'))!.date.getTime()).toBe(ujjainAdvance);
  await act(async () => tree.unmount());
});

test('schedules nothing without notification permission', async () => {
  mockPermission = 'denied';
  const tree = await mount();
  expect(mockScheduled).toHaveLength(0);
  await act(async () => tree.unmount());
});

test('schedules nothing when the only follow is already past', async () => {
  const past = new Date();
  past.setDate(past.getDate() - 3);
  await AsyncStorage.setItem(
    '@vedansh/muhurat-follows',
    JSON.stringify([{ occasionId: 'vahan', dateKey: followDateKey(past), addedAt: 1 }])
  );
  const tree = await mount();
  expect(mockScheduled).toHaveLength(0);
  await act(async () => tree.unmount());
});
