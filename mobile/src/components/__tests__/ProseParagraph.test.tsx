import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet, Text } from 'react-native';
import ProseParagraph from '../ProseParagraph';

const paragraph = 'ಪರ ಮೇರೀ ಸದಾ ಕೃಪಾ ರಹೇಗೀ।';
const normal = { fontFamily: 'NotoSerifKannada_500Medium', fontSize: 20, lineHeight: 34 };
const layout = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: 346, height } } });
let tree: TestRenderer.ReactTestRenderer;
const originalPlatform = Platform.OS;
afterEach(() => { act(() => tree?.unmount()); Platform.OS = originalPlatform; });

test('gives iOS drawing one point of room without altering the source or accumulating height', () => {
  Platform.OS = 'ios';
  act(() => { tree = TestRenderer.create(<ProseParagraph style={normal}>{paragraph}</ProseParagraph>); });
  let text = tree.root.findByType(Text);
  expect(text.props.children).toBe(paragraph);
  expect(StyleSheet.flatten(text.props.style).minHeight).toBeUndefined();
  act(() => text.props.onLayout(layout(476)));
  text = tree.root.findByType(Text);
  expect(StyleSheet.flatten(text.props.style)).toMatchObject({ ...normal, minHeight: 477 });
  act(() => text.props.onLayout(layout(477)));
  expect(StyleSheet.flatten(tree.root.findByType(Text).props.style).minHeight).toBe(477);
});

test('reading-size changes remeasure naturally and ignore old native layout events', () => {
  Platform.OS = 'ios';
  act(() => { tree = TestRenderer.create(<ProseParagraph style={normal}>{paragraph}</ProseParagraph>); });
  const oldLayout = tree.root.findByType(Text).props.onLayout;
  act(() => oldLayout(layout(476)));
  const large = { ...normal, fontSize: 23, lineHeight: 39 };
  act(() => tree.update(<ProseParagraph style={large}>{paragraph}</ProseParagraph>));
  expect(StyleSheet.flatten(tree.root.findByType(Text).props.style).minHeight).toBeUndefined();
  act(() => tree.root.findByType(Text).props.onLayout(layout(624)));
  act(() => oldLayout(layout(476)));
  expect(StyleSheet.flatten(tree.root.findByType(Text).props.style).minHeight).toBe(625);
  expect(tree.root.findByType(Text).props.children).toBe(paragraph);
});

test('changed prose does not inherit the previous paragraph height', () => {
  Platform.OS = 'ios';
  act(() => { tree = TestRenderer.create(<ProseParagraph style={normal}>{paragraph}</ProseParagraph>); });
  act(() => tree.root.findByType(Text).props.onLayout(layout(476)));
  act(() => tree.update(<ProseParagraph style={normal}>A shorter paragraph.</ProseParagraph>));
  expect(StyleSheet.flatten(tree.root.findByType(Text).props.style).minHeight).toBeUndefined();
});

test('Android keeps natural layout without an extra native measurement callback', () => {
  Platform.OS = 'android';
  act(() => { tree = TestRenderer.create(<ProseParagraph style={normal}>{paragraph}</ProseParagraph>); });
  const text = tree.root.findByType(Text);
  expect(text.props.onLayout).toBeUndefined();
  expect(StyleSheet.flatten(text.props.style)).toEqual(normal);
  expect(text.props.children).toBe(paragraph);
});
