import * as FileSystem from 'expo-file-system/legacy';
import type { CachedAssetRequest } from './assetCache';

type Listener = (uri: string | null) => void;
type Job = {
  identity: string;
  request: CachedAssetRequest;
  listeners: Set<Listener>;
  cancelled: boolean;
  abort?: () => void;
};

export const BACKGROUND_DOWNLOAD_TIMEOUT_MS = 8000;
export const BACKGROUND_DOWNLOAD_CONCURRENCY = 2;
const jobs = new Map<string, Job>();
const queue: Job[] = [];
let running = 0;
let attempt = 0;

/** Content identity survives CDN changes; it is also the persistent filename. */
function cacheIdentity(request: CachedAssetRequest): string {
  return `${request.key}.${request.ext}`;
}

function cachePath(request: CachedAssetRequest): string | null {
  return FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}reading-backgrounds/${cacheIdentity(request)}`
    : null;
}

/** Cache lookup does not wait behind the network queue. No render-time stat. */
async function cachedImage(job: Job): Promise<string | null> {
  const destination = cachePath(job.request);
  if (!destination) throw new Error('No background cache directory');
  const cached = await FileSystem.getInfoAsync(destination);
  if (job.cancelled) throw new Error('Background no longer visible');
  // No expiry, HEAD request or network revalidation. Documents survives app
  // restarts and OS cache purges. New content receives a new hash/filename.
  if (cached.exists && !cached.isDirectory && cached.size > 0) return destination;
  return null;
}

/** All disk operations are asynchronous, including cache hits. */
async function resolve(job: Job): Promise<string> {
  // Another attempt may have completed while this miss waited for a network slot.
  const cached = await cachedImage(job);
  if (cached) return cached;
  const destination = cachePath(job.request)!;
  const directory = destination.slice(0, destination.lastIndexOf('/') + 1);
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  if (job.cancelled) throw new Error('Background no longer visible');

  // Unique temporary files prevent a cancelled attempt racing a new subscriber.
  const temporary = `${destination}.${++attempt}.part`;
  // A process-killed first attempt may have left this path behind. It is never
  // treated as a hit and must not prevent a fresh download on the next launch.
  await FileSystem.deleteAsync(temporary, { idempotent: true });
  if (job.cancelled) throw new Error('Background no longer visible');
  const download = FileSystem.createDownloadResumable(job.request.remoteUrl, temporary);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let committed = false;
  try {
    const interrupted = new Promise<never>((_, reject) => {
      job.abort = () => reject(new Error('Background download cancelled'));
      timer = setTimeout(job.abort, BACKGROUND_DOWNLOAD_TIMEOUT_MS);
    });
    const result = await Promise.race([download.downloadAsync(), interrupted]);
    if (job.cancelled || !result || result.status !== 200) throw new Error('Background download failed');
    const info = await FileSystem.getInfoAsync(temporary);
    if (!info.exists || info.isDirectory || info.size === 0) throw new Error('Empty background');
    if (job.cancelled) throw new Error('Background no longer visible');
    // A complete download is promoted atomically; interrupted files are never hits.
    await FileSystem.moveAsync({ from: temporary, to: destination });
    committed = true;
    return destination;
  } finally {
    if (timer) clearTimeout(timer);
    job.abort = undefined;
    if (!committed) {
      await download.cancelAsync().catch(() => undefined);
      await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(() => undefined);
    }
  }
}

function drain(): void {
  while (running < BACKGROUND_DOWNLOAD_CONCURRENCY && queue.length) {
    const job = queue.shift()!;
    if (job.cancelled) continue;
    running++;
    void resolve(job)
      .then(uri => { if (!job.cancelled) job.listeners.forEach(listener => listener(uri)); })
      .catch(() => { if (!job.cancelled) job.listeners.forEach(listener => listener(null)); })
      .finally(() => {
        if (jobs.get(job.identity) === job) jobs.delete(job.identity);
        running--;
        drain();
      });
  }
}

async function prepare(job: Job): Promise<void> {
  let queued = false;
  try {
    const cached = await cachedImage(job);
    if (cached) {
      job.listeners.forEach(listener => listener(cached));
      return;
    }
    // Only misses occupy the bounded download queue. Persisted art can appear
    // immediately even when two unrelated requests are timing out offline.
    queued = true;
    queue.push(job);
    drain();
  } catch {
    if (!job.cancelled) job.listeners.forEach(listener => listener(null));
  } finally {
    if (!queued && jobs.get(job.identity) === job) jobs.delete(job.identity);
  }
}

/** Dedupe by content across backdrops/plates/hosts; cancel when its last viewer leaves. */
export function subscribeBackgroundAsset(request: CachedAssetRequest, listener: Listener): () => void {
  const identity = cacheIdentity(request);
  let job = jobs.get(identity);
  if (!job || job.cancelled) {
    job = { identity, request, listeners: new Set(), cancelled: false };
    jobs.set(identity, job);
    void prepare(job);
  }
  job.listeners.add(listener);
  const subscribed = job;
  return () => {
    subscribed.listeners.delete(listener);
    if (subscribed.listeners.size === 0) {
      subscribed.cancelled = true;
      subscribed.abort?.();
      if (jobs.get(identity) === subscribed) jobs.delete(identity);
      const index = queue.indexOf(subscribed);
      if (index >= 0) queue.splice(index, 1);
    }
  };
}

/** A native decode failure must not poison the persistent cache on every visit. */
export async function evictBackgroundAsset(request: CachedAssetRequest): Promise<void> {
  const path = cachePath(request);
  if (path) await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => undefined);
}
