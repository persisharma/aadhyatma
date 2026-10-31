import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import LaunchAskHost from '../LaunchAskHost';
let mockTour: any = {
  isLoading: false,
  shouldShowOnboardingSetup: false,
  shouldShowFirstLaunchTour: false,
  shouldShowWhatsNew: false,
};
let mockPrefs: any = {
  isLoading: false,
  prefs: { dailyVerseEnabled: false },
  meta: { lastDeclinedAt: null, optedOutAt: null },
  permissionStatus: 'undetermined',
  canAskAgain: true,
};
let mockLaunch: any = {
  ready: true,
  taken: false,
  record: {
    firstDay: '2026-01-01',
    lastDay: null,
    declines: 0,
    stopped: false,
  },
};
const mockClaim = jest.fn(() => true),
  mockSuppress = jest.fn();
jest.mock('@/contexts/TourContext', () => ({ useTour: () => mockTour }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => mockPrefs,
}));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'en' }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/utils/metaAppEvents', () => ({
  startMetaAppEvents: jest.fn().mockResolvedValue(undefined),
  metaTrackingAvailable: () => false,
}));
jest.mock('@/widgets/native', () => ({
  hasWidgetHost: () => true,
  readWidgetPayload: () => Promise.resolve({ kind: 'missing' }),
}));
jest.mock('../widgetNudgeStore', () => ({
  loadNudgeRecord: () => Promise.resolve(),
  nudgeSnapshot: () => ({
    widgetDismissedAt: null,
    widgetAddedAt: null,
    panchangAddedAt: null,
  }),
  updateNudge: jest.fn(),
  startWidgetPinFlow: jest.fn(),
}));
jest.mock('../launchAskStore', () => ({
  useLaunchAsks: () => mockLaunch,
  hydrateLaunchAsks: () => Promise.resolve(),
  claimLaunchAsk: () => mockClaim(),
  suppressLaunchAsks: () => mockSuppress(),
  localDay: () => '2026-10-31',
  reminderDue: () => true,
}));
jest.mock('../OnboardingSetupSheet', () => {
  const React = require('react');
  return () => React.createElement('Setup');
});
jest.mock('../ReminderOptInModal', () => {
  const React = require('react');
  return () => React.createElement('Reminder');
});
jest.mock('../DailyBhaktiNudge', () => {
  const React = require('react');
  return { WidgetHowToSheet: (p: any) => React.createElement('Widgets', p) };
});
let tree: TestRenderer.ReactTestRenderer;
async function mount(targeted = false) {
  await act(async () => {
    tree = TestRenderer.create(<LaunchAskHost targeted={targeted} />);
  });
}
beforeEach(() => {
  Platform.OS = 'android';
  jest.clearAllMocks();
  mockTour = {
    isLoading: false,
    shouldShowOnboardingSetup: false,
    shouldShowFirstLaunchTour: false,
    shouldShowWhatsNew: false,
  };
  mockPrefs = {
    isLoading: false,
    prefs: { dailyVerseEnabled: false },
    meta: { lastDeclinedAt: null, optedOutAt: null },
    permissionStatus: 'undetermined',
    canAskAgain: true,
  };
  mockLaunch = {
    ready: true,
    taken: false,
    record: {
      firstDay: '2026-01-01',
      lastDay: null,
      declines: 0,
      stopped: false,
    },
  };
});
afterEach(() => act(() => tree?.unmount()));
test('setup takes precedence over every later ask', async () => {
  mockTour.shouldShowOnboardingSetup = true;
  await mount();
  expect(tree.root.findAllByType('Setup' as any)).toHaveLength(1);
  expect(tree.root.findAllByType('Reminder' as any)).toHaveLength(0);
});
test('a targeted cold start suppresses all launch asks', async () => {
  mockTour.shouldShowOnboardingSetup = true;
  await mount(true);
  expect(tree.toJSON()).toBeNull();
  expect(mockSuppress).toHaveBeenCalledTimes(1);
});
test('a due explained reminder claims one launch opportunity', async () => {
  await mount();
  expect(tree.root.findAllByType('Reminder' as any)).toHaveLength(1);
  expect(mockClaim).toHaveBeenCalledTimes(1);
});
test('a same-day launch cannot show a second ask', async () => {
  mockLaunch.record.lastDay = '2026-10-31';
  await mount();
  expect(tree.toJSON()).toBeNull();
  expect(mockClaim).not.toHaveBeenCalled();
});
test('hard denial is passive and leaves a later-day opportunity for widgets', async () => {
  mockPrefs.permissionStatus = 'denied';
  mockPrefs.canAskAgain = false;
  await mount();
  expect(tree.root.findAllByType('Reminder' as any)).toHaveLength(0);
  expect(tree.root.findAllByType('Widgets' as any)).toHaveLength(1);
});
test('widgets wait until a later day', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  mockPrefs.permissionStatus = 'granted';
  mockLaunch.record.firstDay = '2026-10-31';
  await mount();
  expect(tree.toJSON()).toBeNull();
});

test('an old default-on preference without an OS grant still gets an explanation', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  await mount();
  expect(tree.root.findAllByType('Reminder' as any)).toHaveLength(1);
});
