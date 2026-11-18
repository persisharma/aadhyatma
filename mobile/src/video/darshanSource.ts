import type { DarshanChannel } from "@/data/darshan/channels";
import { isValidYouTubeId } from "./videoId";

/** Read only actual YouTube iframe srcs on the dedicated official live page.
 * Never take a social link, inline recommendation, or a stale bundled ID.
 * Multiple distinct videos are ambiguous (e.g. Somnath's satellite shrines):
 * fail closed instead of silently playing another temple. */
export function officialEmbedId(html: string): string | null {
  if (html.length > 1500000) return null;
  const ids = new Set<string>();
  for (const tag of html.match(/<iframe\b[^>]*>/gi) ?? []) {
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i
      .exec(tag)?.[1]
      ?.replace(/&amp;/g, "&");
    if (!src) continue;
    try {
      const url = new URL(src.startsWith("//") ? `https:${src}` : src);
      if (
        url.protocol !== "https:" ||
        ![
          "www.youtube.com",
          "www.youtube-nocookie.com",
          "youtube.com",
        ].includes(url.hostname)
      )
        continue;
      const id = /^\/embed\/([^/]+)$/.exec(url.pathname)?.[1];
      if (id && id !== "live_stream" && isValidYouTubeId(id)) ids.add(id);
    } catch {
      /* Not a supported absolute embed URL. */
    }
  }
  return ids.size === 1 ? [...ids][0] : null;
}
export async function resolveDarshanVideo(
  channel: DarshanChannel,
  signal: AbortSignal,
): Promise<string | null> {
  if (!channel.livePage) return null;
  const response = await fetch(channel.livePage, {
    signal,
    headers: { Accept: "text/html" },
  });
  if (
    !response.ok ||
    (response.url &&
      new URL(response.url).hostname !== new URL(channel.livePage).hostname)
  )
    return null;
  return officialEmbedId(await response.text());
}
