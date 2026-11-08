import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, StyleSheet } from 'react-native';
import fs from 'node:fs';
import path from 'node:path';
import FeatureIcon, { featureIconSources, type FeatureIconName } from '../FeatureIcon';
import { moreIconSources } from '../MoreIcon';
import { storybookSources } from '../storybookSources';

it('reuses More artwork for shared Discover subjects', () => {
  expect(featureIconSources['pitru-smaran']).toBe(moreIconSources.remembrance);
  expect(featureIconSources['home-widgets']).toBe(moreIconSources.widgets);
  expect(featureIconSources['daan-punya']).toBe(moreIconSources.daan);
  expect(featureIconSources.routine).toBe(storybookSources.practice);
});

it('covers every Discover feature with centered, untinted decorative artwork', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../screens/HomeScreen.tsx'), 'utf8');
  const wiredNames = [...source.matchAll(/<FeatureIcon name="([^"]+)"/g)].map((m) => m[1]);
  expect(wiredNames.sort()).toEqual(Object.keys(featureIconSources).sort());
  expect(wiredNames).toHaveLength(9);
  for (const name of wiredNames as FeatureIconName[]) {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<FeatureIcon name={name} />); });
    const icon = tree.root.findByType(Image);
    expect(StyleSheet.flatten(icon.props.style)).toEqual({ width: 32, height: 32 });
    expect(icon.props.resizeMode).toBe('contain');
    expect(icon.props.source).toBe(featureIconSources[name]);
    expect(icon.props.accessible).toBe(false);
    expect(icon.props.importantForAccessibility).toBe('no-hide-descendants');
    act(() => { tree.unmount(); });
  }
});
