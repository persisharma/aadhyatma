import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import PostHog from 'posthog-react-native';

const ANON_ID_KEY = '@vedansh/anon-id';
const INSTALL_DATE_KEY = '@vedansh/install-date';
const INSTALL_VERSION_KEY = '@vedansh/install-app-version';
const OPT_OUT_KEY = '@vedansh/analytics-opt-out';
const LAST_PUSH_KEY = '@vedansh/analytics-last-push';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let clientPromise: Promise<PostHog | null> | null = null;
let optedOut = false;

async function readOptOut(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(OPT_OUT_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setAnalyticsOptOut(next: boolean): Promise<void> {
  optedOut = next;
  await AsyncStorage.setItem(OPT_OUT_KEY, next ? '1' : '0').catch(() => undefined);
}

/**
 * Lazily initialize the PostHog client. Returns null when no API key is
 * configured (e.g. local dev without `.env`) or when the user has opted out.
 */
export async function getAnalyticsClient(): Promise<PostHog | null> {
  if (!POSTHOG_KEY) return null;
  if (clientPromise) return clientPromise;
  clientPromise = (async () => {
    optedOut = await readOptOut();
    if (optedOut) return null;
    const client = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      // We push aggregated snapshots, not raw events — small batches are fine.
      flushAt: 1,
      flushInterval: 30_000,
      // We control identify() timing ourselves; don't autocapture lifecycle.
      captureAppLifecycleEvents: false,
    });
    await client.ready().catch(() => undefined);
    return client;
  })();
  return clientPromise;
}

export async function getAnonId(): Promise<string> {
  const existing = await AsyncStorage.getItem(ANON_ID_KEY).catch(() => null);
  if (existing) return existing;
  const fresh = Crypto.randomUUID();
  await AsyncStorage.setItem(ANON_ID_KEY, fresh).catch(() => undefined);
  return fresh;
}

/**
 * Returns the YYYY-MM-DD date the user first launched a build that recorded
 * this metadata. Set once and never updated. Backfilled to today on first
 * read so old installs without the key still get a stable cohort date.
 */
export async function getInstallMetadata(
  todayKey: string,
  appVersion: string
): Promise<{ installDate: string; installAppVersion: string }> {
  const [storedDate, storedVersion] = await Promise.all([
    AsyncStorage.getItem(INSTALL_DATE_KEY).catch(() => null),
    AsyncStorage.getItem(INSTALL_VERSION_KEY).catch(() => null),
  ]);
  const installDate = storedDate ?? todayKey;
  const installAppVersion = storedVersion ?? appVersion;
  if (!storedDate) {
    AsyncStorage.setItem(INSTALL_DATE_KEY, installDate).catch(() => undefined);
  }
  if (!storedVersion) {
    AsyncStorage.setItem(INSTALL_VERSION_KEY, installAppVersion).catch(
      () => undefined
    );
  }
  return { installDate, installAppVersion };
}

export async function getLastPushTimestamp(): Promise<number> {
  const raw = await AsyncStorage.getItem(LAST_PUSH_KEY).catch(() => null);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export async function markPushed(at: number): Promise<void> {
  await AsyncStorage.setItem(LAST_PUSH_KEY, String(at)).catch(() => undefined);
}
