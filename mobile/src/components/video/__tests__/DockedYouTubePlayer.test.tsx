import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import type { VideoMapping } from '@/data/video/videoMappings';

// ---- mocks ------------------------------------------------------------------

// A fake WebView that forwards a ref exposing injectJavaScript/reload and hands
// the test the live `onMessage`/`onError` props so it can drive the bridge.
const mockWebview: {
  onMessage?: (e: { nativeEvent: { data: string } }) => void;
  onError?: () => void;
  injectJavaScript: jest.Mock;
  reload: jest.Mock;
} = { injectJavaScript: jest.fn(), reload: jest.fn() };

jest.mock('react-native-webview', () => {
  const React = require('react');
  const WebView = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    mockWebview.onMessage = props.onMessage as typeof mockWebview.onMessage;
    mockWebview.onError = props.onError as typeof mockWebview.onError;
    React.useImperativeHandle(ref, () => ({
      injectJavaScript: mockWebview.injectJavaScript,
      reload: mockWebview.reload,
    }));
    return null;
  });
  WebView.displayName = 'WebView';
  return { __esModule: true, WebView };
});

jest.mock('@/components/AppIcon', () => ({ __esModule: true, default: () => null }));

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      border: '#ccc',
      ink: '#000',
      inkMuted: '#666',
      saffron: '#B8621B',
      saffronDeep: '#8A3E0B',
      saffronTint: 'rgba(184,98,27,0.12)',
    },
  }),
}));

import DockedYouTubePlayer from '../DockedYouTubePlayer';
import * as arbiter from '@/audio/playbackArbiter';

const mapping: VideoMapping = {
  contentId: 'hanuman-chalisa',
  videoId: 'AETFvQonfV8',
  titleHi: 'श्री हनुमान चालीसा',
  titleEn: 'Shri Hanuman Chalisa',
  channel: 'Test Channel',
  sourceUrl: 'https://www.youtube.com/watch?v=AETFvQonfV8',
  spokenLang: 'hi',
  reviewedOn: null,
  status: 'dev-demo',
};

function allText(root: TestRenderer.ReactTestRenderer): string {
  return JSON.stringify(root.toJSON());
}

beforeEach(() => {
  mockWebview.injectJavaScript.mockClear();
  mockWebview.reload.mockClear();
  mockWebview.onMessage = undefined;
  mockWebview.onError = undefined;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it('claims the playback arbiter the moment it opens', () => {
  const claim = jest.spyOn(arbiter, 'claimPlayback');
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  expect(claim).toHaveBeenCalledWith('youtube');
  act(() => r.unmount());
});

it('reports proportional progress from a bridge time event, ignoring garbage', () => {
  const onProgress = jest.fn();
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(
      <DockedYouTubePlayer mapping={mapping} uiLang="en" onProgress={onProgress} onClose={() => {}} />
    );
  });
  // malformed payloads must not throw or fire progress
  act(() => mockWebview.onMessage?.({ nativeEvent: { data: 'not json' } }));
  act(() => mockWebview.onMessage?.({ nativeEvent: { data: JSON.stringify({ foo: 1 }) } }));
  expect(onProgress).not.toHaveBeenCalled();
  // a real time event → fraction
  act(() =>
    mockWebview.onMessage?.({ nativeEvent: { data: JSON.stringify({ event: 'time', currentTime: 30, duration: 120 }) } })
  );
  expect(onProgress).toHaveBeenLastCalledWith(0.25);
  act(() => r.unmount());
});

it('pauses on background and never on return to foreground', () => {
  const handlers: ((s: string) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_e, cb) => {
    handlers.push(cb as (s: string) => void);
    return { remove: jest.fn() } as never;
  });
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  mockWebview.injectJavaScript.mockClear();
  act(() => handlers.forEach((h) => h('background')));
  expect(mockWebview.injectJavaScript).toHaveBeenCalledWith(expect.stringContaining('__ytPause'));

  mockWebview.injectJavaScript.mockClear();
  act(() => handlers.forEach((h) => h('active')));
  expect(mockWebview.injectJavaScript).not.toHaveBeenCalled();
  act(() => r.unmount());
});

it('falls out of the spinner into the error card when load times out', () => {
  jest.useFakeTimers();
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  act(() => {
    jest.advanceTimersByTime(13000);
  });
  expect(allText(r)).toContain('Can’t play this video');
  act(() => r.unmount());
});

it('removes its AppState listener on unmount (no leak after teardown)', () => {
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove } as never);
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  act(() => r.unmount());
  expect(remove).toHaveBeenCalled();
});
