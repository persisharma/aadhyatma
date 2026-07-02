import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import DeityIcon from '../DeityIcon';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

/** Last numeric fontSize across a (possibly array) style prop. */
function fontSizeOf(style: unknown): number | undefined {
  const arr = Array.isArray(style) ? style : [style];
  let fs: number | undefined;
  for (const s of arr) {
    if (s && typeof s === 'object' && typeof (s as { fontSize?: unknown }).fontSize === 'number') {
      fs = (s as { fontSize: number }).fontSize;
    }
  }
  return fs;
}

function texts(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(Text);
}

describe('DeityIcon', () => {
  test('renders the deity emoji for an emoji-backed iconKey', () => {
    const t = texts(render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" />));
    expect(t).toHaveLength(1);
    expect(t[0].props.children).toBe('🏹');
  });

  test('scales the emoji glyph up with the size prop', () => {
    const small = texts(render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" />));
    const large = texts(render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" size={120} />));
    expect(fontSizeOf(large[0].props.style)!).toBeGreaterThan(fontSizeOf(small[0].props.style)!);
  });

  test('falls back to the given text (scaled) when iconKey is undefined', () => {
    const t = texts(render(<DeityIcon fallbackText="ॐ" size={120} />));
    expect(t).toHaveLength(1);
    expect(t[0].props.children).toBe('ॐ');
    expect(fontSizeOf(t[0].props.style)!).toBeGreaterThan(22);
  });

  test('renders a View-based glyph (no text) for a drawn icon like gada', () => {
    expect(texts(render(<DeityIcon iconKey="gada" fallbackText="ॐ" size={120} />))).toHaveLength(0);
  });
});
