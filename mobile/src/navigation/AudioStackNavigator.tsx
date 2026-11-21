import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AudioLibraryScreen from '@/screens/audio/AudioLibraryScreen';
import { lazyScreen } from './lazyScreen';
import type { AudioStackParamList } from './types';

const Stack = createNativeStackNavigator<AudioStackParamList>();

// The bhajan text shelf is shared with the Home stack (RULEBOOK §6.0.1): its
// door is here, but search, deity pages, routines and resume open it on Home.
const BhajanListScreen = lazyScreen('BhajanList', 2, () => import('@/screens/BhajanListScreen'));
const BhajanReaderScreen = lazyScreen('BhajanReader', 3, () => import('@/screens/BhajanReaderScreen'));

// Root of the Audio bottom tab (prototype 'tab'/'both' entry styles). The
// now-playing surface is a root overlay driven by AudioPlayerContext, so it
// isn't a screen here.
export default function AudioStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AudioLibrary" component={AudioLibraryScreen} />
      <Stack.Screen name="BhajanList" component={BhajanListScreen} />
      <Stack.Screen
        name="BhajanReader"
        component={BhajanReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
