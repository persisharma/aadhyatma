import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SanatanScreen from '@/screens/SanatanScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Sanatan" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sanatan" component={SanatanScreen} />
    </Stack.Navigator>
  );
}
