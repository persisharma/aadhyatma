import React, { useState } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CitationVisit } from '@/contexts/ReadingProgressContext';
import DailyBhaktiScreen from '@/screens/DailyBhaktiScreen';
import HomeStackNavigator from './HomeStackNavigator';
import StackLoadBoundary from './StackLoadBoundary';
import type { BookmarkTarget } from './entryRoutes';
import type { TabParamList } from './types';

type Routes = { DailyCard: undefined; Citation: BookmarkTarget };
const Stack = createNativeStackNavigator<Routes>();

function SourceReader() {
  // The nested navigator starts directly at the canonical reader. Its first
  // Back bubbles to this stack, where the original scroll view is still mounted.
  return <CitationVisit><StackLoadBoundary><HomeStackNavigator /></StackLoadBoundary></CitationVisit>;
}

export default function DailyBhaktiStack({ route }: Pick<BottomTabScreenProps<TabParamList, 'DailyBhaktiTab'>, 'route'>) {
  const [entry, setEntry] = useState({ params: route.params, revision: 0 });
  if (entry.params !== route.params) {
    // A new reminder, including a repeat of the same reminder, reveals the card.
    setEntry({ params: route.params, revision: entry.revision + 1 });
  }
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DailyCard">
      {({ navigation }) => <DailyBhaktiScreen tabRoute={route}
        onOpenSource={target => navigation.navigate('Citation', target)} />}
    </Stack.Screen>
    <Stack.Screen name="Citation" navigationKey={String(entry.revision)} component={SourceReader} />
  </Stack.Navigator>;
}
