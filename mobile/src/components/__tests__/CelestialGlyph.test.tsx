import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image } from 'react-native';
import { Image as SvgImage } from 'react-native-svg';
import CelestialGlyph from '../CelestialGlyph';
import { storybookSources } from '../storybookSources';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => act(() => trees.splice(0).forEach(tree => tree.unmount())));
function render(kind: 'moon' | 'sun', index = 14) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<CelestialGlyph kind={kind} tithiIndex={index} size={30} />); });
  trees.push(tree);
  return tree;
}

test('Purnima displays the entire retained moon painting without shade', () => {
  const tree = render('moon');
  expect(tree.root.findAllByType(SvgImage)).toHaveLength(1);
  expect(tree.root.findByType(SvgImage).props.href).toBe(storybookSources.chandra);
  expect(tree.root.findAllByProps({ testID: 'moon-unlit-shade' })).toHaveLength(0);
});

test('Amavasya shades the full painting and adds no illuminated copy', () => {
  const tree = render('moon', 29);
  expect(tree.root.findAllByType(SvgImage)).toHaveLength(1);
  expect(tree.root.findAllByProps({ testID: 'moon-unlit-shade' }).length).toBeGreaterThan(0);
});

test('the daytime sun reuses the painted eight-ray asset', () => {
  const tree = render('sun');
  expect(tree.root.findByType(Image).props.source).toBe(storybookSources.gayatri);
  const layer = tree.root.findAll(node => node.props.pointerEvents === 'none')[0];
  expect(layer.props.accessible).toBe(false);
  expect(layer.props.accessibilityElementsHidden).toBe(true);
});
