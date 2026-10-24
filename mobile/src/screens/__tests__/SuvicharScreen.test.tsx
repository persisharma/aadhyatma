import React from 'react';
import { Alert, AppState, PixelRatio, Platform, Pressable, TextInput, View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SuvicharScreen from '../SuvicharScreen';
import SuvicharCard from '@/components/SuvicharCard';
import SuvicharPresetPicker from '@/components/SuvicharPresetPicker';
import { suvicharDay, suvicharTemplatesFor } from '@/data/suvicharTemplates';
// Built when called, so it pairs thoughts for the faked date rather than the import-time date.
const templatesToday = () => suvicharTemplatesFor(suvicharDay(new Date()));
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
jest.mock('@/components/ReaderHeader', () => () => null);
jest.mock('@/components/SuvicharCard', () => 'SuvicharCard');
jest.mock('@/components/SuvicharPresetPicker', () => 'SuvicharPresetPicker');
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file:///card.png'), releaseCapture: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => undefined) }));
jest.mock('@/utils/multiShare', () => ({ shareFiles: jest.fn(async () => false) }));
jest.mock('@/utils/backgroundAssetCache', () => ({ subscribeBackgroundAsset: jest.fn(() => () => undefined) }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) } }));
let tree: ReactTestRenderer;
async function flush() { await act(async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); }); }
async function mount(custom = true) { await act(async () => { tree = create(<SuvicharScreen />); }); await flush(); if (custom) act(() => node('suvichar-mode-custom').props.onPress()); act(() => tree.root.findByType(SuvicharCard).props.onHeight(900)); }
const pickDeity = (deity: string) => act(() => tree.root.findByType(SuvicharPresetPicker).props.onSelect(templatesToday().find(t => t.kind === 'daily' && t.deity === deity)!));
const node = (id: string) => tree.root.findAllByProps({ testID: id }).find(n => typeof n.props.onPress === 'function' || typeof n.props.onChangeText === 'function')!;
// Only Date is faked; promises, frames and timers stay real. 25 October 2026 is a Sunday, which has no weekday card.
const day = (date: number) => jest.useFakeTimers({ now: new Date(2026, 9, date, 9), doNotFake: ['hrtime', 'nextTick', 'performance', 'queueMicrotask',
  'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
beforeEach(() => { jest.clearAllMocks(); day(25); jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => { cb(0); return 0; }); });
afterEach(async () => { if (tree) act(() => tree.unmount()); await flush(); jest.restoreAllMocks(); jest.useRealTimers(); });
it('retains the sender through deity/frame changes and saves the latest name', async () => {
  await mount();
  act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  pickDeity('rama');
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
  await mount(false); act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  act(() => node('suvichar-presets-wish').props.onPress());
  act(() => tree.root.findByType(SuvicharPresetPicker).props.onSelect(templatesToday().find(t => t.id === 'wish-diwali')!));
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ deity: 'lakshmi', name: 'Sharma family', original: false });
  act(() => node('suvichar-favorite').props.onPress());
  expect(node('suvichar-favorite').props.accessibilityState.selected).toBe(true);
  act(() => node('suvichar-mode-custom').props.onPress());
  pickDeity('rama');
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

it('opens ready-made cards first and shares one without editing a message', async () => {
  await mount(false);
  expect(node('suvichar-mode-ready').props.accessibilityState.selected).toBe(true);
  expect(node('suvichar-message').props.value).toBe('');
  const picker = tree.root.findByType(SuvicharPresetPicker);
  expect(picker.props.templates).toHaveLength(16);
  act(() => node('suvichar-name').props.onChangeText('Sharma family'));
  const preset = templatesToday().find(t => t.id === 'daily-salasar-balaji')!;
  act(() => picker.props.onSelect(preset));
  const card = tree.root.findByType(SuvicharCard).props;
  expect(card).toMatchObject({ deity: 'salasar-balaji', frame: preset.frame, message: preset.messageHi, name: 'Sharma family', original: true });
  act(() => { card.onHeight(950); card.onReady(true); });
  await act(async () => node('suvichar-share').props.onPress());
  expect(captureRef).toHaveBeenCalledTimes(1);
});

it('offers seven ready-made wishes and keeps the selected card when switching to customize', async () => {
  await mount(false); act(() => node('suvichar-presets-wish').props.onPress());
  const picker = tree.root.findByType(SuvicharPresetPicker);
  expect(picker.props.templates).toHaveLength(7);
  const diwali = templatesToday().find(t => t.id === 'wish-diwali')!;
  act(() => picker.props.onSelect(diwali));
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ deity: 'lakshmi', original: false, message: diwali.messageHi });
  act(() => node('suvichar-mode-custom').props.onPress());
  expect(node('suvichar-message').props.value).toBe(diwali.messageHi);
});

it('picks deities from compact painted tiles in custom mode', async () => {
  await mount();
  const picker = tree.root.findByType(SuvicharPresetPicker);
  expect(picker.props).toMatchObject({ compact: true }); expect(picker.props.templates).toHaveLength(16);
  expect(picker.props.testIDFor(picker.props.templates[0])).toBe(`suvichar-deity-${picker.props.templates[0].deity}`);
  pickDeity('rama');
  expect(tree.root.findByType(SuvicharCard).props.deity).toBe('rama');
  expect(tree.root.findByType(SuvicharPresetPicker).props.selectedId).toBe(templatesToday().find(t => t.kind === 'daily' && t.deity === 'rama')!.id);
});

it('offers message editing on ready-made cards', async () => {
  await mount(false);
  const preset = templatesToday().find(t => t.id === 'daily-salasar-balaji')!;
  act(() => tree.root.findByType(SuvicharPresetPicker).props.onSelect(preset));
  expect(node('suvichar-message').props.value).toBe(preset.messageHi);
  act(() => node('suvichar-message').props.onChangeText('आपका दिन मंगलमय हो।'));
  expect(tree.root.findByType(SuvicharCard).props).toMatchObject({ message: 'आपका दिन मंगलमय हो।', original: false });
});

it('asks for the sender once, then shows it as an editable row', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify({ deity: 'krishna', frame: 'mandir-jharokha', message: '', name: 'Sharma family', favorites: [] }));
  await mount(false);
  expect(tree.root.findAllByProps({ testID: 'suvichar-name' })).toHaveLength(0);
  act(() => node('suvichar-name-row').props.onPress());
  expect(node('suvichar-name').props.value).toBe('Sharma family');
  act(() => node('suvichar-name').props.onChangeText('Patel family'));
  act(() => node('suvichar-name').props.onBlur());
  expect(tree.root.findAllByProps({ testID: 'suvichar-name' })).toHaveLength(0);
  expect(tree.root.findByType(SuvicharCard).props.name).toBe('Patel family');
});

describe('weekday cards', () => {
  const card = () => tree.root.findByType(SuvicharCard).props;
  const stored = (prefs: object) => jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify({ deity: 'krishna', frame: 'mandir-jharokha', message: '', name: '', favorites: [], ...prefs }));

  it('opens a weekday on its own card: day title, that day’s deity and a day-free reflection', async () => {
    day(27); await mount(false);
    expect(node('suvichar-presets-vaar').props.accessibilityState.selected).toBe(true);
    const picker = tree.root.findByType(SuvicharPresetPicker);
    expect(picker.props.templates.map((t: { id: string }) => t.id)).toEqual(['hanuman', 'salasar-balaji'].flatMap(d => ['mandir-jharokha', 'pushp-aangan', 'bhakti-patra'].map(f => `vaar-${d}-${f}`)));
    expect(picker.props.selectedId).toBe('vaar-hanuman-mandir-jharokha');
    expect(card()).toMatchObject({ deity: 'hanuman', title: 'शुभ मंगलवार', message: templatesToday().find(t => t.kind === 'daily' && t.deity === 'hanuman')!.messageHi, original: true });
    expect(node('suvichar-message').props.value).toBe('');
  });

  it('has no weekday tab on Sunday', async () => {
    await mount(false);
    expect(tree.root.findAllByProps({ testID: 'suvichar-presets-vaar' })).toHaveLength(0);
    expect(card().title).toBeUndefined();
  });

  it('keeps the saved frame, and never replaces a message the reader wrote', async () => {
    day(27); stored({ frame: 'bhakti-patra' }); await mount(false);
    expect(card()).toMatchObject({ deity: 'hanuman', frame: 'bhakti-patra', title: 'शुभ मंगलवार' });
    act(() => tree.unmount());
    stored({ frame: 'pushp-aangan', message: 'मेरा अपना संदेश' }); await mount(false);
    expect(card()).toMatchObject({ deity: 'krishna', frame: 'pushp-aangan', message: 'मेरा अपना संदेश', title: undefined });
  });

  it('drops the title for another card and restores it from a weekday tile, keeping it through a new reflection', async () => {
    day(27); await mount(false);
    act(() => node('suvichar-presets-daily').props.onPress());
    act(() => tree.root.findByType(SuvicharPresetPicker).props.onSelect(templatesToday().find(t => t.id === 'daily-rama')!));
    expect(card()).toMatchObject({ deity: 'rama', title: undefined });
    act(() => node('suvichar-presets-vaar').props.onPress());
    const picker = tree.root.findByType(SuvicharPresetPicker);
    act(() => picker.props.onSelect(picker.props.templates.find((t: { id: string }) => t.id === 'vaar-salasar-balaji-pushp-aangan')));
    expect(card()).toMatchObject({ deity: 'salasar-balaji', frame: 'pushp-aangan', title: 'शुभ मंगलवार' });
    expect(tree.root.findByType(SuvicharPresetPicker).props.selectedId).toBe('vaar-salasar-balaji-pushp-aangan');
    const first = card().message;
    act(() => node('suvichar-next').props.onPress());
    expect(card().title).toBe('शुभ मंगलवार'); expect(card().message).not.toBe(first);
  });

  it('rolls over to the new day on return, and a saved weekday card never names a past day', async () => {
    let onChange: (state: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => { onChange = handler as typeof onChange; return { remove: jest.fn() } as never; });
    day(27); await mount(false);
    act(() => node('suvichar-favorite').props.onPress());
    const calls = jest.mocked(AsyncStorage.setItem).mock.calls; await flush();
    expect(JSON.parse(calls[calls.length - 1][1]).favorites[0]).toMatchObject({ deity: 'hanuman', vaar: true });
    act(() => card().onReady(true)); expect(node('suvichar-share').props.disabled).toBe(false);
    day(28); act(() => onChange('active'));
    expect(card()).toMatchObject({ deity: 'ganesha', title: 'शुभ बुधवार' });
    expect(node('suvichar-share').props.disabled).toBe(true);
    act(() => node('suvichar-saved-0').props.onPress());
    expect(card()).toMatchObject({ deity: 'hanuman', title: 'शुभ बुधवार' });
  });
});
