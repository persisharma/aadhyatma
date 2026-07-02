import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

// Render react-native-svg primitives as plain Views so width/height/viewBox
// props are inspectable and no native module is required.
jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return { __esModule: true, default: Svg, Svg, Path: mk(), Circle: mk(), Ellipse: mk(), Line: mk(), G: mk() };
});

import DeityIcon from '../DeityIcon';

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

function svgNodes(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll((n) => n.props?.viewBox === '0 0 44 44');
}

describe('DeityIcon', () => {
  test('renders the glyph SVG at the default size (36) when given an iconKey', () => {
    const tree = render(<DeityIcon iconKey="surya" fallbackText="ॐ" />);
    const svgs = svgNodes(tree);
    expect(svgs.length).toBeGreaterThan(0);
    expect(svgs[0].props.width).toBe(36);
    expect(svgs[0].props.height).toBe(36);
  });

  test('honours an explicit size on the glyph SVG', () => {
    const tree = render(<DeityIcon iconKey="bowArrow" fallbackText="ॐ" size={120} />);
    const svgs = svgNodes(tree);
    expect(svgs[0].props.width).toBe(120);
    expect(svgs[0].props.height).toBe(120);
  });

  test('falls back to text (no SVG) when iconKey is undefined', () => {
    const tree = render(<DeityIcon fallbackText="ॐ" size={120} />);
    expect(svgNodes(tree)).toHaveLength(0);
    const text = tree.root.findAllByType(Text).map((n) => n.props.children).join('');
    expect(text).toBe('ॐ');
  });
});
