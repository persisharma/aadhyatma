/** Registered native app identity, also used as WebView baseURL/Referer. */
export const DARSHAN_EMBED_ORIGIN = 'https://com.prashantsharma.vedansh';

/** YouTube's channel embed selects its current broadcast. No dated video IDs,
 * channel HTML scraping, API key, hidden resolver player or stream extraction. */
export function channelEmbedUrl(channelId: string): string {
  if (!/^UC[\w-]{22}$/.test(channelId)) throw new Error('Invalid YouTube channel');
  const params = new URLSearchParams({
    channel: channelId, enablejsapi: '1', playsinline: '1', controls: '1',
    autoplay: '0', fs: '1', rel: '0', origin: DARSHAN_EMBED_ORIGIN,
  });
  return `https://www.youtube.com/embed/live_stream?${params}`;
}

/** The visible player owns source discovery. Native sends the latest play intent
 * only after ready, so loading cannot undo a background/blur/arbiter pause. */
export function channelEmbedHTML(channelId: string): string {
  const src = channelEmbedUrl(channelId).replace(/&/g, '&amp;');
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="strict-origin-when-cross-origin">
<style>html,body{margin:0;width:100%;height:100%;background:#000}iframe{width:100%;height:100%;border:0;display:block}</style>
</head><body><iframe id="darshan" title="Temple broadcast" src="${src}"
allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
<script>
var player, ready = false;
function send(type, data) { window.ReactNativeWebView.postMessage(JSON.stringify({type:type,data:data})); }
function onYouTubeIframeAPIReady() {
  player = new YT.Player('darshan', {events:{
    onReady:function(){ready=true;send('ready');},
    onStateChange:function(e){send('state',e.data);},
    onError:function(e){send('error',e.data);},
    onAutoplayBlocked:function(){send('blocked');}
  }});
}
// Only these two commands are accepted; never evaluate a message as code.
window.setDarshanPlaying = function(play) {
  if (!ready || !player) return;
  if (play) player.playVideo(); else player.pauseVideo();
};
</script><script src="https://www.youtube.com/iframe_api"></script></body></html>`;
}
