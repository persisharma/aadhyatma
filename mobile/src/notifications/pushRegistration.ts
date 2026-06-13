/**
 * Expo Push token registration.
 *
 * Flow:
 *   1. Caller (app boot) calls `registerForRemotePushAsync()`.
 *   2. We confirm notification permission is granted (don't re-prompt — that's
 *      the daily-verse opt-in's job) and skip if not.
 *   3. Fetch the device's Expo Push token. This requires the EAS project ID
 *      (already in app.json) and a real device — `null` on simulators / Expo Go.
 *   4. Upsert the token into Supabase via REST so the send script can pick
 *      it up later. We compare against an AsyncStorage cursor so a relaunch
 *      with the same token is a no-op.
 *
 * Failures are swallowed and logged — push registration is best-effort and
 * must never break app boot.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const LAST_TOKEN_KEY = '@vedansh/last-registered-push-token';

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const url = typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl.trim() : '';
  const anonKey =
    typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey.trim() : '';
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function getProjectId(): string | null {
  const fromEas = Constants.expoConfig?.extra?.eas?.projectId;
  const fromEasConfig = (Constants as unknown as { easConfig?: { projectId?: string } })
    .easConfig?.projectId;
  return (
    (typeof fromEas === 'string' && fromEas) ||
    (typeof fromEasConfig === 'string' && fromEasConfig) ||
    null
  );
}

async function fetchExpoPushToken(): Promise<string | null> {
  const projectId = getProjectId();
  if (!projectId) return null;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    return result.data;
  } catch {
    // Expo Go (SDK 53+), simulators, missing native module — all land here.
    return null;
  }
}

async function upsertToken(
  cfg: { url: string; anonKey: string },
  token: string
): Promise<boolean> {
  const body = [
    {
      token,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version ?? null,
      expo_runtime: Constants.expoConfig?.runtimeVersion ?? null,
      last_seen_at: new Date().toISOString(),
    },
  ];

  try {
    const res = await fetch(`${cfg.url}/rest/v1/push_tokens?on_conflict=token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        // PostgREST upsert semantics: replace on conflict.
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Best-effort: fetch the Expo Push token for this device and upsert it into
 * Supabase. Returns the token on success, `null` if we couldn't register
 * (no permission, no project id, dev build, network error, or Supabase not
 * configured yet).
 */
export async function registerForRemotePushAsync(): Promise<string | null> {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;

  // Don't re-prompt — caller (daily-verse opt-in) handles the ask.
  const perms = await Notifications.getPermissionsAsync();
  if (perms.status !== 'granted') return null;

  const token = await fetchExpoPushToken();
  if (!token) return null;

  try {
    const lastRegistered = await AsyncStorage.getItem(LAST_TOKEN_KEY);
    if (lastRegistered === token) return token;
  } catch {
    // Cursor read failed — proceed to upsert anyway, server-side is idempotent.
  }

  const ok = await upsertToken(cfg, token);
  if (ok) {
    await AsyncStorage.setItem(LAST_TOKEN_KEY, token).catch(() => undefined);
  }
  return ok ? token : null;
}

/**
 * Forget the locally-cached token so the next `registerForRemotePushAsync`
 * call writes a fresh row. Useful from a "reset" debug control — not wired
 * to UI yet.
 */
export async function clearCachedPushTokenAsync(): Promise<void> {
  await AsyncStorage.removeItem(LAST_TOKEN_KEY).catch(() => undefined);
}
