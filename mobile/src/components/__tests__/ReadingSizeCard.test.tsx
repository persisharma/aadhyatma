import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import ReadingSizeCard from '../ReadingSizeCard';
import { typography } from '@/theme/typography';

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
const mockSetItem = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

async function renderCard() {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <ReadingSizeCard />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree!;
}

function pill(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

describe('ReadingSizeCard', () => {
  beforeEach(() => {
    mockGetItem.mockReset().mockResolvedValue(null);
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  test('offers exactly Standard and Large options as radios', async () => {
    const tree = await renderCard();
    expect(pill(tree, 'Standard')).toBeDefined();
    expect(pill(tree, 'Large')).toBeDefined();
    expect(pill(tree, 'Standard').props.accessibilityRole).toBe('radio');
  });

  test('defaults to Standard selected', async () => {
    const tree = await renderCard();
    expect(pill(tree, 'Standard').props.accessibilityState.selected).toBe(true);
    expect(pill(tree, 'Large').props.accessibilityState.selected).toBe(false);
  });

  test('choosing Large persists L and selects it', async () => {
    const tree = await renderCard();
    act(() => {
      pill(tree, 'Large').props.onPress();
    });
    expect(mockSetItem).toHaveBeenCalledWith('@vedansh/font-scale', 'L');
    expect(pill(tree, 'Large').props.accessibilityState.selected).toBe(true);
  });

  test('the live sample grows when Large is chosen', async () => {
    const tree = await renderCard();
    const sampleSize = () =>
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'reading-size-sample' }).props.style
      ).fontSize;
    expect(sampleSize()).toBe(typography.verse.fontSize); // 23 at M
    act(() => {
      pill(tree, 'Large').props.onPress();
    });
    expect(sampleSize()).toBe(Math.round(typography.verse.fontSize * 1.15)); // 26 at L
  });
});
