/* eslint-disable @typescript-eslint/no-require-imports */
// Load destination modules only when their route opens; the More hub remains eager.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '@/screens/MoreScreen';
import GitaReaderScreen from '@/screens/GitaReaderScreen';
import type { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MoreHome" component={MoreScreen} />
      <Stack.Screen name="Profile" getComponent={() => require('@/screens/ProfileScreen').default} />
      <Stack.Screen name="Wishlist" getComponent={() => require('@/screens/WishlistScreen').default} />
      <Stack.Screen name="Reminders" getComponent={() => require('@/screens/ReminderSettingsScreen').default} />
      <Stack.Screen name="JapamAlarms" getComponent={() => require('@/screens/JapamAlarmsScreen').default} />
      <Stack.Screen name="WidgetGallery" getComponent={() => require('@/screens/WidgetGalleryScreen').default} />
      {/* पितृ स्मरण (PRD-17) — tithi-based family remembrance. */}
      <Stack.Screen name="PitruSmaranList" getComponent={() => require('@/screens/PitruSmaranListScreen').default} />
      <Stack.Screen name="PitruSmaranEdit" getComponent={() => require('@/screens/PitruSmaranEditScreen').default} />
      <Stack.Screen name="PitruSmaranDetail" getComponent={() => require('@/screens/PitruSmaranDetailScreen').default} />
      <Stack.Screen name="PitruPakshaOverview" getComponent={() => require('@/screens/PitruPakshaOverviewScreen').default} />
      {/* पितृ पक्ष परिचय (PRD-44) — pushes from the overview so Back retraces. */}
      <Stack.Screen name="PitruPakshaShiksha" getComponent={() => require('@/screens/PitruPakshaShikshaScreen').default} />
      <Stack.Screen name="PitruParichayReader" getComponent={() => require('@/screens/PitruParichayReaderScreen').default} />
      <Stack.Screen name="PitruKatha" getComponent={() => require('@/screens/PitruKathaScreen').default} />
      {/* वास्तु दिशा (PRD-24) — compass + room guidance. */}
      <Stack.Screen name="VastuDisha" getComponent={() => require('@/screens/VastuDishaScreen').default} />
      {/* दान-पुण्य (PRD-26) — educate home, journey, ledger, directory. */}
      <Stack.Screen name="DaanPunya" getComponent={() => require('@/screens/DaanPunyaScreen').default} />
      <Stack.Screen name="DaanJourney" getComponent={() => require('@/screens/DaanJourneyScreen').default} />
      <Stack.Screen name="DaanLedger" getComponent={() => require('@/screens/DaanLedgerScreen').default} />
      <Stack.Screen name="DaanEntry" getComponent={() => require('@/screens/DaanEntryScreen').default} />
      <Stack.Screen name="DaanDirectory" getComponent={() => require('@/screens/DaanDirectoryScreen').default} />
      <Stack.Screen name="DaanDirectoryDetail" getComponent={() => require('@/screens/DaanDirectoryDetailScreen').default} />
      <Stack.Screen name="DaanKatha" getComponent={() => require('@/screens/DaanKathaScreen').default} />
      {/* मेरा घर (PRD-24 Phase 2) — roster, setup walk and the mandala reading.
          Loaded through require() thunks so the journey's screens (grid, engine,
          handoff) stay OFF the static launch graph (launchGraph.test.ts budget)
          until a door is actually opened. */}
      <Stack.Screen name="GharVastuRoster" getComponent={() => require('@/screens/GharVastuRosterScreen').default} />
      <Stack.Screen name="GharVastuSetup" getComponent={() => require('@/screens/GharVastuSetupScreen').default} />
      <Stack.Screen name="GharVastu" getComponent={() => require('@/screens/GharVastuScreen').default} />
      <Stack.Screen name="GharVastuCompare" getComponent={() => require('@/screens/GharVastuCompareScreen').default} />
      {/* कुल परम्परा (PRD-29) — the living's janma tithis + the family record. */}
      <Stack.Screen name="JanmaTithiList" getComponent={() => require('@/screens/JanmaTithiListScreen').default} />
      <Stack.Screen name="JanmaTithiDetail" getComponent={() => require('@/screens/JanmaTithiDetailScreen').default} />
      <Stack.Screen name="KulParampara" getComponent={() => require('@/screens/KulParamparaScreen').default} />
      <Stack.Screen name="KulParamparaEdit" getComponent={() => require('@/screens/KulParamparaEditScreen').default} />
      <Stack.Screen name="KulParamparaExport" getComponent={() => require('@/screens/KulParamparaExportScreen').default} />
      {/* Personal-tithi vidhi doors push here so Back returns to Pitru Smaran. */}
      <Stack.Screen name="VidhiCatalog" getComponent={() => require('@/screens/VidhiCatalogScreen').default} />
      <Stack.Screen name="VidhiDetail" getComponent={() => require('@/screens/VidhiDetailScreen').default} />
      <Stack.Screen name="VidhiConduct" getComponent={() => require('@/screens/VidhiConductScreen').default} />
      <Stack.Screen name="GitaReader" component={GitaReaderScreen} />
    </Stack.Navigator>
  );
}
