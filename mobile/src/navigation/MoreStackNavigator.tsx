import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '@/screens/MoreScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ReminderSettingsScreen from '@/screens/ReminderSettingsScreen';
import JapamAlarmsScreen from '@/screens/JapamAlarmsScreen';
import WidgetGalleryScreen from '@/screens/WidgetGalleryScreen';
import PitruSmaranListScreen from '@/screens/PitruSmaranListScreen';
import PitruSmaranEditScreen from '@/screens/PitruSmaranEditScreen';
import PitruSmaranDetailScreen from '@/screens/PitruSmaranDetailScreen';
import PitruPakshaOverviewScreen from '@/screens/PitruPakshaOverviewScreen';
import VastuDishaScreen from '@/screens/VastuDishaScreen';
import VidhiCatalogScreen from '@/screens/VidhiCatalogScreen';
import VidhiDetailScreen from '@/screens/VidhiDetailScreen';
import VidhiConductScreen from '@/screens/VidhiConductScreen';
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Reminders" component={ReminderSettingsScreen} />
      <Stack.Screen name="JapamAlarms" component={JapamAlarmsScreen} />
      <Stack.Screen name="WidgetGallery" component={WidgetGalleryScreen} />
      {/* पितृ स्मरण (PRD-17) — tithi-based family remembrance. */}
      <Stack.Screen name="PitruSmaranList" component={PitruSmaranListScreen} />
      <Stack.Screen name="PitruSmaranEdit" component={PitruSmaranEditScreen} />
      <Stack.Screen name="PitruSmaranDetail" component={PitruSmaranDetailScreen} />
      <Stack.Screen name="PitruPakshaOverview" component={PitruPakshaOverviewScreen} />
      {/* वास्तु दिशा (PRD-24) — compass + room guidance. */}
      <Stack.Screen name="VastuDisha" component={VastuDishaScreen} />
      {/* Personal-tithi vidhi doors push here so Back returns to Pitru Smaran. */}
      <Stack.Screen name="VidhiCatalog" component={VidhiCatalogScreen} />
      <Stack.Screen name="VidhiDetail" component={VidhiDetailScreen} />
      <Stack.Screen name="VidhiConduct" component={VidhiConductScreen} />
      <Stack.Screen name="GitaReader" component={GitaReaderScreen} />
    </Stack.Navigator>
  );
}
