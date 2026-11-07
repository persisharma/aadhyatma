import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import * as SplashScreen from 'expo-splash-screen';
import LaunchCover, { __resetLaunchCoverForTests, releaseNativeSplashForCover } from '../LaunchCover';

jest.mock('expo-splash-screen', () => ({ hideAsync: jest.fn(() => Promise.resolve(true)) }));

const hideAsync = SplashScreen.hideAsync as jest.Mock;
const originalOS = Platform.OS;
let tree: TestRenderer.ReactTestRenderer | undefined;

function setOS(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

beforeEach(() => {
  hideAsync.mockClear();
  hideAsync.mockImplementation(() => Promise.resolve(true));
  __resetLaunchCoverForTests();
});

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  setOS(originalOS);
});

function layoutCover() {
  act(() => tree!.root.findByProps({ testID: 'launch-cover' }).props.onLayout());
}

test('paints the native splash ivory so the Android handoff is invisible', () => {
  act(() => { tree = TestRenderer.create(<LaunchCover />); });
  const style = StyleSheet.flatten(tree!.root.findByProps({ testID: 'launch-cover' }).props.style);
  // app.json splash.backgroundColor — BrandNativeHandoff.test pins the native side.
  expect(style.backgroundColor).toBe('#FFF1D5');
  expect(style.flex).toBe(1);
});

test('Android releases the native splash once, on the first cover layout', () => {
  setOS('android');
  act(() => { tree = TestRenderer.create(<LaunchCover />); });
  expect(hideAsync).not.toHaveBeenCalled();
  layoutCover();
  expect(hideAsync).toHaveBeenCalledTimes(1);
  // A second cover (AppReadyGate after the font gate) must not re-issue it.
  layoutCover();
  releaseNativeSplashForCover();
  expect(hideAsync).toHaveBeenCalledTimes(1);
});

test('a failed Android release is retried on the next layout', async () => {
  setOS('android');
  hideAsync.mockImplementationOnce(() => Promise.reject(new Error('not ready')));
  act(() => { tree = TestRenderer.create(<LaunchCover />); });
  layoutCover();
  await act(async () => { await Promise.resolve(); });
  layoutCover();
  expect(hideAsync).toHaveBeenCalledTimes(2);
});

test('iOS keeps the approved native splash hold', () => {
  setOS('ios');
  act(() => { tree = TestRenderer.create(<LaunchCover />); });
  layoutCover();
  releaseNativeSplashForCover();
  expect(hideAsync).not.toHaveBeenCalled();
});
