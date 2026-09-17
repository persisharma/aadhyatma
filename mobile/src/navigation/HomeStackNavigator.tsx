import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import CategoryListScreen from '@/screens/CategoryListScreen';
import DeityListScreen from '@/screens/DeityListScreen';
import DeityIndexScreen from '@/screens/DeityIndexScreen';
import DeityDetailScreen from '@/screens/DeityDetailScreen';
import BrowseByPurposeScreen from '@/screens/BrowseByPurposeScreen';
import PurposeListScreen from '@/screens/PurposeListScreen';
import ChalisaReaderScreen from '@/screens/ChalisaReaderScreen';
import AshtakamReaderScreen from '@/screens/AshtakamReaderScreen';
import SuktamReaderScreen from '@/screens/SuktamReaderScreen';
import KavachamReaderScreen from '@/screens/KavachamReaderScreen';
import StutiReaderScreen from '@/screens/StutiReaderScreen';
import GitaChaptersIndexScreen from '@/screens/GitaChaptersIndexScreen';
import GitaReaderScreen from '@/screens/GitaReaderScreen';
import SundarkandChaptersScreen from '@/screens/SundarkandChaptersScreen';
import SundarkandReaderScreen from '@/screens/SundarkandReaderScreen';
import ShivaStrotamChaptersScreen from '@/screens/ShivaStrotamChaptersScreen';
import ShivaStrotamReaderScreen from '@/screens/ShivaStrotamReaderScreen';
import DurgaStotramChaptersScreen from '@/screens/DurgaStotramChaptersScreen';
import DurgaStotramReaderScreen from '@/screens/DurgaStotramReaderScreen';
import SaraswatiStotramChaptersScreen from '@/screens/SaraswatiStotramChaptersScreen';
import SaraswatiStotramReaderScreen from '@/screens/SaraswatiStotramReaderScreen';
import GaneshStotramChaptersScreen from '@/screens/GaneshStotramChaptersScreen';
import GaneshStotramReaderScreen from '@/screens/GaneshStotramReaderScreen';
import VishnuSahasranamaChaptersScreen from '@/screens/VishnuSahasranamaChaptersScreen';
import VishnuSahasranamaReaderScreen from '@/screens/VishnuSahasranamaReaderScreen';
import HanumanAshtakChaptersScreen from '@/screens/HanumanAshtakChaptersScreen';
import HanumanAshtakReaderScreen from '@/screens/HanumanAshtakReaderScreen';
import BajrangBaanChaptersScreen from '@/screens/BajrangBaanChaptersScreen';
import BajrangBaanReaderScreen from '@/screens/BajrangBaanReaderScreen';
import KrishnaStotramChaptersScreen from '@/screens/KrishnaStotramChaptersScreen';
import KrishnaStotramReaderScreen from '@/screens/KrishnaStotramReaderScreen';
import VratKathaReaderScreen from '@/screens/VratKathaReaderScreen';
import RamStutiChaptersScreen from '@/screens/RamStutiChaptersScreen';
import RamStutiReaderScreen from '@/screens/RamStutiReaderScreen';
import RamcharitmanasChaptersScreen from '@/screens/RamcharitmanasChaptersScreen';
import RamcharitmanasReaderScreen from '@/screens/RamcharitmanasReaderScreen';
import ValmikiRamayanChaptersScreen from '@/screens/ValmikiRamayanChaptersScreen';
import ValmikiRamayanReaderScreen from '@/screens/ValmikiRamayanReaderScreen';
import AartiReaderScreen from '@/screens/AartiReaderScreen';
import TheerthMapScreen from '@/screens/TheerthMapScreen';
import TheerthDetailScreen from '@/screens/TheerthDetailScreen';
import SanskarReaderScreen from '@/screens/SanskarReaderScreen';
import RoutineTodayScreen from '@/screens/RoutineTodayScreen';
import RoutineListScreen from '@/screens/RoutineListScreen';
import CreateRoutineScreen from '@/screens/CreateRoutineScreen';
import RoutineAddItemsScreen from '@/screens/RoutineAddItemsScreen';
import RoutineDetailScreen from '@/screens/RoutineDetailScreen';
import SadhanaProgramListScreen from '@/screens/SadhanaProgramListScreen';
import SadhanaProgramDetailScreen from '@/screens/SadhanaProgramDetailScreen';
import TodayVidhanScreen from '@/screens/TodayVidhanScreen';
import type { HomeStackParamList } from './types';

const LazyJapamCounterScreen = lazy(() => import('@/screens/JapamCounterScreen'));
type JapamCounterScreenProps = NativeStackScreenProps<HomeStackParamList, 'JapamCounter'>;

function JapamCounterScreen(props: JapamCounterScreenProps) {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      }
    >
      <LazyJapamCounterScreen {...props} />
    </Suspense>
  );
}

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * The vidhi flow loads through `require()` thunks (the `getComponent` pattern
 * main introduced for प्रश्न). `VidhiDetailScreen` statically imports
 * `panchang/bhogContent` → `bhogContentExtended` — ~90 KB of offering content
 * that Hermes was evaluating before the first frame, on every cold start, for a
 * screen nobody has opened yet. The flow is registered on three stacks
 * (RULEBOOK §6.0.1) and two of them are static, so both had to move for the
 * payload to actually leave the launch graph (`data/__tests__/launchGraph`).
 */
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
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <Stack.Screen name="VidhiCatalog" getComponent={() => require('@/screens/VidhiCatalogScreen').default} />
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <Stack.Screen name="VidhiDetail" getComponent={() => require('@/screens/VidhiDetailScreen').default} />
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <Stack.Screen name="VidhiConduct" getComponent={() => require('@/screens/VidhiConductScreen').default} />
    </Stack.Navigator>
  );
}
