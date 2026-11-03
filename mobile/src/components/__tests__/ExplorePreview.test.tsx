import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ExplorePreview from '@/components/explore/ExplorePreview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as exploreStore from '@/data/discovery/store';
import { exploreSnapshot } from '@/data/discovery/store';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
const mockDispatch = jest.fn();
let mockLang = 'en';
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@react-navigation/native', () => ({ CommonActions: { navigate: (payload: object) => payload } }));
jest.mock('@/notifications/deepLink', () => ({ navigationRef: { dispatch: (action: object) => mockDispatch(action) } }));
jest.mock('@/components/explore/ExploreSheet', () => ({ __esModule: true, default: (props: object) => require('react').createElement('Sheet', props) }));

let tree: TestRenderer.ReactTestRenderer;
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); jest.clearAllMocks(); mockLang = 'en'; });
test('manual replay immediately cycles every card and closes without cadence writes', () => {
  const close = jest.fn();
  const writes = jest.mocked(AsyncStorage.setItem).mock.calls.length;
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={close} />); });
  expect(exploreSnapshot().visible).toBe(true);
  for (const section of EXPLORE_SECTIONS) {
    const sheet = tree.root.findByType('Sheet' as never);
    expect(sheet.props.section.id).toBe(section.id);
    expect(sheet.props.onDisable).toBeUndefined();
    act(() => sheet.props.onNext());
  }
  expect(close).toHaveBeenCalledTimes(1);
  expect(mockDispatch).not.toHaveBeenCalled();
  expect(jest.mocked(AsyncStorage.setItem).mock.calls.length).toBe(writes);
});
test('the greeting replay hands the name to the real Suvichar composer', () => {
  const close = jest.fn();
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={close} />); });
  expect(exploreSnapshot().visible).toBe(true);
  const index = EXPLORE_SECTIONS.findIndex(s => s.id === 'suvichar');
  for (let i = 0; i < index; i++) act(() => tree.root.findByType('Sheet' as never).props.onNext());
  act(() => tree.root.findByType('Sheet' as never).props.onOpen('Prashant'));
  expect(close).toHaveBeenCalledTimes(1);
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ name: 'HomeTab', params: expect.objectContaining({ screen: 'Suvichar', params: { exploreDraft: { name: 'Prashant', deity: 'ram-darbar' } } }) }));
});

test.each(['hi', 'en', 'gu', 'kn'])('reset in %s requires confirmation and cancellation leaves history alone', lang => {
  mockLang = lang;
  const reset = jest.spyOn(exploreStore, 'resetExploreHistory').mockResolvedValue(true);
  const alert = jest.spyOn(Alert, 'alert');
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={jest.fn()} />); });
  act(() => tree.root.findByType('Sheet' as never).props.onReset());
  const [title, message, buttons] = alert.mock.calls[0];
  expect(title).toBeTruthy();
  expect(message).toContain('24');
  expect(buttons?.find(b => b.style === 'cancel')).toBeDefined();
  expect(buttons?.find(b => b.style === 'destructive')?.onPress).toBeDefined();
  expect(reset).not.toHaveBeenCalled();
  act(() => buttons?.find(b => b.style === 'cancel')?.onPress?.());
  expect(reset).not.toHaveBeenCalled();
});

test('confirmed reset waits for persistence, prevents double writes and explains the next eligible launch', async () => {
  let complete!: (saved: boolean) => void;
  const reset = jest.spyOn(exploreStore, 'resetExploreHistory').mockReturnValue(new Promise(resolve => { complete = resolve; }));
  const alert = jest.spyOn(Alert, 'alert');
  const close = jest.fn();
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={close} />); });
  act(() => tree.root.findByType('Sheet' as never).props.onReset());
  const confirm = alert.mock.calls[0][2]!.find(b => b.style === 'destructive')!.onPress!;
  let pending: unknown;
  act(() => { pending = confirm(); });
  expect(tree.root.findByType('Sheet' as never).props.resetting).toBe(true);
  expect(tree.root.findByType('Sheet' as never).props.resetMessage).toBeUndefined();
  act(() => { void confirm(); });
  expect(reset).toHaveBeenCalledTimes(1);
  await act(async () => { complete(true); await pending; });
  expect(tree.root.findByType('Sheet' as never).props.resetting).toBe(false);
  expect(tree.root.findByType('Sheet' as never).props.resetMessage).toContain('History reset');
  expect(tree.root.findByType('Sheet' as never).props.resetMessage).toContain('tomorrow');
  expect(close).not.toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
});

test('failed persistence reports failure instead of success', async () => {
  jest.spyOn(exploreStore, 'resetExploreHistory').mockResolvedValue(false);
  const alert = jest.spyOn(Alert, 'alert');
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={jest.fn()} />); });
  act(() => tree.root.findByType('Sheet' as never).props.onReset());
  await act(async () => { await alert.mock.calls[0][2]!.find(b => b.style === 'destructive')!.onPress!(); });
  expect(tree.root.findByType('Sheet' as never).props.resetMessage).toContain('Could not reset');
});

test('confirming an obsolete dialog after replay closes cannot reset history', async () => {
  const reset = jest.spyOn(exploreStore, 'resetExploreHistory').mockResolvedValue(true);
  const alert = jest.spyOn(Alert, 'alert');
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={jest.fn()} />); });
  act(() => tree.root.findByType('Sheet' as never).props.onReset());
  act(() => tree.unmount());
  await act(async () => { await alert.mock.calls[0][2]!.find(b => b.style === 'destructive')!.onPress!(); });
  expect(reset).not.toHaveBeenCalled();
});

