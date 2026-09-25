import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import { lazyScreen } from './lazyScreen';
import type { HomeStackParamList } from './types';

/**
 * Every route but Home loads on demand and is warmed in the background by
 * `screenPrefetch`, breadth-first from Home. Statically importing them cost the
 * launch ~1.4 MB of module evaluation across the stacks for screens most users
 * never open; the `depth` here is the screen's distance from Home and decides
 * only the order in which the warm-up reaches it.
 *
 * Home itself stays eager on purpose — it IS the first frame, so deferring it
 * would trade a launch cost for a launch spinner.
 */

// depth 2 — opened directly from Home
const BrowseByPurposeScreen = lazyScreen('BrowseByPurpose', 2, () => import('@/screens/BrowseByPurposeScreen'));
const CategoryListScreen = lazyScreen('CategoryList', 2, () => import('@/screens/CategoryListScreen'));
// दान-पुण्य (PRD-26) — registered here too so the §5.1 purpose door (विद्या /
// आरोग्य on PurposeList) pushes in place and Back retraces the journey.
const DaanPunyaScreen = lazyScreen('DaanPunya', 2, () => import('@/screens/DaanPunyaScreen'));
const DeityIndexScreen = lazyScreen('DeityIndex', 2, () => import('@/screens/DeityIndexScreen'));
const RoutineTodayScreen = lazyScreen('RoutineToday', 2, () => import('@/screens/RoutineTodayScreen'));
const SadhanaProgramListScreen = lazyScreen('SadhanaPrograms', 2, () => import('@/screens/SadhanaProgramListScreen'));
const SearchScreen = lazyScreen('Search', 2, () => import('@/screens/SearchScreen'));
const TheerthMapScreen = lazyScreen('TheerthMap', 2, () => import('@/screens/TheerthMapScreen'));
const TodayVidhanScreen = lazyScreen('TodayVidhan', 2, () => import('@/screens/TodayVidhanScreen'));
const VidhiCatalogScreen = lazyScreen('VidhiCatalog', 2, () => import('@/screens/VidhiCatalogScreen'));

// depth 3 — reached from a depth-2 screen
const AartiReaderScreen = lazyScreen('AartiReader', 3, () => import('@/screens/AartiReaderScreen'));
const AshtakamReaderScreen = lazyScreen('AshtakamReader', 3, () => import('@/screens/AshtakamReaderScreen'));
const BajrangBaanChaptersScreen = lazyScreen('BajrangBaanChapters', 3, () => import('@/screens/BajrangBaanChaptersScreen'));
const BajrangBaanReaderScreen = lazyScreen('BajrangBaanReader', 3, () => import('@/screens/BajrangBaanReaderScreen'));
const ChalisaReaderScreen = lazyScreen('ChalisaReader', 3, () => import('@/screens/ChalisaReaderScreen'));
const DaanDirectoryScreen = lazyScreen('DaanDirectory', 3, () => import('@/screens/DaanDirectoryScreen'));
const DaanJourneyScreen = lazyScreen('DaanJourney', 3, () => import('@/screens/DaanJourneyScreen'));
const DaanKathaScreen = lazyScreen('DaanKatha', 3, () => import('@/screens/DaanKathaScreen'));
const DaanLedgerScreen = lazyScreen('DaanLedger', 3, () => import('@/screens/DaanLedgerScreen'));
const DeityDetailScreen = lazyScreen('DeityDetail', 3, () => import('@/screens/DeityDetailScreen'));
const DeityListScreen = lazyScreen('DeityList', 3, () => import('@/screens/DeityListScreen'));
const DurgaStotramChaptersScreen = lazyScreen('DurgaStotramChapters', 3, () => import('@/screens/DurgaStotramChaptersScreen'));
const DurgaStotramReaderScreen = lazyScreen('DurgaStotramReader', 3, () => import('@/screens/DurgaStotramReaderScreen'));
const GaneshStotramChaptersScreen = lazyScreen('GaneshStotramChapters', 3, () => import('@/screens/GaneshStotramChaptersScreen'));
const GaneshStotramReaderScreen = lazyScreen('GaneshStotramReader', 3, () => import('@/screens/GaneshStotramReaderScreen'));
const GitaChaptersIndexScreen = lazyScreen('GitaChapters', 3, () => import('@/screens/GitaChaptersIndexScreen'));
const GitaReaderScreen = lazyScreen('GitaReader', 3, () => import('@/screens/GitaReaderScreen'));
const HanumanAshtakChaptersScreen = lazyScreen('HanumanAshtakChapters', 3, () => import('@/screens/HanumanAshtakChaptersScreen'));
const HanumanAshtakReaderScreen = lazyScreen('HanumanAshtakReader', 3, () => import('@/screens/HanumanAshtakReaderScreen'));
const JapamCounterScreen = lazyScreen('JapamCounter', 3, () => import('@/screens/JapamCounterScreen'));
const KavachamReaderScreen = lazyScreen('KavachamReader', 3, () => import('@/screens/KavachamReaderScreen'));
const KrishnaStotramChaptersScreen = lazyScreen('KrishnaStotramChapters', 3, () => import('@/screens/KrishnaStotramChaptersScreen'));
const KrishnaStotramReaderScreen = lazyScreen('KrishnaStotramReader', 3, () => import('@/screens/KrishnaStotramReaderScreen'));
const PurposeListScreen = lazyScreen('PurposeList', 3, () => import('@/screens/PurposeListScreen'));
const RamStutiChaptersScreen = lazyScreen('RamStutiChapters', 3, () => import('@/screens/RamStutiChaptersScreen'));
const RamStutiReaderScreen = lazyScreen('RamStutiReader', 3, () => import('@/screens/RamStutiReaderScreen'));
const RamcharitmanasChaptersScreen = lazyScreen('RamcharitmanasChapters', 3, () => import('@/screens/RamcharitmanasChaptersScreen'));
const RamcharitmanasReaderScreen = lazyScreen('RamcharitmanasReader', 3, () => import('@/screens/RamcharitmanasReaderScreen'));
const RoutineListScreen = lazyScreen('RoutineList', 3, () => import('@/screens/RoutineListScreen'));
const SadhanaProgramDetailScreen = lazyScreen('SadhanaProgramDetail', 3, () => import('@/screens/SadhanaProgramDetailScreen'));
const SanskarReaderScreen = lazyScreen('SanskarReader', 3, () => import('@/screens/SanskarReaderScreen'));
const SaraswatiStotramChaptersScreen = lazyScreen('SaraswatiStotramChapters', 3, () => import('@/screens/SaraswatiStotramChaptersScreen'));
const SaraswatiStotramReaderScreen = lazyScreen('SaraswatiStotramReader', 3, () => import('@/screens/SaraswatiStotramReaderScreen'));
const ShivaStrotamChaptersScreen = lazyScreen('ShivaStrotamChapters', 3, () => import('@/screens/ShivaStrotamChaptersScreen'));
const ShivaStrotamReaderScreen = lazyScreen('ShivaStrotamReader', 3, () => import('@/screens/ShivaStrotamReaderScreen'));
const StutiReaderScreen = lazyScreen('StutiReader', 3, () => import('@/screens/StutiReaderScreen'));
const SuktamReaderScreen = lazyScreen('SuktamReader', 3, () => import('@/screens/SuktamReaderScreen'));
const SundarkandChaptersScreen = lazyScreen('SundarkandChapters', 3, () => import('@/screens/SundarkandChaptersScreen'));
const SundarkandReaderScreen = lazyScreen('SundarkandReader', 3, () => import('@/screens/SundarkandReaderScreen'));
const TheerthDetailScreen = lazyScreen('TheerthDetail', 3, () => import('@/screens/TheerthDetailScreen'));
const ValmikiRamayanChaptersScreen = lazyScreen('ValmikiRamayanChapters', 3, () => import('@/screens/ValmikiRamayanChaptersScreen'));
const ValmikiRamayanReaderScreen = lazyScreen('ValmikiRamayanReader', 3, () => import('@/screens/ValmikiRamayanReaderScreen'));
const VidhiDetailScreen = lazyScreen('VidhiDetail', 3, () => import('@/screens/VidhiDetailScreen'));
const VishnuSahasranamaChaptersScreen = lazyScreen('VishnuSahasranamaChapters', 3, () => import('@/screens/VishnuSahasranamaChaptersScreen'));
const VishnuSahasranamaReaderScreen = lazyScreen('VishnuSahasranamaReader', 3, () => import('@/screens/VishnuSahasranamaReaderScreen'));
const VratKathaReaderScreen = lazyScreen('VratKathaReader', 3, () => import('@/screens/VratKathaReaderScreen'));

// depth 4 — reached from a depth-3 screen
const CreateRoutineScreen = lazyScreen('RoutineCreate', 4, () => import('@/screens/CreateRoutineScreen'));
const DaanDirectoryDetailScreen = lazyScreen('DaanDirectoryDetail', 4, () => import('@/screens/DaanDirectoryDetailScreen'));
const DaanEntryScreen = lazyScreen('DaanEntry', 4, () => import('@/screens/DaanEntryScreen'));
const RoutineDetailScreen = lazyScreen('RoutineDetail', 4, () => import('@/screens/RoutineDetailScreen'));
const VidhiConductScreen = lazyScreen('VidhiConduct', 4, () => import('@/screens/VidhiConductScreen'));

// depth 5 — reached from a depth-4 screen
const RoutineAddItemsScreen = lazyScreen('RoutineAddItems', 5, () => import('@/screens/RoutineAddItemsScreen'));

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="DeityList" component={DeityListScreen} />
      <Stack.Screen name="DeityIndex" component={DeityIndexScreen} />
      <Stack.Screen name="DeityDetail" component={DeityDetailScreen} />
      <Stack.Screen name="BrowseByPurpose" component={BrowseByPurposeScreen} />
      <Stack.Screen name="PurposeList" component={PurposeListScreen} />
      {/* दान-पुण्य (PRD-26) — the purpose door's flow. */}
      <Stack.Screen name="DaanPunya" component={DaanPunyaScreen} />
      <Stack.Screen name="DaanJourney" component={DaanJourneyScreen} />
      <Stack.Screen name="DaanLedger" component={DaanLedgerScreen} />
      <Stack.Screen name="DaanEntry" component={DaanEntryScreen} />
      <Stack.Screen name="DaanDirectory" component={DaanDirectoryScreen} />
      <Stack.Screen name="DaanDirectoryDetail" component={DaanDirectoryDetailScreen} />
      <Stack.Screen name="DaanKatha" component={DaanKathaScreen} />
      <Stack.Screen
        name="ChalisaReader"
        component={ChalisaReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="AshtakamReader"
        component={AshtakamReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="SuktamReader"
        component={SuktamReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="KavachamReader"
        component={KavachamReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="StutiReader"
        component={StutiReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="GitaChapters" component={GitaChaptersIndexScreen} />
      <Stack.Screen
        name="GitaReader"
        component={GitaReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="SundarkandChapters" component={SundarkandChaptersScreen} />
      <Stack.Screen
        name="SundarkandReader"
        component={SundarkandReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="ShivaStrotamChapters" component={ShivaStrotamChaptersScreen} />
      <Stack.Screen
        name="ShivaStrotamReader"
        component={ShivaStrotamReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="DurgaStotramChapters" component={DurgaStotramChaptersScreen} />
      <Stack.Screen
        name="DurgaStotramReader"
        component={DurgaStotramReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="SaraswatiStotramChapters" component={SaraswatiStotramChaptersScreen} />
      <Stack.Screen
        name="SaraswatiStotramReader"
        component={SaraswatiStotramReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="GaneshStotramChapters" component={GaneshStotramChaptersScreen} />
      <Stack.Screen
        name="GaneshStotramReader"
        component={GaneshStotramReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="VishnuSahasranamaChapters" component={VishnuSahasranamaChaptersScreen} />
      <Stack.Screen
        name="VishnuSahasranamaReader"
        component={VishnuSahasranamaReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="HanumanAshtakChapters" component={HanumanAshtakChaptersScreen} />
      <Stack.Screen
        name="HanumanAshtakReader"
        component={HanumanAshtakReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="BajrangBaanChapters" component={BajrangBaanChaptersScreen} />
      <Stack.Screen
        name="BajrangBaanReader"
        component={BajrangBaanReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="KrishnaStotramChapters" component={KrishnaStotramChaptersScreen} />
      <Stack.Screen
        name="KrishnaStotramReader"
        component={KrishnaStotramReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="RamStutiChapters" component={RamStutiChaptersScreen} />
      <Stack.Screen
        name="RamStutiReader"
        component={RamStutiReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="RamcharitmanasChapters" component={RamcharitmanasChaptersScreen} />
      <Stack.Screen
        name="RamcharitmanasReader"
        component={RamcharitmanasReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="ValmikiRamayanChapters" component={ValmikiRamayanChaptersScreen} />
      <Stack.Screen
        name="ValmikiRamayanReader"
        component={ValmikiRamayanReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="AartiReader"
        component={AartiReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="SanskarReader"
        component={SanskarReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="JapamCounter"
        component={JapamCounterScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="VratKathaReader"
        component={VratKathaReaderScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TheerthMap"
        component={TheerthMapScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="TheerthDetail"
        component={TheerthDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="RoutineToday" component={RoutineTodayScreen} />
      <Stack.Screen name="RoutineList" component={RoutineListScreen} />
      <Stack.Screen name="RoutineCreate" component={CreateRoutineScreen} />
      <Stack.Screen name="RoutineAddItems" component={RoutineAddItemsScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="SadhanaPrograms" component={SadhanaProgramListScreen} />
      <Stack.Screen name="SadhanaProgramDetail" component={SadhanaProgramDetailScreen} />
      <Stack.Screen name="TodayVidhan" component={TodayVidhanScreen} />
      {/*
        The vidhi flow is registered here as well as on the Panchang stack
        (see VidhiStackParamList). Home's DISCOVER card, the search rows and
        routine items push it in place, so back retraces the Home journey
        instead of stranding the user on the Panchang calendar — which carries
        no vidhi door of its own in its default mode.
      */}
      <Stack.Screen name="VidhiCatalog" component={VidhiCatalogScreen} />
      <Stack.Screen name="VidhiDetail" component={VidhiDetailScreen} />
      <Stack.Screen name="VidhiConduct" component={VidhiConductScreen} />
    </Stack.Navigator>
  );
}
