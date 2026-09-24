import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PanchangScreen from '@/screens/PanchangScreen';
import { lazyScreen } from './lazyScreen';
import type { PanchangStackParamList } from './types';

/**
 * The Panchang stack is itself already behind a dynamic boundary
 * (`lazyPanchangStack`), so this is the second tier: the tab root arrives with
 * the chunk and its ~30 sub-screens load on demand, warmed in the background.
 */

// depth 3
const AbujhDaysScreen = lazyScreen('AbujhDays', 3, () => import('@/screens/AbujhDaysScreen'));
const DaanLedgerScreen = lazyScreen('DaanLedger', 3, () => import('@/screens/DaanLedgerScreen'));
const GocharScreen = lazyScreen('Gochar', 3, () => import('@/screens/GocharScreen'));
const GunaMilanScreen = lazyScreen('GunaMilan', 3, () => import('@/screens/GunaMilanScreen'));
const KathaLibraryScreen = lazyScreen('KathaLibrary', 3, () => import('@/screens/KathaLibraryScreen'));
const KundaliScreen = lazyScreen('Kundali', 3, () => import('@/screens/KundaliScreen'));
const MuhuratDetailScreen = lazyScreen('MuhuratDetail', 3, () => import('@/screens/MuhuratDetailScreen'));
const MuhuratFinderScreen = lazyScreen('MuhuratFinder', 3, () => import('@/screens/MuhuratFinderScreen'));
const MyVratScreen = lazyScreen('MyVrat', 3, () => import('@/screens/MyVratScreen'));
const NamkaranScreen = lazyScreen('Namkaran', 3, () => import('@/screens/NamkaranScreen'));
const ObservanceDetailScreen = lazyScreen('ObservanceDetail', 3, () => import('@/screens/ObservanceDetailScreen'));
const ObservanceListScreen = lazyScreen('ObservanceList', 3, () => import('@/screens/ObservanceListScreen'));
const RashifalScreen = lazyScreen('Rashifal', 3, () => import('@/screens/RashifalScreen'));
const VidhiCatalogScreen = lazyScreen('VidhiCatalog', 3, () => import('@/screens/VidhiCatalogScreen'));
const VidhiDetailScreen = lazyScreen('VidhiDetail', 3, () => import('@/screens/VidhiDetailScreen'));

// depth 4
const DaanJourneyScreen = lazyScreen('DaanJourney', 4, () => import('@/screens/DaanJourneyScreen'));
const KundaliReportScreen = lazyScreen('KundaliReport', 4, () => import('@/screens/KundaliReportScreen'));
const MuhuratDayDetailScreen = lazyScreen('MuhuratDayDetail', 4, () => import('@/screens/MuhuratDayDetailScreen'));
const MuhuratResultsScreen = lazyScreen('MuhuratResults', 4, () => import('@/screens/MuhuratResultsScreen'));
const NamkaranRashiScreen = lazyScreen('NamkaranRashi', 4, () => import('@/screens/NamkaranRashiScreen'));
const NamkaranResultScreen = lazyScreen('NamkaranResult', 4, () => import('@/screens/NamkaranResultScreen'));
const VidhiConductScreen = lazyScreen('VidhiConduct', 4, () => import('@/screens/VidhiConductScreen'));

// depth 5
const DaanDirectoryScreen = lazyScreen('DaanDirectory', 5, () => import('@/screens/DaanDirectoryScreen'));
const DaanEntryScreen = lazyScreen('DaanEntry', 5, () => import('@/screens/DaanEntryScreen'));
const DaanKathaScreen = lazyScreen('DaanKatha', 5, () => import('@/screens/DaanKathaScreen'));
const VastuDishaScreen = lazyScreen('VastuDisha', 5, () => import('@/screens/VastuDishaScreen'));

// depth 6
const DaanDirectoryDetailScreen = lazyScreen('DaanDirectoryDetail', 6, () => import('@/screens/DaanDirectoryDetailScreen'));

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
      {/* दान-पुण्य (PRD-26) — the Observance-Detail daan door pushes the
          journey in place; entry/directory/katha are its terminal pushes.
          DaanPunya itself stays More-only (the educate home has one door). */}
      <Stack.Screen name="DaanJourney" component={DaanJourneyScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DaanLedger" component={DaanLedgerScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DaanEntry" component={DaanEntryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DaanDirectory" component={DaanDirectoryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DaanDirectoryDetail" component={DaanDirectoryDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DaanKatha" component={DaanKathaScreen} options={{ animation: 'slide_from_right' }} />
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
      {/* प्रश्न (PRD-43) — a require() thunk keeps the composer off the launch graph. */}
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <Stack.Screen
        name="Prashna"
        getComponent={() => require('@/screens/PrashnaScreen').default}
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
