/**
 * Remote push-token capture: the pure half.
 *
 * Every other notification family in this app is local and on-device (see
 * `wiki/subsystems/notifications.md`). This module is the first step towards a
 * *remote* one: it captures the device's Expo push token so a server can
 * eventually address a single install.
 *
 * Nothing here touches the clock, the OS, storage, or the network — that is all
 * in `pushToken.ts`, exactly the pure-planner + thin-glue split the reminder
 * families use. Keeping the constants here also means the integrity test can
 * import them without dragging `expo-notifications` into `tsx --test`.
 *
 * ## Identity: two different things
 *
 * - The **push token** (`ExponentPushToken[…]`) is what a server sends *to*. It
 *   rotates — reinstall, device restore, an FCM refresh — so it is a bad key.
 * - The **install id** is ours: minted once and persisted. Stable for the life
 *   of the install, with no OS identifier involved (IDFV and ANDROID_ID both
 *   carry privacy-disclosure weight we do not need), so it is the primary key
 *   and the token is a mutable column on it.
 */

// Reused rather than re-implemented: this is the repo's stable 32-bit FNV-1a,
// already the hash behind daily-verse selection. `seed.ts` imports one *type*
// and nothing else, so pulling it in here costs no module graph.
import { hashDateKey as fnv1a } from './seed';

/**
 * Hardcoded fallback endpoint. `null` ⇒ capture-only: the token is still read
 * and persisted locally (readable via `getCapturedPushToken()`), but the app
 * makes **no network call at all**.
 *
 * Prefer the env var over editing this (see `resolvePushEndpoint`); this
 * constant exists so the endpoint *can* be pinned in source if you would
 * rather not manage build-time config.
 */
export const PUSH_REGISTRY_ENDPOINT: string | null = null;

/**
 * Build-time env var naming the upload endpoint, e.g.
 * `EXPO_PUBLIC_PUSH_REGISTRY_URL=https://push.example.com/devices`.
 *
 * `EXPO_PUBLIC_`-prefixed vars are **inlined by babel at build time**, which is
 * why the read at the call site must be the full literal
 * `process.env.EXPO_PUBLIC_PUSH_REGISTRY_URL` — destructuring it or building
 * the key dynamically defeats the inlining and yields `undefined` in a release
 * bundle. Set it per profile in `eas.json` (or in `.env` for local runs).
 *
 * It is public by design: this is an endpoint URL, not a secret. Nothing here
 * authenticates, so the endpoint must treat every request as untrusted (see the
 * server contract in `pushToken.ts`).
 */
export const PUSH_REGISTRY_ENV_VAR = 'EXPO_PUBLIC_PUSH_REGISTRY_URL';

/**
 * Effective endpoint: the env var if it names a usable `https:` URL, else the
 * source fallback, else `null` (capture-only). Pure so the precedence is
 * pinned by a test rather than by whatever the ambient environment happens to
 * hold.
 */
export function resolvePushEndpoint(
  fromEnv: string | undefined | null,
  fallback: string | null
): string | null {
  if (isPushRegistryConfigured(fromEnv ?? null)) return (fromEnv as string).trim();
  if (isPushRegistryConfigured(fallback)) return fallback.trim();
  return null;
}

/** Total upload attempts per sync — one try plus two retries. */
export const PUSH_SYNC_MAX_ATTEMPTS = 3;

/** Delay before the 2nd attempt; tripled for each one after (2s → 6s). */
export const PUSH_SYNC_BASE_DELAY_MS = 2000;

/** Ceiling on a single backoff wait, so the schedule cannot run away. */
export const PUSH_SYNC_MAX_DELAY_MS = 30_000;

/** Spread of the deterministic per-device jitter added to each backoff. */
export const PUSH_SYNC_JITTER_MS = 1000;

/**
 * How an upload ended, and therefore whether trying again could ever help.
 *
 * - `accepted` — 2xx. Done; the fingerprint may advance.
 * - `retryable` — the request never got a verdict (transport error, timeout) or
 *   got one that says "not now": 408, 425, 429, or any 5xx.
 * - `rejected` — a definitive 4xx. The payload or the credentials are wrong, so
 *   the identical request will be rejected identically; retrying is pure waste.
 *   The fingerprint is NOT advanced, so a server-side fix is picked up on a
 *   later foreground.
 */
export type UploadOutcome = 'accepted' | 'retryable' | 'rejected';

/**
 * Classify one attempt. `null` means the request produced no HTTP status at all
 * — offline, DNS failure, or our own abort on timeout — which is the most
 * common case in an offline-first app and always worth another try.
 */
export function classifyUploadResponse(status: number | null): UploadOutcome {
  if (status === null) return 'retryable';
  if (status >= 200 && status < 300) return 'accepted';
  if (status === 408 || status === 425 || status === 429) return 'retryable';
  if (status >= 500) return 'retryable';
  return 'rejected';
}

/** Is another attempt both allowed and potentially useful? */
export function shouldRetryUpload(outcome: UploadOutcome, attempt: number): boolean {
  return outcome === 'retryable' && attempt < PUSH_SYNC_MAX_ATTEMPTS;
}

/**
 * Backoff before the attempt following `attempt`: exponential (×3), clamped,
 * plus a per-device jitter.
 *
 * The jitter is a hash of the install id, **not** a random number: it still
 * spreads a herd of devices retrying after a server outage across a one-second
 * window, but it is reproducible in a test and needs no entropy source. Same
 * device, same attempt ⇒ same delay, always.
 */
export function retryDelayMs(attempt: number, installId: string): number {
  const exponential = PUSH_SYNC_BASE_DELAY_MS * 3 ** Math.max(0, attempt - 1);
  const clamped = Math.min(exponential, PUSH_SYNC_MAX_DELAY_MS);
  return clamped + (fnv1a(`${installId}:${attempt}`) % PUSH_SYNC_JITTER_MS);
}

/**
 * Drive the attempt/backoff loop.
 *
 * Pure in the sense this folder means it: the two things that touch the world —
 * making a request and waiting — are both parameters, so the whole retry policy
 * is exercised by `tsx --test` with a fake clock and no network. Callers get
 * back the final outcome plus how many attempts it cost.
 *
 * Stops on the first `accepted` or `rejected`; only a `retryable` outcome
 * sleeps and goes round again, at most `PUSH_SYNC_MAX_ATTEMPTS` times total.
 */
export async function runUploadWithRetry(input: {
  /** Perform attempt `n`, resolving to its HTTP status, or `null` if none. */
  attempt: (n: number) => Promise<number | null>;
  sleep: (ms: number) => Promise<void>;
  installId: string;
}): Promise<{ outcome: UploadOutcome; attempts: number }> {
  let outcome: UploadOutcome = 'retryable';
  for (let n = 1; n <= PUSH_SYNC_MAX_ATTEMPTS; n += 1) {
    outcome = classifyUploadResponse(await input.attempt(n));
    if (!shouldRetryUpload(outcome, n)) return { outcome, attempts: n };
    await input.sleep(retryDelayMs(n, input.installId));
  }
  return { outcome, attempts: PUSH_SYNC_MAX_ATTEMPTS };
}

/**
 * EAS project the push token is minted against. Mirrors
 * `app.json` → `expo.extra.eas.projectId`; `pushTokenPure.test.ts` fails if the
 * two drift apart.
 *
 * Passed explicitly rather than read from `expo-constants` at the call site:
 * `getExpoPushTokenAsync` throws without a project id in a bare/dev context,
 * and this repo keeps `expo-constants` out of static module graphs (Jest cannot
 * parse its untranspiled ESM — see `utils/buildFingerprint.ts`).
 */
export const EAS_PROJECT_ID = 'c83547c2-423c-4902-9087-a9ec9879a1f9';

/** Our own stable per-install id. Minted once, never rotated. */
export const INSTALL_ID_KEY = '@vedansh/install-id';

/** Last captured push token, verbatim. */
export const PUSH_TOKEN_KEY = '@vedansh/push-token';

/** Fingerprint of the last registration the server accepted. */
export const PUSH_TOKEN_SYNC_KEY = '@vedansh/push-token-sync';

/**
 * Timeout for a *single* attempt. Deliberately short: this is a fire-and-forget
 * sync, and a request left hanging on a flaky connection holds a socket open
 * for no user-visible benefit. A timeout is not an error worth surfacing — it
 * counts as a retryable attempt, and the next foreground tries again anyway.
 *
 * Worst case for one sync is therefore roughly
 * `PUSH_SYNC_MAX_ATTEMPTS × PUSH_SYNC_TIMEOUT_MS` plus the backoffs (~32 s).
 * Nothing waits on it: the caller is a headless component that ignores the
 * result, and the in-flight guard keeps a foreground burst from stacking syncs.
 */
export const PUSH_SYNC_TIMEOUT_MS = 8000;

/** What a server needs to address and segment one install. */
export type DeviceRegistration = {
  /** Our stable key. */
  installId: string;
  /** `ExponentPushToken[…]` — the address. */
  token: string;
  /** `'ios' | 'android'` in practice; kept open for web/unknown. */
  platform: string;
  /** `app.json` version of the running bundle, or `'unknown'`. */
  appVersion: string;
  /** Reading language (`hi | en | gu | kn`) — push copy should match it. */
  lang: string;
  /** IANA zone, so a server can fire at a sane local hour. */
  timezone: string;
};

export type DeviceRegistrationInput = {
  installId: string;
  token: string;
  platform: string;
  appVersion?: string | null;
  lang?: string | null;
  timezone?: string | null;
};

/** Trim, collapse blanks to a fallback, and bound the length. */
function field(value: string | null | undefined, fallback: string): string {
  const trimmed = (value ?? '').trim();
  return (trimmed === '' ? fallback : trimmed).slice(0, 120);
}

/**
 * Normalise the payload. Every field is bounded and non-empty, so a malformed
 * value can never produce a half-written row on the server side.
 */
export function buildDeviceRegistration(input: DeviceRegistrationInput): DeviceRegistration {
  return {
    installId: field(input.installId, 'unknown'),
    token: field(input.token, 'unknown'),
    platform: field(input.platform, 'unknown'),
    appVersion: field(input.appVersion, 'unknown'),
    lang: field(input.lang, 'hi'),
    timezone: field(input.timezone, 'unknown'),
  };
}

/**
 * Identity of a registration as one string.
 *
 * Compared against the stored fingerprint to decide whether an upload is worth
 * making, so it covers **every** field, not just the token: a language switch or
 * a move across time zones changes how a server should address this install and
 * is exactly as worth re-sending as a rotated token. It is only ever compared
 * for equality — never parsed, ordered, or shown.
 */
export function registrationFingerprint(reg: DeviceRegistration): string {
  return [reg.installId, reg.token, reg.platform, reg.appVersion, reg.lang, reg.timezone].join('|');
}

/** Has anything a server cares about changed since the last accepted upload? */
export function shouldSyncRegistration(
  lastFingerprint: string | null,
  reg: DeviceRegistration
): boolean {
  return lastFingerprint !== registrationFingerprint(reg);
}

/**
 * Is an upload destination configured, and safe to use?
 *
 * `https:` only. A cleartext endpoint would put a push token — which is enough
 * to send a notification to a specific person's phone — on the wire in plain
 * text, and Android's release network config blocks cleartext anyway.
 */
export function isPushRegistryConfigured(endpoint: string | null): endpoint is string {
  if (typeof endpoint !== 'string') return false;
  const trimmed = endpoint.trim();
  return trimmed.startsWith('https://') && trimmed.length > 'https://'.length;
}

/**
 * Mint an install id from the first token we ever captured.
 *
 * Deterministic, not random: an Expo push token is already globally unique per
 * install, so hashing it (twice, with the mint timestamp folded into the second
 * pass so two installs that somehow shared a token still diverge) yields a
 * collision-free key with no entropy source and no native dependency. `now` is
 * a parameter so the suite stays deterministic — the rule every planner in this
 * folder follows.
 *
 * The id is persisted at first capture and then read back forever; it does NOT
 * change when the token rotates, which is the whole point of having it.
 */
export function makeInstallId(seed: string, now: number): string {
  const stamp = Math.floor(now).toString(36);
  const a = fnv1a(seed).toString(36);
  const b = fnv1a(`${stamp}:${seed}`).toString(36);
  return `vd-${stamp}-${a}${b}`;
}

/** Does a stored value look like a usable install id? */
export function isUsableInstallId(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length >= 8;
}
