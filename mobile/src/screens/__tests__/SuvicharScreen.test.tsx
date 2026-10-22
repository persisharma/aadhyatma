import React from 'react';
import { Alert, PixelRatio, Platform, Pressable, TextInput, View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharScreen from '../SuvicharScreen';
import SuvicharCard from '@/components/SuvicharCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
jest.mock('@/components/ReaderHeader', () => () => null);
jest.mock('@/components/SuvicharCard', () => 'SuvicharCard');
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file:///card.png'), releaseCapture: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => undefined) }));
jest.mock('@/utils/multiShare', () => ({ shareFiles: jest.fn(async () => false) }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) } }));
let tree: ReactTestRenderer;
async function flush() { await act(async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); }); }
async function mount() { await act(async () => { tree = create(<SuvicharScreen />); }); await flush(); act(() => tree.root.findByType(SuvicharCard).props.onHeight(900)); }
const node = (id: string) => tree.root.findAllByProps({ testID: id }).find(n => typeof n.props.onPress === 'function' || typeof n.props.onChangeText === 'function')!;
beforeEach(() => { jest.clearAllMocks(); jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => { cb(0); return 0; }); });
afterEach(async () => { if (tree) act(() => tree.unmount()); await flush(); jest.restoreAllMocks(); });
it('retains the sender through deity/frame changes and saves the latest name', async () => {
  await mount();
  act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  act(() => node('suvichar-deity-rama').props.onPress());
  act(() => node('suvichar-frame-pushp-aangan').props.onPress());
  await flush();
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ name: 'Sharma family', deity: 'rama', frame: 'pushp-aangan' });
  const calls = jest.mocked(AsyncStorage.setItem).mock.calls;
  expect(JSON.parse(calls[calls.length - 1][1]).name).toBe('Sharma family');
});
it('never captures before art readiness and locks duplicate shares', async () => {
  await mount(); expect(node('suvichar-share').props.disabled).toBe(true);
  await act(async () => node('suvichar-share').props.onPress()); expect(captureRef).not.toHaveBeenCalled();
  act(() => tree.root.findByType(SuvicharCard).props.onReady(true));
  await act(async () => { node('suvichar-share').props.onPress(); node('suvichar-share').props.onPress(); });
  await flush(); expect(captureRef).toHaveBeenCalledTimes(1); expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///card.png', expect.objectContaining({ mimeType: 'image/png' }));
});
it('rejects stale ready callbacks after name changes', async () => {
  await mount(); const stale = tree.root.findByType(SuvicharCard).props.onReady;
  act(() => node('suvichar-name').props.onChangeText('Patel family'));
  act(() => stale(true)); expect(node('suvichar-share').props.disabled).toBe(true);
});
it('keeps the sender when selecting a festival and restores a saved favorite', async () => {
  await mount(); act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  act(() => node('suvichar-wish-diwali').props.onPress());
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ deity: 'lakshmi', name: 'Sharma family', original: false });
  act(() => node('suvichar-favorite').props.onPress());
  act(() => node('suvichar-deity-rama').props.onPress());
  act(() => node('suvichar-saved-0').props.onPress());
  expect(tree.root.findByType(SuvicharCard).props.deity).toBe('lakshmi');
});
it('reports capture failure and does not hand off a missing image', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.mocked(captureRef).mockRejectedValueOnce(new Error('capture failed'));
  await mount(); act(() => tree.root.findByType(SuvicharCard).props.onReady(true));
  await act(async () => node('suvichar-share').props.onPress()); await flush();
  expect(alert).toHaveBeenCalled(); expect(Sharing.shareAsync).not.toHaveBeenCalled();
});

it('chooses a fresh reflection while preserving the sender and frame', async () => {
  await mount(); act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  act(() => node('suvichar-frame-bhakti-patra').props.onPress());
  act(() => node('suvichar-next').props.onPress());
  const first = tree.root.findByType(SuvicharCard).props.message;
  act(() => node('suvichar-next').props.onPress());
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ name: 'Sharma family', frame: 'bhakti-patra' });
  expect(tree.root.findByType(SuvicharCard).props.message).not.toBe(first);
});

it('keeps a ready card shareable when its selected frame is tapped again', async () => {
  await mount(); act(() => tree.root.findByType(SuvicharCard).props.onReady(true));
  act(() => node('suvichar-frame-mandir-jharokha').props.onPress());
  expect(node('suvichar-share').props.disabled).toBe(false);
});

it('passes both native dimensions for a complete 1080-pixel-wide image', async () => {
  await mount(); const props = tree.root.findByType(SuvicharCard).props;
  act(() => { props.onHeight(1200); props.onReady(true); });
  await act(async () => node('suvichar-share').props.onPress()); await flush();
  const scale = Platform.OS === 'ios' ? PixelRatio.get() : 1;
  expect(captureRef).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ width: 1080 / scale, height: Math.ceil(1200 * 1080 / props.width) / scale }));
});
it('refuses a card that loses image readiness during the capture wait', async () => {
  await mount(); const props = tree.root.findByType(SuvicharCard).props;
  act(() => props.onReady(true));
  await act(async () => { const pending = node('suvichar-share').props.onPress(); props.onReady(false); await pending; });
  expect(captureRef).not.toHaveBeenCalled();
});
it('refuses a new selection until its own measured height arrives', async () => {
  await mount(); act(() => node('suvichar-name').props.onChangeText('New name'));
  act(() => tree.root.findByType(SuvicharCard).props.onReady(true));
  await act(async () => node('suvichar-share').props.onPress());
  expect(captureRef).not.toHaveBeenCalled();
});
