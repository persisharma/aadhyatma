import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import DockedYouTubePlayer from '../DockedYouTubePlayer';
import { claimPlayback } from '@/audio/playbackArbiter';

// Keep the installed YouTube library real: mocking YoutubePlayer hides the
// ready/command ordering bug. Only replace the native WebView boundary.
const mockInject = jest.fn();
const mockPost = jest.fn();
let mockWebProps: { onMessage?: (e: unknown) => void };
jest.mock('react-native-webview', () => {
  const ReactLib = require('react');
  const WebView = ReactLib.forwardRef((props: object, ref: React.Ref<unknown>) => {
    mockWebProps = props;
    ReactLib.useImperativeHandle(ref, () => ({
      injectJavaScript: mockInject,
      postMessage: mockPost,
    }));
    return null;
  });
  WebView.displayName = 'NativeWebViewBoundary';
  return { __esModule: true, WebView, default: WebView };
});
jest.mock('@/components/AppIcon', () => ({ __esModule: true, default: () => null }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {} }) }));
const mockFocus: { blur?: () => void } = {};
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void)) => {
    require('react').useEffect(() => {
      const cleanup = cb();
      mockFocus.blur = cleanup;
      return cleanup;
    }, [cb]);
  },
}));

const mapping = { videoId: 'AAAAAAAAAAA', titleHi: 'दर्शन', titleEn: 'Darshan', channel: 'Temple' };
let renderer: TestRenderer.ReactTestRenderer;
function mount(broadcast = true, key = 'initial') {
  act(() => {
    renderer = TestRenderer.create(<DockedYouTubePlayer key={key} mapping={mapping} uiLang="en" broadcast={broadcast} onClose={() => {}} />);
  });
}
function ready() {
  act(() => mockWebProps.onMessage?.({ nativeEvent: { data: JSON.stringify({ eventType: 'playerReady' }) } }));
}
beforeEach(() => { jest.clearAllMocks(); });
afterEach(() => { act(() => renderer?.unmount()); jest.restoreAllMocks(); });

it.each([true, false])('starts after iframe readiness without another tap (broadcast=%s)', (broadcast) => {
  mount(broadcast);
  expect(mockInject).not.toHaveBeenCalled(); // player does not exist yet
  ready();
  expect(mockInject).toHaveBeenCalledTimes(1);
  expect(mockInject).toHaveBeenLastCalledWith('player.playVideo(); true;');
  ready(); // duplicate readiness must not restart playback
  expect(mockInject).toHaveBeenCalledTimes(1);
});

it.each(['background', 'blur', 'competing audio'])('honours %s while loading, even when readiness arrives later', (reason) => {
  const handlers: ((s: string) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    handlers.push(handler as (s: string) => void);
    return { remove: jest.fn() };
  });
  mount();
  act(() => {
    if (reason === 'background') handlers.forEach((h) => h('background'));
    else if (reason === 'blur') mockFocus.blur?.();
    else claimPlayback('recorded');
  });
  expect(mockInject).not.toHaveBeenCalled();
  ready();
  expect(mockInject).toHaveBeenLastCalledWith('player.pauseVideo(); true;');
  mockInject.mockClear();
  act(() => handlers.forEach((h) => h('active')));
  expect(mockInject).not.toHaveBeenCalled();
});

it('autoplays a retry only after the replacement iframe is ready', () => {
  mount();
  ready();
  act(() => mockWebProps.onMessage?.({ nativeEvent: { data: JSON.stringify({ eventType: 'playerError', data: 100 }) } }));
  const retry = renderer.root.findAllByProps({ accessibilityRole: 'button' })[0];
  mockInject.mockClear();
  act(() => retry.props.onPress());
  expect(mockInject).not.toHaveBeenCalled();
  ready();
  expect(mockInject).toHaveBeenLastCalledWith('player.playVideo(); true;');
});
