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
 * Where a captured token is POSTed. `null` ⇒ capture-only: the token is still
 * read and persisted locally (readable via `getCapturedPushToken()`), but the
 * app makes **no network call at all**. That is the shipped default — this repo
 * has no backend yet, and Vedansh is otherwise a fully offline app, so the
 * upload has to be switched on deliberately.
 *
 * Must be `https:` when set — see `isPushRegistryConfigured`.
 */
export const PUSH_REGISTRY_ENDPOINT: string | null = null;

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
 * Upload timeout. Deliberately short: this is a fire-and-forget sync, and a
 * request left hanging on a flaky connection holds a socket open for no
 * user-visible benefit. A timeout is not an error worth surfacing — the next
 * foreground retries.
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
