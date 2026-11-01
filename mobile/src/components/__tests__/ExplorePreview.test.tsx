import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ExplorePreview from '@/components/explore/ExplorePreview';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({ CommonActions: { navigate: (payload: object) => payload } }));
jest.mock('@/notifications/deepLink', () => ({ navigationRef: { dispatch: (action: object) => mockDispatch(action) } }));
jest.mock('@/components/explore/ExploreSheet', () => ({ __esModule: true, default: (props: object) => require('react').createElement('Sheet', props) }));

let tree: TestRenderer.ReactTestRenderer;
afterEach(() => { act(() => tree?.unmount()); jest.clearAllMocks(); });
test('manual replay immediately cycles every card and closes without cadence writes', () => {
  const close = jest.fn();
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={close} />); });
  for (const section of EXPLORE_SECTIONS) {
    const sheet = tree.root.findByType('Sheet' as never);
    expect(sheet.props.section.id).toBe(section.id);
    expect(sheet.props.onDisable).toBeUndefined();
    act(() => sheet.props.onNext());
  }
  expect(close).toHaveBeenCalledTimes(1);
  expect(mockDispatch).not.toHaveBeenCalled();
});
test('the greeting replay hands the name to the real Suvichar composer', () => {
  const close = jest.fn();
  act(() => { tree = TestRenderer.create(<ExplorePreview onClose={close} />); });
  const index = EXPLORE_SECTIONS.findIndex(s => s.id === 'suvichar');
  for (let i = 0; i < index; i++) act(() => tree.root.findByType('Sheet' as never).props.onNext());
  act(() => tree.root.findByType('Sheet' as never).props.onOpen('Prashant'));
  expect(close).toHaveBeenCalledTimes(1);
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ name: 'HomeTab', params: expect.objectContaining({ screen: 'Suvichar', params: { exploreDraft: { name: 'Prashant', deity: 'ram-darbar' } } }) }));
});
