import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '@/screens/MoreScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ReminderSettingsScreen from '@/screens/ReminderSettingsScreen';
import JapamAlarmsScreen from '@/screens/JapamAlarmsScreen';
import WidgetGalleryScreen from '@/screens/WidgetGalleryScreen';
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
    </Stack.Navigator>
  );
}
