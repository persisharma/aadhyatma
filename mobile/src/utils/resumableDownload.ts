/**
 * One remote file, fetched in a way a slow connection can actually finish.
 *
 * The two asset caches (`backgroundAssetCache`, `assetCache`) used to give a
 * download a fixed amount of wall-clock time and throw the bytes away when it
 * ran out. On a link that delivers 30 KB/s that is a guarantee of failure for
 * any artwork over ~240 KB: every visit re-spent the user's data on the same
 * first few hundred kilobytes and never showed the picture.
 *
 * Two rules replace that:
 *
 *   1. STALL, NOT DURATION. A download is abandoned when no byte has arrived for
 *      `stallMs`, never because it has merely been running a long time. An
 *      offline device still settles to its fallback after `stallMs`, exactly as
 *      before; a slow one is allowed to finish.
 *
 *   2. KEEP WHAT ARRIVED (Android). When an attempt is interrupted — a stall, the
 *      viewer leaving, the network dropping — the bytes already on disk are kept
 *      and the next attempt asks the server for the rest (`Range`). iOS hands
 *      resumption to the system through an opaque token the legacy module only
 *      produces from `pauseAsync`, so there an interrupted attempt restarts; the
 *      stall rule still applies.
 *
 * Resuming is only ever trusted after it is CHECKED. Content is addressed by
 * hash, so the same URL is always the same bytes, but a server (or a Worker in
 * front of the bucket) may ignore `Range` and send the whole file, which the
 * native module would append to the partial. Three independent checks stop that
 * from becoming a cached picture: the resumed response must report the same
 * total as the first one, must be HTTP 206, and the finished file must be
 * exactly that total. A response that fails any of them is never cached. One
 * that shows `Range` being ignored (a different total, a whole 2xx body, a
 * wrong final length) also turns resuming off for the rest of the session; an
 * error status (5xx, 429, 404) only costs that one file its kept bytes.
 *
 * Resume state is deliberately in memory only. A scratch file left by a killed
 * process is never treated as progress; callers sweep those.
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

type Partial = { uri: string; offset: number; total: number };

/** key → bytes an interrupted attempt left on disk. */
const partials = new Map<string, Partial>();
/** key → the attempt that currently owns that key's scratch file. */
const active = new Map<string, Promise<void>>();
/** A server answered a ranged request with the whole file: stop asking. */
let rangeRefused = false;
let attempt = 0;

/** How long to wait for native code to stop writing after a cancel. */
const SETTLE_GRACE_MS = 1500;

export class DownloadInterrupted extends Error {
  constructor(readonly reason: 'stalled' | 'expired' | 'aborted') {
    super(`Download ${reason}`);
    this.name = 'DownloadInterrupted';
  }
}

export type ResumableDownloadRequest = {
  /** Identity of the file being fetched; attempts for one key never overlap. */
  key: string;
  url: string;
  /** Scratch files are `${scratchBase}.<n>.part`; the caller moves the result. */
  scratchBase: string;
  /** Abandon the attempt when no byte arrives for this long. */
  stallMs: number;
  /** Abandon the attempt after this long regardless (the bytes are kept). */
  maxMs?: number;
  /** Called with the function that abandons this attempt, then with `undefined`. */
  onAbortable?: (abort: (() => void) | undefined) => void;
  /** Checked before any native work starts, after waiting for a prior attempt. */
  isCancelled?: () => boolean;
};

/**
 * Read ONCE, when this module is evaluated — never from a timer or a late
 * continuation. `Platform` is a lazy getter on `react-native`, and a download
 * can outlive whatever asked for it (a stall timer, a queued attempt); nothing
 * on those paths may be the first thing to touch it.
 */
let resumablePlatform = Platform.OS === 'android';

async function remove(uri: string): Promise<void> {
  await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
}

async function sizeOf(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists && !info.isDirectory ? info.size : 0;
  } catch {
    return 0;
  }
}

/** The partial for `key`, if its file is still exactly what the last attempt left. */
async function usablePartial(key: string, resumable: boolean): Promise<Partial | null> {
  const partial = partials.get(key);
  if (!partial) return null;
  partials.delete(key);
  if (resumable && !rangeRefused && (await sizeOf(partial.uri)) === partial.offset) return partial;
  await remove(partial.uri);
  return null;
}

async function run(request: ResumableDownloadRequest, resumable: boolean): Promise<string> {
  const { key, url, scratchBase, stallMs, maxMs, onAbortable, isCancelled } = request;
  const resume = await usablePartial(key, resumable);
  const scratch = resume?.uri ?? `${scratchBase}.${++attempt}.part`;
  // A process-killed attempt may have left this path behind. It is never
  // progress, and it must not make a fresh download append to stale bytes.
  if (!resume) await remove(scratch);
  // Checked LAST: nothing is awaited between here and `onAbortable` below, so a
  // caller that gave up during either wait above never starts a transfer that
  // nobody holds the abort for.
  if (isCancelled?.()) {
    // Nothing was started, so what the last attempt left is still intact.
    if (resume) partials.set(key, resume);
    throw new DownloadInterrupted('aborted');
  }

  let total = resume?.total ?? 0;
  let wrongTotal = false;
  /** The answer to a ranged request showed the server does not honour `Range`. */
  let rangeIgnored = false;
  let interrupt!: (error: Error) => void;
  const interrupted = new Promise<never>((_, reject) => { interrupt = reject; });
  // The race below settles on whichever comes first; the loser must not surface
  // as an unhandled rejection.
  interrupted.catch(() => undefined);

  let stallTimer: ReturnType<typeof setTimeout> | undefined;
  const watch = () => {
    if (stallTimer) clearTimeout(stallTimer);
    stallTimer = setTimeout(() => interrupt(new DownloadInterrupted('stalled')), stallMs);
  };
  const expiry = maxMs === undefined
    ? undefined
    : setTimeout(() => interrupt(new DownloadInterrupted('expired')), maxMs);

  const download = FileSystem.createDownloadResumable(
    url,
    scratch,
    {},
    ({ totalBytesExpectedToWrite }) => {
      watch();
      if (totalBytesExpectedToWrite <= 0) return;
      if (resume && totalBytesExpectedToWrite !== resume.total) {
        // The server ignored `Range` and is sending the whole file after the
        // bytes we already hold. Stop paying for it now.
        wrongTotal = true;
        interrupt(new Error('Resumed download reported a different size'));
        return;
      }
      total = totalBytesExpectedToWrite;
    },
    resume ? String(resume.offset) : undefined
  );
  const transfer = resume ? download.resumeAsync() : download.downloadAsync();
  let transferSettled = false;
  transfer.then(() => { transferSettled = true; }, () => { transferSettled = true; });
  onAbortable?.(() => interrupt(new DownloadInterrupted('aborted')));
  watch();

  let rejectedResponse = false;
  try {
    const result = await Promise.race([transfer, interrupted]);
    if (!result) throw new DownloadInterrupted('aborted');
    if (result.status !== (resume ? 206 : 200)) {
      rejectedResponse = true;
      // Only a whole body in answer to a ranged request says the server ignores
      // `Range`. A 503, 429 or 404 says nothing about it, and must not cost
      // every later download in the session its kept bytes.
      rangeIgnored = Boolean(resume) && result.status >= 200 && result.status < 300;
      throw new Error(`Download failed with HTTP ${result.status}`);
    }
    const size = await sizeOf(scratch);
    // A fresh download is held to what it always was: a non-empty 200. The
    // exact-length check is for the one case that can silently corrupt — bytes
    // appended to a partial. (A fresh response may also be transfer-compressed,
    // where the reported total is not the file's length at all.)
    if (size === 0 || (resume && size !== resume.total)) {
      rejectedResponse = true;
      rangeIgnored = Boolean(resume);
      throw new Error('Downloaded file is incomplete');
    }
    // The legacy task removes its progress listener only in `cancelAsync` /
    // `pauseAsync`, so a task that simply finished would keep it — and this
    // closure — for the life of the process, and every later progress event
    // would be handed to all of them. Cancelling a finished task does nothing
    // natively.
    await download.cancelAsync().catch(() => undefined);
    return scratch;
  } catch (error) {
    await download.cancelAsync().catch(() => undefined);
    // Native code resolves the transfer once it has stopped writing; only then
    // is the file's length the true offset. Bounded, because a wedged transfer
    // must not hold its caller's slot forever — and skipped entirely when the
    // transfer is what failed, so an ordinary failure leaves no timer behind.
    if (!transferSettled) {
      let grace: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        transfer.then(() => undefined, () => undefined),
        new Promise<void>(resolve => { grace = setTimeout(resolve, SETTLE_GRACE_MS); }),
      ]);
      if (grace) clearTimeout(grace);
    }

    if (resume && (wrongTotal || rangeIgnored)) rangeRefused = true;
    const offset = !wrongTotal && !rejectedResponse && resumable && !rangeRefused && total > 0
      ? await sizeOf(scratch)
      : 0;
    if (offset > 0 && offset < total) partials.set(key, { uri: scratch, offset, total });
    else await remove(scratch);
    throw error;
  } finally {
    if (stallTimer) clearTimeout(stallTimer);
    if (expiry) clearTimeout(expiry);
    onAbortable?.(undefined);
  }
}

/**
 * Fetch `url` and resolve with the scratch file holding the COMPLETE body. The
 * caller owns that file from then on (validate it, move it into place).
 *
 * Rejects with `DownloadInterrupted` for a stall, expiry or abort, and with a
 * plain `Error` for a network failure or a response that must not be cached.
 */
export function downloadWithResume(request: ResumableDownloadRequest): Promise<string> {
  const previous = active.get(request.key);
  const resumable = resumablePlatform;
  // A cancelled attempt is still deciding whether its bytes are worth keeping;
  // starting beside it would race two writers on one file.
  const task = (async () => {
    if (previous) await previous;
    return run(request, resumable);
  })();
  const settled = task.then(() => undefined, () => undefined);
  active.set(request.key, settled);
  void settled.then(() => { if (active.get(request.key) === settled) active.delete(request.key); });
  return task;
}

/** Drop any kept bytes for `key` (its content was evicted or superseded). */
export async function forgetPartialDownload(key: string): Promise<void> {
  const partial = partials.get(key);
  if (!partial) return;
  partials.delete(key);
  await remove(partial.uri);
}

/** Scratch files this process is still counting on; a sweep must leave them. */
function isKeptPartial(uri: string): boolean {
  for (const partial of partials.values()) if (partial.uri === uri) return true;
  return false;
}

/** directory → its one sweep. */
const sweeps = new Map<string, Promise<void>>();

/**
 * Scratch files outlive a killed process and nothing else ever removes them.
 * Once per process and directory, before the first download into it, drop every
 * `.part` this process is not itself counting on.
 *
 * ONE shared promise per directory, awaited by every download into it: a second
 * download that skipped the wait could create its scratch file while the first
 * caller's listing was still being deleted. `directory` ends with a slash.
 */
export function sweepAbandonedScratch(directory: string): Promise<void> {
  let sweep = sweeps.get(directory);
  if (!sweep) {
    sweep = (async () => {
      try {
        const names = await FileSystem.readDirectoryAsync(directory);
        await Promise.all(
          names
            .filter(name => name.endsWith('.part') && !isKeptPartial(`${directory}${name}`))
            .map(name => remove(`${directory}${name}`))
        );
      } catch {
        // Housekeeping only: an unreadable directory must not cost the download.
      }
    })();
    sweeps.set(directory, sweep);
  }
  return sweep;
}

/** Test seam — model a new app process, optionally on the other platform. */
export function resetResumableDownloadsForTests(options: { resumable?: boolean } = {}): void {
  resumablePlatform = options.resumable ?? Platform.OS === 'android';
  partials.clear();
  active.clear();
  sweeps.clear();
  rangeRefused = false;
  attempt = 0;
}
