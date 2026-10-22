import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import DevotionalShareCard from '../DevotionalShareCard';

// The masters come from R2 through the download-once cache; tests resolve them to a local file.
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: (request: { key: string; ext: string }, listener: (uri: string | null) => void) => { listener(`file:///cache/${request.key}.${request.ext}`); return () => undefined; },
  evictBackgroundAsset: jest.fn(async () => undefined),
}));
const page = { art: 'krishna' as const, verse: 'Om', meaning: 'Peace', heroHeight: 90, continuation: false };
let tree: ReactTestRenderer;
const height = jest.fn();
afterEach(() => { if (tree) act(() => tree.unmount()); height.mockClear(); });
function card(onReady: jest.Mock, meaning = page.meaning) { return <DevotionalShareCard header="Gita" page={{ ...page, meaning }} lang="en" pageIndex={0} pageCount={1} onReady={onReady} onHeight={height} />; }
function mount(onReady: jest.Mock) { act(() => { tree = create(card(onReady)); }); }
function layout(body = 348, root = 728) {
  act(() => tree.root.findByProps({ testID: 'devotional-share-content' }).props.onLayout({ nativeEvent: { layout: { height: body } } }));
  act(() => tree.root.findByProps({ testID: 'devotional-share-card' }).props.onLayout({ nativeEvent: { layout: { height: root } } }));
}
function paint(except?: string) { act(() => { for (const img of tree.root.findAllByType(Image)) if (!except || img.props.testID !== except) img.props.onLoad(); }); }
it('waits for every decoded section and the final native layout', () => {
  const ready = jest.fn(); mount(ready); paint(); expect(ready).not.toHaveBeenCalled();
  layout(); expect(ready).toHaveBeenLastCalledWith(true); expect(height).toHaveBeenLastCalledWith(728);
});
it.each(['devotional-hero-image', 'devotional-source-panel-image', 'devotional-meaning-frame-image', 'devotional-divider-image', 'devotional-footer-image'])('waits for %s and refuses its decode failure', id => {
  const ready = jest.fn(); mount(ready); layout(); paint(id); expect(ready).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: id }).props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
});
it('waits for fixed decorative caps too', () => {
  const ready = jest.fn(); mount(ready); layout(); const images = tree.root.findAllByType(Image), cap = images.find(img => !img.props.testID)!;
  act(() => { for (const img of images) if (img !== cap) img.props.onLoad(); }); expect(ready).not.toHaveBeenCalled();
  act(() => cap.props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
});
it('grows to the complete measured body and rejects a stale root size', () => {
  const ready = jest.fn(); mount(ready); paint(); layout(800, 728); expect(ready).not.toHaveBeenCalled();
  const root = tree.root.findByProps({ testID: 'devotional-share-card' }); expect(StyleSheet.flatten(root.props.style).height).toBe(1180);
  act(() => root.props.onLayout({ nativeEvent: { layout: { height: 1180 } } })); expect(ready).toHaveBeenLastCalledWith(true); expect(height).toHaveBeenLastCalledWith(1180);
});
it.each([NaN, Infinity, 0, -1])('refuses invalid body height %s', h => {
  const ready = jest.fn(); mount(ready); paint(); layout(h); expect(ready).toHaveBeenLastCalledWith(false);
});
it('resets painting and measurement when the reading changes', () => {
  const ready = jest.fn(); mount(ready); paint(); layout(); expect(ready).toHaveBeenLastCalledWith(true); ready.mockClear();
  act(() => tree.update(card(ready, 'A different, longer complete meaning.'))); layout(); expect(ready).not.toHaveBeenCalled(); paint(); expect(ready).toHaveBeenLastCalledWith(true);
});
it('fills the short-card gap from the same unscaled master and waits for its paint', () => {
  const ready = jest.fn(); mount(ready); layout(300, 728); paint('devotional-spacer-image');
  expect(ready).not.toHaveBeenCalled();
  const spacer = tree.root.findAllByType(Image).find(node => node.props.testID === 'devotional-spacer-image')!;
  expect(StyleSheet.flatten(spacer.props.style)).toMatchObject({ width: 540, height: 728, top: -600 });
  expect(spacer.props.source).toEqual(tree.root.findAllByType(Image).find(node => node.props.testID === 'devotional-footer-image')!.props.source);
  act(() => spacer.props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
  act(() => spacer.props.onError()); expect(ready).toHaveBeenLastCalledWith(false);
});
