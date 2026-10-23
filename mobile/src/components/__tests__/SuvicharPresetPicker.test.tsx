import React from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharPresetPicker from '../SuvicharPresetPicker';
import { suvicharTemplates } from '@/data/suvicharTemplates';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';

const mockDispose = jest.fn();
jest.mock('@/data/suvichar', () => ({ ...jest.requireActual('@/data/suvichar'), suvicharArtRequest: (deity: string, frame: string) => ({ key: `${deity}-${frame}`, ext: 'webp', remoteUrl: `https://cdn.vedansh.app/suvichar/${deity}-${frame}.webp` }) }));
jest.mock('@/utils/backgroundAssetCache', () => ({ subscribeBackgroundAsset: jest.fn((_: unknown, cb: (uri: string) => void) => { cb('file:///preset.webp'); return mockDispose; }) }));

let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); jest.clearAllMocks(); });
it('opens the full chosen preset and releases its cached artwork subscription on unmount', () => {
  const preset = suvicharTemplates.find(t => t.id === 'daily-salasar-balaji')!;
  const onSelect = jest.fn();
  act(() => { tree = create(<SuvicharPresetPicker templates={[preset]} lang="hi" disabled={false} onSelect={onSelect} />); });
  expect(subscribeBackgroundAsset).toHaveBeenCalledWith(expect.objectContaining({ remoteUrl: expect.stringContaining('salasar-balaji') }), expect.any(Function));
  expect(tree.root.findByType(Image).props.source.uri).toBe('file:///preset.webp');
  act(() => tree.root.findAllByProps({ testID: `suvichar-preset-${preset.id}` }).find(node => typeof node.props.onPress === 'function')!.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(preset);
  act(() => tree.unmount());
  expect(mockDispose).toHaveBeenCalledTimes(1);
});
