import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { VratFollowProvider, useVratFollows } from '@/contexts/VratFollowContext';
import { useVratReminderAction } from '../useVratReminderAction';
import VratReminderSheet from '../VratReminderSheet';

let mockStore: Record<string, string> = {};
const mockRequestPermission = jest.fn(async () => 'granted');
let mockPermission = 'granted';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStore[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockStore[key] = value; }),
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => ({
  permissionStatus: mockPermission, canAskAgain: true, requestPermission: mockRequestPermission,
}) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('../VratReminderSheet', () => jest.fn(() => null));

let action!: ReturnType<typeof useVratReminderAction>;
let context!: ReturnType<typeof useVratFollows>;
let tree: TestRenderer.ReactTestRenderer;
const first = { id: 'karwa-chauth', nameHi: 'करवा चौथ', nameEn: 'Karwa Chauth' };
const second = { id: 'sankashti', nameHi: 'संकष्टी', nameEn: 'Sankashti' };
const pref = { advanceDays: 2 as const, dayOf: true, dayOfTime: { hour: 8, minute: 0 } };
function Probe() { context = useVratFollows(); action = useVratReminderAction(); return action.reminderSheet; }
async function mount() { await act(async () => { tree = TestRenderer.create(<VratFollowProvider><Probe /></VratFollowProvider>); }); }
function sheet() { return tree.root.findByType(VratReminderSheet); }
function toggle(target = first) { act(() => action.toggleReminder(target)); }
beforeEach(() => { mockStore = {}; mockPermission = 'granted'; jest.clearAllMocks(); });
afterEach(() => act(() => tree?.unmount()));

test('first setup saves the reminder and favourite together; later bells skip setup', async () => {
  const daily = JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 5, minute: 45 }] });
  mockStore['@vedansh/notif-prefs'] = daily;
  await mount();
  toggle();
  expect(context.followCount).toBe(0);
  act(() => sheet().props.onSave(pref));
  act(() => sheet().props.onClose());
  expect(context.isFollowing(first.id)).toBe(true);
  expect(context.reminderDefault).toEqual(pref);
  toggle(second);
  expect(tree.root.findAllByType(VratReminderSheet)).toHaveLength(0);
  expect(context.follows.map(f => f.ruleId)).toEqual([first.id, second.id]);
  expect(context.follows.every(f => f.reminder === undefined)).toBe(true);
  expect(context.reminderCount).toBe(2);
  expect(mockStore['@vedansh/notif-prefs']).toBe(daily);
  expect(mockRequestPermission).not.toHaveBeenCalled();
});

test('cancelling first setup neither saves a favourite nor schedules a reminder', async () => {
  await mount(); toggle();
  act(() => sheet().props.onClose());
  expect(context.follows).toEqual([]);
  expect(context.savedReminderPreference).toBeNull();
  expect(mockStore['@vedansh/vrat-follows']).toBeUndefined();
});

test('an earlier per-vrat preference is reused without changing other followers', async () => {
  mockStore['@vedansh/vrat-follows'] = JSON.stringify([
    { ruleId: 'default-based', order: 0, addedAt: 1 },
    { ruleId: 'custom', order: 1, addedAt: 2, reminder: pref },
  ]);
  await mount(); toggle();
  expect(tree.root.findAllByType(VratReminderSheet)).toHaveLength(0);
  expect(context.follows.find(f => f.ruleId === first.id)?.reminder).toEqual(pref);
  expect(context.follows[0].reminder).toBeUndefined();
  expect(context.reminderDefault.advanceDays).toBe(1);
});

test('stored off settings save the favourite silently without enabling alerts', async () => {
  mockStore['@vedansh/vrat-reminder-default'] = JSON.stringify({ advanceDays: 0, dayOf: false });
  mockPermission = 'undetermined';
  await mount(); toggle();
  expect(context.isFollowing(first.id)).toBe(true);
  expect(context.reminderCount).toBe(0);
  expect(tree.root.findAllByType(VratReminderSheet)).toHaveLength(0);
  expect(mockRequestPermission).not.toHaveBeenCalled();
});

test.each(['undetermined', 'denied'])('OS %s state does not alter Daily Bhakti settings', async permission => {
  mockPermission = permission;
  mockStore['@vedansh/vrat-reminder-default'] = JSON.stringify(pref);
  const daily = JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 6, minute: 15 }] });
  mockStore['@vedansh/notif-prefs'] = daily;
  await mount(); toggle();
  expect(context.isFollowing(first.id)).toBe(true);
  expect(tree.root.findAllByType(VratReminderSheet)).toHaveLength(0);
  expect(mockRequestPermission).toHaveBeenCalledTimes(permission === 'undetermined' ? 1 : 0);
  expect(mockStore['@vedansh/notif-prefs']).toBe(daily);
});

test('a second tap removes the favourite and its reminder without a popup', async () => {
  mockStore['@vedansh/vrat-reminder-default'] = JSON.stringify(pref);
  await mount(); toggle(); toggle();
  expect(context.follows).toEqual([]);
  expect(tree.root.findAllByType(VratReminderSheet)).toHaveLength(0);
  expect(context.savedReminderPreference).toEqual(pref);
});
