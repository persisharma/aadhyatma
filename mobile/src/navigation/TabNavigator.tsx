import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStackNavigator from './HomeStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';
import PanchangStackNavigator from './PanchangStackNavigator';
import AudioStackNavigator from './AudioStackNavigator';
import DailyBhaktiScreen from '@/screens/DailyBhaktiScreen';
import { useTheme } from '@/theme/ThemeContext';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconProps = {
  color: string;
  size: number;
};

type BhaktiIconProps = TabIconProps & {
  accentColor: string;
};

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
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 0.02,
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
          tabBarIcon: ({ color, size }) => (
            <BhaktiIcon color={color} accentColor={colors.saffron} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PanchangTab"
        component={PanchangStackNavigator}
        options={{
          tabBarLabel: 'Panchang',
          tabBarIcon: ({ color, size }) => (
            <PanchangIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AudioTab"
        component={AudioStackNavigator}
        options={{
          tabBarLabel: 'Audio',
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
          tabBarIcon: ({ color, size }) => (
            <MoreIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function HomeIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.07);
  const windowSize = size * 0.11;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.28,
          left: size * 0.12,
          width: size * 0.5,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '-43deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.28,
          right: size * 0.12,
          width: size * 0.5,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '43deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.2,
          right: size * 0.17,
          width: stroke,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          width: size * 0.56,
          height: size * 0.38,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: stroke,
          borderBottomRightRadius: stroke,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.52,
          width: size * 0.28,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: size * 0.05,
        }}
      >
        {[0, 1, 2, 3].map((pane) => (
          <View
            key={pane}
            style={{
              width: windowSize,
              height: windowSize,
              borderRadius: stroke * 0.3,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function BhaktiIcon({ color, accentColor, size }: BhaktiIconProps) {
  const stroke = Math.max(1.5, size * 0.07);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          width: stroke,
          height: size * 0.58,
          borderRadius: stroke / 2,
          backgroundColor: accentColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.12,
          width: size * 0.48,
          height: size * 0.58,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          borderBottomLeftRadius: size * 0.24,
          borderBottomRightRadius: size * 0.24,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.78,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size * 0.06,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function PanchangIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.08);
  const arm = size * 0.28;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: stroke, height: size * 0.64, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', width: size * 0.64, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', top: size * 0.18, left: size * 0.5, width: arm, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', top: size * 0.5, right: size * 0.18, width: stroke, height: arm, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', bottom: size * 0.18, right: size * 0.5, width: arm, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ position: 'absolute', bottom: size * 0.5, left: size * 0.18, width: stroke, height: arm, backgroundColor: color, borderRadius: stroke / 2 }} />
    </View>
  );
}

function MoreIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.07);
  const dotSize = size * 0.11;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.74,
          height: size * 0.74,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: size * 0.37,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: size * 0.08,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <View
            key={dot}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function MusicIcon({ color, size }: TabIconProps) {
  const stroke = Math.max(1.5, size * 0.085);
  const head = size * 0.3;
  const stemLeft = size * 0.24 + head - stroke;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* notehead */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.24,
          bottom: size * 0.22,
          width: head,
          height: head * 0.78,
          borderRadius: head / 2,
          backgroundColor: color,
          transform: [{ rotate: '-20deg' }],
        }}
      />
      {/* stem */}
      <View
        style={{
          position: 'absolute',
          left: stemLeft,
          bottom: size * 0.3,
          width: stroke,
          height: size * 0.44,
          borderRadius: stroke / 2,
          backgroundColor: color,
        }}
      />
      {/* flag */}
      <View
        style={{
          position: 'absolute',
          left: stemLeft,
          top: size * 0.2,
          width: size * 0.24,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '34deg' }],
        }}
      />
    </View>
  );
}
