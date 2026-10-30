import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, Linking, Modal, Platform, Text, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyBhaktiNudge from '@/components/DailyBhaktiNudge';
import { NUDGE_STORAGE_KEY } from '@/components/dailyBhaktiNudgeView';
import { WIDGET_TIME_ZONE, widgetDateKey } from '@/widgets/contract';

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
let mockPayload: unknown = { kind: 'missing' };
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
  readWidgetPayload: jest.fn(() => Promise.resolve(mockPayload)),
}));

let appStateListeners: ((state: AppStateStatus) => void)[] = [];
async function appState(state: AppStateStatus) {
  await act(async () => {
    appStateListeners.forEach((listener) => listener(state));
  });
}

function l10n(text: string) {
  return { hi: text, en: text, gu: text, kn: text };
}

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
  mockPayload = { kind: 'missing' };
  mockNavigate.mockClear();
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, listener: (state: AppStateStatus) => void) => {
    appStateListeners.push(listener);
    return { remove: () => (appStateListeners = appStateListeners.filter((item) => item !== listener)) };
  }) as never);
  (jest.requireMock('@/widgets/native') as { requestPinWidget: jest.Mock }).requestPinWidget.mockClear();
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

  expect(lastWrite()).toEqual({
    reminderDismissedAt: expect.any(Number),
    widgetDismissedAt: null,
    widgetAddedAt: null,
    panchangAddedAt: null,
  });
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

test('iOS: Add opens the how-to sheet for both widgets; Got it ends the widget ask', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  const tree = await render();
  expect(text(tree)).toContain('Verse & Panchang widgets');
  expect(tree.root.findByType(Modal).props.visible).toBe(false);

  await press(tree, 'daily-bhakti-nudge-widget-action');
  expect(tree.root.findByType(Modal).props.visible).toBe(true);
  expect(text(tree)).toContain('Search “Vedansh”, add “Vedansh · Verse” at Wide');
  expect(text(tree)).toContain('Tap + again, add “Vedansh · Panchang” at Small');
  expect(text(tree)).toContain(LINES.join(' · '));
  // No snapshot yet: the Panchang facsimile keeps its eyebrow and invents no day.
  expect(text(tree)).toContain('Today’s Panchang');

  await press(tree, 'daily-bhakti-widget-sheet-done');
  expect(lastWrite()).toMatchObject({ widgetAddedAt: expect.any(Number), panchangAddedAt: expect.any(Number) });
  expect(tree.toJSON()).toBeNull();
});

test('iOS: a verse-only user is offered the Panchang alone, previewed from the widget snapshot', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  mockStored = JSON.stringify({ widgetAddedAt: Date.now() - 1000 });
  mockPayload = {
    kind: 'ready',
    payload: {
      panchang: {
        cityLabel: l10n('Bengaluru'),
        days: [
          {
            dateKey: widgetDateKey(new Date(), WIDGET_TIME_ZONE),
            representedDate: l10n('30 Oct'),
            tithi: l10n('Chaturthi'),
            tithiSegments: [{ name: l10n('Panchami'), till: l10n('till 19:25') }],
            sunrise: l10n('Sunrise 06:12'),
            rahuKaal: l10n('Rahu 10:30'),
            deepLink: 'vedansh://widget/panchang',
          },
        ],
      },
    },
  };
  const tree = await render();
  expect(byId(tree, 'daily-bhakti-nudge-panchangWidget')).not.toHaveLength(0);

  await press(tree, 'daily-bhakti-nudge-panchangWidget-action');
  const sheet = text(tree);
  expect(sheet).toContain('Search “Vedansh”, add “Vedansh · Panchang” at Small');
  expect(sheet).not.toContain('Vedansh · Verse');
  expect(sheet).toContain('30 Oct · Bengaluru');
  expect(sheet).toContain('Panchami');
  expect(sheet).toContain('till 19:25');
  expect(sheet).toContain('Sunrise 06:12');

  await press(tree, 'daily-bhakti-widget-sheet-done');
  expect(lastWrite().panchangAddedAt).toEqual(expect.any(Number));
  expect(tree.toJSON()).toBeNull();
});

test('iOS: the sheet link opens the in-app widget gallery', async () => {
  mockPrefs.prefs.dailyVerseEnabled = true;
  const tree = await render();
  await press(tree, 'daily-bhakti-nudge-widget-action');
  await press(tree, 'daily-bhakti-widget-sheet-gallery');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', { screen: 'WidgetGallery', initial: false });
});

test('Android: one Add pins the verse, then the Panchang once the first dialog closes', async () => {
  setOS('android');
  mockPrefs.prefs.dailyVerseEnabled = true;
  const native = jest.requireMock('@/widgets/native') as { requestPinWidget: jest.Mock };

  const tree = await render();
  expect(tree.root.findAllByType(Modal)).toHaveLength(0);
  await press(tree, 'daily-bhakti-nudge-widget-action');
  expect(native.requestPinWidget.mock.calls).toEqual([['verse']]);
  expect(lastWrite().widgetAddedAt).toEqual(expect.any(Number));

  // An `active` before the dialog ever took the foreground is not its close.
  await appState('active');
  expect(native.requestPinWidget.mock.calls).toEqual([['verse']]);

  await appState('background');
  await appState('active');
  expect(native.requestPinWidget.mock.calls).toEqual([['verse'], ['panchang']]);
  expect(lastWrite()).toMatchObject({ widgetAddedAt: expect.any(Number), panchangAddedAt: expect.any(Number) });
  expect(tree.toJSON()).toBeNull();

  // The chain is spent: a later return to the app pins nothing more.
  await appState('background');
  await appState('active');
  expect(native.requestPinWidget).toHaveBeenCalledTimes(2);
});

test('Android: a launcher that never pauses the app leaves the Panchang ask for one more tap', async () => {
  setOS('android');
  mockPrefs.prefs.dailyVerseEnabled = true;
  const native = jest.requireMock('@/widgets/native') as { requestPinWidget: jest.Mock };

  const tree = await render();
  await press(tree, 'daily-bhakti-nudge-widget-action');
  expect(byId(tree, 'daily-bhakti-nudge-panchangWidget')).not.toHaveLength(0);

  await press(tree, 'daily-bhakti-nudge-panchangWidget-action');
  expect(native.requestPinWidget.mock.calls).toEqual([['verse'], ['panchang']]);
  expect(lastWrite().panchangAddedAt).toEqual(expect.any(Number));
  expect(tree.toJSON()).toBeNull();

  // The manual tap replaced the queued Panchang — no second Panchang dialog.
  await appState('background');
  await appState('active');
  expect(native.requestPinWidget).toHaveBeenCalledTimes(2);
});

test('Android: a launcher that cannot pin gets the gallery', async () => {
  setOS('android');
  mockPrefs.prefs.dailyVerseEnabled = true;

  mockPinSupported = false;
  const fresh = await render();
  await press(fresh, 'daily-bhakti-nudge-widget-action');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', { screen: 'WidgetGallery', initial: false });
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
