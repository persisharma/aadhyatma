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

it('searches the approved humility copy and excludes a different shrine in the same family', () => {
  const onSelect = jest.fn(), onClose = jest.fn();
  const thought = suvicharThoughtsFor('hanuman').find(t => t.id === 'VD-0055')!;
  act(() => { tree = create(<SuvicharThoughtPicker visible deity="hanuman" lang="hi" onSelect={onSelect} onClose={onClose} />); });
  act(() => tree.root.findAllByProps({ testID: 'suvichar-thought-search' }).find(n => n.props.onChangeText)!.props.onChangeText('विनम्रता'));
  expect(tree.root.findByType(FlatList).props.data).toContain(thought);
  act(() => tree.root.findAllByProps({ testID: `suvichar-thought-${thought.id}` }).find(n => n.props.onPress)!.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(thought);
  expect(onClose).toHaveBeenCalledTimes(1);
  act(() => tree.update(<SuvicharThoughtPicker visible deity="jagannath" lang="en" onSelect={onSelect} onClose={onClose} />));
  act(() => tree.root.findAllByProps({ testID: 'suvichar-thought-search' }).find(n => n.props.onChangeText)!.props.onChangeText('VD-0037'));
  expect(tree.root.findByType(FlatList).props.data).toEqual([]);
});

it('finds the new Hare Ka Sahara messages by theme and selects the complete final ID', () => {
  const onSelect = jest.fn();
  act(() => { tree = create(<SuvicharThoughtPicker visible deity="khatu-shyam" lang="hi" onSelect={onSelect} onClose={jest.fn()} />); });
  const search = () => tree.root.findAllByProps({ testID: 'suvichar-thought-search' }).find(n => n.props.onChangeText)!;
  act(() => search().props.onChangeText('हारे का सहारा'));
  expect(tree.root.findByType(FlatList).props.data.map((t: { id: string }) => t.id)).toEqual(Array.from({ length: 8 }, (_, i) => `VD-${String(i + 77).padStart(4, '0')}`));
  act(() => search().props.onChangeText('VD-0084'));
  const thought = suvicharThoughtsFor('khatu-shyam').find(t => t.id === 'VD-0084')!;
  expect(tree.root.findByType(FlatList).props.data).toEqual([thought]);
  act(() => tree.root.findAllByProps({ testID: 'suvichar-thought-VD-0084' }).find(n => n.props.onPress)!.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(thought);
});
