/**
 * YouTube video-id helpers. The id is the canonical 11-char key YouTube assigns a
 * video; everything else (watch url, embed html) derives from it, so validating it
 * once here keeps a malformed/injected id out of the WebView and the open-in-app url.
 */

/** YouTube ids are exactly 11 chars from the URL-safe base64 alphabet. */
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** True for a well-formed YouTube video id. Guards the registry and bridge payloads. */
export function isValidYouTubeId(id: string): boolean {
  return YT_ID_RE.test(id);
}

/** Canonical watch url for "Open in YouTube" (opens the app or the site). */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
