import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import DeityIcon from '../DeityIcon';
import { deityGlyphs } from '../deityGlyphs';

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
  test('every registered iconKey renders a drawn View glyph — no emoji, no text', () => {
    const keys = Object.keys(deityGlyphs) as (keyof typeof deityGlyphs)[];
    expect(keys.length).toBe(21);
    for (const key of keys) {
      const tree = render(<DeityIcon iconKey={key} fallbackText="ॐ" />);
      expect(texts(tree)).toHaveLength(0);
      expect(tree.root.findAllByProps({ testID: `deity-glyph-${key}` }).length).toBeGreaterThan(0);
    }
  });

  test('transform-scales the drawn glyph for non-base sizes only', () => {
    const hasScale = (n: TestRenderer.ReactTestInstance, match: (s: unknown) => boolean) =>
      Array.isArray(n.props.style?.transform) &&
      n.props.style.transform.some((t: Record<string, unknown>) => match(t.scale));

    const scaled = render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" size={120} />);
    expect(scaled.root.findAll((n) => hasScale(n, (s) => s === 120 / 36)).length).toBeGreaterThan(0);

    const base = render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" size={36} />);
    expect(base.root.findAll((n) => hasScale(n, (s) => typeof s === 'number'))).toHaveLength(0);
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

  test('trishul, lakshmi, and narasimha glyphs carry their silhouette parts', () => {
    const trishul = render(<DeityIcon iconKey="trishul" fallbackText="ॐ" />);
    for (const part of ['shaft', 'crossbar', 'prong']) {
      expect(trishul.root.findAllByProps({ testID: `deity-icon-trishul-${part}` }).length).toBeGreaterThan(0);
    }
    const lakshmi = render(<DeityIcon iconKey="lakshmi" fallbackText="ॐ" />);
    expect(lakshmi.root.findAllByProps({ testID: 'deity-icon-lakshmi-coin' }).length).toBeGreaterThan(0);
    expect(lakshmi.root.findAllByProps({ testID: 'deity-icon-lakshmi-cup' }).length).toBeGreaterThan(0);
    const narasimha = render(<DeityIcon iconKey="narasimha" fallbackText="ॐ" />);
    expect(narasimha.root.findAllByProps({ testID: 'deity-icon-narasimha-mane' }).length).toBeGreaterThan(0);
    expect(narasimha.root.findAllByProps({ testID: 'deity-icon-narasimha-face' }).length).toBeGreaterThan(0);
  });
});
