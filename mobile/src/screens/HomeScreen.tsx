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
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { rotateLeadByDay, dayOfYear } from '@/utils/rotateByDay';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { hasNewInCategory, devSimulateUpgrade, devResetNewState } = useNewContent();
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
  };

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    status: 'active';
    icon?: React.ReactNode;
    onPress: () => void;
    hasNew?: boolean;
  };

  const tiles: TileItem[] = [
    ...categories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      status: 'active' as const,
      icon: categoryIcons[c.id],
      hasNew: hasNewInCategory(c.id),
      onPress: () =>
        c.id === 'theerth'
          ? navigation.navigate('TheerthMap', {})
          : navigation.navigate('CategoryList', { categoryId: c.id as ContentCategory }),
    })),
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
  const tileWidth = (screenWidth - 2 * gridPadding - gridGap) / 2;

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
      eyebrowHi: 'नित्य', eyebrowEn: 'Practice',
      titleHi: 'नित्य साधना', titleEn: 'Daily Practice',
      descHi: 'अपनी दैनिक साधना चुनें और निरंतरता बनाए रखें।',
      descEn: 'Pick your daily rituals and keep the streak alive.',
      ctaHi: 'शुरू करें', ctaEn: 'Begin',
      icon: <LotusMark size={28} />,
      onPress: () => navigation.navigate('RoutineToday'),
    },
    {
      key: 'daily-bhakti',
      eyebrowHi: 'आज', eyebrowEn: 'Today',
      titleHi: 'दैनिक भक्ति', titleEn: 'Daily Verse',
      descHi: 'हर दिन एक नया श्लोक चिंतन और भक्ति के लिए।',
      descEn: 'A fresh shloka to reflect on every single day.',
      ctaHi: 'पढ़ें', ctaEn: 'Read',
      icon: <CategoryIcon iconKey="stotram" />,
      onPress: () => rootNav.navigate('DailyBhaktiTab'),
    },
    {
      key: 'panchang',
      eyebrowHi: 'पंचांग', eyebrowEn: 'Calendar',
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
      key: 'theerth',
      eyebrowHi: 'तीर्थ', eyebrowEn: 'Journeys',
      titleHi: 'तीर्थ यात्रा', titleEn: 'Sacred Journeys',
      descHi: 'भारत के पवित्र मंदिरों और धामों की खोज करें।',
      descEn: 'Explore sacred temples and dhams across Bharat.',
      ctaHi: 'खोजें', ctaEn: 'Explore',
      icon: <CategoryIcon iconKey="theerth" />,
      onPress: () => navigation.navigate('TheerthMap', {}),
    },
  ];

  // All cards always render (awareness = coverage); only the lead rotates, once
  // per day, so Home feels fresh without ever hiding a section. Seed is the
  // day-of-year — stable across renders within a day. See utils/rotateByDay.
  const orderedSpotlights = rotateLeadByDay(spotlights, dayOfYear(new Date()));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
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

          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontWeight: typography.sectionLabel.fontWeight,
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
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontWeight: typography.sectionLabel.fontWeight,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            CATEGORIES
          </Text>

          <View style={[styles.grid, { gap: gridGap }]}>
            {tiles.map((tile) => (
              <View key={tile.key} style={{ width: tileWidth }}>
                <CategoryCard
                  nameHi={tile.nameHi}
                  nameEn={tile.nameEn}
                  status={tile.status}
                  icon={tile.icon}
                  onPress={tile.onPress}
                  hasNew={tile.hasNew}
                />
              </View>
            ))}
          </View>

          <Text
            style={[
              styles.footer,
              {
                color: colors.inkMuted,
                fontFamily: typography.footerMantra.fontFamily,
                fontSize: typography.footerMantra.fontSize,
                letterSpacing: typography.footerMantra.letterSpacing,
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
      <RoutineBanner />
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
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 36,
    includeFontPadding: false,
  },
});
