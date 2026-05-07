import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import CategoryListScreen from '@/screens/CategoryListScreen';
import DeityListScreen from '@/screens/DeityListScreen';
import DeityIndexScreen from '@/screens/DeityIndexScreen';
import ChalisaReaderScreen from '@/screens/ChalisaReaderScreen';
import GitaChaptersIndexScreen from '@/screens/GitaChaptersIndexScreen';
import GitaReaderScreen from '@/screens/GitaReaderScreen';
import SundarkandReaderScreen from '@/screens/SundarkandReaderScreen';
import ShivaStrotamChaptersScreen from '@/screens/ShivaStrotamChaptersScreen';
import ShivaStrotamReaderScreen from '@/screens/ShivaStrotamReaderScreen';
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
    </Stack.Navigator>
  );
}
