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

// Own the timer lifecycle so sibling suites cannot change when the chip's
// deferred observance lookup settles in a runInBand full-suite execution.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
  jest.useRealTimers();
  mockNavigate.mockClear();
  mockObservance = null;
});

async function render(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
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
  await act(async () => {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  });
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
