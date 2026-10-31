import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
const mockPin = jest.fn().mockResolvedValue(true),
  mockSupported = jest.fn().mockResolvedValue(true);
jest.mock('@/widgets/native', () => ({
  isWidgetPinSupported: () => mockSupported(),
  requestPinWidget: (w: string) => mockPin(w),
}));
let store: typeof import('../widgetNudgeStore'), listener: (s: string) => void;
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockPin.mockResolvedValue(true);
  mockSupported.mockResolvedValue(true);
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((
    _event: string,
    fn: (s: string) => void,
  ) => {
    listener = fn;
    return { remove: jest.fn() };
  }) as any);
  jest.isolateModules(() => {
    store = require('../widgetNudgeStore');
  });
  await store.loadNudgeRecord();
});
afterEach(() => jest.restoreAllMocks());
test('second pin survives view unsubscribe and preserves both stamps', async () => {
  const off = store.subscribeNudge(() => undefined);
  await store.startWidgetPinFlow(['verse', 'panchang']);
  off();
  listener('background');
  listener('active');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(mockPin.mock.calls.map((c) => c[0])).toEqual(['verse', 'panchang']);
  expect(store.nudgeSnapshot().widgetAddedAt).toEqual(expect.any(Number));
  expect(store.nudgeSnapshot().panchangAddedAt).toEqual(expect.any(Number));
});
test('a launcher without lifecycle transitions permits the Panchang follow-up tap', async () => {
  await store.startWidgetPinFlow(['verse', 'panchang']);
  await store.startWidgetPinFlow(['panchang']);
  expect(mockPin.mock.calls.map((c) => c[0])).toEqual(['verse', 'panchang']);
});
test('unsupported launcher does not stamp an add flow', async () => {
  mockSupported.mockResolvedValue(false);
  expect(await store.startWidgetPinFlow(['verse', 'panchang'])).toBe(false);
  expect(store.nudgeSnapshot().widgetAddedAt).toBeNull();
});
