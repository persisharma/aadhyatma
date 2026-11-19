import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { PLAYER_STATES } from 'react-native-youtube-iframe';
import { channelEmbedHTML, DARSHAN_EMBED_ORIGIN } from '@/video/channelEmbed';

/**
 * The only navigation this WebView may perform is its own embed page (the
 * app-identity base URL its HTML is loaded under, or the blank first load).
 * Anything else, such as a link inside the player, is refused: the YouTube
 * iframe itself loads as a sub-frame of that page and is not a navigation of the
 * WebView. Mirrors the docked player's guard (react-native-youtube-iframe).
 */
export function allowDarshanNavigation(request: { url: string; mainDocumentURL?: string }): boolean {
  const url = request.mainDocumentURL || request.url;
  return url === 'about:blank' || url === DARSHAN_EMBED_ORIGIN || url.startsWith(`${DARSHAN_EMBED_ORIGIN}/`);
}

export default function ChannelYouTubeFrame({ channelId, height, play, onReady, onError, onChangeState }: {
  channelId: string;
  height: number;
  play: boolean;
  onReady: () => void;
  onError: () => void;
  onChangeState: (state: PLAYER_STATES) => void;
}) {
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const source = useMemo(() => ({
    html: channelEmbedHTML(channelId), baseUrl: `${DARSHAN_EMBED_ORIGIN}/`,
  }), [channelId]);
  useEffect(() => {
    if (ready) web.current?.injectJavaScript(`window.setDarshanPlaying(${play ? 'true' : 'false'});true;`);
  }, [ready, play]);
  return <WebView
    ref={web}
    testID="darshan-channel-webview"
    source={source}
    style={{ width: '100%', height, backgroundColor: '#000' }}
    allowsInlineMediaPlayback
    allowsFullscreenVideo
    mediaPlaybackRequiresUserAction={false}
    onShouldStartLoadWithRequest={allowDarshanNavigation}
    // Keep normal YouTube controls/branding; there are no app-owned exit CTAs.
    onMessage={({ nativeEvent }) => {
      try {
        const event = JSON.parse(nativeEvent.data);
        if (event.type === 'ready') { setReady(true); onReady(); }
        else if (event.type === 'error') onError();
        else if (event.type === 'blocked') onChangeState(PLAYER_STATES.PAUSED);
        else if (event.type === 'state') {
          const state = ({ 1: PLAYER_STATES.PLAYING, 2: PLAYER_STATES.PAUSED, 0: PLAYER_STATES.ENDED } as Record<number, PLAYER_STATES>)[event.data];
          if (state) onChangeState(state);
        }
      } catch { /* Ignore malformed/non-player bridge events. */ }
    }}
    onError={onError}
    // Subresource HTTP errors (e.g. a thumbnail) are not playback failures.
    // YouTube reports embed failures through onMessage; load stalls time out
    // in the owning player. Native main-document/process failures remain fatal.
    onContentProcessDidTerminate={onError}
  />;
}
