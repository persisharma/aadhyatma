import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import PitruPakshaDayChip from '../PitruPakshaDayChip';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

let mockObservance: import('@/panchang/pitruSmaran').PitruPakshaDayObservance | null = null;
jest.mock('@/panchang/pitruSmaran', () => ({
  pitruPakshaObservanceForDate: () => mockObservance,
}));
jest.mock('@/data/vidhi', () => ({
  getVidhiById: (id: string) => id === 'shraddha-tarpan-vidhi' ? { id } : null,
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const trees: TestRenderer.ReactTestRenderer[] = [];

// The chip resolves its observance through a real setTimeout(0) in useEffect, so
// pin real timers here — otherwise fake timers leaked by a sibling suite (runInBand)
// leave `observance` null and the guide door never renders.
beforeEach(() => {
  jest.useRealTimers();
});

afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
  mockNavigate.mockClear();
  mockObservance = null;
});

async function render(): Promise<TestRenderer.ReactTestRenderer> {
  // Force real timers here too (not just beforeEach): under the full runInBand
  // suite a sibling can leave fake timers installed, which would stall the chip's
  // setTimeout(0) observance solve and leave the guide door unrendered.
  jest.useRealTimers();
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <PitruPakshaDayChip date={new Date(2026, 9, 10)} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  // The chip resolves `observance` through a setTimeout(0) effect; flush it on
  // real timers, polling to survive scheduler jitter late in the suite.
  for (let i = 0; i < 20; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    if (tree.root.findAllByProps({ accessibilityLabel: 'Open Tila-Tarpana remembrance guide' }).length > 0) break;
    if (tree.root.findAllByProps({ accessibilityRole: 'button' }).length > 0 && i >= 2) break;
  }
  trees.push(tree);
  return tree;
}

describe('PitruPakshaDayChip', () => {
  test('Sarvapitri day exposes a muted direct door to the registered guide', async () => {
    mockObservance = {
      tithi: 29,
      isPurnima: false,
      isSarvapitri: true,
      labelHi: 'पितृ पक्ष — सर्वपितृ अमावस्या',
      labelEn: 'Pitru Paksha — Sarvapitri Amavasya',
    };
    const tree = await render();
    const door = tree.root.findByProps({ accessibilityLabel: 'Open Tila-Tarpana remembrance guide' });
    act(() => door.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('MoreTab', {
      screen: 'VidhiDetail',
      params: {
        vidhiId: 'shraddha-tarpan-vidhi',
        dateMs: new Date(2026, 9, 10).getTime(),
      },
      initial: false,
    });
  });

  test('ordinary Pitru Paksha days keep only the overview door', async () => {
    mockObservance = {
      tithi: 22,
      isPurnima: false,
      isSarvapitri: false,
      labelHi: 'पितृ पक्ष — अष्टमी श्राद्ध',
      labelEn: 'Pitru Paksha — Ashtami Shraddha',
    };
    const tree = await render();
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Open Tila-Tarpana remembrance guide' })).toHaveLength(0);
  });
});
