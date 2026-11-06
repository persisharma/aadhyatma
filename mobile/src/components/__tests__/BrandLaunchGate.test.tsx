import React from 'react';
import { AccessibilityInfo, Animated, AppState, Linking, Modal, Text, type AppStateStatus } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { GitaLanguageProvider } from '@/data/gita/language';
import BrandLaunchGate, { BRAND_HOME_FADE_MS, BRAND_HOME_HANDOFF_TIMEOUT_MS } from '../BrandLaunchGate';
import BrandLaunchReveal, { BRAND_REVEAL_TIMEOUT_MS } from '../BrandLaunchReveal';
import { WebView } from 'react-native-webview';
import { isBrandLaunchVisible, signalBrandLaunchTarget, useBrandLaunchVisible } from '@/navigation/brandLaunchIntent';

const mockInject = jest.fn();
jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { WebView: React.forwardRef(function MockWebView(props: object, ref: React.Ref<unknown>) {
    React.useImperativeHandle(ref, () => ({ injectJavaScript: mockInject }));
    return React.createElement('ParticleWebView', props);
  }) };
});
let tree: TestRenderer.ReactTestRenderer | undefined;
const removed = jest.fn();
let onState: (state: AppStateStatus) => void;
let onLink: () => void;
const stateListeners = new Set<(state: AppStateStatus) => void>();
const linkListeners = new Set<() => void>();
const originalState = AppState.currentState;
const surfaceReady = jest.fn();
async function mount(targeted = false) {
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi">
    <BrandLaunchGate targeted={targeted} onReady={surfaceReady}><Text>Application ready</Text></BrandLaunchGate>
  </GitaLanguageProvider>); });
}
function ready() { return tree!.root.findAllByProps({ testID: 'brand-launch-content' }).some(n => n.props.pointerEvents === 'auto'); }
async function send(type: string) { await act(async () => tree!.root.findByType(WebView).props.onMessage({ nativeEvent: { data: JSON.stringify({ type }) } })); }
function layoutHome() { act(() => tree!.root.findByProps({ testID: 'brand-launch-content' }).props.onLayout()); }
async function finishReveal() {
  await send('brand-ready'); await send('brand-complete');
  layoutHome(); act(() => jest.advanceTimersByTime(BRAND_HOME_FADE_MS + 100));
}
beforeEach(() => {
  jest.useFakeTimers(); surfaceReady.mockClear(); removed.mockClear(); mockInject.mockClear();
  stateListeners.clear(); linkListeners.clear();
  Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
  onState = next => { Object.assign(AppState, { currentState: next }); for (const listener of [...stateListeners]) listener(next); };
  onLink = () => { for (const listener of [...linkListeners]) listener(); };
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
  const subscription = Linking.addEventListener('url', () => {}); subscription.remove(); removed.mockClear(); subscription.remove = removed;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue(subscription);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => { stateListeners.add(listener); return { remove: () => { removed(); stateListeners.delete(listener); } }; });
  jest.spyOn(Linking, 'addEventListener').mockImplementation((_event, listener) => { const call = () => listener({ url: 'vedansh://widget/panchang' }); linkListeners.add(call); return Object.assign(Object.create(subscription) as typeof subscription, { remove: () => { removed(); linkListeners.delete(call); } }); });
});
afterEach(() => { act(() => tree?.unmount()); tree = undefined; jest.restoreAllMocks(); Object.assign(AppState, { currentState: originalState }); jest.useRealTimers(); });
test('native splash waits for the actual canvas; launch asks wait for animation completion', async () => {
  await mount(); expect(ready()).toBe(false); expect(surfaceReady).not.toHaveBeenCalled();
  await send('brand-ready'); expect(surfaceReady).toHaveBeenCalledTimes(1); expect(ready()).toBe(false);
  await finishReveal(); expect(ready()).toBe(true); expect(tree!.root.findAllByType(BrandLaunchReveal)).toHaveLength(0);
  expect(removed).toHaveBeenCalledTimes(7);
});
test('unknown and malformed bridge messages do not dismiss launch', async () => {
  await mount(); await send('anything');
  act(() => tree!.root.findByType(WebView).props.onMessage({ nativeEvent: { data: 'broken json' } }));
  expect(ready()).toBe(false); expect(surfaceReady).not.toHaveBeenCalled();
});
test('notification/widget cold targets bypass the introduction and release splash', async () => {
  await mount(true); expect(ready()).toBe(true); expect(surfaceReady).toHaveBeenCalledTimes(1);
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
test.each(['isReduceMotionEnabled', 'isScreenReaderEnabled'] as const)('%s bypasses the canvas', async method => {
  jest.mocked(AccessibilityInfo[method]).mockResolvedValue(true); await mount(); expect(ready()).toBe(true);
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(surfaceReady).toHaveBeenCalledTimes(1);
});
test('stalled native accessibility and silent canvas startup are both bounded', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockReturnValue(new Promise(() => {})); await mount();
  expect(ready()).toBe(false); act(() => jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS)); expect(ready()).toBe(true);
});
test('a canvas that sends no completion cannot trap launch', async () => {
  await mount(); await send('brand-ready'); act(() => jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS)); expect(ready()).toBe(true);
});
test('a native query rejection fails open', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockRejectedValue(new Error('unavailable')); await mount(); expect(ready()).toBe(true);
});
test.each(['onError','onHttpError','onContentProcessDidTerminate','onRenderProcessGone'])('%s fails open to the application', async event => {
  await mount(); act(() => tree!.root.findByType(WebView).props[event]()); expect(ready()).toBe(true); expect(surfaceReady).toHaveBeenCalledTimes(1);
});
test('backgrounding cancels the cold renderer and returning never restarts it', async () => {
  await mount(); act(() => onState('background')); expect(ready()).toBe(true);
  await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  expect(tree!.root.findAllByType(Modal)).toHaveLength(0);
});

test('an incoming URL cancels the renderer immediately', async () => { await mount(); act(() => onLink()); expect(ready()).toBe(true); });
test('unmount cleans up and late bridge callbacks cannot complete', async () => {
  const done = jest.fn(); await act(async () => { tree = TestRenderer.create(<BrandLaunchReveal onComplete={done} />); });
  const late = tree!.root.findByType(WebView).props.onMessage;
  act(() => tree!.unmount()); tree = undefined;
  act(() => { late({ nativeEvent: { data: '{"type":"brand-complete"}' } }); jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS); });
  expect(done).not.toHaveBeenCalled(); expect(removed).toHaveBeenCalledTimes(4);
});
test('the approved canvas cannot navigate to external pages', async () => {
  await mount(); const should = tree!.root.findByType(WebView).props.onShouldStartLoadWithRequest;
  expect(should({ url: 'about:blank' })).toBe(true); expect(should({ url: 'https://example.com' })).toBe(false);
});


test('background and inactive returns keep the existing app without another reveal', async () => {
  const mounted = jest.fn(), unmounted = jest.fn();
  function Application() { React.useEffect(() => { mounted(); return unmounted; }, []); return <Text>Application ready</Text>; }
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><BrandLaunchGate targeted={false}><Application /></BrandLaunchGate></GitaLanguageProvider>); });
  await finishReveal(); expect(mounted).toHaveBeenCalledTimes(1);
  for (const states of [['inactive', 'active'], ['inactive', 'background', 'active'], ['background', 'active']] as AppStateStatus[][]) {
    await act(async () => { for (const state of states) onState(state); });
    expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(ready()).toBe(true);
    expect(tree!.root.findAllByType(Modal)).toHaveLength(0);
  }
  expect(mounted).toHaveBeenCalledTimes(1); expect(unmounted).not.toHaveBeenCalled();
});

test('cached-preference cold startup waits through inactive before starting', async () => {
  Object.assign(AppState, { currentState: 'inactive' });
  await mount(); expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(ready()).toBe(false);
  await act(async () => { onState('inactive'); }); expect(ready()).toBe(false);
  await act(async () => { onState('active'); }); expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
  await send('brand-ready'); expect(surfaceReady).toHaveBeenCalledTimes(1); expect(ready()).toBe(false);
  await finishReveal(); expect(ready()).toBe(true);
});
test('only a new cold process plays again after the previous process completed', async () => {
  await mount(); await finishReveal();
  await act(async () => { onState('inactive'); onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => tree!.unmount()); tree = undefined;
  await mount();
  expect(tree!.root.findAllByType(WebView)).toHaveLength(1); expect(ready()).toBe(false);
  await finishReveal(); expect(ready()).toBe(true);
});

test('warm notification/widget targets and later ordinary returns never show branding', async () => {
  await mount(); await finishReveal();
  act(() => { onState('background'); signalBrandLaunchTarget(); });
  await act(async () => { onState('active'); }); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => signalBrandLaunchTarget()); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});

test('a cold targeted process skips branding and the next ordinary cold process plays', async () => {
  await mount(true); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => tree!.unmount()); tree = undefined;
  await mount(); expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
});

test('reduced motion stays respected on subsequent opens', async () => {
  await mount(); await finishReveal();
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});

test('frame zero waits for native splash dismissal and duplicate readiness starts once', async () => {
  let hidden!: () => void;
  surfaceReady.mockImplementationOnce(() => new Promise<void>(resolve => { hidden = resolve; }));
  await mount();
  await send('brand-ready'); await send('brand-ready');
  expect(mockInject).not.toHaveBeenCalled();
  await send('brand-complete'); expect(ready()).toBe(false);
  await act(async () => { hidden(); });
  expect(mockInject).toHaveBeenCalledTimes(1);
  expect(mockInject).toHaveBeenCalledWith(expect.stringContaining('__vedanshStart'));
  await send('brand-complete'); expect(ready()).toBe(false);
  layoutHome(); act(() => jest.advanceTimersByTime(BRAND_HOME_FADE_MS + 100)); expect(ready()).toBe(true);
});
test('a cancelled splash handoff cannot start the discarded canvas or replay on resume', async () => {
  let hidden!: () => void;
  surfaceReady.mockImplementationOnce(() => new Promise<void>(resolve => { hidden = resolve; }));
  await mount(); await send('brand-ready');
  act(() => onState('inactive'));
  await act(async () => { hidden(); });
  expect(mockInject).not.toHaveBeenCalled();
  await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(ready()).toBe(true);
});

test('inactive targets and duplicate active events cannot reactivate completed branding', async () => {
  await mount(); await finishReveal();
  act(() => { onState('inactive'); signalBrandLaunchTarget(); onState('background'); });
  await act(async () => { onState('active'); onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => onState('inactive'));
  await act(async () => { onState('active'); onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});


test('holds the final canvas over the mounted app until native layout and fade complete', async () => {
  const mounted = jest.fn(), unmounted = jest.fn();
  function Application() { React.useEffect(() => { mounted(); return unmounted; }, []); return <Text>Application ready</Text>; }
  const fade = jest.spyOn(Animated, 'timing');
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><BrandLaunchGate targeted={false}><Application /></BrandLaunchGate></GitaLanguageProvider>); });
  expect(mounted).not.toHaveBeenCalled();
  await send('brand-ready'); await send('brand-complete');
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
  const content = tree!.root.findByProps({ testID: 'brand-launch-content' });
  expect(content.props.pointerEvents).toBe('none');
  expect(content.props.accessibilityElementsHidden).toBe(true);
  expect(content.props.importantForAccessibility).toBe('no-hide-descendants');
  expect(isBrandLaunchVisible()).toBe(true);
  act(() => jest.advanceTimersByTime(200)); expect(fade).not.toHaveBeenCalled();
  layoutHome(); expect(fade).not.toHaveBeenCalled();
  act(() => jest.advanceTimersToNextTimer()); expect(fade).not.toHaveBeenCalled();
  act(() => jest.advanceTimersToNextTimer());
  expect(fade).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ toValue: 0, duration: BRAND_HOME_FADE_MS, useNativeDriver: true, isInteraction: false }));
  expect(isBrandLaunchVisible()).toBe(true); expect(ready()).toBe(false);
  act(() => jest.advanceTimersByTime(BRAND_HOME_FADE_MS + 50));
  expect(isBrandLaunchVisible()).toBe(false); expect(ready()).toBe(true);
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  expect(mounted).toHaveBeenCalledTimes(1); expect(unmounted).not.toHaveBeenCalled();
});
test('missing native layout cannot trap the homepage behind the final frame', async () => {
  await mount(); await send('brand-ready'); await send('brand-complete');
  act(() => jest.advanceTimersByTime(BRAND_HOME_HANDOFF_TIMEOUT_MS - 1)); expect(ready()).toBe(false);
  act(() => jest.advanceTimersByTime(1)); expect(ready()).toBe(true); expect(isBrandLaunchVisible()).toBe(false);
});
test('a stalled fade is bounded from formation even when native layout arrives late', async () => {
  const stop = jest.fn();
  jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn(), stop, reset: jest.fn() });
  await mount(); await send('brand-ready'); await send('brand-complete');
  act(() => jest.advanceTimersByTime(BRAND_HOME_HANDOFF_TIMEOUT_MS - 200));
  layoutHome(); act(() => jest.advanceTimersByTime(100)); expect(ready()).toBe(false);
  act(() => jest.advanceTimersByTime(100)); expect(ready()).toBe(true); expect(stop).toHaveBeenCalledTimes(1);
});
test.each(['onError', 'onContentProcessDidTerminate', 'onRenderProcessGone'])('%s after formation releases the outgoing cover immediately', async event => {
  await mount(); await send('brand-ready'); await send('brand-complete');
  act(() => tree!.root.findByType(WebView).props[event]());
  expect(ready()).toBe(true); expect(isBrandLaunchVisible()).toBe(false);
});
test.each(['inactive', 'background'] as const)('%s during Home layout cancels the handoff without replay', async state => {
  await mount(); await send('brand-ready'); await send('brand-complete');
  act(() => onState(state)); expect(ready()).toBe(true);
  await act(async () => { onState('active'); jest.advanceTimersByTime(BRAND_HOME_HANDOFF_TIMEOUT_MS); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(isBrandLaunchVisible()).toBe(false);
});
test.each(['reduceMotionChanged', 'screenReaderChanged'] as const)('%s during the handoff skips the fade', async event => {
  await mount(); await send('brand-ready'); await send('brand-complete');
  // Jest selects RN's final (announcement) overload; these two events carry booleans.
  const calls = jest.mocked(AccessibilityInfo.addEventListener).mock.calls as unknown as [string, (enabled: boolean) => void][];
  const listener = calls.filter(([name]) => name === event).at(-1)![1];
  act(() => listener(true)); expect(ready()).toBe(true); expect(isBrandLaunchVisible()).toBe(false);
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
test('a target during the fade wins immediately and stale animation completion is inert', async () => {
  let finishFade!: (result: { finished: boolean }) => void;
  const stop = jest.fn();
  jest.spyOn(Animated, 'timing').mockReturnValue({ start: callback => { finishFade = callback!; }, stop, reset: jest.fn() });
  await mount(); await send('brand-ready'); await send('brand-complete'); layoutHome();
  act(() => jest.advanceTimersByTime(100)); expect(finishFade).toBeDefined(); expect(ready()).toBe(false);
  act(() => signalBrandLaunchTarget()); expect(ready()).toBe(true); expect(stop).toHaveBeenCalledTimes(1);
  const calls = surfaceReady.mock.calls.length;
  act(() => finishFade({ finished: true }));
  expect(surfaceReady).toHaveBeenCalledTimes(calls); expect(isBrandLaunchVisible()).toBe(false);
});
test('unmount cancels pending paint frames and the handoff watchdog', async () => {
  const fade = jest.spyOn(Animated, 'timing');
  await mount(); await send('brand-ready'); await send('brand-complete'); layoutHome();
  act(() => tree!.unmount()); tree = undefined;
  act(() => jest.advanceTimersByTime(BRAND_HOME_HANDOFF_TIMEOUT_MS + BRAND_REVEAL_TIMEOUT_MS));
  expect(fade).not.toHaveBeenCalled(); expect(isBrandLaunchVisible()).toBe(false);
});
test('a changed targeted prop during layout preserves the already mounted application', async () => {
  const mounted = jest.fn(), unmounted = jest.fn();
  function Application() { React.useEffect(() => { mounted(); return unmounted; }, []); return <Text>Application ready</Text>; }
  const app = (targeted: boolean) => <GitaLanguageProvider initialLang="hi"><BrandLaunchGate targeted={targeted}><Application /></BrandLaunchGate></GitaLanguageProvider>;
  await act(async () => { tree = TestRenderer.create(app(false)); });
  await send('brand-ready'); await send('brand-complete');
  act(() => tree!.update(app(true)));
  expect(ready()).toBe(true); expect(mounted).toHaveBeenCalledTimes(1); expect(unmounted).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
test('a mounted automatic-ask subscriber stays suppressed through the cover fade', async () => {
  // Native timing is a mocked boundary: drive its completion explicitly.
  let finishFade!: (result: { finished: boolean }) => void;
  jest.spyOn(Animated, 'timing').mockReturnValue({ start: callback => { finishFade = callback!; }, stop: jest.fn(), reset: jest.fn() });
  const selected = jest.fn();
  function AutomaticAsk() {
    const brandVisible = useBrandLaunchVisible();
    React.useEffect(() => { if (!brandVisible) selected(); }, [brandVisible]);
    return null;
  }
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><BrandLaunchGate targeted={false}><AutomaticAsk /></BrandLaunchGate></GitaLanguageProvider>); });
  await send('brand-ready'); await send('brand-complete'); expect(selected).not.toHaveBeenCalled();
  layoutHome(); act(() => jest.advanceTimersByTime(50)); expect(selected).not.toHaveBeenCalled();
  act(() => finishFade({ finished: true })); expect(selected).toHaveBeenCalledTimes(1);
});
