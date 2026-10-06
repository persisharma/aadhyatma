import React, { Suspense } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
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
  const { fontScale } = useWindowDimensions();

  const tabBarStyle = {
    backgroundColor: colors.parchmentSoft,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: 60 + Math.max(0, Math.ceil(16 * (Math.min(fontScale, 1.4) - 1))) + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 6,
  };

  // Tab labels follow the reading language like the rest of the chrome — the
  // bar was the last surface still English-only under a fully Indic screen.
  // contentByLang transliterates the Hindi label for gu/kn.
  const tabLabelStyle = {
    fontFamily: lang === 'en' ? fontFamilies.inter : scriptTitleFont(lang, fontFamilies.devanagariBold),
    fontSize: 11,
    letterSpacing: lang === 'en' && fontScale <= 1.2 ? 0.4 : 0,
    textAlign: 'center' as const,
  };
  // Navigation labels grow by up to 40%; full reading text remains uncapped.
  // A larger scale clips Panchang/Bhajan on compact English phones.
  const tabLabel = (hi: string, en: string) =>
    function NavigationLabel({ color, position }: { color: string; position: 'below-icon' | 'beside-icon' }) {
      return (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.4}
          numberOfLines={1}
          style={[
            tabLabelStyle,
            { color },
            // UIKit tabs add 5dp side padding. Captions can use the full slot
            // while the icon retains its inset; enlarged Panchang then fits.
            position === 'below-icon' ? { marginHorizontal: -5 } : { marginLeft: 8 },
          ]}
        >
          {contentByLang(lang, hi, en)}
        </Text>
      );
    };
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.saffronDeep,
        tabBarAllowFontScaling: true,
        tabBarInactiveTintColor: colors.iconInk,
        tabBarLabelStyle: tabLabelStyle,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
            title: contentByLang(lang, 'होम', 'Home'),
            tabBarLabel: tabLabel('होम', 'Home'),
            tabBarButtonTestID: 'tab-home',
            tabBarIcon: ({ focused, size }) => (
              <HomeIcon color={focused ? colors.iconAccent : colors.iconInk} size={size} />
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
          title: contentByLang(lang, 'भक्ति', 'Bhakti'),
          tabBarLabel: tabLabel('भक्ति', 'Bhakti'),
          tabBarButtonTestID: 'tab-bhakti',
          tabBarIcon: ({ focused, size }) => (
            <BhaktiIcon color={focused ? colors.iconAccent : colors.iconInk} accentColor={colors.saffron} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PanchangTab"
        component={PanchangTabRoot}
        options={{
          title: contentByLang(lang, 'पंचांग', 'Panchang'),
          tabBarLabel: tabLabel('पंचांग', 'Panchang'),
          tabBarButtonTestID: 'tab-panchang',
          tabBarIcon: ({ focused, size }) => (
            <PanchangIcon color={focused ? colors.iconAccent : colors.iconInk} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AudioTab"
        component={AudioStackNavigator}
        options={{
          title: contentByLang(lang, 'भजन', 'Bhajan'),
          tabBarLabel: tabLabel('भजन', 'Bhajan'),
          tabBarButtonTestID: 'tab-bhajan',
          tabBarIcon: ({ focused, size }) => (
            <MusicIcon color={focused ? colors.iconAccent : colors.iconInk} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          title: contentByLang(lang, 'अन्य', 'More'),
          tabBarLabel: tabLabel('अन्य', 'More'),
          tabBarButtonTestID: 'tab-more',
          tabBarIcon: ({ focused, size }) => (
            <MoreIcon color={focused ? colors.iconAccent : colors.iconInk} size={size} />
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
