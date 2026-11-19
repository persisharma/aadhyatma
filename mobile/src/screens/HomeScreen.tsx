import AppIcon from '@/components/AppIcon';
import React from 'react';
import {
  useWindowDimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { categories } from '@/data/categories';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon, { type CategoryIconKey } from '@/components/CategoryIcon';
import FeatureIcon from '@/components/FeatureIcon';
import FeatureCard, { type FeatureSpotlight } from '@/components/FeatureCard';
import { shuffleBySeed } from '@/utils/shuffleBySeed';
import HomeWordmark from '@/components/HomeWordmark';
import { homeLayout } from '@/utils/homeLayout';
import { useGitaLanguage } from '@/data/gita/language';
import { pick, contentByLang } from '@/utils/localize';
import { titleFontByLang, pillTextStyle } from '@/utils/langType';
import RoutineBanner from '@/components/RoutineBanner';
import TodayStrip from '@/components/TodayStrip';
import FestiveToran from '@/components/FestiveToran';
import { getTodayFestival } from '@/data/discoveryMeta';
import { useObservancesForDate, usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { useTodayKey } from '@/utils/useTodayKey';
import { launchMarkOnce } from '@/utils/launchTrace';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { useTilePressController, TilePressProvider } from '@/contexts/TilePressContext';
import { moreTabTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';

// The illustrated card sits below the category grid. Load its art and copy in
// a separate chunk so the Home launch graph stays within its byte budget.
const SanatanHomeCard = React.lazy(() => import('@/components/SanatanHomeCard'));
const KidsStoriesHomeCard = React.lazy(() => import('@/components/KidsStoriesHomeCard'));

const FeaturedReadings = React.lazy(() => import('@/components/home/FeaturedReadings'));
const JapmalaBanner = React.lazy(() => import('@/components/home/JapmalaBanner'));
// The Today cluster (restored 19 Nov 2026): today's deity links and the FOR TODAY row.
const DeityDayLinks = React.lazy(() => import('@/components/DeityDayLinks'));
const TodayRecommendationsRow = React.lazy(() => import('@/components/TodayRecommendationsRow'));

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  launchMarkOnce('home-render');
  const { colors, typography, spacing } = useTheme();
  const { hasNewInCategory, devSimulateUpgrade, devResetNewState } = useNewContent();
  // Feature-tour spotlight anchors (design.md §47). Home tiles live in the
  // vertical scroll, so they reveal themselves (scroll into view) before measure.
  const homeScrollRef = React.useRef<ScrollView>(null);
  // Reselecting the Home tab while Home is showing returns the page to the top
  // (from a pushed screen the first tap still just pops back to Home).
  useScrollToTop(homeScrollRef);
  // The routine banner now lives inline in the scroll (below the Today strip),
  // so it reveals itself into view before the tour measures its spotlight ring.
  const routineCardRef = useTourTarget('routineCard', (ref) => scrollNodeIntoView(homeScrollRef, ref));
  const settingsRef = useTourTarget('settingsButton', (ref) => scrollNodeIntoView(homeScrollRef, ref));
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
  const openSearch = React.useCallback(() => navigation.navigate('Search'), [navigation]);
  const openSettings = React.useCallback(
    () => rootNav.navigate('MoreTab', moreTabTarget('MoreHome')),
    [rootNav]
  );

  const todayKey = useTodayKey();
  const today = React.useMemo(() => new Date(todayKey), [todayKey]);
  // A catalog festival day hangs the toran under the wordmark (design.md §55).
  const todayFestival = React.useMemo(() => getTodayFestival(today), [today]);
  const [calendar] = usePanchangCalendarSystem();
  const observances = useObservancesForDate(today,calendar);
  const occasion = observances.find(o => o.rule.category === 'festival') ?? observances[0];

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    shortNameEn?: string;
    status: 'active' | 'coming';
    icon?: React.ReactNode;
    onPress: () => void;
    hasNew?: boolean;
    fullWidth?: boolean;
  };

  // Keep the compact Home shortcuts in a stable order. Library contains every reading form.
  const tiles: TileItem[] = React.useMemo(() => {
    const iconFor = (key: CategoryIconKey) => <CategoryIcon iconKey={key} size={spacing.homeCategoryArtwork} />;
    const vratTile: TileItem = {
      key: 'vrat',
      nameHi: 'आज का व्रत',
      nameEn: 'Today’s vrat',
      status: 'active',
      icon: iconFor('vrat'),
      onPress: () =>
        occasion ? rootNav.navigate('VratTab',panchangTabTarget('ObservanceDetail',{ruleId:occasion.rule.id,dateMs:today.getTime()})) : rootNav.navigate('PanchangTab',panchangTabTarget('PanchangHome',{initialTab:'calendar',dateMs:today.getTime()})),
    };
    const libraryTile: TileItem = {key:'library',nameHi:'पुस्तकालय',nameEn:'Library',status:'active',icon:iconFor('granth'),
      hasNew: categories.some(c=>hasNewInCategory(c.id)),onPress:()=>navigation.navigate('ReadingLibrary')};
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
    // दान-पुण्य (PRD-26) — the giving layer's standing Home door. A non-content
    // launcher (like व्रत/कुंडली) and the grid's full-width closing row. Daily
    // Practice already has the dedicated RoutineBanner above this grid.
    const daanTile: TileItem = {
      key: 'daan',
      nameHi: 'दान-पुण्य',
      nameEn: 'Daan Punya',
      shortNameEn: 'Giving',
      status: 'active',
      icon: iconFor('daan'),
      hasNew: true,
      fullWidth: true,
      onPress: () => navigation.navigate('DaanPunya'),
    };
    const result: TileItem[] = [];
    for (const c of categories) {
      if(c.id==='granth') result.push(libraryTile);
      if(c.id==='japam') result.push(vratTile,kundaliTile,muhuratTile);
      if(!['chalisa','aarti','theerth'].includes(c.id)) continue;
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
      if (c.id === 'theerth') result.push(deityTile, purposeTile);
    }
    result.push(daanTile);
    return result;
  }, [hasNewInCategory, navigation, rootNav, spacing.homeCategoryArtwork, occasion, today]);

  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { lang } = useGitaLanguage();
  const { contentWidth, gridWidth, gridPadding, gridGap, tileWidth, launcherHeight, largeText } =
    homeLayout(width - insets.left - insets.right, fontScale);

  // "और जानें": wide cards that peek the next one. Width is the viewport minus
  // the side gutter and a sliver of the following card; snap by card + gap.
  const featureGap = spacing.md;
  const featureWidth = Math.min(320, contentWidth - gridPadding - 56);
  const featureSnap = featureWidth + featureGap;

  // One card per surface worth knowing about. Every card always renders
  // (awareness is coverage); only the order changes.
  const spotlights: (FeatureSpotlight & { onPress: () => void })[] = [
    {
      key: 'darshan',
      titleHi: 'मंदिर दर्शन', titleEn: 'Temple Darshan',
      descHi: 'प्रमुख मंदिरों के सीधे दर्शन, घर बैठे।',
      descEn: 'Live darshan from major temples, wherever you are.',
      ctaHi: 'दर्शन करें', ctaEn: 'Watch',
      icon: <CategoryIcon iconKey="theerth" size={32} />,
      onPress: () => navigation.navigate('DarshanQuick'),
    },
    {
      key: 'puja-vidhi',
      titleHi: 'पूजा विधि', titleEn: 'Guided pujas',
      descHi: 'सत्यनारायण से शिवरात्रि तक—हर चरण, हर मन्त्र साथ।',
      descEn: 'Satyanarayan to Shivaratri — every step, guided in hand.',
      ctaHi: 'विधि देखें', ctaEn: 'Open',
      icon: <FeatureIcon name="puja-vidhi" />,
      onPress: () => navigation.navigate('VidhiCatalog'),
    },
    {
      key: 'routine',
      titleHi: 'नित्य साधना', titleEn: 'Daily Practice',
      descHi: 'अपनी दैनिक साधना चुनें और निरंतरता बनाए रखें।',
      descEn: 'Pick your daily rituals and keep the streak alive.',
      ctaHi: 'शुरू करें', ctaEn: 'Begin',
      icon: <FeatureIcon name="routine" />,
      onPress: () => navigation.navigate('RoutineToday'),
    },
    {
      key: 'daily-bhakti',
      titleHi: 'दैनिक भक्ति', titleEn: 'Daily Verse',
      descHi: 'हर दिन एक नया श्लोक चिंतन और भक्ति के लिए।',
      descEn: 'A fresh shloka to reflect on every single day.',
      ctaHi: 'पढ़ें', ctaEn: 'Read',
      icon: <FeatureIcon name="daily-bhakti" />,
      onPress: () => rootNav.navigate('DailyBhaktiTab'),
    },
    {
      key: 'daan-punya',
      titleHi: 'दान-पुण्य', titleEn: 'Daan Punya',
      descHi: 'जप · व्रत · दान — पहले महत्व, फिर देना। कभी भी।',
      descEn: 'Japa · vrat · daan — understand first, then give. Any day.',
      ctaHi: 'खोलें', ctaEn: 'Open',
      icon: <FeatureIcon name="daan-punya" />,
      onPress: () => navigation.navigate('DaanPunya'),
    },
    {
      key: 'sankalp',
      titleHi: 'संकल्प', titleEn: 'Sadhana Programs',
      descHi: '४१-दिन हनुमान चालीसा जैसे तैयार संकल्प लें।',
      descEn: 'Take a prebuilt vow, like the 41-day Hanuman Chalisa.',
      ctaHi: 'संकल्प लें', ctaEn: 'Begin',
      icon: <FeatureIcon name="sankalp" />,
      onPress: () => navigation.navigate('SadhanaPrograms'),
    },
    {
      key: 'pitru-smaran',
      titleHi: 'पितृ स्मरण', titleEn: 'Pitru Smaran',
      descHi: 'एक बार तिथि जोड़ें—हर वर्ष श्राद्ध की सही तारीख़ जानें।',
      descEn: 'Save a tithi once and know its shraddha date every year.',
      ctaHi: 'स्मरण जोड़ें', ctaEn: 'Set up',
      icon: <FeatureIcon name="pitru-smaran" />,
      onPress: () => rootNav.navigate('MoreTab', moreTabTarget('PitruSmaranList')),
    },
    {
      key: 'jijnasa',
      titleHi: 'जिज्ञासा · आज का विधान', titleEn: 'Ask Vedansh',
      descHi: 'आज की तिथि, व्रत, भोग, मुहूर्त—एक प्रश्न में उत्तर।',
      descEn: "Today's tithi, vrat, bhog, muhurat — answered in one line.",
      ctaHi: 'पूछें', ctaEn: 'Ask',
      icon: <FeatureIcon name="jijnasa" />,
      onPress: () => navigation.navigate('TodayVidhan'),
    },
    {
      key: 'theerth',
      titleHi: 'तीर्थ यात्रा', titleEn: 'Sacred Journeys',
      descHi: 'भारत के पवित्र मंदिरों और धामों की खोज करें।',
      descEn: 'Explore sacred temples and dhams across Bharat.',
      ctaHi: 'खोजें', ctaEn: 'Explore',
      icon: <FeatureIcon name="theerth" />,
      onPress: () => navigation.navigate('TheerthMap', {}),
    },
    {
      // Opens the in-app Widget Gallery, which carries the platform's own
      // add-widget steps; it never promises a system widget-picker jump.
      key: 'home-widgets',
      titleHi: 'होम-स्क्रीन विजेट', titleEn: 'Home-Screen Widgets',
      descHi: 'आज का श्लोक, पंचांग और जप—होम स्क्रीन पर।',
      descEn: "Today's verse, Panchang, and japa on your home screen.",
      ctaHi: 'देखें', ctaEn: 'View',
      icon: <FeatureIcon name="home-widgets" />,
      onPress: () => rootNav.navigate('MoreTab', moreTabTarget('WidgetGallery')),
    },
  ];

  // The order is shuffled once per app open so a different card leads each
  // visit. The seed is captured at mount, so the order is fresh on every open
  // yet stable across re-renders while the reader is on Home (utils/shuffleBySeed).
  const shuffleSeed = React.useMemo(() => Date.now(), []);
  const orderedSpotlights = shuffleBySeed(spotlights, shuffleSeed);

  const heading = (title: string, all = false) => <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:14,marginBottom:6}}>
    <Text accessibilityRole="header" style={{fontFamily:titleFontByLang(lang),fontSize:15,color:colors.inkSoft}}>{title}</Text>
    {all && <Pressable testID="home-all-features" accessibilityRole="button" style={{minHeight:44,justifyContent:'center'}} onPress={()=>navigation.navigate('ReadingLibrary',{features:true})}>
      <Text style={{fontFamily:titleFontByLang(lang),color:colors.saffronDeep}}>{pick(lang,{hi:'सभी देखें',en:'View all',gu:'બધું જુઓ',kn:'ಎಲ್ಲವನ್ನೂ ನೋಡಿ'})} ›</Text>
    </Pressable>}
  </View>;

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
              width: '100%',
              maxWidth: contentWidth,
              alignSelf: 'center',
              paddingHorizontal: gridPadding,
              paddingBottom: spacing.xxl * 3 + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={markTileDrag}
        >
          <View style={styles.hero}>
            <HomeWordmark compact={contentWidth - gridPadding * 2 < 350} />
            <View ref={settingsRef} collapsable={false} style={styles.settingsAnchor}>
              <Pressable
                testID="home-settings"
                accessibilityRole="button"
                accessibilityLabel={contentByLang(lang, 'सेटिंग्स', 'Settings')}
                onPress={() => activateTile(openSettings)}
                onPressIn={() => beginTilePress(openSettings)}
                onPressOut={finishTilePress}
                style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.7 }]}
              >
                <AppIcon name="settings" size={24} color={colors.iconInk} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => activateTile(openSearch)}
            onPressIn={() => beginTilePress(openSearch)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel="Search verses, sections, and mantras"
            style={({ pressed }) => [
              styles.search,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppIcon name="search" size={24} color={colors.iconInk} />
            <Text style={[styles.searchText, { color: colors.inkMuted }, pillTextStyle(lang, typography.cardMeta), { fontSize: 14, textTransform: 'none', letterSpacing: 0 }]}>
              {contentByLang(lang, 'श्लोक, मंत्र और ग्रंथ खोजें', 'Search verses, mantras and texts')}
            </Text>
          </Pressable>

          {todayFestival && (
            <FestiveToran greetingHi={todayFestival.greetingHi} greetingEn={todayFestival.greetingEn} />
          )}

          <TodayStrip />
          <React.Suspense fallback={null}><DeityDayLinks /></React.Suspense>
          <React.Suspense fallback={null}><TodayRecommendationsRow horizontalGutter={gridPadding} /></React.Suspense>
          <React.Suspense fallback={<View style={{minHeight:198}} />}><FeaturedReadings navigation={navigation} width={gridWidth} largeText={largeText}/></React.Suspense>
          <View ref={japaTileRef} collapsable={false}>
            <React.Suspense fallback={<View style={{minHeight:114}} />}><JapmalaBanner navigation={navigation}/></React.Suspense>
          </View>
          <View style={styles.routineInline}>
            <RoutineBanner bannerRef={routineCardRef} />
          </View>

          {heading(pick(lang,{hi:'श्रेणियाँ',en:'Categories',gu:'શ્રેણીઓ',kn:'ವರ್ಗಗಳು'}),true)}
          {/* categoriesGrid tour target rings the whole grid, not one tile. */}
          <View style={[styles.grid, { gap: gridGap }]} ref={categoriesGridRef} collapsable={false}>
            {tiles.map((tile) => (
              <View
                key={tile.key}
                // दान-पुण्य is the grid's full-width closing row (design.md §18);
                // other tiles use the current responsive grid track.
                style={{ width: tile.fullWidth ? gridWidth : tileWidth }}
                ref={tile.key==='theerth'?theerthTileRef:undefined}
                collapsable={tile.key==='theerth'?false:undefined}
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
                  launcherArtwork="illustrated"
                  launcherHeight={launcherHeight}
                  launcherLabelLines={largeText ? 2 : 1}
                />
              </View>
            ))}
          </View>

          {heading(pick(lang,{hi:'कथाएँ और परंपराएँ',en:'Stories and traditions',gu:'કથાઓ અને પરંપરાઓ',kn:'ಕಥೆಗಳು ಮತ್ತು ಸಂಪ್ರದಾಯಗಳು'}))}
          <View style={{ gap: 12, marginBottom: 12 }}>
            <React.Suspense fallback={<View style={{ height: 86 }} />}>
              <KidsStoriesHomeCard
                onPress={() => activateTile(() => navigation.navigate('KidsStoryLibrary'))}
                onPressIn={() => beginTilePress(() => navigation.navigate('KidsStoryLibrary'))}
                onPressOut={finishTilePress}
              />
            </React.Suspense>
            <React.Suspense fallback={<View style={{ height: 86 }} />}>
              <SanatanHomeCard
                onPress={() => activateTile(() => navigation.navigate('SanatanParichay'))}
                onPressIn={() => beginTilePress(() => navigation.navigate('SanatanParichay'))}
                onPressOut={finishTilePress}
              />
            </React.Suspense>
          </View>

          {heading(pick(lang,{hi:'और जानें',en:'Explore more',gu:'વધુ જાણો',kn:'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ'}))}
          <ScrollView
            testID="home-discover-carousel"
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={featureSnap}
            snapToAlignment="start"
            // Full-bleed: cancel the page gutter so the next card peeks, then
            // re-pad the content so the first card lines up with the page.
            style={{ marginHorizontal: -gridPadding }}
            // The vertical padding widens the touch band so an arced horizontal
            // flick scrolls the row instead of opening a card.
            contentContainerStyle={{ paddingHorizontal: gridPadding, gap: featureGap, paddingVertical: 10 }}
            onScrollBeginDrag={markTileDrag}
          >
            {orderedSpotlights.map(({ onPress, ...item }) => (
              <FeatureCard
                key={item.key}
                testID={`home-discover-${item.key}`}
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
  settingsAnchor: { position: 'absolute', top: 0, right: 0 },
  settingsButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  search: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchText: { flex: 1, fontSize: 14, textTransform: 'none', letterSpacing: 0 },
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
