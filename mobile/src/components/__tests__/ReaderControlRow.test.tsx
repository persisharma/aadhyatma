import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import ReaderControlRow from '../ReaderControlRow';

let tree: ReactTestRenderer;
afterEach(() => { act(() => tree.unmount()); });
function mount() {
  act(() => { tree = create(<ReaderControlRow trailing={<Text>Listen</Text>}><Text>Language and routine</Text></ReaderControlRow>); });
}
function node(id: string) { return tree.root.findAllByType(View).find(n => n.props.testID === id)!; }
function layout(id: string, width: number) {
  act(() => node(id).props.onLayout({ nativeEvent: { layout: { width } } }));
}
function position() { return StyleSheet.flatten(node('reader-control-trailing').props.style).position; }

test('starts safely stacked and uses a single row only with room for touch targets', () => {
  mount();
  expect(position()).toBeUndefined();
  layout('reader-control-row', 390); layout('reader-control-group', 160); layout('reader-control-trailing', 72);
  expect(position()).toBe('absolute');
  layout('reader-control-row', 320);
  expect(position()).toBeUndefined();
  expect(StyleSheet.flatten(node('reader-control-trailing').props.style).marginTop).toBe(24);
  layout('reader-control-row', 390);
  expect(position()).toBe('absolute');
});

test('reflows when larger fonts or a longer locale label expand either group', () => {
  mount();
  layout('reader-control-row', 390); layout('reader-control-group', 160); layout('reader-control-trailing', 72);
  layout('reader-control-trailing', 100);
  expect(position()).toBeUndefined();
  layout('reader-control-trailing', 72); layout('reader-control-group', 210);
  expect(position()).toBeUndefined();
  expect(tree.root.findAllByType(Text).map(n => n.props.children)).toEqual(['Language and routine', 'Listen']);
});
