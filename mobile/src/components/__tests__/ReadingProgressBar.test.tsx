import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import ReadingProgressBar from '@/components/ReadingProgressBar';

function render(props: React.ComponentProps<typeof ReadingProgressBar>) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <ReadingProgressBar {...props} />
      </ThemeProvider>
    );
  });
  return tree;
}

function fillWidth(tree: TestRenderer.ReactTestRenderer): string | number | undefined {
  const fill = tree.root.findByProps({ testID: 'reading-progress-fill' });
  const styles = Array.isArray(fill.props.style) ? fill.props.style : [fill.props.style];
  return Object.assign({}, ...styles).width;
}

describe('ReadingProgressBar', () => {
  test('fill width reflects 1-based position over total (1 / 5 → 20%)', () => {
    expect(fillWidth(render({ current: 1, total: 5 }))).toBe('20%');
  });

  test('fill is full at the last page (5 / 5 → 100%)', () => {
    expect(fillWidth(render({ current: 5, total: 5 }))).toBe('100%');
  });

  test('handles a mid-text fraction (3 / 4 → 75%)', () => {
    expect(fillWidth(render({ current: 3, total: 4 }))).toBe('75%');
  });

  test('renders nothing when there is nothing to track (total = 0)', () => {
    expect(render({ current: 1, total: 0 }).toJSON()).toBeNull();
  });

  test('clamps an out-of-range position to 100% (defensive)', () => {
    expect(fillWidth(render({ current: 6, total: 5 }))).toBe('100%');
  });

  test('clamps a non-positive position to 0% (defensive)', () => {
    expect(fillWidth(render({ current: 0, total: 5 }))).toBe('0%');
  });
});
