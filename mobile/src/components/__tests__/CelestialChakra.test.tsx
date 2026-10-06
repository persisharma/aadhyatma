import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, StyleSheet } from 'react-native';
import { JyotishChakraSeal, PanchangChakraBackground, TodayChakraOrnament } from '../CelestialChakra';

it.each([PanchangChakraBackground, TodayChakraOrnament, JyotishChakraSeal])(
  '%p artwork never intercepts taps or adds a screen-reader stop', (Component) => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<Component />); });
    const layer = tree.root.findAll((node) => node.props.pointerEvents === 'none')[0];
    expect(layer.props.accessible).toBe(false);
    expect(layer.props.accessibilityElementsHidden).toBe(true);
    expect(layer.props.importantForAccessibility).toBe('no-hide-descendants');
    const drawing = tree.root.findByType(Image);
    expect(drawing.props.resizeMode).toBe('contain');
    const style = StyleSheet.flatten(drawing.props.style);
    expect(style.width).toBe(style.height);
    act(() => tree.unmount());
  }
);
