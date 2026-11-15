import * as FileSystem from 'expo-file-system/legacy';
import type { CachedAssetRequest } from './assetCache';
import { downloadWithResume, forgetPartialDownload, sweepAbandonedScratch } from './resumableDownload';

type Listener = (uri: string | null) => void;
type Job = {
  identity: string;
  request: CachedAssetRequest;
  listeners: Set<Listener>;
  cancelled: boolean;
  abort?: () => void;
};

/**
 * No byte for this long means the connection is dead: settle to the fallback
 * and free the slot. It is a STALL limit, not a duration — the old 8 s total
 * meant a 340 KB plate needed 42 KB/s to ever appear, and failed on every visit
 * below that (see `resumableDownload`).
 */
export const BACKGROUND_DOWNLOAD_STALL_MS = 8000;
/**
 * A slot is still bounded. Two minutes carries the largest plate (~550 KB) down
 * to ~5 KB/s; past it the attempt yields its slot and, on Android, the next
 * visit continues from the bytes already stored.
 */
export const BACKGROUND_DOWNLOAD_MAX_MS = 120000;
export const BACKGROUND_DOWNLOAD_CONCURRENCY = 2;
const jobs = new Map<string, Job>();
const queue: Job[] = [];
let running = 0;
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

  await sweepAbandonedScratch(directory);
  if (job.cancelled) throw new Error('Background no longer visible');

  // One attempt per content identity at a time; an interrupted attempt keeps
  // its bytes for the next one where the platform can resume.
  const scratch = await downloadWithResume({
    key: destination,
    url: job.request.remoteUrl,
    scratchBase: destination,
    stallMs: BACKGROUND_DOWNLOAD_STALL_MS,
    maxMs: BACKGROUND_DOWNLOAD_MAX_MS,
    onAbortable: abort => { job.abort = abort; },
    isCancelled: () => job.cancelled,
  });
  let committed = false;
  try {
    // A complete download is promoted atomically; interrupted files are never
    // hits. It is promoted even if its last viewer has just left: the bytes are
    // paid for, and the next visit should find them rather than fetch again.
    await FileSystem.moveAsync({ from: scratch, to: destination });
    committed = true;
    return destination;
  } finally {
    if (!committed) await FileSystem.deleteAsync(scratch, { idempotent: true }).catch(() => undefined);
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

/** Cache-only lookup for decorative previews: the persisted file or null. Never downloads. */
export async function peekBackgroundAsset(request: CachedAssetRequest): Promise<string | null> {
  const path = cachePath(request);
  if (!path) return null;
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists && !info.isDirectory && info.size > 0 ? path : null;
  } catch { return null; }
}

/** A native decode failure must not poison the persistent cache on every visit. */
export async function evictBackgroundAsset(request: CachedAssetRequest): Promise<void> {
  const path = cachePath(request);
  if (!path) return;
  await forgetPartialDownload(path);
  await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => undefined);
}
