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

  test('renders drawn glyphs (no text) for the converted geometric keys', () => {
    const keys = [
      'chakra',
      'surya',
      'suryadev',
      'navagraha',
      'shani',
      'kartikeya',
      'kubera',
      'ganga',
      'parvati',
    ] as const;
    for (const key of keys) {
      const tree = render(<DeityIcon iconKey={key} fallbackText="ॐ" />);
      expect(texts(tree)).toHaveLength(0);
      expect(tree.root.findAllByProps({ testID: `deity-glyph-${key}` }).length).toBeGreaterThan(0);
    }
  });

  test('chakra glyph carries its silhouette parts', () => {
    const tree = render(<DeityIcon iconKey="chakra" fallbackText="ॐ" />);
    for (const part of ['ring', 'spoke', 'hub']) {
      expect(tree.root.findAllByProps({ testID: `deity-icon-chakra-${part}` }).length).toBeGreaterThan(0);
    }
  });

  test('shani glyph carries ring and disc; navagraha carries its gold center', () => {
    const shani = render(<DeityIcon iconKey="shani" fallbackText="ॐ" />);
    expect(shani.root.findAllByProps({ testID: 'deity-icon-shani-ring' }).length).toBeGreaterThan(0);
    expect(shani.root.findAllByProps({ testID: 'deity-icon-shani-disc' }).length).toBeGreaterThan(0);
    const nava = render(<DeityIcon iconKey="navagraha" fallbackText="ॐ" />);
    expect(nava.root.findAllByProps({ testID: 'deity-icon-navagraha-center' }).length).toBeGreaterThan(0);
  });
});
