/**
 * Remote push-token capture: the glue.
 *
 * One job: when the notification permission is *already* granted, read this
 * install's Expo push token, persist it, and (only if an endpoint **and** an API
 * key are configured) register it once. That is the whole feature.
 *
 * ## What this module deliberately does NOT do
 *
 * It is additive by construction — nothing else in the app changes behaviour
 * because it exists:
 *
 * - **Never prompts.** It reads `readNotificationPermissionState()` and stands
 *   down unless the answer is already `granted`. The permission moment stays
 *   owned by `NotificationPreferencesContext` / `RoutineDetailScreen`, and one
 *   grant still covers every family (§38).
 * - **Never schedules or cancels anything.** It does not touch the pending
 *   queue, so the nine local families and the shared iOS 64-pending budget are
 *   untouched.
 * - **Never throws and never blocks.** Every path is wrapped; the only return
 *   value is a status. Offline is the *normal* case for this app, so a failed
 *   upload is silent and simply retried on a later foreground.
 * - **Makes no network call at all** until both an endpoint and an API key are
 *   configured (see `resolvePushEndpoint` / `resolveApiKey`). The token is still
 *   captured locally, so the plumbing is verifiable before any data leaves the
 *   device.
 *
 * ## Server contract
 *
 * `POST <endpoint>`, `content-type: application/json`,
 * `authorization: Bearer <key>`, body = `DeviceIdsBody`:
 *
 * ```json
 * { "deviceIds": ["ExponentPushToken[…]"] }
 * ```
 *
 * The device id is the Expo push token — the address a server pushes to. Once a
 * given id registers successfully the client stores it and never re-sends it
 * (the once-only, local-storage guard); a rotated token is a new id and
 * registers afresh.
 *
 * **The status code is the whole protocol**, because it decides what the client
 * does next (`classifyUploadResponse`):
 *
 * - **2xx** — accepted. The client records the id as registered and stops
 *   calling, so do not return 2xx unless the row is durable.
 * - **5xx / 429 / 408 / 425** — the client retries, up to
 *   `PUSH_SYNC_MAX_ATTEMPTS` with a tripling backoff. Use these for "try again".
 * - **any other 4xx** — the client gives up for this attempt without retrying,
 *   and without recording success. Use these for a malformed or unauthorised
 *   request; a fix on your side is picked up on the user's next foreground.
 *
 * Response bodies are ignored entirely.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { readNotificationPermissionState } from './permissionState';
import {
  EAS_PROJECT_ID,
  INSTALL_ID_KEY,
  PUSH_REGISTRY_ENDPOINT,
  PUSH_SYNC_TIMEOUT_MS,
  PUSH_TOKEN_KEY,
  PUSH_TOKEN_SYNC_KEY,
  buildDeviceIdsBody,
  isUsableInstallId,
  makeInstallId,
  resolveApiKey,
  resolvePushEndpoint,
  runUploadWithRetry,
  shouldRegisterDeviceId,
} from './pushTokenPure';

/**
 * Outcome of one sync attempt. Every value is a normal, expected end state —
 * none of them is an error the user should ever see.
 *
 * - `not-granted` — permission is undetermined or refused. We stood down.
 * - `no-token` — no token available: a simulator, Expo Go, or a build whose
 *   APNs key / FCM service account is not configured on the EAS project.
 * - `captured` — token read and stored locally; no endpoint configured.
 * - `unchanged` — nothing a server cares about moved since the last upload.
 * - `synced` — the endpoint accepted the registration.
 * - `failed` — offline, timed out, or 5xx, after exhausting the retries. The
 *   fingerprint is left unset, so a later foreground tries again.
 * - `rejected` — a definitive 4xx. Not retried within the attempt (the same
 *   request would be rejected the same way), but not remembered either, so a
 *   server-side fix is picked up on a later foreground.
 */
export type PushTokenSyncStatus =
  | 'not-granted'
  | 'no-token'
  | 'captured'
  | 'unchanged'
  | 'synced'
  | 'failed'
  | 'rejected';

export type PushTokenSyncResult = {
  status: PushTokenSyncStatus;
  /** The captured token, when there was one. */
  token: string | null;
};

/**
 * Collapses concurrent callers onto one attempt. The registrar fires on mount,
 * on every foreground, and on a token-rotation event — two of those can land in
 * the same tick, and two in-flight POSTs of the same row is pure waste.
 */
let inFlight: Promise<PushTokenSyncResult> | null = null;

/** Read one AsyncStorage key, tolerating a storage failure. */
async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Write one AsyncStorage key; a failure only costs a redundant retry later. */
async function write(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Non-fatal by design: next launch re-captures and re-uploads.
  }
}

/**
 * Our stable install id, minting it on first use from the supplied seed.
 *
 * Seeded by the first captured token, so this is only ever called once we have
 * one — which is also why the id cannot be minted before a device is
 * push-capable. Nothing else in the app depends on it existing.
 */
export async function getInstallId(seed: string, now: number = Date.now()): Promise<string> {
  const existing = await read(INSTALL_ID_KEY);
  if (isUsableInstallId(existing)) return existing.trim();
  const minted = makeInstallId(seed, now);
  await write(INSTALL_ID_KEY, minted);
  return minted;
}

/** The last token we captured, without doing any work to refresh it. */
export async function getCapturedPushToken(): Promise<string | null> {
  const token = await read(PUSH_TOKEN_KEY);
  return token && token.trim() !== '' ? token : null;
}

/** Ask expo for this install's Expo push token. `null` on any failure. */
async function readExpoPushToken(): Promise<string | null> {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    return typeof data === 'string' && data !== '' ? data : null;
  } catch {
    // Simulator, Expo Go, or missing APNs/FCM credentials on the EAS project.
    return null;
  }
}

/**
 * One POST, bounded by `PUSH_SYNC_TIMEOUT_MS`.
 *
 * Resolves to the HTTP status, or `null` when the request produced none at all
 * (offline, DNS failure, or our own abort on timeout). Classifying that status
 * — and deciding whether another attempt could help — is
 * `classifyUploadResponse`'s job, not this function's.
 */
async function attemptUpload(
  endpoint: string,
  body: string,
  apiKey: string
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PUSH_SYNC_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body,
      signal: controller.signal,
    });
    return typeof response.status === 'number' ? response.status : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Backoff wait. The only clock this module owns. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSync(now: number): Promise<PushTokenSyncResult> {
  // Cheapest gate first, and the one that makes this safe: we only ever act on
  // a grant somebody else already obtained.
  const { status } = await readNotificationPermissionState();
  if (status !== 'granted') return { status: 'not-granted', token: null };

  const token = await readExpoPushToken();
  if (!token) return { status: 'no-token', token: null };

  // Persist first. The token is worth having locally even with no endpoint —
  // it is what makes the capture verifiable on a real device before any upload
  // is switched on.
  await write(PUSH_TOKEN_KEY, token);

  // The full literal reads are required for babel's build-time inlining of
  // EXPO_PUBLIC_* vars — see `PUSH_REGISTRY_ENV_VAR` / the API-key env var.
  const endpoint = resolvePushEndpoint(
    process.env.EXPO_PUBLIC_PUSH_REGISTRY_URL,
    PUSH_REGISTRY_ENDPOINT
  );
  const apiKey = resolveApiKey(process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY);
  // No endpoint or no key ⇒ capture-only: the token is stored locally but never
  // leaves the device (an unauthenticated call would just be rejected anyway).
  if (endpoint === null || apiKey === null) return { status: 'captured', token };

  // The local-storage once-only guard: skip the API entirely once this exact
  // device id has already registered successfully.
  const lastRegistered = await read(PUSH_TOKEN_SYNC_KEY);
  if (!shouldRegisterDeviceId(lastRegistered, token)) return { status: 'unchanged', token };

  const body = JSON.stringify(buildDeviceIdsBody(token));
  const { outcome } = await runUploadWithRetry({
    attempt: () => attemptUpload(endpoint, body, apiKey),
    sleep,
    installId: await getInstallId(token, now),
  });

  if (outcome === 'rejected') return { status: 'rejected', token };
  if (outcome !== 'accepted') return { status: 'failed', token };

  await write(PUSH_TOKEN_SYNC_KEY, token);
  return { status: 'synced', token };
}

/**
 * Capture this install's push token and register it if it is not already
 * registered.
 *
 * Never throws, never prompts, never schedules. Safe to call on every
 * foreground: an already-registered device id costs two AsyncStorage reads and
 * one token read, and no request.
 */
export async function syncPushToken(
  input: { now?: number } = {}
): Promise<PushTokenSyncResult> {
  if (inFlight) return inFlight;
  const attempt = runSync(input.now ?? Date.now())
    .catch((): PushTokenSyncResult => ({ status: 'failed', token: null }))
    .finally(() => {
      inFlight = null;
    });
  inFlight = attempt;
  return attempt;
}

/** Test seam: drop the in-flight guard between suites. */
export function __resetPushTokenSyncState(): void {
  inFlight = null;
}
