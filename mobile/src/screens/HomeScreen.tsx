import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { categories } from '@/data/categories';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon, { type CategoryIconKey } from '@/components/CategoryIcon';
import FeatureCard, { type FeatureSpotlight } from '@/components/FeatureCard';
import LotusMark from '@/components/LotusMark';
import HomeWordmark from '@/components/HomeWordmark';
import SearchFloatingButton from '@/components/SearchFloatingButton';
import RoutineBanner from '@/components/RoutineBanner';
import TodayStrip from '@/components/TodayStrip';
import ContinueReadingCard from '@/components/ContinueReadingCard';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { shuffleBySeed } from '@/utils/shuffleBySeed';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { hasNewInCategory, devSimulateUpgrade, devResetNewState } = useNewContent();
  // Feature-tour spotlight anchors (design.md §47). Home tiles live in the
  // vertical scroll, so they reveal themselves (scroll into view) before measure.
  const homeScrollRef = React.useRef<ScrollView>(null);
  const routineCardRef = useTourTarget('routineCard');
  const categoriesGridRef = useTourTarget('categoriesGrid', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const japaTileRef = useTourTarget('japaTile', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const theerthTileRef = useTourTarget('theerthTile', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  // Sibling tabs (Daily Bhakti, Panchang) live on the root tab navigator, not in
  // the Home stack — navigate via the parent so the action bubbles up. Same
  // pattern as RoutineBanner / PanchangScreen.
  const rootNav = useNavigation<any>();

  // The docked RoutineBanner (rendered below) sits at `spacing.sm` above the tab
  // bar and stands ~60px tall at most. Lift the search FAB above it so it isn't
  // hidden behind / overlapped by the banner.
  const searchFabBottom = spacing.sm + 60 + spacing.md;

  const categoryIcons: Record<CategoryIconKey, React.ReactNode> = {
    granth: <CategoryIcon iconKey="granth" />,
    stotram: <CategoryIcon iconKey="stotram" />,
    chalisa: <CategoryIcon iconKey="chalisa" />,
    japam: <CategoryIcon iconKey="japam" />,
    deity: <CategoryIcon iconKey="deity" />,
    aarti: <CategoryIcon iconKey="aarti" />,
    theerth: <CategoryIcon iconKey="theerth" />,
    sanskar: <CategoryIcon iconKey="sanskar" />,
    vrat: <CategoryIcon iconKey="vrat" />,
  };

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    shortNameEn?: string;
    status: 'active';
    icon?: React.ReactNode;
    onPress: () => void;
    hasNew?: boolean;
  };

  // 3×3 launcher grid: the 7 registry categories, plus the व्रत tile (a door
  // into the Panchang tab's Vrat & Parv catalog, PRD-09 — not a ContentCategory;
  // its content lives in the observance engine, not the library) and the देवता
  // tile (the Deity Index). Nine tiles — the grid stays a full square.
  const tiles: TileItem[] = [
    ...categories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      shortNameEn: c.shortNameEn,
      status: 'active' as const,
      icon: categoryIcons[c.id],
      hasNew: hasNewInCategory(c.id),
      onPress: () =>
        c.id === 'theerth'
          ? navigation.navigate('TheerthMap', {})
          : navigation.navigate('CategoryList', { categoryId: c.id as ContentCategory }),
    })),
    {
      key: 'vrat',
      nameHi: 'व्रत',
      nameEn: 'Vrat & Parv',
      shortNameEn: 'Vrat',
      status: 'active' as const,
      icon: categoryIcons['vrat'],
      onPress: () =>
        rootNav.navigate('PanchangTab', {
          screen: 'ObservanceList',
          params: { category: 'vrat' },
        }),
    },
    {
      key: 'deity',
      nameHi: 'देवता',
      nameEn: 'By Deity',
      status: 'active' as const,
      icon: categoryIcons['deity'],
      onPress: () => navigation.navigate('DeityIndex'),
    },
  ];

  const screenWidth = Dimensions.get('window').width;
  const gridPadding = spacing.xxl;
  const gridGap = 10;
  const tileWidth = (screenWidth - 2 * gridPadding - 2 * gridGap) / 3;

  // Discover carousel — wide cards that peek the next one. Width is the viewport
  // minus the side gutter and a sliver of the following card; snap by card+gap.
  const featureGap = spacing.md;
  const featureWidth = Math.min(320, screenWidth - gridPadding - 56);
  const featureSnap = featureWidth + featureGap;

  // Spotlight content. One flexible card shell (FeatureCard) carries every
  // section so awareness of each surface is raised from a single carousel.
  const spotlights: (FeatureSpotlight & { onPress: () => void })[] = [
    {
      key: 'routine',
      titleHi: 'नित्य साधना', titleEn: 'Daily Practice',
      descHi: 'अपनी दैनिक साधना चुनें और निरंतरता बनाए रखें।',
      descEn: 'Pick your daily rituals and keep the streak alive.',
      ctaHi: 'शुरू करें', ctaEn: 'Begin',
      icon: <LotusMark size={28} />,
      onPress: () => navigation.navigate('RoutineToday'),
    },
    {
      key: 'daily-bhakti',
      titleHi: 'दैनिक भक्ति', titleEn: 'Daily Verse',
      descHi: 'हर दिन एक नया श्लोक चिंतन और भक्ति के लिए।',
      descEn: 'A fresh shloka to reflect on every single day.',
      ctaHi: 'पढ़ें', ctaEn: 'Read',
      icon: <CategoryIcon iconKey="stotram" />,
      onPress: () => rootNav.navigate('DailyBhaktiTab'),
    },
    {
      key: 'panchang',
      titleHi: 'आज का पंचांग', titleEn: "Today's Panchang",
      descHi: 'तिथि, नक्षत्र और व्रत-पर्व एक ही नज़र में।',
      descEn: 'Tithi, nakshatra and festivals at a glance.',
      ctaHi: 'देखें', ctaEn: 'View',
      icon: (
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 22,
            color: colors.saffronDeep,
          }}
        >
          पं
        </Text>
      ),
      onPress: () => rootNav.navigate('PanchangTab'),
    },
    {
      key: 'sankalp',
      titleHi: 'संकल्प', titleEn: 'Sadhana Programs',
      descHi: '४१-दिन हनुमान चालीसा जैसे तैयार संकल्प लें।',
      descEn: 'Take a prebuilt vow, like the 41-day Hanuman Chalisa.',
      ctaHi: 'संकल्प लें', ctaEn: 'Begin',
      icon: (
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 22,
            color: colors.saffronDeep,
          }}
        >
          सं
        </Text>
      ),
      onPress: () => navigation.navigate('SadhanaPrograms'),
    },
    {
      key: 'theerth',
      titleHi: 'तीर्थ यात्रा', titleEn: 'Sacred Journeys',
      descHi: 'भारत के पवित्र मंदिरों और धामों की खोज करें।',
      descEn: 'Explore sacred temples and dhams across Bharat.',
      ctaHi: 'खोजें', ctaEn: 'Explore',
      icon: <CategoryIcon iconKey="theerth" />,
      onPress: () => navigation.navigate('TheerthMap', {}),
    },
  ];

  // All cards always render (awareness = coverage); their order is shuffled once
  // per app open so a different section leads each visit. The seed is captured
  // at mount (useMemo []), so the order is fresh on each open yet stable across
  // re-renders while the user is on Home. See utils/shuffleBySeed.
  const shuffleSeed = React.useMemo(() => Date.now(), []);
  const orderedSpotlights = shuffleBySeed(spotlights, shuffleSeed);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          ref={homeScrollRef}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxl * 3,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <HomeWordmark />
          </View>

          <TodayStrip />

          <Text
            style={[
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontFamily: typography.sectionLabel.fontFamily,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            CATEGORIES
          </Text>

          <View style={[styles.grid, { gap: gridGap }]}>
            {tiles.map((tile, i) => (
              <View
                key={tile.key}
                style={{ width: tileWidth }}
                ref={
                  tile.key === 'japam'
                    ? japaTileRef
                    : tile.key === 'theerth'
                      ? theerthTileRef
                      : i === 0
                        ? categoriesGridRef
                        : undefined
                }
                collapsable={
                  tile.key === 'japam' || tile.key === 'theerth' || i === 0 ? false : undefined
                }
              >
                <CategoryCard
                  nameHi={tile.nameHi}
                  nameEn={tile.nameEn}
                  displayNameEn={tile.shortNameEn}
                  status={tile.status}
                  icon={tile.icon}
                  onPress={tile.onPress}
                  hasNew={tile.hasNew}
                  variant="launcher"
                />
              </View>
            ))}
          </View>

          <ContinueReadingCard />

          <Text
            style={[
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontFamily: typography.sectionLabel.fontFamily,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            DISCOVER
          </Text>

          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={featureSnap}
              snapToAlignment="start"
              // Full-bleed: cancel the page gutter so cards run edge-to-edge and the
              // next card peeks, then re-pad the content so the first card aligns
              // with the rest of the page.
              style={{ marginHorizontal: -gridPadding }}
              contentContainerStyle={{
                paddingHorizontal: gridPadding,
                gap: featureGap,
                paddingBottom: 4,
              }}
            >
              {orderedSpotlights.map(({ onPress, ...item }) => (
                <FeatureCard key={item.key} item={item} width={featureWidth} onPress={onPress} />
              ))}
            </ScrollView>

          <Text
            style={[
              styles.footer,
              {
                color: colors.inkMuted,
                fontFamily: typography.footerMantra.fontFamily,
                fontSize: typography.footerMantra.fontSize,
              },
            ]}
          >
            ॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥
          </Text>

          {__DEV__ && (
            <View style={{ marginTop: 24, marginBottom: 160, flexDirection: 'row', gap: 10, alignSelf: 'center' }}>
              <Pressable
                testID="dev-seed-new-content"
                onPress={devSimulateUpgrade}
                accessibilityLabel="DEV simulate update"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 seed NEW</Text>
              </Pressable>
              <Pressable
                testID="dev-reset-new-content"
                onPress={devResetNewState}
                accessibilityLabel="DEV reset new state"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 reset</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <SearchFloatingButton
        onPress={() => navigation.navigate('Search')}
        bottomOffset={searchFabBottom}
      />
      <RoutineBanner bannerRef={routineCardRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingTop: 4,
  },
  hero: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionLabelSpaced: {
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 20,
    includeFontPadding: false,
  },
});
