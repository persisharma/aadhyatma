import React from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharEntryCard from '../SuvicharEntryCard';
import { peekBackgroundAsset } from '@/utils/backgroundAssetCache';
import { suvicharArtRequest } from '@/data/suvichar';
jest.mock('@/utils/backgroundAssetCache', () => ({ peekBackgroundAsset: jest.fn(async () => null) }));
let tree: ReactTestRenderer;
// Only Date is faked; 27 October 2026 is a Tuesday and 25 October a Sunday.
const day = (date: number) => jest.useFakeTimers({ now: new Date(2026, 9, date, 9), doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate', 'setTimeout', 'setInterval'] });
async function mount() { await act(async () => { tree = create(<SuvicharEntryCard lang="hi" onPress={jest.fn()} />); }); }
const texts = () => tree.root.findAllByType(Text).map(t => [t.props.children].flat().join(''));
afterEach(() => { act(() => tree.unmount()); jest.useRealTimers(); jest.clearAllMocks(); });

it('names the day and its deity, and shows the painting only from the cache', async () => {
  day(27); await mount();
  expect(texts()).toEqual(expect.arrayContaining(['शुभ मंगलवार भेजें', 'श्रीहनुमान का आज का कार्ड, आपके नाम के साथ']));
  expect(peekBackgroundAsset).toHaveBeenCalledWith(suvicharArtRequest('hanuman', 'mandir-jharokha'));
  expect(tree.root.findAllByProps({ testID: 'open-suvichar-art' })).toHaveLength(0);
  expect(texts()).toContain('ॐ');
  act(() => tree.unmount());
  jest.mocked(peekBackgroundAsset).mockResolvedValueOnce('file:///hanuman.webp');
  await mount();
  expect(tree.root.findByProps({ testID: 'open-suvichar-art' }).props.source).toEqual({ uri: 'file:///hanuman.webp' });
});

it('keeps the general wording on Sunday and looks up no art', async () => {
  day(25); await mount();
  expect(texts()).toContain('आज का सुविचार भेजें');
  expect(peekBackgroundAsset).not.toHaveBeenCalled();
});
