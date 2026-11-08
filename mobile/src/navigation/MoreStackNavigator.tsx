/* eslint-disable @typescript-eslint/no-require-imports */
// Load destination modules only when their route opens; the More hub remains eager.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '@/screens/MoreScreen';
import { lazyScreen, prefetchedRoute } from './lazyScreen';
import type { MoreStackParamList } from './types';

/**
 * The More tab loads its root eagerly and everything behind it on demand,
 * warmed in the background by `screenPrefetch` once Home is up. Depth here
 * continues the Home numbering: the tab root is 2, what it opens is 3.
 */

// depth 3
const GitaReaderScreen = lazyScreen('GitaReader', 3, () => import('@/screens/GitaReaderScreen'));


// Registered at module scope, NOT inline in the JSX: `prefetchedRoute` enrols
// the route with the background walk as a side effect, and a call sited in the
// render body would re-enrol all of them on every re-render. Defining them here
// keeps enrolment to exactly once and leaves `getComponent` a plain reference,
// so rendering the navigator still evaluates no destination module.
const loadProfileRoute = prefetchedRoute('Profile', 3, () => require('@/screens/ProfileScreen').default);
const loadWishlistRoute = prefetchedRoute('Wishlist', 3, () => require('@/screens/WishlistScreen').default);
const loadRemindersRoute = prefetchedRoute('Reminders', 3, () => require('@/screens/ReminderSettingsScreen').default);
const loadJapamAlarmsRoute = prefetchedRoute('JapamAlarms', 3, () => require('@/screens/JapamAlarmsScreen').default);
const loadWidgetGalleryRoute = prefetchedRoute('WidgetGallery', 3, () => require('@/screens/WidgetGalleryScreen').default);
const loadPitruSmaranListRoute = prefetchedRoute('PitruSmaranList', 3, () => require('@/screens/PitruSmaranListScreen').default);
const loadPitruSmaranEditRoute = prefetchedRoute('PitruSmaranEdit', 3, () => require('@/screens/PitruSmaranEditScreen').default);
const loadPitruSmaranDetailRoute = prefetchedRoute('PitruSmaranDetail', 3, () => require('@/screens/PitruSmaranDetailScreen').default);
const loadPitruPakshaOverviewRoute = prefetchedRoute('PitruPakshaOverview', 3, () => require('@/screens/PitruPakshaOverviewScreen').default);
const loadPitruPakshaShikshaRoute = prefetchedRoute('PitruPakshaShiksha', 3, () => require('@/screens/PitruPakshaShikshaScreen').default);
const loadPitruParichayReaderRoute = prefetchedRoute('PitruParichayReader', 3, () => require('@/screens/PitruParichayReaderScreen').default);
const loadPitruKathaRoute = prefetchedRoute('PitruKatha', 3, () => require('@/screens/PitruKathaScreen').default);
const loadVastuDishaRoute = prefetchedRoute('VastuDisha', 3, () => require('@/screens/VastuDishaScreen').default);
const loadDaanPunyaRoute = prefetchedRoute('DaanPunya', 3, () => require('@/screens/DaanPunyaScreen').default);
const loadDaanJourneyRoute = prefetchedRoute('DaanJourney', 3, () => require('@/screens/DaanJourneyScreen').default);
const loadDaanLedgerRoute = prefetchedRoute('DaanLedger', 3, () => require('@/screens/DaanLedgerScreen').default);
const loadDaanEntryRoute = prefetchedRoute('DaanEntry', 3, () => require('@/screens/DaanEntryScreen').default);
const loadDaanDirectoryRoute = prefetchedRoute('DaanDirectory', 3, () => require('@/screens/DaanDirectoryScreen').default);
const loadDaanDirectoryDetailRoute = prefetchedRoute('DaanDirectoryDetail', 3, () => require('@/screens/DaanDirectoryDetailScreen').default);
const loadDaanKathaRoute = prefetchedRoute('DaanKatha', 3, () => require('@/screens/DaanKathaScreen').default);
const loadGharVastuRosterRoute = prefetchedRoute('GharVastuRoster', 3, () => require('@/screens/GharVastuRosterScreen').default);
const loadGharVastuSetupRoute = prefetchedRoute('GharVastuSetup', 3, () => require('@/screens/GharVastuSetupScreen').default);
const loadGharVastuRoute = prefetchedRoute('GharVastu', 3, () => require('@/screens/GharVastuScreen').default);
const loadGharVastuCompareRoute = prefetchedRoute('GharVastuCompare', 3, () => require('@/screens/GharVastuCompareScreen').default);
const loadJanmaTithiListRoute = prefetchedRoute('JanmaTithiList', 3, () => require('@/screens/JanmaTithiListScreen').default);
const loadJanmaTithiDetailRoute = prefetchedRoute('JanmaTithiDetail', 3, () => require('@/screens/JanmaTithiDetailScreen').default);
const loadKulParamparaRoute = prefetchedRoute('KulParampara', 3, () => require('@/screens/KulParamparaScreen').default);
const loadKulParamparaEditRoute = prefetchedRoute('KulParamparaEdit', 3, () => require('@/screens/KulParamparaEditScreen').default);
const loadKulParamparaExportRoute = prefetchedRoute('KulParamparaExport', 3, () => require('@/screens/KulParamparaExportScreen').default);
const loadVidhiCatalogRoute = prefetchedRoute('VidhiCatalog', 3, () => require('@/screens/VidhiCatalogScreen').default);
const loadVidhiDetailRoute = prefetchedRoute('VidhiDetail', 3, () => require('@/screens/VidhiDetailScreen').default);
const loadVidhiConductRoute = prefetchedRoute('VidhiConduct', 3, () => require('@/screens/VidhiConductScreen').default);

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
      <Stack.Screen name="Profile" getComponent={loadProfileRoute} />
      <Stack.Screen name="Wishlist" getComponent={loadWishlistRoute} />
      <Stack.Screen name="Reminders" getComponent={loadRemindersRoute} />
      <Stack.Screen name="JapamAlarms" getComponent={loadJapamAlarmsRoute} />
      <Stack.Screen name="WidgetGallery" getComponent={loadWidgetGalleryRoute} />
      {/* पितृ स्मरण (PRD-17) — tithi-based family remembrance. */}
      <Stack.Screen name="PitruSmaranList" getComponent={loadPitruSmaranListRoute} />
      <Stack.Screen name="PitruSmaranEdit" getComponent={loadPitruSmaranEditRoute} />
      <Stack.Screen name="PitruSmaranDetail" getComponent={loadPitruSmaranDetailRoute} />
      <Stack.Screen name="PitruPakshaOverview" getComponent={loadPitruPakshaOverviewRoute} />
      {/* पितृ पक्ष परिचय (PRD-44) — pushes from the overview so Back retraces. */}
      <Stack.Screen name="PitruPakshaShiksha" getComponent={loadPitruPakshaShikshaRoute} />
      <Stack.Screen name="PitruParichayReader" getComponent={loadPitruParichayReaderRoute} />
      <Stack.Screen name="PitruKatha" getComponent={loadPitruKathaRoute} />
      {/* वास्तु दिशा (PRD-24) — compass + room guidance. */}
      <Stack.Screen name="VastuDisha" getComponent={loadVastuDishaRoute} />
      {/* दान-पुण्य (PRD-26) — educate home, journey, ledger, directory. */}
      <Stack.Screen name="DaanPunya" getComponent={loadDaanPunyaRoute} />
      <Stack.Screen name="DaanJourney" getComponent={loadDaanJourneyRoute} />
      <Stack.Screen name="DaanLedger" getComponent={loadDaanLedgerRoute} />
      <Stack.Screen name="DaanEntry" getComponent={loadDaanEntryRoute} />
      <Stack.Screen name="DaanDirectory" getComponent={loadDaanDirectoryRoute} />
      <Stack.Screen name="DaanDirectoryDetail" getComponent={loadDaanDirectoryDetailRoute} />
      <Stack.Screen name="DaanKatha" getComponent={loadDaanKathaRoute} />
      {/* मेरा घर (PRD-24 Phase 2) — roster, setup walk and the mandala reading.
          Loaded through require() thunks so the journey's screens (grid, engine,
          handoff) stay OFF the static launch graph (launchGraph.test.ts budget)
          until a door is actually opened. */}
      <Stack.Screen name="GharVastuRoster" getComponent={loadGharVastuRosterRoute} />
      <Stack.Screen name="GharVastuSetup" getComponent={loadGharVastuSetupRoute} />
      <Stack.Screen name="GharVastu" getComponent={loadGharVastuRoute} />
      <Stack.Screen name="GharVastuCompare" getComponent={loadGharVastuCompareRoute} />
      {/* कुल परम्परा (PRD-29) — the living's janma tithis + the family record. */}
      <Stack.Screen name="JanmaTithiList" getComponent={loadJanmaTithiListRoute} />
      <Stack.Screen name="JanmaTithiDetail" getComponent={loadJanmaTithiDetailRoute} />
      <Stack.Screen name="KulParampara" getComponent={loadKulParamparaRoute} />
      <Stack.Screen name="KulParamparaEdit" getComponent={loadKulParamparaEditRoute} />
      <Stack.Screen name="KulParamparaExport" getComponent={loadKulParamparaExportRoute} />
      {/* Personal-tithi vidhi doors push here so Back returns to Pitru Smaran. */}
      <Stack.Screen name="VidhiCatalog" getComponent={loadVidhiCatalogRoute} />
      <Stack.Screen name="VidhiDetail" getComponent={loadVidhiDetailRoute} />
      <Stack.Screen name="VidhiConduct" getComponent={loadVidhiConductRoute} />
      <Stack.Screen name="GitaReader" component={GitaReaderScreen} />
    </Stack.Navigator>
  );
}
