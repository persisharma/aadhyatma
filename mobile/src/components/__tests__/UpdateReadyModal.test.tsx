import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Modal, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import UpdateReadyModal from '@/components/UpdateReadyModal';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Controllable expo-updates mock.
const mockUseUpdates = jest.fn();
const mockReloadAsync = jest.fn().mockResolvedValue(undefined);
let mockIsEnabled = true;

jest.mock('expo-updates', () => ({
  get isEnabled() {
    return mockIsEnabled;
  },
  useUpdates: () => mockUseUpdates(),
  reloadAsync: () => mockReloadAsync(),
}));

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang="en">
          <UpdateReadyModal />
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  return tree;
}

function modalVisible(tree: TestRenderer.ReactTestRenderer): boolean {
  return tree.root.findByType(Modal).props.visible === true;
}

// The pressables expose both `accessibilityLabel` and `onPress` props.
function pressableByLabel(
  tree: TestRenderer.ReactTestRenderer,
  label: string
): ReactTestInstance {
  return tree.root.find(
    (n) =>
      n.props?.accessibilityLabel === label && typeof n.props?.onPress === 'function'
  );
}

beforeEach(() => {
  mockIsEnabled = true;
  mockReloadAsync.mockClear();
  mockUseUpdates.mockReset();
});

describe('UpdateReadyModal', () => {
  test('stays hidden when no update is pending', () => {
    mockUseUpdates.mockReturnValue({ isUpdatePending: false });
    expect(modalVisible(render())).toBe(false);
  });

  test('shows when an update has been downloaded (pending)', () => {
    mockUseUpdates.mockReturnValue({ isUpdatePending: true });
    const tree = render();
    expect(modalVisible(tree)).toBe(true);
    const text = tree.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat(Number.POSITIVE_INFINITY)
      .join(' ');
    expect(text).toMatch(/fresh update is ready/i);
  });

  test('stays hidden when updates are disabled (dev client / Expo Go)', () => {
    mockIsEnabled = false;
    mockUseUpdates.mockReturnValue({ isUpdatePending: true });
    expect(modalVisible(render())).toBe(false);
  });

  test('"Update now" triggers reloadAsync', () => {
    mockUseUpdates.mockReturnValue({ isUpdatePending: true });
    const tree = render();
    act(() => {
      pressableByLabel(tree, 'Update now').props.onPress();
    });
    expect(mockReloadAsync).toHaveBeenCalledTimes(1);
  });

  test('"Later" dismisses the modal without reloading', () => {
    mockUseUpdates.mockReturnValue({ isUpdatePending: true });
    const tree = render();
    act(() => {
      pressableByLabel(tree, 'Later').props.onPress();
    });
    expect(mockReloadAsync).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(false);
  });
});
