import React from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import DevotionalShareCard from '../DevotionalShareCard';
const page = { art: 'krishna' as const, verse: 'Om', meaning: 'Peace', heroHeight: 90, continuation: false };
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
function mount(onReady: jest.Mock) { act(() => { tree = create(<DevotionalShareCard header="Gita" page={page} lang="en" pageIndex={0} pageCount={1} onReady={onReady} />); }); }
it('waits for decoded artwork and actual native text layout', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onLoad());
  expect(ready).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: 250 } } }));
  expect(ready).toHaveBeenLastCalledWith(true);
});
it('refuses an overflowing card instead of capturing clipped text', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onLoad());
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: 519 } } }));
  expect(ready).toHaveBeenLastCalledWith(false); expect(ready).not.toHaveBeenCalledWith(true);
});
it('refuses an artwork decode failure', () => {
  const ready = jest.fn(); mount(ready);
  act(() => tree.root.findByType(Image).props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
});
