import React, { useCallback, useEffect } from 'react';
import { InteractionManager, Linking, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts as useNotoFonts,
  NotoSerifDevanagari_500Medium,
  NotoSerifDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-serif-devanagari';
import {
  useFonts as useCormorantFonts,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  useFonts as useGujaratiFonts,
  NotoSerifGujarati_500Medium,
  NotoSerifGujarati_600SemiBold,
} from '@expo-google-fonts/noto-serif-gujarati';
import {
  useFonts as useKannadaFonts,
  NotoSerifKannada_500Medium,
  NotoSerifKannada_600SemiBold,
} from '@expo-google-fonts/noto-serif-kannada';
import {
  useFonts as useInterFonts,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider, useFontScale } from '@/contexts/FontScaleContext';
import { lightColors } from '@/theme/colors';
import { GitaLanguageProvider, useGitaLanguage } from '@/data/gita/language';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import { VratFollowProvider } from '@/contexts/VratFollowContext';
import { MuhuratFollowProvider } from '@/contexts/MuhuratFollowContext';
import { PitruSmaranProvider } from '@/contexts/PitruSmaranContext';
import { JapamCounterProvider } from '@/contexts/JapamCounterContext';
import { JapamAlarmsProvider } from '@/contexts/JapamAlarmsContext';
import { registerNativeAlarmForegroundHandler } from '@/notifications/japamAlarmNative';
import { maybeHandleJapamSnoozeResponse } from '@/notifications/japamAlarmScheduler';
import { JAPAM_SNOOZE_ACTION_ID } from '@/notifications/japamAlarms';
import { ReadingProgressProvider } from '@/contexts/ReadingProgressContext';
import { RoutineProvider } from '@/contexts/RoutineContext';
import { SadhanaProvider } from '@/contexts/SadhanaContext';
import { RoutineSheetProvider } from '@/contexts/RoutineSheetProvider';
import { UserActivityProvider } from '@/contexts/UserActivityContext';
import { NewContentProvider } from '@/contexts/NewContentContext';
import {
  NotificationPreferencesProvider,
  configureForegroundNotificationHandler,
} from '@/contexts/NotificationPreferencesContext';
import { PanchangLocationProvider } from '@/contexts/PanchangLocationContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { ReadAloudPrefsProvider } from '@/contexts/ReadAloudPrefsContext';
import { ReadAloudProvider } from '@/contexts/ReadAloudContext';
import { handleNotificationResponse, navigationRef } from '@/notifications/deepLink';
import ReminderOptInModal from '@/components/ReminderOptInModal';
import UpdateReadyModal from '@/components/UpdateReadyModal';
import FeatureTour from '@/components/FeatureTour';
import OnboardingSetupSheet from '@/components/OnboardingSetupSheet';
import WhatsNewModal from '@/components/WhatsNewModal';
import RatingPromptSheet from '@/components/RatingPromptSheet';
import { TourProvider } from '@/contexts/TourContext';
import { RatingPromptProvider } from '@/contexts/RatingPromptContext';
import RoutineCelebrationOverlay from '@/components/RoutineCelebrationOverlay';
import SadhanaCompletionOverlay from '@/components/SadhanaCompletionOverlay';
import VratReminderScheduler from '@/components/VratReminderScheduler';
import MuhuratReminderScheduler from '@/components/MuhuratReminderScheduler';
import FestiveReminderScheduler from '@/components/FestiveReminderScheduler';
import PitruSmaranReminderScheduler from '@/components/PitruSmaranReminderScheduler';
import SadhanaReminderScheduler from '@/components/SadhanaReminderScheduler';
import DailyVerseAngaBridge from '@/components/DailyVerseAngaBridge';
import MiniPlayer from '@/components/audio/MiniPlayer';
import NowPlayingScreen from '@/screens/audio/NowPlayingScreen';
import { ShareProvider } from '@/utils/shareVerse';
import { currentBuildFingerprint } from '@/utils/buildFingerprint';
import { resetDerivedCachesIfBuildChanged } from '@/utils/derivedCacheReset';
import { prefetchTodayPanchang } from '@/panchang/panchangLaunchPrefetch';
import RootNavigator from '@/navigation/RootNavigator';
import WidgetCoordinator from '@/widgets/WidgetCoordinator';
import { retryWidgetDeepLink } from '@/widgets/deepLink';
import { launchMark, launchMarkOnce } from '@/utils/launchTrace';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop — already prevented */
});

// One-time global setup: foreground notification presentation.
configureForegroundNotificationHandler();

// Drop the derived caches (panchang day solves, observance year scans, the widget
// dedupe key) when the running build changes — a store update or an OTA — so a bug
// baked into cached data cannot outlive the release that fixes it. Nothing the user
// authored is touched; see `derivedCacheReset` for the allowlist and the exclusions.
//
// MODULE SCOPE, not an effect: the caches await this before touching storage, and
// registering it here is what guarantees it is in flight before React renders
// anything that hydrates. Fire-and-forget — it never rejects.
void resetDerivedCachesIfBuildChanged(currentBuildFingerprint());

// Read the panchang preferences and pull today's persisted day solves into memory
// NOW, concurrently with the splash gate below rather than behind it. Home's
// `आज का पंचांग` card is the one thing on that screen which cannot render from
// bundled JS, and its read used to be the launch's third serial storage round
// trip — after the font/language gate, then after the calendar-system preference
// that only a mounted Home subscribed to. Starting it here is what lets the
// headline paint with the rest of Home instead of two round trips later.
//
// MODULE SCOPE for the same reason as the reset above: it has to be in flight
// before React renders anything that reads it. Fire-and-forget, hydrate-only
// (never a solve), and it never rejects — nothing waits on it and a lost race
// just leaves the hooks on the path they already take.
void prefetchTodayPanchang();

launchMark('app-module-body');

// The idle mark lives here rather than in `launchTrace` (which imports nothing on
// purpose) — it is the moment everything gated on `runAfterInteractions` is
// finally allowed to run, so a late one indicts whatever held the thread.
InteractionManager.runAfterInteractions(() => launchMark('first-ui-idle'));

export default function App() {
  launchMarkOnce('app-render');
  const [notoLoaded] = useNotoFonts({
    NotoSerifDevanagari_500Medium,
    NotoSerifDevanagari_600SemiBold,
  });
  const [cormorantLoaded] = useCormorantFonts({
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
  });
  const [gujaratiLoaded] = useGujaratiFonts({
    NotoSerifGujarati_500Medium,
    NotoSerifGujarati_600SemiBold,
  });
  const [kannadaLoaded] = useKannadaFonts({
    NotoSerifKannada_500Medium,
    NotoSerifKannada_600SemiBold,
  });
  const [interLoaded] = useInterFonts({
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fontsReady =
    notoLoaded && cormorantLoaded && gujaratiLoaded && kannadaLoaded && interLoaded;
  if (fontsReady) launchMarkOnce('fonts-ready');

  // Wire notification taps to deep-link navigation. Handles both:
  //  (a) Cold start — app was killed; iOS launches us with the tap response,
  //      pulled via `getLastNotificationResponseAsync()`.
  //  (b) Warm start — app already running; subscribe via
  //      `addNotificationResponseReceivedListener`.
  // The handler is a no-op until `navigationRef.isReady()` so we don't lose
  // taps that arrive before navigation has mounted.
  useEffect(() => {
    if (!fontsReady) return undefined;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (cancelled || !response) return;
        // Defer until NavigationContainer marks itself ready, but bound the
        // retry — if navigation never readies in ~5 s, give up rather than
        // spinning forever.
        let attempts = 0;
        // Snooze taps are handled ONLY by the live listener below. The
        // cold-start "last response" can be an hours-old tap replayed on an
        // unrelated launch; re-executing it would schedule a phantom ring
        // 5 minutes after app open. Ignore it here (don't navigate either).
        if (response.actionIdentifier === JAPAM_SNOOZE_ACTION_ID) return;
        const tryHandle = () => {
          if (cancelled) return;
          if (handleNotificationResponse(response)) return;
          if (attempts >= 50) return;
          attempts += 1;
          timeoutId = setTimeout(tryHandle, 100);
        };
        tryHandle();
      })
      .catch(() => undefined);

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (maybeHandleJapamSnoozeResponse(response)) return;
      handleNotificationResponse(response);
    });

    const unregisterNotifee = registerNativeAlarmForegroundHandler();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      sub.remove();
      unregisterNotifee();
    };
  }, [fontsReady]);

  // WidgetKit/AppWidget taps arrive as ordinary app links. Retry a cold-start
  // URL briefly until the navigation container is ready; warm links dispatch
  // immediately through the same validated parser.
  useEffect(() => {
    if (!fontsReady) return undefined;
    let cancelled = false;
    const cancellations = new Set<() => void>();
    const route = (url: string) => {
      if (cancelled) return;
      const cancel = retryWidgetDeepLink(url);
      cancellations.add(cancel);
    };
    Linking.getInitialURL().then((url) => { if (url?.startsWith('vedansh://widget/')) route(url); }).catch(() => undefined);
    const sub = Linking.addEventListener('url', ({ url }) => { if (url.startsWith('vedansh://widget/')) route(url); });
    return () => { cancelled = true; cancellations.forEach((cancel) => cancel()); cancellations.clear(); sub.remove(); };
  }, [fontsReady]);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: lightColors.parchment }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* `initialMetrics` is the launch-jerk fix, not an optimization to trim.
          Without it the provider renders NOTHING until the first native inset
          event crosses the (busy) launch JS thread, and the whole tree then
          mounts on whatever that first event carried — on Android cold starts
          under edge-to-edge that can be a pre-attach zero, so Home painted
          flush under the status bar, sat frozen behind the mount burst, and
          lurched down by the status-bar height when the corrected insets
          finally applied. Seeding from the native module's constants gives the
          first committed frame its final insets, so any later inset event is a
          no-op instead of a visible reflow. */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider>
            <AudioPlayerProvider>
            {/* Read-aloud needs the reading language and its own prefs; it sits
                inside AudioPlayerProvider so both register with the playback
                arbiter that keeps recorded audio and TTS mutually exclusive. */}
            <ReadAloudPrefsProvider>
            <ReadAloudProvider>
            <BookmarksProvider>
              <VratFollowProvider>
              {/* Dated one-shot muhurat follows (PRD-16 §6.7). Sibling of the
                  vrat store, not a reuse: the key is (occasion, civil day). */}
              <MuhuratFollowProvider>
              {/* पितृ स्मरण entries (PRD-17) — device-only AsyncStorage, no sync. */}
              <PitruSmaranProvider>
              <UserActivityProvider>
                <NewContentProvider>
                  <ReadingProgressProvider>
                    <JapamCounterProvider>
                      <RoutineProvider>
                      <SadhanaProvider>
                      <RoutineSheetProvider>
                      <NotificationPreferencesProvider>
                        <JapamAlarmsProvider>
                        <PanchangLocationProvider>
                        <TourProvider>
                        {/* Inside TourProvider + NotificationPreferencesProvider:
                            the rating gate reads their "a surface is already
                            asking" flags so prompts can't stack (§54). */}
                        <RatingPromptProvider>
                        <ShareProvider>
                          <AppReadyGate>
                          <View style={{ flex: 1 }}>
                            <NavigationContainer ref={navigationRef}>
                              <StatusBar style="dark" />
                              <RootNavigator />
                              <ReminderOptInModal />
                              <UpdateReadyModal />
                              <WhatsNewModal />
                            </NavigationContainer>
                            <RoutineCelebrationOverlay />
                            <SadhanaCompletionOverlay />
                            <VratReminderScheduler />
                            {/* Muhurat follows (PRD-16 §6.7). Must stay inside
                                PanchangLocationProvider: every window is
                                sunrise-derived, so it re-derives them (and
                                re-arms) on a location/calendar-system change. */}
                            <MuhuratReminderScheduler />
                            {/* Default-on festival pushes. Below
                                NotificationPreferencesProvider for the pref +
                                shared permission grant; needs no panchang
                                location (festival dates come from the bundled
                                precomputed table). */}
                            <FestiveReminderScheduler />
                            <PitruSmaranReminderScheduler />
                            <SadhanaReminderScheduler />
                            {/* Feeds the daily-verse scheduler each fire day's
                                tithi/vrat for its title. Must stay inside
                                PanchangLocationProvider — the notification
                                provider itself sits above it. */}
                            <DailyVerseAngaBridge />
                            <WidgetCoordinator />
                            <MiniPlayer />
                            <NowPlayingScreen />
                            {/* Top-level so the spotlight overlays the tab bar +
                                mini-player, and is in-tree (not a Modal) so it can
                                ring the live UI and stay visible to a11y/Maestro. */}
                            <FeatureTour />
                            {/* Opens the moment the tour closes on a fresh
                                install (or a replay) — language + reading size,
                                the two settings the last tour steps point at. */}
                            <OnboardingSetupSheet />
                          {/* Last in the stack: the rating ask never competes
                              with the tour, onboarding, or What's New — its gate
                              stands down while any of those want the screen. */}
                          <RatingPromptSheet />
                          </View>
                          </AppReadyGate>
                        </ShareProvider>
                        </RatingPromptProvider>
                        </TourProvider>
                        </PanchangLocationProvider>
                        </JapamAlarmsProvider>
                      </NotificationPreferencesProvider>
                      </RoutineSheetProvider>
                      </SadhanaProvider>
                      </RoutineProvider>
                    </JapamCounterProvider>
                  </ReadingProgressProvider>
                </NewContentProvider>
              </UserActivityProvider>
              </PitruSmaranProvider>
              </MuhuratFollowProvider>
              </VratFollowProvider>
            </BookmarksProvider>
            </ReadAloudProvider>
            </ReadAloudPrefsProvider>
            </AudioPlayerProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
        </FontScaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Font-size and language preferences both change Home geometry. Keep the native
 * splash in place until those two layout-critical reads finish, so Home's first
 * visible frame is already its final frame and an immediate press cannot be
 * cancelled by preference hydration moving the category grid.
 */
function AppReadyGate({ children }: { children: React.ReactNode }) {
  const { isLoading: fontScaleLoading } = useFontScale();
  const { isLoading: languageLoading } = useGitaLanguage();
  const ready = !fontScaleLoading && !languageLoading;
  const hideSplash = useCallback(() => {
    if (!ready) return;
    launchMarkOnce('splash-hidden (first frame)');
    SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: lightColors.parchment }} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={hideSplash}>
      {children}
    </View>
  );
}
