import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StatusBar } from 'react-native';

let mockFocused = true;
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => mockFocused }));

import FocusedLightStatusBar from '../FocusedLightStatusBar';

test('light status-bar icons are only set while the screen is focused (BEH-08)', () => {
  mockFocused = true;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<FocusedLightStatusBar />); });
  expect(tree.root.findAllByType(StatusBar)).toHaveLength(1);
  expect(tree.root.findByType(StatusBar).props.barStyle).toBe('light-content');

  // A reader pushed on top blurs this screen: the entry must be released.
  mockFocused = false;
  act(() => { tree.update(<FocusedLightStatusBar />); });
  expect(tree.root.findAllByType(StatusBar)).toHaveLength(0);
  act(() => tree.unmount());
});
