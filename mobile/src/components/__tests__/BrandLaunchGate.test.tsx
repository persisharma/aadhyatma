import React from 'react';
import { AccessibilityInfo, Animated, AppState, Linking, Text, type AppStateStatus } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { GitaLanguageProvider } from '@/data/gita/language';
import BrandLaunchGate from '../BrandLaunchGate';
import BrandLaunchReveal, { BRAND_REVEAL_TIMEOUT_MS } from '../BrandLaunchReveal';

let tree: TestRenderer.ReactTestRenderer | undefined;
let finished: ((result: { finished: boolean }) => void) | undefined;
const stopped = jest.fn();
const removed = jest.fn();
let onState: (state: AppStateStatus) => void;
let onLink: () => void;

async function mount(targeted = false) {
  await act(async () => {
    tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi">
      <BrandLaunchGate targeted={targeted}><Text>Application ready</Text></BrandLaunchGate>
    </GitaLanguageProvider>);
  });
}
function ready() {
  return tree!.root.findAllByType(Text).some(n => n.props.children === 'Application ready');
}
beforeEach(() => {
  jest.useFakeTimers();
  finished = undefined;
  stopped.mockClear(); removed.mockClear();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
  const subscription = Linking.addEventListener('url', () => {});
  subscription.remove();
  removed.mockClear();
  subscription.remove = removed;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue(subscription);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    onState = listener; return subscription;
  });
  jest.spyOn(Linking, 'addEventListener').mockImplementation((_event, listener) => {
    onLink = () => listener({ url: 'vedansh://widget/panchang' }); return subscription;
  });
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: callback => { finished = callback; }, stop: stopped, reset: jest.fn(),
  }));
});
afterEach(() => {
  act(() => tree?.unmount()); tree = undefined;
  jest.restoreAllMocks(); jest.useRealTimers();
});

test('holds application children until the single introduction finishes', async () => {
  await mount();
  expect(ready()).toBe(false);
  expect(tree!.root.findAllByType(BrandLaunchReveal)).toHaveLength(1);
  act(() => finished!({ finished: true }));
  expect(ready()).toBe(true);
  expect(tree!.root.findAllByType(BrandLaunchReveal)).toHaveLength(0);
  expect(stopped).toHaveBeenCalledTimes(1);
});
test('notification/widget cold targets bypass the introduction', async () => {
  await mount(true);
  expect(ready()).toBe(true);
  expect(Animated.timing).not.toHaveBeenCalled();
});
test.each(['isReduceMotionEnabled', 'isScreenReaderEnabled'] as const)('%s bypasses animation', async method => {
  jest.mocked(AccessibilityInfo[method]).mockResolvedValue(true);
  await mount();
  expect(ready()).toBe(true);
  expect(Animated.timing).not.toHaveBeenCalled();
});
test('a stalled native accessibility query cannot trap startup', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockReturnValue(new Promise(() => {}));
  await mount();
  expect(ready()).toBe(false);
  act(() => jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS));
  expect(ready()).toBe(true);
});
test('a native query rejection fails open to the application', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockRejectedValue(new Error('unavailable'));
  await mount();
  expect(ready()).toBe(true);
});
test('backgrounding completes and cancels the introduction', async () => {
  await mount(); act(() => onState('background'));
  expect(ready()).toBe(true);
  expect(stopped).toHaveBeenCalledTimes(1);
  expect(removed).toHaveBeenCalledTimes(4);
});
test('an incoming URL cancels the introduction immediately', async () => {
  await mount(); act(() => onLink()); expect(ready()).toBe(true);
});
test('unmount removes timers/listeners and a late callback cannot complete', async () => {
  const complete = jest.fn();
  await act(async () => {
    tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><BrandLaunchReveal onComplete={complete} /></GitaLanguageProvider>);
  });
  act(() => tree!.unmount()); tree = undefined;
  act(() => { finished!({ finished: true }); jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS); });
  expect(complete).not.toHaveBeenCalled(); expect(removed).toHaveBeenCalledTimes(4);
});
