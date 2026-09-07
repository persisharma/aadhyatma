import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStackNavigator from './HomeStackNavigator';
import StackLoadBoundary from './StackLoadBoundary';
import { LazyPanchangStackNavigator } from './lazyPanchangStack';
import MoreStackNavigator from './MoreStackNavigator';
import AudioStackNavigator from './AudioStackNavigator';
import DailyBhaktiScreen from '@/screens/DailyBhaktiScreen';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
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

// Full-screen reader routes that should hide the bottom tab bar so it doesn't
// compete with immersive reading. Lives at the tab level (rather than per-screen
// setOptions) so the bar animates out cleanly and restores itself on blur.
const IMMERSIVE_HOME_ROUTES = ['VratKathaReader'];

export default function TabNavigator() {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    backgroundColor: colors.parchmentSoft,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 6,
  };

  // Tab labels follow the reading language like the rest of the chrome — the
  // bar was the last surface still English-only under a fully Indic screen.
  // contentByLang transliterates the Hindi label for gu/kn.
  const tabLabel = (hi: string, en: string) => contentByLang(lang, hi, en);
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          // Inter carries only the English labels — it has no Indic glyphs; the
          // scripts take their own serif title faces (hi → Noto Serif Devanagari).
          fontFamily: lang === 'en' ? fontFamilies.inter : scriptTitleFont(lang, fontFamilies.devanagariBold),
          fontSize: 10,
          // RN letterSpacing is in px, not em: the previous 0.02 was invisible.
          // 0.4 matches the cardMeta chrome token, the nearest sibling scale —
          // but tracking splits the shirorekha, so it applies to en only (§3).
          letterSpacing: lang === 'en' ? 0.4 : 0,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
            tabBarLabel: tabLabel('होम', 'Home'),
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
          tabBarLabel: tabLabel('भक्ति', 'Bhakti'),
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
          tabBarLabel: tabLabel('पंचांग', 'Panchang'),
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
          tabBarLabel: tabLabel('भजन', 'Bhajan'),
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
          tabBarLabel: tabLabel('अन्य', 'More'),
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
