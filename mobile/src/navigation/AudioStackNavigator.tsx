import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AudioLibraryScreen from '@/screens/audio/AudioLibraryScreen';
import type { AudioStackParamList } from './types';

const Stack = createNativeStackNavigator<AudioStackParamList>();

// Root of the Audio bottom tab (prototype 'tab'/'both' entry styles). The
// now-playing surface is a root overlay driven by AudioPlayerContext, so it
// isn't a screen here.
export default function AudioStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AudioLibrary" component={AudioLibraryScreen} />
    </Stack.Navigator>
  );
}
