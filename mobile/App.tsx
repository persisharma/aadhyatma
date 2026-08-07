import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import SadhanaReminderScheduler from '@/components/SadhanaReminderScheduler';
import DailyVerseAngaBridge from '@/components/DailyVerseAngaBridge';
import MiniPlayer from '@/components/audio/MiniPlayer';
import NowPlayingScreen from '@/screens/audio/NowPlayingScreen';
import { ShareProvider } from '@/utils/shareVerse';
import RootNavigator from '@/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop — already prevented */
});

// One-time global setup: foreground notification presentation.
configureForegroundNotificationHandler();

export default function App() {
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

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: lightColors.parchment }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider>
            <AudioPlayerProvider>
            <BookmarksProvider>
              <VratFollowProvider>
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
                            <SadhanaReminderScheduler />
                            {/* Feeds the daily-verse scheduler each fire day's
                                tithi/vrat for its title. Must stay inside
                                PanchangLocationProvider — the notification
                                provider itself sits above it. */}
                            <DailyVerseAngaBridge />
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
              </VratFollowProvider>
            </BookmarksProvider>
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
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
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
