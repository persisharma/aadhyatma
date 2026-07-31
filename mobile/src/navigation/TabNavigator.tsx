import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStackNavigator from './HomeStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';
import AudioStackNavigator from './AudioStackNavigator';
import DailyBhaktiScreen from '@/screens/DailyBhaktiScreen';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { TabParamList } from './types';
import {
  HomeIcon,
  BhaktiIcon,
  PanchangIcon,
  MusicIcon,
  MoreIcon,
  type TabIconProps,
} from './tabBarIcons';

const Tab = createBottomTabNavigator<TabParamList>();
const LazyPanchangStackNavigator = lazy(() => import('./PanchangStackNavigator'));

// Full-screen reader routes that should hide the bottom tab bar so it doesn't
// compete with immersive reading. Lives at the tab level (rather than per-screen
// setOptions) so the bar animates out cleanly and restores itself on blur.
const IMMERSIVE_HOME_ROUTES = ['VratKathaReader'];

export default function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    backgroundColor: colors.parchmentSoft,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 6,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          fontFamily: fontFamilies.inter,
          fontSize: 10,
          // RN letterSpacing is in px, not em: the previous 0.02 was invisible.
          // 0.4 matches the cardMeta chrome token, the nearest sibling scale.
          letterSpacing: 0.4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
            tabBarLabel: 'Home',
            tabBarButtonTestID: 'tab-home',
            tabBarIcon: ({ color, size }: TabIconProps) => (
              <HomeIcon color={color} size={size} />
            ),
            tabBarStyle: IMMERSIVE_HOME_ROUTES.includes(focused)
              ? { display: 'none' as const }
              : tabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="DailyBhaktiTab"
        component={DailyBhaktiScreen}
        options={{
          tabBarLabel: 'Bhakti',
          tabBarButtonTestID: 'tab-bhakti',
          tabBarIcon: ({ color, size }) => (
            <BhaktiIcon color={color} accentColor={colors.saffron} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PanchangTab"
        component={PanchangTabRoot}
        options={{
          tabBarLabel: 'Panchang',
          tabBarButtonTestID: 'tab-panchang',
          tabBarIcon: ({ color, size }) => (
            <PanchangIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AudioTab"
        component={AudioStackNavigator}
        options={{
          tabBarLabel: 'Bhajan',
          tabBarButtonTestID: 'tab-bhajan',
          tabBarIcon: ({ color, size }) => (
            <MusicIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarButtonTestID: 'tab-more',
          tabBarIcon: ({ color, size }) => (
            <MoreIcon color={color} size={size} />
          ),
        }}
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
  );
}
