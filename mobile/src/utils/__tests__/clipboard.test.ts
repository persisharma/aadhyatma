/**
 * `copyToClipboard` must work on both kinds of binary this bundle reaches:
 * a store build that carries `expo-clipboard`, and an older one that does not
 * (an OTA lands there too), which keeps React Native's own API.
 */
import { Clipboard } from 'react-native';

const mockOptional = jest.fn();
const mockSetStringAsync = jest.fn((_text: string) => Promise.resolve(true));
jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: (name: string) => mockOptional(name),
}));
jest.mock('expo-clipboard', () => ({
  setStringAsync: (text: string) => mockSetStringAsync(text),
}));

import { __resetClipboardForTests, copyToClipboard } from '@/utils/clipboard';

let legacy: jest.SpyInstance;

beforeEach(() => {
  __resetClipboardForTests();
  mockOptional.mockReset();
  mockSetStringAsync.mockClear();
  legacy = jest.spyOn(Clipboard, 'setString').mockImplementation(() => undefined);
});

afterEach(() => legacy.mockRestore());

test('a binary with expo-clipboard copies through it and leaves the deprecated API alone', () => {
  mockOptional.mockReturnValue({});
  copyToClipboard('ॐ नमः शिवाय');
  expect(mockOptional).toHaveBeenCalledWith('ExpoClipboard');
  expect(mockSetStringAsync).toHaveBeenCalledWith('ॐ नमः शिवाय');
  expect(legacy).not.toHaveBeenCalled();
});

test('a binary without the native module falls back to React Native', () => {
  mockOptional.mockReturnValue(null);
  copyToClipboard('राम');
  expect(mockSetStringAsync).not.toHaveBeenCalled();
  expect(legacy).toHaveBeenCalledWith('राम');
});

test('the native module is probed once, not on every copy', () => {
  mockOptional.mockReturnValue({});
  copyToClipboard('a');
  copyToClipboard('b');
  expect(mockOptional).toHaveBeenCalledTimes(1);
  expect(mockSetStringAsync).toHaveBeenCalledTimes(2);
});

test('a copy that fails never throws into the share flow', async () => {
  mockOptional.mockReturnValue({});
  mockSetStringAsync.mockRejectedValueOnce(new Error('denied'));
  expect(() => copyToClipboard('x')).not.toThrow();
  await Promise.resolve();

  __resetClipboardForTests();
  mockOptional.mockReturnValue(null);
  legacy.mockImplementation(() => {
    throw new Error('no clipboard');
  });
  expect(() => copyToClipboard('y')).not.toThrow();
});
