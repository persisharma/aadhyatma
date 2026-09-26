import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
/** Defer App's module graph: short-text registries can read only after DB import. */
export default function LibraryBootstrap() {
  const [App, setApp] = useState<React.ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    async function boot() {
      await require('./content.native').initializeLibrary();
      const ReadyApp = require('../../App').default;
      if (!cancelled) setApp(() => ReadyApp);
    }
    boot().catch((error) => {
      console.error('Library initialization failed', error);
      if (!cancelled) {
        setFailed(true);
        void SplashScreen.hideAsync();
      }
    });
    return () => { cancelled = true; };
  }, [attempt]);
  if (App) return <App />;
  return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF8EE',padding:24}}>
    {failed ? <>
      <Text accessibilityRole="alert">The library could not open. Please try again.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Retry opening library" onPress={() => setAttempt((n) => n+1)} style={{padding:20}}>
        <Text>Try again</Text>
      </Pressable>
    </> : <ActivityIndicator accessibilityLabel="Opening library" color="#B8621B" />}
  </View>;
}
