import React from 'react';
import { AccessibilityInfo, AppState, Linking, Modal, Text, type AppStateStatus } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { GitaLanguageProvider } from '@/data/gita/language';
import BrandLaunchGate from '../BrandLaunchGate';
import BrandLaunchReveal, { BRAND_REVEAL_TIMEOUT_MS } from '../BrandLaunchReveal';
import { WebView } from 'react-native-webview';
import { signalBrandLaunchTarget } from '@/navigation/brandLaunchIntent';

jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { WebView: (props: object) => React.createElement('ParticleWebView', props) };
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
function ready() { return tree!.root.findAllByType(Text).some(n => n.props.children === 'Application ready'); }
function send(type: string) { act(() => tree!.root.findByType(WebView).props.onMessage({ nativeEvent: { data: JSON.stringify({ type }) } })); }
beforeEach(() => {
  jest.useFakeTimers(); surfaceReady.mockClear(); removed.mockClear();
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
  send('brand-ready'); expect(surfaceReady).toHaveBeenCalledTimes(1); expect(ready()).toBe(false);
  send('brand-complete'); expect(ready()).toBe(true); expect(tree!.root.findAllByType(BrandLaunchReveal)).toHaveLength(0);
  expect(removed).toHaveBeenCalledTimes(4);
});
test('unknown and malformed bridge messages do not dismiss launch', async () => {
  await mount(); send('anything');
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
  await mount(); send('brand-ready'); act(() => jest.advanceTimersByTime(BRAND_REVEAL_TIMEOUT_MS)); expect(ready()).toBe(true);
});
test('a native query rejection fails open', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockRejectedValue(new Error('unavailable')); await mount(); expect(ready()).toBe(true);
});
test.each(['onError','onHttpError','onContentProcessDidTerminate','onRenderProcessGone'])('%s fails open to the application', async event => {
  await mount(); act(() => tree!.root.findByType(WebView).props[event]()); expect(ready()).toBe(true); expect(surfaceReady).toHaveBeenCalledTimes(1);
});
test('backgrounding cancels the renderer and the next app open starts a new one', async () => {
  await mount(); act(() => onState('background')); expect(ready()).toBe(true);
  await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
  expect(tree!.root.findAllByType(Modal)).toHaveLength(1);
  send('brand-complete'); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
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


test('second and third opens replay without remounting the existing app', async () => {
  const mounted = jest.fn(), unmounted = jest.fn();
  function Application() { React.useEffect(() => { mounted(); return unmounted; }, []); return <Text>Application ready</Text>; }
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><BrandLaunchGate targeted={false}><Application /></BrandLaunchGate></GitaLanguageProvider>); });
  send('brand-complete'); expect(mounted).toHaveBeenCalledTimes(1);
  for (let i = 0; i < 2; i++) {
    act(() => onState('background'));
    await act(async () => { onState('active'); });
    expect(tree!.root.findAllByType(WebView)).toHaveLength(1); expect(ready()).toBe(true);
    send('brand-complete');
  }
  expect(mounted).toHaveBeenCalledTimes(1); expect(unmounted).not.toHaveBeenCalled();
});
test('cached-preference cold startup waits through inactive before starting', async () => {
  Object.assign(AppState, { currentState: 'inactive' });
  await mount(); expect(tree!.root.findAllByType(WebView)).toHaveLength(0); expect(ready()).toBe(false);
  await act(async () => { onState('inactive'); }); expect(ready()).toBe(false);
  await act(async () => { onState('active'); }); expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
  send('brand-ready'); expect(surfaceReady).toHaveBeenCalledTimes(1); expect(ready()).toBe(false);
  send('brand-complete'); expect(ready()).toBe(true);
});
test('an inactive/active system interruption does not replay completed branding', async () => {
  await mount(); send('brand-complete');
  await act(async () => { onState('inactive'); onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
test('warm notification/widget targets bypass branding before and after active', async () => {
  await mount(); send('brand-complete');
  act(() => { onState('background'); signalBrandLaunchTarget(); });
  await act(async () => { onState('active'); }); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
  act(() => signalBrandLaunchTarget()); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
test('a cold targeted visit does not permanently disable ordinary opens', async () => {
  await mount(true); expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(1);
});
test('reduced motion stays respected on subsequent opens', async () => {
  await mount(); send('brand-complete');
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  act(() => onState('background')); await act(async () => { onState('active'); });
  expect(tree!.root.findAllByType(WebView)).toHaveLength(0);
});
