const mockPlatform = { OS: 'ios' };
const mockConfig = { extra: { metaTrackingEnabled: true } };
const mockNativeLookup = jest.fn();
const mockAddListener = jest.fn();

jest.mock('react-native', () => ({
  Platform: mockPlatform,
  AppState: { currentState: 'active', addEventListener: mockAddListener },
}));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: mockConfig } }));
jest.mock('expo-modules-core', () => ({ requireOptionalNativeModule: mockNativeLookup }));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockPlatform.OS = 'ios';
  mockConfig.extra.metaTrackingEnabled = true;
});

test('web never looks up the native tracking bridge', () => {
  mockPlatform.OS = 'web';
  const { startMetaAppEvents } = require('../metaAppEvents');
  startMetaAppEvents();
  expect(mockNativeLookup).not.toHaveBeenCalled();
  expect(mockAddListener).not.toHaveBeenCalled();
});

test('a disabled build does not start tracking or request ATT', () => {
  mockNativeLookup.mockReturnValue({ enabled: false, activate: jest.fn() });
  const { startMetaAppEvents } = require('../metaAppEvents');
  startMetaAppEvents();
  expect(mockAddListener).not.toHaveBeenCalled();
});

test("an OTA manifest's disabled flag cannot suppress an enabled binary", () => {
  mockConfig.extra.metaTrackingEnabled = false;
  mockNativeLookup.mockReturnValue({ enabled: true, activate: jest.fn().mockResolvedValue(true) });
  const { startMetaAppEvents } = require('../metaAppEvents');
  startMetaAppEvents();
  expect(mockAddListener).toHaveBeenCalledTimes(1);
});

test('a binary without the enabled constant falls back to the manifest flag', () => {
  mockConfig.extra.metaTrackingEnabled = false;
  mockNativeLookup.mockReturnValue({ activate: jest.fn() });
  const { startMetaAppEvents } = require('../metaAppEvents');
  startMetaAppEvents();
  expect(mockAddListener).not.toHaveBeenCalled();
});

test('Expo Go and older binaries without the module keep opening normally', () => {
  mockNativeLookup.mockReturnValue(null);
  const { startMetaAppEvents } = require('../metaAppEvents');
  expect(() => startMetaAppEvents()).not.toThrow();
  expect(mockAddListener).not.toHaveBeenCalled();
});
