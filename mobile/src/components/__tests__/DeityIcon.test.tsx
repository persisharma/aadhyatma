import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, Text } from 'react-native';

import DeityIcon from '../DeityIcon';
import { deityArtwork } from '../deityArtwork';
import { deities } from '@/data/deities';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

function texts(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(Text);
}

describe('DeityIcon', () => {
  test('every registered deity renders bundled symbolic art, without duplicate labels or text', () => {
    expect(Object.keys(deityArtwork)).toHaveLength(21);
    for (const deity of deities) {
      const tree = render(<DeityIcon iconKey={deity.iconKey} />);
      expect(texts(tree)).toHaveLength(0);
      const image = tree.root.findByType(Image);
      expect(image.props.source).toBeTruthy();
      expect(image.props.source.uri).toBeUndefined();
      expect(image.props.accessible).toBe(false);
      expect(tree.root.findAllByProps({ testID: `deity-glyph-${deity.iconKey}` }).length).toBeGreaterThan(0);
    }
  });

  test('transform-scales the art for non-base sizes only', () => {
    const hasScale = (n: TestRenderer.ReactTestInstance, match: (s: unknown) => boolean) =>
      Array.isArray(n.props.style?.transform) &&
      n.props.style.transform.some((t: Record<string, unknown>) => match(t.scale));

    const scaled = render(<DeityIcon iconKey="bowArrow" size={120} />);
    expect(scaled.root.findAll((n) => hasScale(n, (s) => s === 120 / 36)).length).toBeGreaterThan(0);

    const base = render(<DeityIcon iconKey="bowArrow" size={36} />);
    expect(base.root.findAll((n) => hasScale(n, (s) => typeof s === 'number'))).toHaveLength(0);
  });

  test('an undefined iconKey renders the painted deity seal, never a text glyph', () => {
    const tree = render(<DeityIcon size={120} />);
    expect(texts(tree)).toHaveLength(0);
    expect(tree.root.findByType(Image).props.source).toBeTruthy();
    expect(tree.root.findAllByProps({ testID: 'deity-glyph-fallback' }).length).toBeGreaterThan(0);
  });

  test('renders a bundled image (no text) for a drawn icon like gada', () => {
    expect(texts(render(<DeityIcon iconKey="gada" size={120} />))).toHaveLength(0);
  });

  test('preserves distinct sun and flower attributes and the guru Om emblem', () => {
    expect(deityArtwork.surya).not.toBe(deityArtwork.suryadev);
    expect(new Set([deityArtwork.lotus, deityArtwork.lakshmi, deityArtwork.radha, deityArtwork.parvati]).size).toBe(4);
    expect(deityArtwork.dattatreya).toBe('stotram');
    expect(deityArtwork.navagraha).toBe('navagraha');
    expect(deityArtwork.kali).toBe('kali');
  });
});
