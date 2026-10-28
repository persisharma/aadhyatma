import React from 'react';
import { FlatList } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharThoughtPicker from '../SuvicharThoughtPicker';
import { suvicharThoughtsFor } from '@/data/suvicharContent';

let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
it('finds and selects a late reviewed ID from the complete deity collection', () => {
  const onSelect = jest.fn(), onClose = jest.fn();
  const late = suvicharThoughtsFor('krishna').find(t => t.id === 'SV-0099')!;
  act(() => { tree = create(<SuvicharThoughtPicker visible deity="krishna" lang="hi" onSelect={onSelect} onClose={onClose} />); });
  expect(tree.root.findByType(FlatList).props.data).toHaveLength(suvicharThoughtsFor('krishna').length);
  act(() => tree.root.findAllByProps({ testID: 'suvichar-thought-search' }).find(n => n.props.onChangeText)!.props.onChangeText('SV-0099'));
  expect(tree.root.findByType(FlatList).props.data).toEqual([late]);
  act(() => tree.root.findAllByProps({ testID: 'suvichar-thought-SV-0099' }).find(n => n.props.onPress)!.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(late);
  expect(onClose).toHaveBeenCalledTimes(1);
  act(() => tree.update(<SuvicharThoughtPicker visible deity="ganesha" lang="en" onSelect={onSelect} onClose={onClose} />));
  expect(tree.root.findByType(FlatList).props.data).toEqual([]);
});
