import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import CategoryListScreen from '@/screens/CategoryListScreen';
import DeityListScreen from '@/screens/DeityListScreen';
import DeityIndexScreen from '@/screens/DeityIndexScreen';
import ChalisaReaderScreen from '@/screens/ChalisaReaderScreen';
import GitaChaptersIndexScreen from '@/screens/GitaChaptersIndexScreen';
import GitaReaderScreen from '@/screens/GitaReaderScreen';
import SundarkandChaptersScreen from '@/screens/SundarkandChaptersScreen';
import SundarkandReaderScreen from '@/screens/SundarkandReaderScreen';
import ShivaStrotamChaptersScreen from '@/screens/ShivaStrotamChaptersScreen';
import ShivaStrotamReaderScreen from '@/screens/ShivaStrotamReaderScreen';
import DurgaStotramChaptersScreen from '@/screens/DurgaStotramChaptersScreen';
import DurgaStotramReaderScreen from '@/screens/DurgaStotramReaderScreen';
import GaneshStotramChaptersScreen from '@/screens/GaneshStotramChaptersScreen';
import GaneshStotramReaderScreen from '@/screens/GaneshStotramReaderScreen';
import VishnuSahasranamaChaptersScreen from '@/screens/VishnuSahasranamaChaptersScreen';
import VishnuSahasranamaReaderScreen from '@/screens/VishnuSahasranamaReaderScreen';
import HanumanAshtakChaptersScreen from '@/screens/HanumanAshtakChaptersScreen';
import HanumanAshtakReaderScreen from '@/screens/HanumanAshtakReaderScreen';
import RamStutiChaptersScreen from '@/screens/RamStutiChaptersScreen';
import RamStutiReaderScreen from '@/screens/RamStutiReaderScreen';
import RamcharitmanasChaptersScreen from '@/screens/RamcharitmanasChaptersScreen';
import RamcharitmanasReaderScreen from '@/screens/RamcharitmanasReaderScreen';
import AartiReaderScreen from '@/screens/AartiReaderScreen';
import type { HomeStackParamList } from './types';

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
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="DeityList" component={DeityListScreen} />
      <Stack.Screen name="DeityIndex" component={DeityIndexScreen} />
      <Stack.Screen
        name="ChalisaReader"
        component={ChalisaReaderScreen}
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
      <Stack.Screen
        name="AartiReader"
        component={AartiReaderScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
