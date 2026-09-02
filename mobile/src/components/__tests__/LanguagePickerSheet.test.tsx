import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import LanguagePickerSheet from '../LanguagePickerSheet';

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
const mockSetItem = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

async function renderSheet(onClose: () => void) {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang="hi">
          <LanguagePickerSheet visible onClose={onClose} />
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  return tree!;
}

function radio(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

describe('LanguagePickerSheet', () => {
  beforeEach(() => {
    mockGetItem.mockReset().mockResolvedValue(null);
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  test('offers all four reading languages as radios', async () => {
    const tree = await renderSheet(() => {});
    for (const l of ['Hindi', 'English', 'Gujarati', 'Kannada']) {
      expect(radio(tree, l)).toBeDefined();
      expect(radio(tree, l).props.accessibilityRole).toBe('radio');
    }
  });

  test('marks the current language selected', async () => {
    const tree = await renderSheet(() => {});
    expect(radio(tree, 'Hindi').props.accessibilityState.selected).toBe(true);
    expect(radio(tree, 'English').props.accessibilityState.selected).toBe(false);
  });

  test('choosing a language persists it and closes the sheet', async () => {
    const onClose = jest.fn();
    const tree = await renderSheet(onClose);
    act(() => {
      radio(tree, 'English').props.onPress();
    });
    expect(mockSetItem).toHaveBeenCalledWith('@vedansh/language', 'en');
    expect(onClose).toHaveBeenCalled();
    expect(radio(tree, 'English').props.accessibilityState.selected).toBe(true);
  });
});
