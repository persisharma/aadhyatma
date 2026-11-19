import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import AutoSlideButton from '@/components/AutoSlideButton';
import type { AutoSlideControl } from '@/screens/_useAutoSlide';
import type { AutoSlideSpeed } from '@/utils/autoSlideStore';

function control(speed: AutoSlideSpeed, cycleSpeed = jest.fn()): AutoSlideControl {
  return {
    visible: true,
    playing: true,
    speed,
    countdownMs: 3000,
    countdownKey: 1,
    toggle: jest.fn(),
    stop: jest.fn(),
    cycleSpeed,
    Cell: (() => null) as unknown as AutoSlideControl['Cell'],
  };
}

function render(c: AutoSlideControl) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang="hi">
          <AutoSlideButton control={c} />
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  return tree;
}

/** Bars of the pace meter, read as lit (opacity 1) / unlit (0.3). */
function meter(tree: TestRenderer.ReactTestRenderer): boolean[] {
  const speedButton = tree.root.findByProps({ accessibilityHint: 'Changes how long each page stays' });
  return speedButton
    .findAll((n) => n.type === View && StyleSheet.flatten(n.props.style)?.width === 3)
    .map((bar) => StyleSheet.flatten(bar.props.style).opacity !== 0.3);
}

describe('AutoSlideButton pace meter (design.md §85)', () => {
  test.each<[AutoSlideSpeed, string, boolean[]]>([
    ['slow', 'slow', [true, false, false, false]],
    ['normal', 'normal', [true, true, false, false]],
    ['fast', 'fast', [true, true, true, false]],
    ['veryFast', 'very fast', [true, true, true, true]],
  ])('%s lights its bars and reads "Slideshow speed: %s"', (speed, spoken, lit) => {
    const tree = render(control(speed));
    expect(tree.root.findAllByProps({ accessibilityLabel: `Slideshow speed: ${spoken}` }).length).toBeGreaterThan(0);
    expect(meter(tree)).toEqual(lit);
  });

  test('tapping the meter asks the hook to cycle the pace', () => {
    const cycle = jest.fn();
    const tree = render(control('fast', cycle));
    const [speedButton] = tree.root.findAllByProps({ accessibilityLabel: 'Slideshow speed: fast' });
    act(() => speedButton.props.onPress());
    expect(cycle).toHaveBeenCalledTimes(1);
  });
});
