import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { useLoopActive } from '../useLoopActive';

type Listener = () => void;
function fakeNavigation(initiallyFocused: boolean) {
  const listeners: Record<string, Listener[]> = { focus: [], blur: [] };
  let focused = initiallyFocused;
  return {
    isFocused: () => focused,
    addListener: (event: string, fn: Listener) => {
      listeners[event].push(fn);
      return () => { listeners[event] = listeners[event].filter((l) => l !== fn); };
    },
    emit(event: 'focus' | 'blur') {
      focused = event === 'focus';
      listeners[event].forEach((l) => l());
    },
  };
}

let appStateListener: ((state: string) => void) | null = null;
beforeEach(() => {
  appStateListener = null;
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, fn: (s: string) => void) => {
    appStateListener = fn;
    return { remove: () => { appStateListener = null; } };
  }) as never);
});
afterEach(() => jest.restoreAllMocks());

function mount(nav: ReturnType<typeof fakeNavigation> | null, focusedProp?: boolean) {
  const seen: boolean[] = [];
  function Probe() {
    seen.push(useLoopActive(focusedProp));
    return null;
  }
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      nav ? <NavigationContext.Provider value={nav as never}><Probe /></NavigationContext.Provider> : <Probe />,
    );
  });
  return { tree, last: () => seen[seen.length - 1] };
}

test('runs outside a navigator (tests, previews)', () => {
  expect(mount(null).last()).toBe(true);
});

test('pauses on screen blur and resumes on focus (PERF-05)', () => {
  const nav = fakeNavigation(true);
  const { last } = mount(nav);
  expect(last()).toBe(true);
  act(() => nav.emit('blur'));
  expect(last()).toBe(false);
  act(() => nav.emit('focus'));
  expect(last()).toBe(true);
});

test('pauses when the app is backgrounded and resumes in the foreground', () => {
  const { last } = mount(fakeNavigation(true));
  act(() => appStateListener!('background'));
  expect(last()).toBe(false);
  act(() => appStateListener!('active'));
  expect(last()).toBe(true);
});

test('honours a focused=false prop from a caller that tracks focus itself', () => {
  expect(mount(null, false).last()).toBe(false);
});
