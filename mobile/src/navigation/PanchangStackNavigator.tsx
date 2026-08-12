import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PanchangScreen from '@/screens/PanchangScreen';
import ObservanceListScreen from '@/screens/ObservanceListScreen';
import ObservanceDetailScreen from '@/screens/ObservanceDetailScreen';
import KathaLibraryScreen from '@/screens/KathaLibraryScreen';
import MyVratScreen from '@/screens/MyVratScreen';
import MuhuratDetailScreen from '@/screens/MuhuratDetailScreen';
import MuhuratFinderScreen from '@/screens/MuhuratFinderScreen';
import MuhuratResultsScreen from '@/screens/MuhuratResultsScreen';
import MuhuratDayDetailScreen from '@/screens/MuhuratDayDetailScreen';
import AbujhDaysScreen from '@/screens/AbujhDaysScreen';
import KundaliScreen from '@/screens/KundaliScreen';
import RashifalScreen from '@/screens/RashifalScreen';
import GunaMilanScreen from '@/screens/GunaMilanScreen';
import VidhiCatalogScreen from '@/screens/VidhiCatalogScreen';
import VidhiDetailScreen from '@/screens/VidhiDetailScreen';
import VidhiConductScreen from '@/screens/VidhiConductScreen';
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
      <Stack.Screen
        name="MuhuratDetail"
        component={MuhuratDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MuhuratFinder"
        component={MuhuratFinderScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MuhuratResults"
        component={MuhuratResultsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MuhuratDayDetail"
        component={MuhuratDayDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AbujhDays"
        component={AbujhDaysScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Kundali"
        component={KundaliScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Rashifal"
        component={RashifalScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GunaMilan"
        component={GunaMilanScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VidhiCatalog"
        component={VidhiCatalogScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VidhiDetail"
        component={VidhiDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VidhiConduct"
        component={VidhiConductScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
