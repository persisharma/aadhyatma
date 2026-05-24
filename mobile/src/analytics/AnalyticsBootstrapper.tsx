import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import * as Application from 'expo-application';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import {
  toDateKey,
  useUserActivity,
} from '@/contexts/UserActivityContext';
import {
  getAnalyticsClient,
  getAnonId,
  getInstallMetadata,
  getLastPushTimestamp,
  markPushed,
} from './client';
import { buildSadhakSnapshot, type SnapshotInput } from './snapshot';

const MIN_PUSH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes between identifies

function platformName(): SnapshotInput['platform'] {
  const os = Platform.OS;
  if (os === 'ios' || os === 'android' || os === 'web' || os === 'macos' || os === 'windows') {
    return os;
  }
  return 'web';
}

export function AnalyticsBootstrapper() {
  const { lang } = useGitaLanguage();
  const { mode } = useTheme();
  const { bookmarks, isLoading: bookmarksLoading } = useBookmarks();
  const { progress, isLoading: progressLoading } = useReadingProgress();
  const { prefs, isLoading: notifLoading } = useNotificationPreferences();
  const {
    isLoading: activityLoading,
    lifetimeTotals,
    dayTotals,
    activeDateKeys,
    currentStreak,
    longestStreak,
    activeDaysInLastN,
  } = useUserActivity();

  const ready =
    !activityLoading && !bookmarksLoading && !progressLoading && !notifLoading;

  // Latest values via ref so the AppState listener — registered once — sees
  // current data without re-subscribing on every re-render.
  const buildAndPush = useRef<() => Promise<void>>(async () => undefined);
  buildAndPush.current = async () => {
    const client = await getAnalyticsClient();
    if (!client) return;

    const now = Date.now();
    const lastPush = await getLastPushTimestamp();
    if (now - lastPush < MIN_PUSH_INTERVAL_MS) return;

    const todayDate = toDateKey(new Date());
    const appVersion = Application.nativeApplicationVersion ?? 'unknown';
    const { installDate, installAppVersion } = await getInstallMetadata(
      todayDate,
      appVersion
    );

    const lifetime = lifetimeTotals();
    const today = dayTotals(todayDate);
    const dayKeys = activeDateKeys();
    const lastActive = dayKeys.length > 0 ? dayKeys[dayKeys.length - 1] : null;

    const bookmarksPerSource: Record<string, number> = {};
    for (const b of bookmarks) {
      bookmarksPerSource[b.sourceId] = (bookmarksPerSource[b.sourceId] ?? 0) + 1;
    }

    const startedIds = new Set(Object.keys(progress));

    const input: SnapshotInput = {
      installDate,
      installAppVersion,
      appVersion,
      platform: platformName(),
      lang,
      todayDate,

      currentStreak: currentStreak(),
      longestStreak: longestStreak(),
      activeDaysLifetime: dayKeys.length,
      activeDaysLast7: activeDaysInLastN(7),
      activeDaysLast30: activeDaysInLastN(30),
      lastActiveDate: lastActive,

      lifetime,
      today,

      bookmarkCount: bookmarks.length,
      bookmarksPerSource,

      sourcesStarted: startedIds.size,

      reminderEnabled: prefs.dailyVerseEnabled,
      reminderHour: prefs.dailyVerseEnabled ? prefs.time.hour : null,
      theme: mode,
    };

    const snapshot = buildSadhakSnapshot(input);
    const anonId = await getAnonId();
    client.identify(anonId, snapshot);
    await markPushed(now);
  };

  // Fire once when every dependency context has hydrated.
  useEffect(() => {
    if (!ready) return;
    buildAndPush.current().catch(() => undefined);
  }, [ready]);

  // Re-push on foreground transitions, throttled to MIN_PUSH_INTERVAL_MS.
  useEffect(() => {
    if (!ready) return undefined;
    const appStateRef = { current: AppState.currentState as AppStateStatus };
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') {
        buildAndPush.current().catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, [ready]);

  return null;
}
