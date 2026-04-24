import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import ChalisaReaderScreen from '@/screens/ChalisaReaderScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
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
        name="ChalisaReader"
        component={ChalisaReaderScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
