import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';
import { getTodayRecommendationsForDate } from '@/data/discoveryMeta';
import FeatureCard, { type FeatureSpotlight } from '@/components/FeatureCard';
import { navigateToEntryStart } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';
import type { LibraryEntry } from '@/data/texts';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function TodayRecommendationsRow() {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<Nav>();
  const todayKey = useTodayKey();
  const recommendations = React.useMemo(
    () => getTodayRecommendationsForDate(new Date(todayKey)),
    [todayKey]
  );

  if (recommendations.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.sectionLabel,
          { color: colors.inkMuted },
          // sectionLabel is a Latin token (Inter + 2.4 tracking + uppercase). On
          // hi/gu/kn that face has no glyphs (silent system fallback) and the
          // tracking splits the shirorekha, so route through pillTextStyle to
          // swap to the script serif and drop tracking/case. (design.md §3)
          pillTextStyle(lang, typography.sectionLabel),
        ]}
      >
        {contentByLang(lang, 'आज के लिए', 'FOR TODAY')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.xxl }}
        contentContainerStyle={{
          paddingHorizontal: spacing.xxl,
          gap: spacing.sm,
          paddingBottom: 4,
        }}
      >
        {recommendations.slice(0, 6).map((entry) => (
          <View key={entry.id} style={styles.cardWrap}>
            <FeatureCard
              item={spotlightForEntry(entry, typography.thumb.fontFamily, colors.saffronDeep)}
              width={styles.cardWrap.width}
              onPress={() => navigateToEntryStart(navigation, entry)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function spotlightForEntry(
  entry: LibraryEntry,
  thumbFontFamily: string,
  thumbColor: string
): FeatureSpotlight {
  return {
    key: entry.id,
    titleHi: entry.nameHi,
    titleEn: entry.nameEn,
    descHi: 'आज के लिए अनुशंसित',
    descEn: 'Recommended for today',
    ctaHi: 'पढ़ें',
    ctaEn: 'Read',
    icon: (
      <Text
        style={{
          color: thumbColor,
          fontFamily: thumbFontFamily,
          fontSize: 19,
        }}
      >
        {entry.thumb}
      </Text>
    ),
  };
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    gap: 8,
  },
  sectionLabel: {
    // textTransform/letterSpacing/fontFamily are owned by pillTextStyle (script-aware).
    paddingHorizontal: 4,
  },
  cardWrap: {
    width: 292,
  },
});
