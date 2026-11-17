import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

function render(os: 'ios' | 'android', props: Record<string, unknown> = {}) {
  const original = Platform.OS;
  Platform.OS = os;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <KeyboardAwareScrollView {...props}><Text>field</Text></KeyboardAwareScrollView>,
    );
  });
  Platform.OS = original;
  return tree;
}

test('iOS adjusts the scroll insets for the keyboard and lets taps through (UX-02)', () => {
  const tree = render('ios');
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.automaticallyAdjustKeyboardInsets).toBe(true);
  expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
  expect(tree.root.findByType(KeyboardAvoidingView).props.enabled).toBe(false);
});

test('Android (edge-to-edge) shrinks the scroll area with a KeyboardAvoidingView', () => {
  const kav = render('android').root.findByType(KeyboardAvoidingView);
  expect(kav.props.enabled).toBe(true);
  expect(kav.props.behavior).toBe('height');
});

test('every ScrollView prop passes through and the ref reaches the ScrollView', () => {
  const ref = React.createRef<ScrollView>();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <KeyboardAwareScrollView ref={ref} scrollEnabled={false} showsVerticalScrollIndicator={false} keyboardDismissMode="none">
        <Text>field</Text>
      </KeyboardAwareScrollView>,
    );
  });
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.scrollEnabled).toBe(false);
  expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  expect(scroll.props.keyboardDismissMode).toBe('none');
  expect(ref.current).not.toBeNull();
});
