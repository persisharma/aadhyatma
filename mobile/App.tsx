import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useNotoFonts,
  NotoSerifDevanagari_500Medium,
  NotoSerifDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-serif-devanagari';
import {
  useFonts as useCormorantFonts,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import { ThemeProvider } from '@/theme/ThemeContext';
import { lightColors } from '@/theme/colors';
import RootNavigator from '@/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop — already prevented */
});

export default function App() {
  const [notoLoaded] = useNotoFonts({
    NotoSerifDevanagari_500Medium,
    NotoSerifDevanagari_600SemiBold,
  });
  const [cormorantLoaded] = useCormorantFonts({
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold_Italic,
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

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: lightColors.parchment }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
