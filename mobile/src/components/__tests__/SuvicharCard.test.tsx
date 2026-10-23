import React from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharCard from '../SuvicharCard';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
jest.mock('@/data/suvichar', () => ({ ...jest.requireActual('@/data/suvichar'), suvicharArtRequest: () => ({ key: 'test', ext: 'webp', remoteUrl: 'https://cdn.vedansh.app/suvichar/test.webp' }) }));
jest.mock('@/utils/backgroundAssetCache', () => ({ subscribeBackgroundAsset: jest.fn((_: unknown, cb: (uri: string) => void) => { cb('file:///test.webp'); return () => undefined; }), evictBackgroundAsset: jest.fn() }));
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
function mount(ready: jest.Mock, name = 'शर्मा परिवार', message = 'श्रद्धा रखिए।') {
  act(() => { tree = create(<SuvicharCard deity="krishna" frame="mandir-jharokha" name={name} message={message} lang="hi" width={360} onReady={ready} />); });
}
function layout(body = 250, root = 520) {
  act(() => tree.root.findByProps({ testID: 'suvichar-card-body' }).props.onLayout({ nativeEvent: { layout: { height: body } } }));
  act(() => tree.root.findByProps({ testID: 'suvichar-card' }).props.onLayout({ nativeEvent: { layout: { height: root } } }));
}
it('waits for both decoded sections and matching final measured height', () => {
  const ready = jest.fn(); mount(ready); layout();
  const images = tree.root.findAllByType(Image);
  act(() => images[0].props.onLoad()); expect(ready).toHaveBeenLastCalledWith(false);
  act(() => images[0].props.onLoad()); expect(ready).toHaveBeenLastCalledWith(false);
  act(() => images[1].props.onLoad()); expect(ready).toHaveBeenLastCalledWith(true);
  layout(800, 520); expect(ready).toHaveBeenLastCalledWith(false);
  layout(800, 1070); expect(ready).toHaveBeenLastCalledWith(true);
});
it('refuses capture after native image decode failure', () => {
  const ready = jest.fn(); mount(ready); layout();
  act(() => tree.root.findAllByType(Image).forEach(image => image.props.onLoad()));
  expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.root.findAllByType(Image)[0].props.onError());
  expect(ready).toHaveBeenLastCalledWith(false);
});
it('keeps complete editable content and omits an empty sender line', () => {
  const message = 'श्रद्धा और सेवा। '.repeat(20); mount(jest.fn(), '', message);
  expect(tree.root.findAllByProps({ testID: 'suvichar-card-sender' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.children).toBe(message);
  expect(tree.root.findByProps({ testID: 'suvichar-card-message' }).props.numberOfLines).toBeUndefined();
});

it('reuses the artwork request while a sender is edited and remeasures the card', () => {
  jest.mocked(subscribeBackgroundAsset).mockClear();
  const ready = jest.fn(); mount(ready); layout();
  act(() => tree.root.findAllByType(Image).forEach(image => image.props.onLoad()));
  expect(ready).toHaveBeenLastCalledWith(true);
  act(() => tree.update(<SuvicharCard deity="krishna" frame="mandir-jharokha" name="New family" message="श्रद्धा रखिए।" lang="hi" width={360} onReady={ready} />));
  expect(ready).toHaveBeenLastCalledWith(false);
  expect(subscribeBackgroundAsset).toHaveBeenCalledTimes(1);
});
