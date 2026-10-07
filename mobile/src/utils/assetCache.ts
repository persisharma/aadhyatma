/**
 * The on-device cache for heavy assets served from the network (the audio
 * library and the kids-stories artwork — the two folders pulled out of the app
 * binary to keep the install small).
 *
 * Contract: a given remote asset is downloaded AT MOST ONCE per device. The
 * file is stored under `Paths.document` — the OS-safe directory that is NOT
 * reclaimed when the app backgrounds or the device runs low on storage (unlike
 * `Paths.cache`). So once an asset is fetched it stays local across every app
 * close and restart, works fully offline, and is only removed on uninstall or
 * when the user explicitly clears app storage.
 *
 * `key` is the asset's CONTENT HASH (from the remote manifest): changed content
 * lands at a new path and is fetched once on its own, while everything unchanged
 * keeps its existing local file — no blanket cache-bust, no stale bytes.
 */
import { Directory, File, Paths } from 'expo-file-system';

export interface CachedAssetRequest {
  /** Content hash — the stable, unguessable filename stem. */
  key: string;
  /** File extension without the dot, e.g. `webp` or `mp3`. */
  ext: string;
  /** Bucket folder under the document dir, e.g. `kids-stories` or `audio`. */
  subdir: string;
  /** Absolute URL to fetch from (R2 via the auth Worker). */
  remoteUrl: string;
}

// De-dupes concurrent first-requests for the same file (a list prefetch racing
// the reader) into a single in-flight download, keyed by the destination uri.
const inFlight = new Map<string, Promise<string>>();

/**
 * Returns a local `file://` uri for the asset, downloading it once if it is not
 * already stored. Throws if the download fails (callers show a placeholder and
 * retry on the next mount — never a silent blank).
 */
export async function cachedAssetUri({ key, ext, subdir, remoteUrl }: CachedAssetRequest): Promise<string> {
  const dir = new Directory(Paths.document, subdir);
  const file = new File(dir, `${key}.${ext}`);

  if (file.exists) return file.uri;

  const pending = inFlight.get(file.uri);
  if (pending) return pending;

  const task = (async () => {
    if (!dir.exists) dir.create({ intermediates: true });
    try {
      await File.downloadFileAsync(remoteUrl, file);
      return file.uri;
    } catch (err) {
      // Leave nothing half-written behind, so the next attempt retries cleanly.
      if (file.exists) file.delete();
      throw err;
    } finally {
      inFlight.delete(file.uri);
    }
  })();

  inFlight.set(file.uri, task);
  return task;
}
