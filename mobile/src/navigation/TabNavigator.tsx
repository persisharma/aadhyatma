import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import StackLoadBoundary from './StackLoadBoundary';
import { LazyPanchangStackNavigator } from './lazyPanchangStack';
import MoreStackNavigator from './MoreStackNavigator';
import AudioStackNavigator from './AudioStackNavigator';
import DailyBhaktiScreen from '@/screens/DailyBhaktiScreen';
import AppTabBar from './AppTabBar';
import { useTheme } from '@/theme/ThemeContext';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * The bottom tab navigator.
 *
 * FIVE BUTTONS, THREE VISIBLE ROUTES. The bar shows
 * होम · भक्ति · पंचांग · व्रत · ज्योतिष, but पंचांग/व्रत/ज्योतिष are three entry
 * points into the ONE `PanchangTab` screen — see `AppTabBar` for why that is a
 * single route and how the highlight follows the active section.
 *
 * `AudioTab` (भजन) and `MoreTab` (अन्य) are registered here with NO tab button:
 * `tabBarButton: () => null` keeps the routes, their stacks and their lazy
 * mounting exactly as they were, so every `navigate('MoreTab', …)` caller, the
 * notification deep links into that stack, and the feature tour keep working.
 * Only the buttons left the bar — भजन became a segment inside भक्ति and अन्य
 * became `AppHeaderMenuButton` on every tab root.
 *
 * The bar itself is `AppTabBar`; `tabBarStyle`/`tabBarIcon`/`tabBarLabel` are
 * therefore not set here. Do not re-add them — they would be silently ignored,
 * and the next reader would believe them.
 */
export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="DailyBhaktiTab" component={DailyBhaktiScreen} />
      <Tab.Screen name="PanchangTab" component={PanchangTabRoot} />
      {/* Buttonless routes — reachable, just not from the bar. */}
      <Tab.Screen
        name="AudioTab"
        component={AudioStackNavigator}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

/**
 * Keep Panchang, Kundali, and Rashifal screen modules out of Home's startup
 * evaluation. The bottom tab navigator is lazy by default, but a static import
 * would still evaluate the entire Panchang stack before Home can become
 * interactive. Suspense gives the first cross-tab navigation an immediate,
 * lightweight surface while that stack loads.
 */
function PanchangTabRoot() {
  const { colors } = useTheme();
  return (
    // Boundary OUTSIDE Suspense: a chunk that fails to evaluate must be caught
    // here, not thrown past the root into a dead screen (StackLoadBoundary).
    <StackLoadBoundary>
      <Suspense
        fallback={
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.parchment,
            }}
          >
            <ActivityIndicator color={colors.saffron} />
          </View>
        }
      >
        <LazyPanchangStackNavigator />
      </Suspense>
    </StackLoadBoundary>
  );
}
