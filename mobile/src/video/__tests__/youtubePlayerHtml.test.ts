import { buildYouTubePlayerHtml, YT_ORIGIN } from '../youtubePlayerHtml';

describe('buildYouTubePlayerHtml', () => {
  it('embeds the video via the official player with jsapi + matching origin', () => {
    const html = buildYouTubePlayerHtml('AETFvQonfV8', true);
    // Static iframe to the official embed (no audio extraction / bare player).
    expect(html).toContain('https://www.youtube.com/embed/AETFvQonfV8');
    expect(html).toContain('enablejsapi=1');
    expect(html).toContain(`origin=${encodeURIComponent(YT_ORIGIN)}`);
    // Bridges events back to RN.
    expect(html).toContain('window.ReactNativeWebView.postMessage');
  });

  it('honours the autoplay flag', () => {
    expect(buildYouTubePlayerHtml('AETFvQonfV8', true)).toContain('autoplay=1');
    expect(buildYouTubePlayerHtml('AETFvQonfV8', false)).toContain('autoplay=0');
  });

  it('refuses an invalid id rather than inlining it', () => {
    expect(() => buildYouTubePlayerHtml("x'};evil//", true)).toThrow(/invalid video id/);
  });
});
