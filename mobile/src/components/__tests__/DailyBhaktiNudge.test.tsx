import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Linking, Modal, Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyBhaktiNudge from '@/components/DailyBhaktiNudge';
import { NUDGE_STORAGE_KEY } from '@/components/dailyBhaktiNudgeView';

// ---- mutable mock state (reset in beforeEach) ----
let mockStored: string | null = null;
let mockPrefs = {
  prefs: { dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }], festiveRemindersEnabled: true },
  permissionStatus: 'granted' as 'granted' | 'denied' | 'undetermined',
  canAskAgain: true,
  isLoading: false,
  setDailyVerseEnabled: jest.fn(),
};
let mockOsStatus = { status: 'granted', canAskAgain: true };
let mockWidgetHost = true;
let mockPinSupported = true;
let mockPinAccepted = true;
const mockNavigate = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(mockStored)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => mockPrefs,
}));
jest.mock('@/notifications/permissionState', () => ({
  readNotificationPermissionState: () => Promise.resolve(mockOsStatus),
}));
jest.mock('@/widgets/native', () => ({
  hasWidgetHost: () => mockWidgetHost,
  isWidgetPinSupported: () => Promise.resolve(mockPinSupported),
  requestPinWidget: jest.fn(() => Promise.resolve(mockPinAccepted)),
}));

const LINES = ['karmaṇy evādhikāras te mā phaleṣu kadācana', 'mā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi'];

async function render(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<DailyBhaktiNudge previewLines={LINES} />);
  });
  return tree;
}

async function rerender(tree: TestRenderer.ReactTestRenderer) {
  await act(async () => {
    tree.update(<DailyBhaktiNudge previewLines={LINES} />);
  });
}

function byId(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAll((n) => n.props?.testID === id);
}

async function press(tree: TestRenderer.ReactTestRenderer, id: string) {
  const node = byId(tree, id).find((n) => typeof n.props.onPress === 'function');
  if (!node) throw new Error(`no pressable ${id}`);
  await act(async () => {
    await node.props.onPress();
  });
}

function text(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function lastWrite(): Record<string, number | null> {
  const calls = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(([key]) => key === NUDGE_STORAGE_KEY);
  return JSON.parse(calls[calls.length - 1][1]);
}

const originalOS = Platform.OS;
function setOS(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

beforeEach(() => {
  mockStored = null;
  mockPrefs = {
    prefs: { dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }], festiveRemindersEnabled: true },
    permissionStatus: 'granted',
    canAskAgain: true,
    isLoading: false,
    setDailyVerseEnabled: jest.fn(async () => {
      if (mockOsStatus.status === 'granted') {
        mockPrefs.prefs = { ...mockPrefs.prefs, dailyVerseEnabled: true };
        mockPrefs.permissionStatus = 'granted';
      }
    }),
  };
  mockOsStatus = { status: 'granted', canAskAgain: true };
  mockWidgetHost = true;
  mockPinSupported = true;
  mockPinAccepted = true;
  mockNavigate.mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  setOS('ios');
});

afterAll(() => setOS(originalOS as 'ios' | 'android'));

test('asks for the reminder, then swaps to the widget offer confirming the time', async () => {
  const tree = await render();
  expect(byId(tree, 'daily-bhakti-nudge-reminder')).not.toHaveLength(0);
  expect(text(tree)).toContain('Daily at 07:00');

  await press(tree, 'daily-bhakti-nudge-reminder-action');
  expect(mockPrefs.setDailyVerseEnabled).toHaveBeenCalledWith(true);
  await rerender(tree);

  expect(byId(tree, 'daily-bhakti-nudge-reminder')).toHaveLength(0);
  expect(byId(tree, 'daily-bhakti-nudge-widget')).not.toHaveLength(0);
  expect(text(tree)).toContain('Reminder on · 07:00');
});

test('an OS refusal rests the reminder ask instead of pleading for Settings', async () => {
  mockOsStatus = { status: 'denied', canAskAgain: false };
  const tree = await render();
  await press(tree, 'daily-bhakti-nudge-reminder-action');

  expect(lastWrite().reminderDismissedAt).toEqual(expect.any(Number));
  expect(byId(tree, 'daily-bhakti-nudge-reminderBlocked')).toHaveLength(0);
  expect(byId(tree, 'daily-bhakti-nudge-widget')).not.toHaveLength(0);
});

test('a hard denial offers the system Settings', async () => {
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  mockPrefs.permissionStatus = 'denied';
  mockPrefs.canAskAgain = false;
  const tree = await render();

  expect(byId(tree, 'daily-bhakti-nudge-reminderBlocked')).not.toHaveLength(0);
  await press(tree, 'daily-bhakti-nudge-reminderBlocked-action');
  expect(openSettings).toHaveBeenCalled();
  expect(mockPrefs.setDailyVerseEnabled).not.toHaveBeenCalled();
  openSettings.mockRestore();
});

test('"not now" on the reminder persists and hands the slot to the widget', async () => {
  const tree = await render();
  await press(tree, 'daily-bhakti-nudge-reminder-dismiss');

  expect(lastWrite()).toEqual({ reminderDismissedAt: expect.any(Number), widgetDismissedAt: null, widgetAddedAt: null });
  expect(byId(tree, 'daily-bhakti-nudge-widget')).not.toHaveLength(0);
  expect(text(tree)).not.toContain('Reminder on');
});

test('renders nothing while the default-on reminder is mid OS prompt', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  mockPrefs.permissionStatus = 'undetermined';
  const tree = await render();
  expect(tree.toJSON()).toBeNull();
});

test('renders nothing when the reminder is on and the binary has no widget extension', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  mockWidgetHost = false;
  const tree = await render();
  expect(tree.toJSON()).toBeNull();
});

test('a stored widget "not now" keeps the strip hidden', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  mockStored = JSON.stringify({ widgetDismissedAt: Date.now() - 1000 });
  const tree = await render();
  expect(tree.toJSON()).toBeNull();
});

test('iOS: Add opens the how-to sheet; Got it ends the widget ask', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  const tree = await render();
  expect(tree.root.findByType(Modal).props.visible).toBe(false);

  await press(tree, 'daily-bhakti-nudge-widget-action');
  expect(tree.root.findByType(Modal).props.visible).toBe(true);
  expect(text(tree)).toContain('Vedansh · Verse');
  expect(text(tree)).toContain(LINES.join(' · '));

  await press(tree, 'daily-bhakti-widget-sheet-done');
  expect(lastWrite().widgetAddedAt).toEqual(expect.any(Number));
  expect(tree.toJSON()).toBeNull();
});

test('iOS: the sheet link opens the in-app widget gallery', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  const tree = await render();
  await press(tree, 'daily-bhakti-nudge-widget-action');
  await press(tree, 'daily-bhakti-widget-sheet-gallery');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', { screen: 'WidgetGallery', initial: false });
});

test('Android: a launcher that pins ends the ask; one that cannot gets the gallery', async () => {
  setOS('android');
  mockPrefs.prefs.dailyVerseEnabled = true;
  const native = jest.requireMock('@/widgets/native') as { requestPinWidget: jest.Mock };

  const tree = await render();
  expect(tree.root.findAllByType(Modal)).toHaveLength(0);
  await press(tree, 'daily-bhakti-nudge-widget-action');
  expect(native.requestPinWidget).toHaveBeenCalledWith('verse');
  expect(lastWrite().widgetAddedAt).toEqual(expect.any(Number));

  mockStored = null;
  mockPinSupported = false;
  (AsyncStorage.setItem as jest.Mock).mockClear();
  const fresh = await render();
  await press(fresh, 'daily-bhakti-nudge-widget-action');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', { screen: 'WidgetGallery', initial: false });
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
