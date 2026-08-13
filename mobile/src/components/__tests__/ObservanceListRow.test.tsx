import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';

import ObservanceListRow from '@/components/ObservanceListRow';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function render(node: React.ReactNode): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>{node}</ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

describe('ObservanceListRow', () => {
  test('includes decorative leading content and trailing metadata in the row press target', async () => {
    const onPress = jest.fn();
    const tree = await render(
      <ObservanceListRow
        leading={<Text>॥</Text>}
        title={<Text>पिताजी</Text>}
        caption={<Text>माघ कृष्ण अष्टमी</Text>}
        trailing={<Text>31 जन 2027</Text>}
        onPress={onPress}
        accessibilityLabel="Smaran Father"
      />
    );

    const row = tree.root.find((node) => node.props.accessibilityLabel === 'Smaran Father');
    act(() => row.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(Text).map((node) => node.props.children)).toEqual([
      '॥',
      'पिताजी',
      'माघ कृष्ण अष्टमी',
      '31 जन 2027',
    ]);
  });

  test('keeps an interactive leading action independent from the main row action', async () => {
    const onFollow = jest.fn();
    const onOpen = jest.fn();
    const tree = await render(
      <ObservanceListRow
        leadingAction={(
          <Pressable accessibilityLabel="Follow Ekadashi" onPress={onFollow}>
            <Text>☆</Text>
          </Pressable>
        )}
        title={<Text>एकादशी</Text>}
        onPress={onOpen}
        accessibilityLabel="Open Ekadashi"
      />
    );

    const follow = tree.root.find((node) => node.props.accessibilityLabel === 'Follow Ekadashi');
    const open = tree.root.find((node) => node.props.accessibilityLabel === 'Open Ekadashi');
    act(() => follow.props.onPress());
    expect(onFollow).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
    act(() => open.props.onPress());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
