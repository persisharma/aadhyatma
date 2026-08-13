import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

/**
 * PRD-17 §3.5 — the Panchang day panel's private "॥ स्मरण" chip: renders only
 * when a saved entry matches the date, in the muted gold register (goldTint fill,
 * ink-soft text — never the festive saffron style), and deep-links the person's
 * detail in the More stack.
 */

// @react-navigation/native ships ESM the RN jest preset doesn't transform, so
// the module is fully replaced (house pattern — see KundaliExperience.test.tsx).
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

let mockMatches: import('@/panchang/pitruSmaran').SmaranEntry[] = [];
jest.mock('@/panchang/usePitruSmaranForDate', () => ({
  usePitruSmaranForDate: () => mockMatches,
}));

import PitruSmaranDayChip from '../PitruSmaranDayChip';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { lightColors } from '@/theme/colors';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    trees.splice(0).forEach((t) => t.unmount());
  });
  mockNavigate.mockClear();
  mockMatches = [];
});

async function render(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <PitruSmaranDayChip date={new Date(2027, 0, 29)} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

describe('PitruSmaranDayChip', () => {
  test('renders nothing when no entry matches the date', async () => {
    const tree = await render();
    expect(tree.toJSON()).toBeNull();
  });

  test('renders the muted chip for a matching entry and opens its detail', async () => {
    mockMatches = [
      { id: 'smaran-father', relation: 'pitaji', tithiRule: { lunarMonth: 11, paksha: 'krishna', tithi: 8 }, createdAtMs: 1 },
    ];
    const tree = await render();
    const text = tree.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat(Number.POSITIVE_INFINITY)
      .join(' ');
    expect(text).toContain('स्मरण');
    expect(text).toContain('पिताजी');

    const chip = tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Smaran, Father' && typeof n.props.onPress === 'function'
    )[0];
    // Muted register, never festive: ink-soft text (goldTint fill on the pill).
    const textNode = tree.root.findAllByType(Text)[0];
    expect(textNode.props.style.color).toBe(lightColors.inkSoft);

    act(() => chip.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('MoreTab', {
      screen: 'PitruSmaranDetail',
      params: { entryId: 'smaran-father' },
    });
  });
});
