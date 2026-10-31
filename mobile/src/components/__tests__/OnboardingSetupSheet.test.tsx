import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingSetupSheet from '../OnboardingSetupSheet';
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
  useGitaLanguage: () => ({ lang: 'hi', setLang: mockSetLang }),
}));
jest.mock('@/contexts/FontScaleContext', () => ({
  useFontScale: () => ({ scale: 'M', setScale: mockScale }),
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
