import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import DevotionalShareCard from '../DevotionalShareCard';
const page = { art: 'krishna' as const, verse: 'Om', meaning: 'Peace', heroHeight: 90, continuation: false };
let tree: ReactTestRenderer;
const height = jest.fn();
afterEach(() => { if (tree) act(() => tree.unmount()); height.mockClear(); });
function mount(onReady: jest.Mock) { act(() => { tree = create(<DevotionalShareCard header="Gita" page={page} lang="en" pageIndex={0} pageCount={1} onReady={onReady} onHeight={height} />); }); }
it('waits for decoded artwork and actual native text layout', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onLoad());
  expect(ready).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: 250 } } }));
  expect(ready).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'devotional-share-card' }).props.onLayout({ nativeEvent: { layout: { height: 675 } } }));
  expect(ready).toHaveBeenLastCalledWith(true);
  expect(height).toHaveBeenLastCalledWith(675);
});
it('grows one card to its actual full body height before allowing capture', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onLoad());
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: 800 } } }));
  const card = tree.root.findByProps({ testID: 'devotional-share-card' });
  expect(StyleSheet.flatten(card.props.style).height).toBe(1137);
  expect(ready).not.toHaveBeenCalled();
  act(() => card.props.onLayout({ nativeEvent: { layout: { height: 1137 } } }));
  expect(ready).toHaveBeenLastCalledWith(true);
  expect(height).toHaveBeenLastCalledWith(1137);
});
it('rejects invalid native layout rather than guessing a short frame', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: NaN } } }));
  expect(ready).toHaveBeenLastCalledWith(false);
});
it('refuses an artwork decode failure', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
});
