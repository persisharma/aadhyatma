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
import GocharScreen from '@/screens/GocharScreen';
import KundaliReportScreen from '@/screens/KundaliReportScreen';
import GunaMilanScreen from '@/screens/GunaMilanScreen';
import NamkaranScreen from '@/screens/NamkaranScreen';
import NamkaranResultScreen from '@/screens/NamkaranResultScreen';
import NamkaranRashiScreen from '@/screens/NamkaranRashiScreen';
import VastuDishaScreen from '@/screens/VastuDishaScreen';
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
      {/* वास्तु दिशा (PRD-24) — pushed in place by the griha-pravesh door. */}
      <Stack.Screen
        name="VastuDisha"
        component={VastuDishaScreen}
        options={{ animation: 'slide_from_right' }}
      />
      {/* मेरा घर (PRD-24 Phase 2) — the griha-pravesh result's door pushes the
       * journey in place here so Back returns to the muhurat result. require()
       * thunks keep the journey off the static launch graph (launchGraph budget). */}
      {/* eslint-disable @typescript-eslint/no-require-imports */}
      <Stack.Screen
        name="GharVastuRoster"
        getComponent={() => require('@/screens/GharVastuRosterScreen').default}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GharVastuSetup"
        getComponent={() => require('@/screens/GharVastuSetupScreen').default}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GharVastu"
        getComponent={() => require('@/screens/GharVastuScreen').default}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GharVastuCompare"
        getComponent={() => require('@/screens/GharVastuCompareScreen').default}
        options={{ animation: 'slide_from_right' }}
      />
      {/* eslint-enable @typescript-eslint/no-require-imports */}
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
        name="Gochar"
        component={GocharScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="KundaliReport"
        component={KundaliReportScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GunaMilan"
        component={GunaMilanScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Namkaran"
        component={NamkaranScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="NamkaranResult"
        component={NamkaranResultScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="NamkaranRashi"
        component={NamkaranRashiScreen}
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
