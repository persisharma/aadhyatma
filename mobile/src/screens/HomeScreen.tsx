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
import TodayRecommendationsRow from '@/components/TodayRecommendationsRow';
import FestiveToran from '@/components/FestiveToran';
import { getTodayFestival } from '@/data/discoveryMeta';
import { useTodayKey } from '@/utils/useTodayKey';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { useTilePressController, TilePressProvider } from '@/contexts/TilePressContext';
import { shuffleBySeed } from '@/utils/shuffleBySeed';
import { panchangTabTarget } from '@/navigation/entryRoutes';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { hasNewInCategory, devSimulateUpgrade, devResetNewState } = useNewContent();
  // Feature-tour spotlight anchors (design.md §47). Home tiles live in the
  // vertical scroll, so they reveal themselves (scroll into view) before measure.
  const homeScrollRef = React.useRef<ScrollView>(null);
  // The routine banner now lives inline in the scroll (below the Today strip),
  // so it reveals itself into view before the tour measures its spotlight ring.
  const routineCardRef = useTourTarget('routineCard', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const categoriesGridRef = useTourTarget('categoriesGrid', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const japaTileRef = useTourTarget('japaTile', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const theerthTileRef = useTourTarget('theerthTile', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  // Sibling tabs (Daily Bhakti, Panchang) live on the root tab navigator, not in
  // the Home stack — navigate via the parent so the action bubbles up. Same
  // pattern as RoutineBanner / PanchangScreen.
  const rootNav = useNavigation<any>();

  // First-tap recovery for the launcher tiles and the Today/Discover cards:
  // iOS can cancel a child Pressable's `onPress` when it lives inside a
  // ScrollView even without a real drag. One shared controller (context) covers
  // every Home card so a vertical page-scroll started on any card suppresses its
  // fallback instead of navigating. See @/contexts/TilePressContext.
  const tilePress = useTilePressController();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = tilePress;

  // Festive toran (design.md §55): on the 18 catalog festivals Home hangs a
  // garland + greeting chip under the wordmark. Same festival resolution as the
  // FOR TODAY row's leading card (and the morning's notification), so the three
  // surfaces always name the same day. `new Date(todayKey)` mirrors
  // TodayRecommendationsRow; the observance lookup is the cheap precomputed-table
  // path the row already takes on this same render.
  const todayKey = useTodayKey();
  const todayFestival = React.useMemo(() => getTodayFestival(new Date(todayKey)), [todayKey]);

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    shortNameEn?: string;
    status: 'active' | 'coming';
    icon?: React.ReactNode;
    onPress: () => void;
    hasNew?: boolean;
  };

  // Launcher grid: the registry content categories (categories.ts, ranked by
  // usefulness + USP), with non-content tiles interleaved at their ranked
  // spots — व्रत (a door into the Panchang observance engine, PRD-09) and
  // कुंडली (the PRD-C Jyotish landing) right after जप, and देवता after तीर्थ.
  // These are permanent launchers, not shuffled Discover cards: high-intent
  // tools must remain findable in the same place on every visit.
  // Anchoring by id (not index) keeps the interleave correct if categories are
  // added/reordered. Memoized so the CategoryCards keep stable icon/onPress
  // props across unrelated HomeScreen re-renders (context churn, tour registration).
  const tiles: TileItem[] = React.useMemo(() => {
    const iconFor = (key: CategoryIconKey) => <CategoryIcon iconKey={key} />;
    const vratTile: TileItem = {
      key: 'vrat',
      nameHi: 'व्रत',
      nameEn: 'Vrat & Parv',
      shortNameEn: 'Vrat',
      status: 'active',
      icon: iconFor('vrat'),
      onPress: () =>
        rootNav.navigate('PanchangTab', panchangTabTarget('ObservanceList', { category: 'vrat' })),
    };
    const deityTile: TileItem = {
      key: 'deity',
      nameHi: 'देवता',
      nameEn: 'By Deity',
      status: 'active',
      icon: iconFor('deity'),
      onPress: () => navigation.navigate('DeityIndex'),
    };
    const kundaliTile: TileItem = {
      key: 'kundali',
      nameHi: 'कुंडली',
      nameEn: 'Kundali',
      status: 'active',
      icon: iconFor('insight'),
      hasNew: true,
      onPress: () =>
        rootNav.navigate(
          'PanchangTab',
          panchangTabTarget('PanchangHome', { initialTab: 'jyotish' })
        ),
    };
    const muhuratTile: TileItem = {
      key: 'muhurat',
      nameHi: 'मुहूर्त',
      nameEn: 'Muhurat',
      status: 'active',
      icon: iconFor('muhurat'),
      hasNew: true,
      onPress: () =>
        rootNav.navigate('PanchangTab', panchangTabTarget('MuhuratFinder', undefined)),
    };
    const purposeTile: TileItem = {
      key: 'purpose',
      nameHi: 'उद्देश्य',
      nameEn: 'By Purpose',
      shortNameEn: 'Purpose',
      status: 'active',
      icon: iconFor('purpose'),
      onPress: () => navigation.navigate('BrowseByPurpose'),
    };
    const nityaSadhnaTile: TileItem = {
      key: 'routine',
      nameHi: 'नित्य साधना',
      nameEn: 'Daily Practice',
      shortNameEn: 'Sadhana',
      status: 'active',
      icon: iconFor('routine'),
      onPress: () => navigation.navigate('RoutineToday'),
    };
    const result: TileItem[] = [];
    for (const c of categories) {
      result.push({
        key: c.id,
        nameHi: c.nameHi,
        nameEn: c.nameEn,
        shortNameEn: c.shortNameEn,
        status: c.status,
        icon: iconFor(c.id),
        hasNew: c.status === 'active' ? hasNewInCategory(c.id) : undefined,
        onPress: () =>
          c.id === 'theerth'
            ? navigation.navigate('TheerthMap', {})
            : navigation.navigate('CategoryList', { categoryId: c.id as ContentCategory }),
      });
      if (c.id === 'japam') result.push(vratTile, kundaliTile, muhuratTile);
      if (c.id === 'theerth') result.push(deityTile, purposeTile);
    }
    // नित्य साधना closes the grid. With मुहूर्त the count is 16 = 5 full rows
    // + this closer, which renders full-width below (PRD-16; design.md §18) so
    // the grid still ends clean rather than on an orphan pair.
    result.push(nityaSadhnaTile);
    return result;
  }, [hasNewInCategory, navigation, rootNav]);

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
    // NOTE: no Panchang spotlight here — the Today strip (§48) owns that
    // surface now; a second card produced two "Today's Panchang." buttons for
    // screen readers.
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
      // Standing zero-state discovery door. The Today strip is contextual and
      // the Panchang ledger is a planning surface; this card makes the feature
      // discoverable on Home before anybody has saved a family tithi.
      key: 'pitru-smaran',
      titleHi: 'पितृ स्मरण', titleEn: 'Pitru Smaran',
      descHi: 'एक बार तिथि जोड़ें—हर वर्ष श्राद्ध की सही तारीख़ जानें।',
      descEn: 'Save a tithi once and know its shraddha date every year.',
      ctaHi: 'स्मरण जोड़ें', ctaEn: 'Set up',
      hasNew: true,
      icon: (
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 22,
            color: colors.gold,
          }}
        >
          ॥
        </Text>
      ),
      onPress: () => rootNav.navigate('MoreTab', { screen: 'PitruSmaranList', initial: false }),
    },
    {
      // PRD-19 Phase 2B Discover card: the vidhi catalog's Home awareness door.
      // The Panchang day-panel pill is date-dependent and the Vrat & Parv tile
      // is two taps deep; this card makes guided pujas discoverable on Home.
      key: 'puja-vidhi',
      titleHi: 'पूजा विधि', titleEn: 'Guided Pujas',
      descHi: 'सत्यनारायण से शिवरात्रि तक—हर चरण, हर मन्त्र साथ।',
      descEn: 'Satyanarayan to Shivaratri — every step, guided in hand.',
      ctaHi: 'विधि देखें', ctaEn: 'Open',
      hasNew: true,
      icon: (
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 22,
            color: colors.saffronDeep,
          }}
        >
          ॥
        </Text>
      ),
      onPress: () => rootNav.navigate('PanchangTab', panchangTabTarget('VidhiCatalog')),
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
    {
      // Launch-release Discover card (PRD-15 §3.4, design.md §HomeWidgets). One
      // spotlight raising awareness of home-screen widgets; it opens the in-app
      // Widget Gallery (which carries the platform add-widget instructions) —
      // it never promises a system widget-picker jump. WidgetGallery lives on
      // the More stack, so route through the MoreTab like the tour steps do.
      key: 'home-widgets',
      titleHi: 'होम-स्क्रीन विजेट', titleEn: 'Home-Screen Widgets',
      descHi: 'आज का श्लोक, पंचांग और जप—होम स्क्रीन पर।',
      descEn: "Today's verse, Panchang, and japa on your home screen.",
      ctaHi: 'देखें', ctaEn: 'View',
      hasNew: true,
      icon: (
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 22,
            color: colors.saffronDeep,
          }}
        >
          वि
        </Text>
      ),
      onPress: () => rootNav.navigate('MoreTab', { screen: 'WidgetGallery' }),
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
        <TilePressProvider value={tilePress}>
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
          onScrollBeginDrag={markTileDrag}
        >
          <View style={styles.hero}>
            <HomeWordmark />
          </View>

          {todayFestival && (
            <FestiveToran
              greetingHi={todayFestival.greetingHi}
              greetingEn={todayFestival.greetingEn}
            />
          )}

          <TodayStrip />

          <TodayRecommendationsRow />

          {/* Routine banner, inline (not docked) on Home — it sits with the
              Today strip as the "today" cluster, above the library grid, so it
              no longer floats over and clips the DISCOVER carousel below. */}
          <View style={styles.routineInline}>
            <RoutineBanner variant="inline" bannerRef={routineCardRef} />
          </View>

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

          {/* categoriesGrid tour target rings the whole grid, not one tile. */}
          <View style={[styles.grid, { gap: gridGap }]} ref={categoriesGridRef} collapsable={false}>
            {tiles.map((tile) => (
              <View
                key={tile.key}
                // नित्य साधना is the grid's full-width closing row (design.md §18);
                // every other tile keeps the 3-column width.
                style={{ width: tile.key === 'routine' ? tileWidth * 3 + 2 * gridGap : tileWidth }}
                ref={
                  tile.key === 'japam'
                    ? japaTileRef
                    : tile.key === 'theerth'
                      ? theerthTileRef
                      : undefined
                }
                collapsable={tile.key === 'japam' || tile.key === 'theerth' ? false : undefined}
              >
                <CategoryCard
                  nameHi={tile.nameHi}
                  nameEn={tile.nameEn}
                  displayNameEn={tile.shortNameEn}
                  status={tile.status}
                  icon={tile.icon}
                  onPress={() => activateTile(tile.onPress)}
                  onPressIn={() => beginTilePress(tile.onPress)}
                  onPressOut={finishTilePress}
                  hasNew={tile.hasNew}
                  variant="launcher"
                />
              </View>
            ))}
          </View>

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
              // A horizontal swipe here is a scroll, not a tap — suppress the
              // shared first-tap fallback so a swipe never opens a card.
              onScrollBeginDrag={markTileDrag}
            >
              {orderedSpotlights.map(({ onPress, ...item }) => (
                <FeatureCard
                  key={item.key}
                  item={item}
                  width={featureWidth}
                  onPress={() => activateTile(onPress)}
                  onPressIn={() => beginTilePress(onPress)}
                  onPressOut={finishTilePress}
                />
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
        </TilePressProvider>
      </SafeAreaView>

      <SearchFloatingButton onPress={() => navigation.navigate('Search')} />
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
  routineInline: {
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
