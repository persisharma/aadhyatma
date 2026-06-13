import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import HomeWordmark from '../HomeWordmark';

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<HomeWordmark />);
  });
  return tree;
}

function textNode(tree: TestRenderer.ReactTestRenderer, text: string): ReactTestInstance {
  return tree.root.findAllByType(Text).find((node) => node.props.children === text)!;
}

describe('HomeWordmark', () => {
  it('lowers the Vedansh title inside a clipping-safe lockup centered on the Om marks', () => {
    const tree = render();
    const title = textNode(tree, 'वेदांश़');
    const titleStyle = StyleSheet.flatten(title.props.style);
    const lockupStyle = StyleSheet.flatten(title.parent!.props.style);
    const mark = tree.root
      .findAllByType(View)
      .find((node) => StyleSheet.flatten(node.props.style)?.width === 30)!;
    const markStyle = StyleSheet.flatten(mark.props.style);

    expect(lockupStyle.height).toBe(42);
    expect(lockupStyle.alignItems).toBe('center');
    expect(markStyle.height).toBe(30);
    expect(markStyle.alignItems).toBe('center');
    expect(markStyle.justifyContent).toBe('center');
    expect(titleStyle.lineHeight).toBe(42);
    expect(titleStyle.transform).toEqual([{ translateY: 4 }]);
  });
});
