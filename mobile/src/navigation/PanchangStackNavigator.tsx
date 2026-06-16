import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PanchangScreen from '@/screens/PanchangScreen';
import ObservanceListScreen from '@/screens/ObservanceListScreen';
import ObservanceDetailScreen from '@/screens/ObservanceDetailScreen';
import KathaLibraryScreen from '@/screens/KathaLibraryScreen';
import MyVratScreen from '@/screens/MyVratScreen';
import type { PanchangStackParamList } from './types';

const Stack = createNativeStackNavigator<PanchangStackParamList>();

// The Panchang tab is a stack so the "Vrat & Parv" catalog journey
// (list → detail) pushes within the tab instead of jumping to Home. The
// katha reader itself still lives in HomeStack; "Read Katha" routes there.
export default function PanchangStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PanchangHome" component={PanchangScreen} />
      <Stack.Screen
        name="ObservanceList"
        component={ObservanceListScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ObservanceDetail"
        component={ObservanceDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="KathaLibrary"
        component={KathaLibraryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MyVrat"
        component={MyVratScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
