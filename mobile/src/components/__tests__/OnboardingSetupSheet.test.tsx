import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingSetupSheet from '../OnboardingSetupSheet';
import { nudgeSnapshot, updateNudge } from '../widgetNudgeStore';
const mockPin = jest.fn().mockResolvedValue(true),
  mockSupported = jest.fn().mockResolvedValue(true);
let mockHost = true;
let mockLang: 'hi' | 'en' | 'gu' | 'kn' = 'hi';
let mockSize: 'M' | 'L' = 'M';
jest.mock('@/widgets/native', () => ({
  hasWidgetHost: () => mockHost,
  isWidgetPinSupported: () => mockSupported(),
  requestPinWidget: (widget: string) => mockPin(widget),
}));
jest.mock('../DailyBhaktiNudge', () => ({ WidgetHowToBody: 'WidgetInstructions' }));
jest.mock('@/panchang/engine', () => ({
  UJJAIN_CITY_ID: 'ujjain', UJJAIN_GEO: { latitude: 23.17, longitude: 75.78, elevation: 0 },
  sunriseForDate: () => new Date('2026-11-05T01:00:00Z'),
}));
const mockCommit = jest.fn(),
  mockResolve = jest.fn(),
  mockEnable = jest.fn().mockResolvedValue(undefined),
  mockDecline = jest.fn().mockResolvedValue(undefined),
  mockComplete = jest.fn().mockResolvedValue(undefined),
  mockSetLang = jest.fn(),
  mockScale = jest.fn();
jest.mock('../QuietCompanionSheet', () => {
  const React = require('react');
  return (p: any) => React.createElement('QuietSheet', p, p.children);
});
jest.mock('../QuietReminderBody', () => () => null);
jest.mock('../AppIcon', () => () => null);
jest.mock('@/utils/metaAppEvents', () => ({
  startMetaAppEvents: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/contexts/TourContext', () => ({
  useTour: () => ({
    shouldShowOnboardingSetup: true,
    markOnboardingSetupCompleted: mockComplete,
  }),
}));
jest.mock('@/data/gita/language', () => ({
  ...jest.requireActual('@/data/gita/language'),
  useGitaLanguage: () => ({ lang: mockLang, setLang: mockSetLang }),
}));
jest.mock('@/contexts/FontScaleContext', () => ({
  useFontScale: () => ({ scale: mockSize, setScale: mockScale }),
}));
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: require('@/panchang/locations').DEFAULT_LOCATION,
    commitLocation: mockCommit,
    resolveDeviceLocation: mockResolve,
  }),
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({
    permissionStatus: 'undetermined',
    canAskAgain: true,
    enableReminders: mockEnable,
    declineReminders: mockDecline,
  }),
}));
let tree: TestRenderer.ReactTestRenderer;
const sheet = () => tree.root.findByType('QuietSheet' as any);
async function mount() {
  await act(async () => {
    tree = TestRenderer.create(<OnboardingSetupSheet />);
  });
}
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  Platform.OS = 'android';
  mockHost = true;
  mockLang = 'hi'; mockSize = 'M';
  mockPin.mockResolvedValue(true); mockSupported.mockResolvedValue(true);
});
afterEach(() => act(() => tree?.unmount()));
test('setup advances through language, city and reminders; only yes requests permission', async () => {
  await mount();
  expect(sheet().props.step).toBe(1);
  await act(async () => sheet().props.onPrimary());
  expect(sheet().props.step).toBe(2);
  expect(mockCommit).not.toHaveBeenCalled();
  await act(async () => sheet().props.onPrimary());
  expect(mockCommit).toHaveBeenCalledTimes(1);
  expect(sheet().props.step).toBe(3);
  expect(mockEnable).not.toHaveBeenCalled();
  await act(async () => sheet().props.onPrimary());
  expect(mockEnable).toHaveBeenCalledTimes(1);
  expect(mockComplete).toHaveBeenCalledTimes(1);
});
test('Not now disables both reminder families and still completes setup', async () => {
  await AsyncStorage.setItem('@vedansh/setup-step-v1', '3');
  await mount();
  await act(async () => sheet().props.onSecondary());
  expect(mockDecline).toHaveBeenCalledTimes(1);
  expect(mockEnable).not.toHaveBeenCalled();
  expect(mockComplete).toHaveBeenCalledTimes(1);
});
test('a resumed setup returns to its saved step', async () => {
  await AsyncStorage.setItem('@vedansh/setup-step-v1', '2');
  await mount();
  expect(sheet().props.step).toBe(2);
});
test('iOS completes setup only after the host Modal dismisses', async () => {
  Platform.OS = 'ios';
  await AsyncStorage.setItem('@vedansh/setup-step-v1', '3');
  await mount();
  await act(async () => sheet().props.onSecondary());
  expect(mockComplete).not.toHaveBeenCalled();
  await act(async () => sheet().props.onDismiss());
  expect(mockComplete).toHaveBeenCalledTimes(1);
});

test('language Next starts Android widget pinning with no Add tap, after saving the city resume point', async () => {
  mockPin.mockImplementationOnce(async () => {
    expect(await AsyncStorage.getItem('@vedansh/setup-step-v1')).toBe('2');
    return true;
  });
  await mount();
  expect(mockPin).not.toHaveBeenCalled();
  await act(async () => sheet().props.onPrimary());
  expect(mockPin).toHaveBeenCalledWith('verse');
  expect(nudgeSnapshot().widgetAddedAt).toEqual(expect.any(Number));
  expect(sheet().props.step).toBe(2);
  expect(mockEnable).not.toHaveBeenCalled();
  await act(async () => sheet().props.onBack());
  await act(async () => sheet().props.onPrimary());
  expect(mockPin.mock.calls.map(c => c[0])).toEqual(['verse', 'panchang']);
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('iPhone opens inline widget instructions on Next in %s and continues to city', async lang => {
  Platform.OS = 'ios'; mockLang = lang; mockSize = 'L';
  await mount();
  await act(async () => sheet().props.onPrimary());
  expect(sheet().props.primaryLabel).toBe('Setup widgets continue');
  expect(tree.root.findAllByType('QuietSheet' as any)).toHaveLength(1);
  expect(tree.root.findByType('WidgetInstructions' as any).props.widgets).toEqual(['verse', 'panchang']);
  expect(await AsyncStorage.getItem('@vedansh/setup-step-v1')).toBe('widgets');
  expect(mockPin).not.toHaveBeenCalled();
  await act(async () => sheet().props.onPrimary());
  expect(sheet().props.step).toBe(2);
  expect(nudgeSnapshot().panchangAddedAt).toEqual(expect.any(Number));
  expect(mockComplete).not.toHaveBeenCalled();
});

test('Not now on widgets continues city without declining reminders', async () => {
  Platform.OS = 'ios';
  await AsyncStorage.setItem('@vedansh/setup-step-v1', 'widgets');
  await mount();
  await act(async () => sheet().props.onSecondary());
  expect(sheet().props.step).toBe(2);
  expect(nudgeSnapshot().widgetDismissedAt).toEqual(expect.any(Number));
  expect(mockDecline).not.toHaveBeenCalled();
});

test('iPhone cold resume hydrates the pending Panchang-only instructions', async () => {
  Platform.OS = 'ios';
  await AsyncStorage.multiSet([
    ['@vedansh/setup-step-v1', 'widgets'],
    ['@vedansh/daily-bhakti-nudge', JSON.stringify({ widgetAddedAt: Date.now() })],
  ]);
  await mount();
  expect(tree.root.findByType('WidgetInstructions' as any).props.widgets).toEqual(['panchang']);
  expect(mockPin).not.toHaveBeenCalled();
});

test.each(['dismissed', 'completed', 'no host', 'unsupported', 'failed'])(
  '%s widget setup never blocks onboarding', async state => {
    mockHost = state !== 'no host';
    mockSupported.mockResolvedValue(state !== 'unsupported');
    if (state === 'failed') mockPin.mockRejectedValueOnce(new Error('launcher unavailable'));
    await mount();
    if (state === 'dismissed') await updateNudge({widgetDismissedAt: Date.now()});
    if (state === 'completed') await updateNudge({panchangAddedAt: Date.now()});
    await act(async () => sheet().props.onPrimary());
    expect(sheet().props.step).toBe(2);
    if (['dismissed', 'completed', 'no host', 'unsupported'].includes(state)) expect(mockPin).not.toHaveBeenCalled();
  },
);

test('repeated Next while storage is loading starts one pin request', async () => {
  await mount();
  await act(async () => { sheet().props.onPrimary(); sheet().props.onPrimary(); });
  expect(mockPin).toHaveBeenCalledTimes(1);
});

test('a cold restart at city never automatically repeats a widget request', async () => {
  await AsyncStorage.setItem('@vedansh/setup-step-v1', '2');
  await mount();
  expect(sheet().props.step).toBe(2);
  expect(mockPin).not.toHaveBeenCalled();
});

test('failed progress persistence continues city without opening an unresumable system dialog', async () => {
  await mount();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk unavailable'));
  await act(async () => sheet().props.onPrimary());
  expect(sheet().props.step).toBe(2);
  expect(mockPin).not.toHaveBeenCalled();
});

test('unmount while widget bookkeeping loads never starts a late pin request', async () => {
  await mount();
  let resolve!: (value: string | null) => void;
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  await act(async () => { sheet().props.onPrimary(); });
  await act(async () => { tree.unmount(); });
  await act(async () => { resolve(null); });
  expect(mockPin).not.toHaveBeenCalled();
});
