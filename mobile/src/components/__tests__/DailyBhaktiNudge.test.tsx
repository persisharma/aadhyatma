import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import DailyBhaktiNudge from '../DailyBhaktiNudge';
const mockPin = jest.fn().mockResolvedValue(true),
  mockUpdate = jest.fn(),
  mockNavigate = jest.fn();
let mockRecord: any = {
  reminderDismissedAt: Date.now(),
  widgetDismissedAt: null,
  widgetAddedAt: null,
  panchangAddedAt: null,
};
let mockPrefs: any = {
  prefs: { dailyVerseEnabled: true, times: [{ hour: 7, minute: 0 }] },
  permissionStatus: 'granted',
  canAskAgain: true,
  isLoading: false,
  setDailyVerseEnabled: jest.fn(),
};
jest.mock('@/components/QuietCompanionSheet', () => {
  const React = require('react');
  return (p: any) => React.createElement('QuietSheet', p, p.children);
});
jest.mock('@/components/widgetNudgeStore', () => ({
  loadNudgeRecord: () => Promise.resolve(),
  nudgeSnapshot: () => mockRecord,
  subscribeNudge: () => () => undefined,
  updateNudge: (patch: any) => mockUpdate(patch),
  startWidgetPinFlow: (widgets: any) => mockPin(widgets),
}));
jest.mock('@/components/launchAskStore', () => ({
  localDay: () => '2026-10-31',
  useLaunchAsks: () => ({ record: { lastDay: null } }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'en' }),
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => mockPrefs,
}));
jest.mock('@/notifications/permissionState', () => ({
  readNotificationPermissionState: () =>
    Promise.resolve({ status: 'granted', canAskAgain: false }),
}));
jest.mock('@/widgets/native', () => ({
  hasWidgetHost: () => true,
  readWidgetPayload: () => Promise.resolve({ kind: 'missing' }),
}));
let tree: TestRenderer.ReactTestRenderer;
async function mount() {
  await act(async () => {
    tree = TestRenderer.create(
      <DailyBhaktiNudge previewLines={['Actual verse preview']} />,
    );
  });
}
async function press(id: string) {
  await act(async () => {
    await tree.root
      .findAll(
        (n) => n.props.testID === id && typeof n.props.onPress === 'function',
      )[0]
      .props.onPress();
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  mockRecord = {
    reminderDismissedAt: Date.now(),
    widgetDismissedAt: null,
    widgetAddedAt: null,
    panchangAddedAt: null,
  };
  Platform.OS = 'ios';
  mockPin.mockResolvedValue(true);
});
afterEach(() => act(() => tree?.unmount()));
test('iPhone offers the real preview pair through the Quiet companion sheet', async () => {
  await mount();
  await press('daily-bhakti-nudge-widget-action');
  const sheet = tree.root.findByType('QuietSheet' as any);
  expect(sheet.props.visible).toBe(true);
  expect(
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Panchang widget preview',
    ).length,
  ).toBeGreaterThan(0);
  await act(async () => sheet.props.onPrimary());
  expect(mockUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      widgetAddedAt: expect.any(Number),
      panchangAddedAt: expect.any(Number),
    }),
  );
});
test('existing verse users are offered Panchang only', async () => {
  mockRecord.widgetAddedAt = 1;
  await mount();
  await press('daily-bhakti-nudge-panchangWidget-action');
  expect(
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Daily verse widget preview',
    ),
  ).toHaveLength(0);
});
test('dismissal ends both widget offers', async () => {
  await mount();
  await press('daily-bhakti-nudge-widget-dismiss');
  expect(mockUpdate).toHaveBeenCalledWith({
    widgetDismissedAt: expect.any(Number),
  });
});
test('Android hands the pair to the process-owned pin flow', async () => {
  Platform.OS = 'android';
  await mount();
  await press('daily-bhakti-nudge-widget-action');
  expect(mockPin).toHaveBeenCalledWith(['verse', 'panchang']);
});
test('unsupported launchers fall back to the gallery', async () => {
  Platform.OS = 'android';
  mockPin.mockResolvedValue(false);
  await mount();
  await press('daily-bhakti-nudge-widget-action');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', {
    screen: 'WidgetGallery',
    initial: false,
  });
});
