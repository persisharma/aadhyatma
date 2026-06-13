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
import { ThemeProvider } from '@/theme/ThemeContext';
import { lightColors } from '@/theme/colors';
import { GitaLanguageProvider } from '@/data/gita/language';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import { JapamCounterProvider } from '@/contexts/JapamCounterContext';
import { ReadingProgressProvider } from '@/contexts/ReadingProgressContext';
import { RoutineProvider } from '@/contexts/RoutineContext';
import { RoutineSheetProvider } from '@/contexts/RoutineSheetProvider';
import { UserActivityProvider } from '@/contexts/UserActivityContext';
import { NewContentProvider } from '@/contexts/NewContentContext';
import {
  NotificationPreferencesProvider,
  configureForegroundNotificationHandler,
} from '@/contexts/NotificationPreferencesContext';
import { handleNotificationResponse, navigationRef } from '@/notifications/deepLink';
import ReminderOptInModal from '@/components/ReminderOptInModal';
import UpdateReadyModal from '@/components/UpdateReadyModal';
import RoutineCelebrationOverlay from '@/components/RoutineCelebrationOverlay';
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

  const fontsReady = notoLoaded && cormorantLoaded;

  const onLayout = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

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
      handleNotificationResponse(response);
    });

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      sub.remove();
    };
  }, [fontsReady]);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: lightColors.parchment }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <ThemeProvider>
          <GitaLanguageProvider>
            <BookmarksProvider>
              <UserActivityProvider>
                <NewContentProvider>
                  <ReadingProgressProvider>
                    <JapamCounterProvider>
                      <RoutineProvider>
                      <RoutineSheetProvider>
                      <NotificationPreferencesProvider>
                        <ShareProvider>
                          <View style={{ flex: 1 }}>
                            <NavigationContainer ref={navigationRef}>
                              <StatusBar style="dark" />
                              <RootNavigator />
                              <ReminderOptInModal />
                              <UpdateReadyModal />
                            </NavigationContainer>
                            <RoutineCelebrationOverlay />
                          </View>
                        </ShareProvider>
                      </NotificationPreferencesProvider>
                      </RoutineSheetProvider>
                      </RoutineProvider>
                    </JapamCounterProvider>
                  </ReadingProgressProvider>
                </NewContentProvider>
              </UserActivityProvider>
            </BookmarksProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
