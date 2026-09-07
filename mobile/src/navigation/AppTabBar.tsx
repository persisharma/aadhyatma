import React, { useMemo } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePanchangSection } from '@/contexts/PanchangSectionContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { panchangTabTarget } from './entryRoutes';
import { TAB_BAR_BASE_HEIGHT } from './tabBarMetrics';
import type { PanchangSection } from './types';
import {
  BhaktiIcon,
  HomeIcon,
  JyotishIcon,
  MoonIcon,
  PanchangIcon,
  type TabIconProps,
} from './tabBarIcons';

/**
 * The bottom bar: होम · भक्ति · पंचांग · व्रत · ज्योतिष (design.md §17).
 *
 * WHY THIS IS HAND-ROLLED rather than five `Tab.Screen`s with the default bar.
 *
 * पंचांग, व्रत and ज्योतिष are three entry points into ONE screen. Registering
 * three tab routes would mount three copies of `PanchangScreen` — three
 * Hindu-calendar solves, three independent selected dates, so a segment switch
 * would silently reset the date — and the Jyotish copy would drag the Kundali
 * graph in behind it. So the navigator registers a single `PanchangTab`, these
 * three buttons all resolve to it with a different `section`, and the
 * HIGHLIGHT is read from `PanchangSectionContext` instead of from navigation
 * state.
 *
 * That context is the single source of truth (its module header states the sync
 * rule). The consequence here: while `PanchangTab` is focused, which of the
 * three buttons lights up is decided by the section, NOT by which button was
 * pressed to get here. Switching segments inside the screen therefore moves the
 * highlight — a bar reading पंचांग over vrat content is the nav reporting the
 * wrong location, and is the specific thing this file exists to prevent.
 *
 * भजन and अन्य are gone from the bar but NOT from the app: भजन is a segment
 * inside भक्ति, and अन्य is `AppHeaderMenuButton` on every tab root. `AudioTab`
 * and `MoreTab` stay registered so every existing cross-tab `navigate` and
 * notification deep link into those stacks keeps working.
 */

/** Full-screen reader routes that hide the bar so it can't compete with reading. */
const IMMERSIVE_HOME_ROUTES = ['VratKathaReader'];

type TabButton = {
  key: string;
  hi: string;
  en: string;
  testID: string;
  icon: (props: TabIconProps & { accentColor: string }) => React.ReactElement;
  /** Set on the three buttons that resolve to the one shared Panchang screen. */
  section?: PanchangSection;
  /** The tab route this button focuses. */
  route: 'HomeTab' | 'DailyBhaktiTab' | 'PanchangTab';
};

const TAB_BUTTONS: readonly TabButton[] = [
  {
    key: 'home',
    hi: 'होम',
    en: 'Home',
    testID: 'tab-home',
    route: 'HomeTab',
    icon: ({ color, size }) => <HomeIcon color={color} size={size} />,
  },
  {
    key: 'bhakti',
    hi: 'भक्ति',
    en: 'Bhakti',
    testID: 'tab-bhakti',
    route: 'DailyBhaktiTab',
    icon: ({ color, accentColor, size }) => (
      <BhaktiIcon color={color} accentColor={accentColor} size={size} />
    ),
  },
  {
    key: 'panchang',
    hi: 'पंचांग',
    en: 'Panchang',
    testID: 'tab-panchang',
    route: 'PanchangTab',
    section: 'panchang',
    icon: ({ color, size }) => <PanchangIcon color={color} size={size} />,
  },
  {
    key: 'vrat',
    hi: 'व्रत',
    en: 'Vrat',
    testID: 'tab-vrat',
    route: 'PanchangTab',
    section: 'vrat',
    icon: ({ color, size }) => <MoonIcon color={color} size={size} />,
  },
  {
    key: 'jyotish',
    hi: 'ज्योतिष',
    en: 'Jyotish',
    testID: 'tab-jyotish',
    route: 'PanchangTab',
    section: 'jyotish',
    icon: ({ color, size }) => <JyotishIcon color={color} size={size} />,
  },
];

export default function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const insets = useSafeAreaInsets();
  const { section, setSection } = usePanchangSection();

  const focusedRoute = state.routes[state.index];
  const focusedRouteName = focusedRoute.name;

  // Immersive reader routes hide the bar. Read off the focused tab's nested
  // state rather than per-screen setOptions, so it disappears and restores
  // cleanly with the navigation rather than a frame late.
  const nestedFocused =
    focusedRouteName === 'HomeTab' ? getFocusedRouteNameFromRoute(focusedRoute) ?? 'Home' : null;
  const hidden = nestedFocused != null && IMMERSIVE_HOME_ROUTES.includes(nestedFocused);

  /**
   * Which button reads as active. On `PanchangTab` this is the SECTION, not the
   * button that was pressed — that is the sync rule.
   */
  const activeKey = useMemo(() => {
    if (focusedRouteName === 'PanchangTab') {
      return TAB_BUTTONS.find((tab) => tab.section === section)?.key ?? 'panchang';
    }
    return TAB_BUTTONS.find((tab) => tab.route === focusedRouteName)?.key ?? null;
  }, [focusedRouteName, section]);

  if (hidden) return null;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.parchmentSoft,
          borderTopColor: colors.divider,
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
      accessibilityRole="tablist"
    >
      {TAB_BUTTONS.map((tab) => (
        <TabBarButton
          key={tab.key}
          tab={tab}
          active={tab.key === activeKey}
          lang={lang}
          onPress={() => {
            if (tab.section) {
              // Write the section FIRST: the highlight is derived from it, so
              // setting it before navigating means the bar and the screen agree
              // on the same frame. Re-selecting the active section from a tab is
              // treated as a re-tap (scroll to top) inside the context.
              setSection(tab.section, 'tab');
              navigation.navigate('PanchangTab', panchangTabTarget('PanchangHome', {
                section: tab.section,
              }));
              return;
            }
            navigation.navigate(tab.route);
          }}
        />
      ))}
    </View>
  );
}

function TabBarButton({
  tab,
  active,
  lang,
  onPress,
}: {
  tab: TabButton;
  active: boolean;
  lang: ReturnType<typeof useGitaLanguage>['lang'];
  onPress: () => void;
}) {
  const { colors } = useTheme();
  // The highlight transition the handover asks for (~150–200ms), so moving the
  // highlight in response to a SEGMENT tap reads as an answer to the user's tap
  // rather than a glitch. Driven by a 0→1 progress value and interpolated to
  // colour, because RN cannot animate a colour prop directly.
  const progress = React.useRef(new Animated.Value(active ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 175,
      // Colour is not a transform/opacity, so this cannot run on the UI thread.
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  const tint = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inkMuted, colors.saffron],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.en}
      testID={tab.testID}
      style={styles.button}
    >
      {/* The icons take a plain colour string, so they cross-fade as two stacked
          copies rather than animating their own strokes. Cheaper than it looks:
          both are static View/SVG trees with no layout of their own. */}
      <View style={styles.iconWrap}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconLayer, { opacity: progress }]}>
          {tab.icon({ color: colors.saffron, accentColor: colors.saffron, size: 22 })}
        </Animated.View>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.iconLayer,
            { opacity: Animated.subtract(1, progress) },
          ]}
        >
          {tab.icon({ color: colors.inkMuted, accentColor: colors.inkMuted, size: 22 })}
        </Animated.View>
      </View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: tint,
            // Inter carries only the English labels — it has no Indic glyphs;
            // the scripts take their own serif title faces.
            fontFamily:
              lang === 'en' ? fontFamilies.inter : scriptTitleFont(lang, fontFamilies.devanagariBold),
            // RN letterSpacing is in px, not em. Tracking splits the shirorekha,
            // so it applies to en only (design.md §3).
            letterSpacing: lang === 'en' ? 0.4 : 0,
          },
        ]}
      >
        {contentByLang(lang, tab.hi, tab.en)}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  button: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
  },
  iconWrap: { width: 22, height: 22 },
  iconLayer: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 10,
    // भक्ति and ज्योतिष carry matras ABOVE and BELOW the baseline. At the RN
    // default line-height for 10 pt they clip top and bottom — 14 is the floor
    // that clears both (handover §4), and the explicit height stops one label
    // from sitting a pixel off its neighbours.
    lineHeight: 14,
    height: 14,
    // Devanagari labels must never be allowed to reflow onto a second line:
    // `numberOfLines={1}` plus this keeps all five baselines aligned. At large
    // OS font scales the bar scales the whole row, not one label.
    textAlign: 'center',
    includeFontPadding: false,
  },
});
