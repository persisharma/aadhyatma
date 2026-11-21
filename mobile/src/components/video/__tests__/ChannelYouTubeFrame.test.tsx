import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import ChannelYouTubeFrame, { allowDarshanNavigation } from '../ChannelYouTubeFrame';
import { channelEmbedHTML, channelEmbedUrl, DARSHAN_EMBED_ORIGIN } from '@/video/channelEmbed';
import { darshanChannels } from '@/data/darshan/channels';

const mockInject = jest.fn();
type NativeProps = {
  source: { html: string; baseUrl: string };
  allowsFullscreenVideo: boolean;
  allowsInlineMediaPlayback: boolean;
  mediaPlaybackRequiresUserAction: boolean;
  onMessage: (e: { nativeEvent: { data: string } }) => void;
  onError: () => void;
  onHttpError?: () => void;
  onContentProcessDidTerminate: () => void;
  onShouldStartLoadWithRequest: (request: { url: string; mainDocumentURL?: string }) => boolean;
};
let mockProps: NativeProps;
jest.mock('react-native-webview', () => {
  const ReactLib = require('react');
  const WebView = ReactLib.forwardRef((props: object, ref: React.Ref<unknown>) => {
    mockProps = props as NativeProps;
    ReactLib.useImperativeHandle(ref, () => ({ injectJavaScript: mockInject }));
    return null;
  });
  WebView.displayName = 'NativeChannelWebView';
  return { WebView };
});
const callbacks = { onReady: jest.fn(), onError: jest.fn(), onChangeState: jest.fn() };
let tree: TestRenderer.ReactTestRenderer;
const channelId = darshanChannels[2].channelId;
function render(play = true) {
  act(() => { tree = TestRenderer.create(<ChannelYouTubeFrame channelId={channelId} height={240} play={play} {...callbacks} />); });
}
function message(type: string, data?: unknown) {
  act(() => mockProps.onMessage({ nativeEvent: { data: JSON.stringify({ type, data }) } }));
}
afterEach(() => { act(() => tree?.unmount()); jest.clearAllMocks(); });

it.each(darshanChannels.map((c) => [c.templeId, c.channelId]))('%s uses a stable current-channel iframe with controls and fullscreen', (_name, id) => {
  const url = new URL(channelEmbedUrl(id));
  expect(url.pathname).toBe('/embed/live_stream');
  expect(url.searchParams.get('channel')).toBe(id);
  expect(url.searchParams.get('fs')).toBe('1');
  expect(url.searchParams.get('controls')).toBe('1');
  expect(url.searchParams.get('autoplay')).toBe('0'); // native ready handshake owns start
  expect(channelEmbedHTML(id)).toContain('allowfullscreen');
});
it.each(['UC123', "UC123';alert(1);//", '<script>', 'https://youtube.com/channel/UC123'])(
  'rejects malformed source %s', (id) => expect(() => channelEmbedHTML(id)).toThrow('Invalid YouTube channel'),
);
it('uses registered app identity and native fullscreen without remounting on a height change', () => {
  render();
  expect(mockProps.source.baseUrl).toBe(`${DARSHAN_EMBED_ORIGIN}/`);
  expect(mockProps.allowsFullscreenVideo).toBe(true);
  expect(mockProps.allowsInlineMediaPlayback).toBe(true);
  expect(mockProps.mediaPlaybackRequiresUserAction).toBe(false);
  const source = mockProps.source;
  message('ready');
  mockInject.mockClear();
  act(() => tree.update(<ChannelYouTubeFrame channelId={channelId} height={600} play {...callbacks} />));
  expect(mockProps.source).toBe(source);
  expect(mockInject).not.toHaveBeenCalled();
});
it('plays only after readiness and honours the latest pause while loading', () => {
  render();
  expect(mockInject).not.toHaveBeenCalled();
  act(() => tree.update(<ChannelYouTubeFrame channelId={channelId} height={240} play={false} {...callbacks} />));
  message('ready');
  expect(mockInject).toHaveBeenLastCalledWith('window.setDarshanPlaying(false);true;');
  act(() => tree.update(<ChannelYouTubeFrame channelId={channelId} height={240} play {...callbacks} />));
  expect(mockInject).toHaveBeenLastCalledWith('window.setDarshanPlaying(true);true;');
});
it('reports actual player states, autoplay blocking, native and embed errors', () => {
  render();
  message('state', 1);
  expect(callbacks.onChangeState).toHaveBeenLastCalledWith(PLAYER_STATES.PLAYING);
  message('state', 2);
  expect(callbacks.onChangeState).toHaveBeenLastCalledWith(PLAYER_STATES.PAUSED);
  message('blocked');
  expect(callbacks.onChangeState).toHaveBeenLastCalledWith(PLAYER_STATES.PAUSED);
  message('state', 0);
  expect(callbacks.onChangeState).toHaveBeenLastCalledWith(PLAYER_STATES.ENDED);
  message('error', 150);
  expect(mockProps.onHttpError).toBeUndefined();
  act(() => mockProps.onError());
  act(() => mockProps.onContentProcessDidTerminate());
  expect(callbacks.onError).toHaveBeenCalledTimes(3);
  expect(() => act(() => mockProps.onMessage({ nativeEvent: { data: 'malformed' } }))).not.toThrow();
});

it('SEC-12: only its own embed page may navigate; links out of the player are refused', () => {
  render();
  const guard = mockProps.onShouldStartLoadWithRequest;
  expect(guard).toBe(allowDarshanNavigation);
  // The initial load (blank, or the app-identity base URL the HTML is served under).
  expect(guard({ url: 'about:blank' })).toBe(true);
  expect(guard({ url: `${DARSHAN_EMBED_ORIGIN}/` })).toBe(true);
  // The YouTube iframe is a sub-frame: its main document is still ours.
  expect(guard({ url: 'https://www.youtube.com/embed/live_stream?channel=x', mainDocumentURL: `${DARSHAN_EMBED_ORIGIN}/` })).toBe(true);
  // Top-level navigations elsewhere are blocked.
  expect(guard({ url: 'https://www.youtube.com/watch?v=abc' })).toBe(false);
  expect(guard({ url: 'https://evil.example/' })).toBe(false);
  expect(guard({ url: `${DARSHAN_EMBED_ORIGIN}.evil.example/` })).toBe(false);
  expect(guard({ url: 'https://evil.example/', mainDocumentURL: 'https://evil.example/' })).toBe(false);
  expect(guard({ url: 'javascript:alert(1)' })).toBe(false);
});
