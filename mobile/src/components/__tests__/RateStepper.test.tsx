import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import RateStepper from '../RateStepper';

/**
 * Shared by the japam tempo control and the read-aloud settings sheet, so the bounds
 * arithmetic is pinned here once rather than in each caller.
 */

function render(value: number, onChange = jest.fn(), overrides: Partial<{ min: number; max: number; step: number }> = {}) {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <RateStepper
            value={value}
            onChange={onChange}
            min={overrides.min ?? 0.5}
            max={overrides.max ?? 1.5}
            step={overrides.step ?? 0.1}
          />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return { tree: tree!, onChange };
}

function byLabel(t: TestRenderer.ReactTestRenderer, label: string) {
  return t.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

function text(t: TestRenderer.ReactTestRenderer): string {
  return t.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join('');
}

it('renders the value to one decimal with a multiplication sign', () => {
  const { tree } = render(1);
  expect(text(tree)).toContain('1.0×');
});

it('steps up and down by `step`', () => {
  const { tree, onChange } = render(1);

  act(() => byLabel(tree, 'Faster').props.onPress());
  expect(onChange).toHaveBeenLastCalledWith(1.1);

  act(() => byLabel(tree, 'Slower').props.onPress());
  expect(onChange).toHaveBeenLastCalledWith(0.9);
});

it('never steps past the bounds', () => {
  const up = render(1.45);
  act(() => byLabel(up.tree, 'Faster').props.onPress());
  expect(up.onChange).toHaveBeenLastCalledWith(1.5);

  const down = render(0.55);
  act(() => byLabel(down.tree, 'Slower').props.onPress());
  expect(down.onChange).toHaveBeenLastCalledWith(0.5);
});

it('avoids float drift in the stepped value', () => {
  // 0.7 - 0.1 is 0.5999999999999999 without the toFixed round-trip.
  const { tree, onChange } = render(0.7);
  act(() => byLabel(tree, 'Slower').props.onPress());
  expect(onChange).toHaveBeenLastCalledWith(0.6);
});

it('disables each control at its bound', () => {
  const atMax = render(1.5);
  expect(byLabel(atMax.tree, 'Faster').props.accessibilityState.disabled).toBe(true);
  expect(byLabel(atMax.tree, 'Slower').props.accessibilityState.disabled).toBe(false);

  const atMin = render(0.5);
  expect(byLabel(atMin.tree, 'Slower').props.accessibilityState.disabled).toBe(true);
  expect(byLabel(atMin.tree, 'Faster').props.accessibilityState.disabled).toBe(false);
});

it('treats a near-bound float as at the bound', () => {
  // Accumulated 0.1 steps land on 1.4999999999999998, which must still disable.
  const t = render(1.4999999999999998);
  expect(byLabel(t.tree, 'Faster').props.accessibilityState.disabled).toBe(true);
});

it('renders an optional caption', () => {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <RateStepper value={1} onChange={jest.fn()} min={0.5} max={1.5} step={0.1} label="गति" />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  expect(text(tree!)).toContain('गति');
});
