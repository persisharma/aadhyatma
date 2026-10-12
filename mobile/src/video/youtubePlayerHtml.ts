/**
 * Builds the HTML loaded into the player WebView. It embeds YouTube's official
 * player via a static <iframe> (youtube.com/embed/…?enablejsapi=1) and bridges the
 * player's postMessage events to React Native via
 * `window.ReactNativeWebView.postMessage`.
 *
 * Why a static iframe (not the injected IFrame API `iframe_api` script): on iOS
 * WKWebView loads documents supplied as an HTML string (`source={{ html }}`)
 * specially — a dynamically-appended REMOTE <script> (the `iframe_api`) silently
 * never loads, so `YT.Player` never initialises and the player hangs on "loading".
 * A static <iframe> is a frame navigation to a real URL, which WKWebView loads
 * normally. We talk to it with the same postMessage protocol the IFrame API uses
 * under the hood (`enablejsapi=1` + the "listening"/"command" messages), so we
 * still get ready/state/time events and play/pause control — and we never extract
 * audio, hide the player, or block ads (YouTube's embed terms).
 *
 * `origin` must match the WebView's base url (we load with
 * `baseUrl: 'https://www.youtube.com'`) or YouTube rejects the jsapi messages.
 */
import { isValidYouTubeId } from './videoId';

export const YT_ORIGIN = 'https://www.youtube.com';

/** Messages the page posts back. Mirrored by the RN parser in DockedYouTubePlayer. */
export type YouTubeBridgeEvent =
  | { event: 'ready' }
  | { event: 'state'; state: 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued' }
  | { event: 'time'; currentTime: number; duration: number }
  | { event: 'error'; code: number };

export function buildYouTubePlayerHtml(videoId: string, autoplay: boolean): string {
  if (!isValidYouTubeId(videoId)) {
    throw new Error(`refusing to build player html for invalid video id: ${videoId}`);
  }
  // The id is validated above (strict 11-char URL-safe charset), so it is safe to
  // inline into the embed url + JS string — it cannot carry quotes or markup.
  // `origin` MUST be URL-encoded: YouTube matches it against the embedding
  // referrer, and an unencoded "https://…" breaks the match → error 150/152
  // ("not allowed in embedded players") even for embeddable videos.
  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(YT_ORIGIN)}` +
    `&autoplay=${autoplay ? 1 : 0}`;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}
  iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
</style>
</head>
<body>
<iframe id="yt" src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
<script>
  function post(payload){
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }
  var yt = document.getElementById('yt');
  var STATE = {'-1':'unstarted','0':'ended','1':'playing','2':'paused','3':'buffering','5':'cued'};
  function toPlayer(func){
    if (yt && yt.contentWindow) {
      yt.contentWindow.postMessage(JSON.stringify({event:'command', func:func, args:[]}), '*');
    }
  }
  window.__ytPlay = function(){ toPlayer('playVideo'); };
  window.__ytPause = function(){ toPlayer('pauseVideo'); };

  // The enablejsapi "listening" handshake must reach the embed before YouTube emits
  // any events. iframe.onload is unreliable in WKWebView, so send it on a short
  // interval until the player answers (any message), then stop. This is what makes
  // onReady/time/state arrive at all.
  var handshake = setInterval(function(){
    if (yt && yt.contentWindow) {
      yt.contentWindow.postMessage(JSON.stringify({event:'listening', id:'yt', channel:'widget'}), '*');
    }
  }, 300);
  setTimeout(function(){ if (handshake) { clearInterval(handshake); handshake = null; } }, 15000);

  // Receive YouTube's jsapi events (same protocol the IFrame API consumes).
  window.addEventListener('message', function(e){
    var d;
    try { d = JSON.parse(e.data); } catch (_){ return; }
    if (!d || !d.event) return;
    // Any answer from the player proves it is live — stop handshaking and clear the
    // RN loading state immediately (native controls are usable even if the precise
    // onReady lags).
    if (handshake) { clearInterval(handshake); handshake = null; post({event:'ready'}); }
    if (d.event === 'onReady' || d.event === 'initialDelivery') {
      post({event:'ready'});
    } else if (d.event === 'onStateChange') {
      post({event:'state', state: STATE[String(d.info)] || 'unstarted'});
    } else if (d.event === 'infoDelivery' && d.info) {
      if (typeof d.info.playerState !== 'undefined') {
        post({event:'state', state: STATE[String(d.info.playerState)] || 'unstarted'});
      }
      if (typeof d.info.currentTime !== 'undefined') {
        post({event:'time', currentTime: d.info.currentTime || 0, duration: d.info.duration || 0});
      }
    } else if (d.event === 'onError') {
      post({event:'error', code: Number(d.info) || 2});
    }
  });

  // If the frame's own load event does fire, that's an extra (harmless) ready signal.
  yt.onload = function(){ post({event:'ready'}); };
  yt.onerror = function(){ post({event:'error', code: 2}); };
</script>
</body>
</html>`;
}
