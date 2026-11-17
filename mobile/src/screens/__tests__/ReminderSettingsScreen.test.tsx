import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Linking, View as mockView } from 'react-native';

// UX-08 / UX-05: when notification permission is denied the festival switch has
// its own explanation (the daily-verse card had the only one), and the screen's
// accessibility labels follow the reading language.

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@/components/tour/tourTargets', () => ({
  useTourTarget: () => ({ current: null }),
  scrollNodeIntoView: jest.fn(),
}));

const mockSetFestive = jest.fn(() => Promise.resolve());
const mockPrefs = {
  prefs: { dailyVerseEnabled: false, festiveRemindersEnabled: false, times: [{ hour: 7, minute: 0 }] },
  permissionStatus: 'denied' as string,
  canAskAgain: false,
  isLoading: false,
  setDailyVerseEnabled: jest.fn(() => Promise.resolve()),
  setFestiveRemindersEnabled: mockSetFestive,
  setTimes: jest.fn(() => Promise.resolve()),
};
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => mockPrefs,
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const ReminderSettingsScreen = jest.requireActual<typeof import('../ReminderSettingsScreen')>('../ReminderSettingsScreen').default;

function render(lang: 'hi' | 'en' | 'gu' | 'kn') {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <ReminderSettingsScreen navigation={{ goBack: jest.fn() } as never} route={{} as never} />
      </GitaLanguageProvider>
    );
  });
  return tree;
}
const pressablesLabelled = (tree: TestRenderer.ReactTestRenderer, label: string) =>
  tree.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function');

beforeEach(() => {
  jest.clearAllMocks();
  mockPrefs.permissionStatus = 'denied';
  mockPrefs.canAskAgain = false;
});

test('a denied permission shows the reason in the festival card too, not only under the daily verse', () => {
  const tree = render('en');
  const banners = pressablesLabelled(tree, 'Open system settings');
  expect(banners).toHaveLength(2);
  const spy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  act(() => banners[1].props.onPress());
  expect(spy).toHaveBeenCalled();
  act(() => tree.unmount());
});

test('while the OS can still ask, the festival banner re-requests for festival reminders', () => {
  mockPrefs.canAskAgain = true;
  const tree = render('en');
  const banners = pressablesLabelled(tree, 'Allow notifications');
  expect(banners).toHaveLength(2);
  act(() => banners[1].props.onPress());
  expect(mockSetFestive).toHaveBeenCalledWith(true);
  expect(mockPrefs.setDailyVerseEnabled).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

test('no banner when permission is not denied', () => {
  mockPrefs.permissionStatus = 'granted';
  const tree = render('en');
  expect(pressablesLabelled(tree, 'Open system settings')).toHaveLength(0);
  act(() => tree.unmount());
});

test.each([
  ['hi', 'वापस'],
  ['gu', 'પાછા'],
  ['kn', 'ಹಿಂದೆ'],
] as const)('the Back and banner labels are localized (%s)', (lang, back) => {
  const tree = render(lang);
  expect(pressablesLabelled(tree, back)).toHaveLength(1);
  expect(pressablesLabelled(tree, 'Back')).toHaveLength(0);
  expect(pressablesLabelled(tree, 'Open system settings')).toHaveLength(0);
  act(() => tree.unmount());
});
