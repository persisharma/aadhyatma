import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';
import {
  getTodayRecommendationDetails,
  type TodayRecommendation,
} from '@/data/discoveryMeta';
import FeatureCard, { type FeatureSpotlight } from '@/components/FeatureCard';
import { navigateToEntryStart } from '@/navigation/entryRoutes';
import { useTodayAbujh } from '@/panchang/useMuhuratFinder';
import { getTodayFestival } from '@/data/discoveryMeta';
import type { HomeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function TodayRecommendationsRow() {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<Nav>();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = useTilePress();
  const todayKey = useTodayKey();
  const today = React.useMemo(() => new Date(todayKey), [todayKey]);
  const recommendations = React.useMemo(
    () => getTodayRecommendationDetails(today),
    [today]
  );
  // अबूझ मुहूर्त (PRD-16 §4.2) — resolved off the render path, null on an
  // ordinary day. It rides the ROW rather than `getTodayRecommendationDetails`
  // because that function returns LibraryEntry recommendations and is asserted
  // on by festiveReminders.test.ts; keeping it entry-only leaves the notification
  // ⇄ FOR TODAY contract exactly as it is.
  const abujh = useTodayAbujh(today);
  // On a catalogued festival day the festival card must still LEAD (the same
  // test pins that promise), so the abujh card slots in second. On any other
  // abujh day — Guru/Ravi Pushya, which is the common case — it leads.
  const abujhIndex = React.useMemo(() => {
    if (!abujh) return -1;
    try {
      return getTodayFestival(today) ? 1 : 0;
    } catch {
      return 0;
    }
  }, [abujh, today]);

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
        // A horizontal swipe here is a scroll, not a tap — suppress the shared
        // first-tap fallback so a swipe never opens a card.
        onScrollBeginDrag={markTileDrag}
      >
        {recommendations.slice(0, 6).flatMap((recommendation, i) => {
          const { entry } = recommendation;
          const open = () => navigateToEntryStart(navigation, entry);
          const card = (
            <View key={entry.id} style={styles.cardWrap}>
              <FeatureCard
                item={spotlightForEntry(
                  recommendation,
                  typography.thumb.fontFamily,
                  colors.saffronDeep
                )}
                width={styles.cardWrap.width}
                onPress={() => activateTile(open)}
                onPressIn={() => beginTilePress(open)}
                onPressOut={finishTilePress}
              />
            </View>
          );
          if (i !== abujhIndex || !abujh) return [card];
          // Sibling tab — dispatch through the parent, same as TodayStrip's
          // Panchang hand-off. `initial: false` so a cold tap cannot make
          // AbujhDays the lazily-mounted Panchang stack's initial route.
          const openAbujh = () =>
            (navigation as unknown as { navigate: (n: string, p?: object) => void }).navigate(
              'PanchangTab',
              { screen: 'AbujhDays', initial: false }
            );
          const abujhCard = (
            <View key="abujh-today" style={styles.cardWrap} testID="for-today-abujh">
              <FeatureCard
                item={{
                  key: 'abujh-today',
                  titleHi: abujh.nameHi,
                  titleEn: abujh.nameEn,
                  descHi: 'अबूझ मुहूर्त — कोई भी समय शुभ',
                  descEn: 'Auspicious all day — no shuddhi needed',
                  ctaHi: 'देखें',
                  ctaEn: 'View',
                  icon: (
                    <Text style={{ color: colors.saffronDeep, fontFamily: typography.thumb.fontFamily, fontSize: 19 }}>
                      ॥
                    </Text>
                  ),
                }}
                width={styles.cardWrap.width}
                onPress={() => activateTile(openAbujh)}
                onPressIn={() => beginTilePress(openAbujh)}
                onPressOut={finishTilePress}
              />
            </View>
          );
          // Index 0 => abujh leads; index 1 => it follows the festival card.
          return abujhIndex === 0 ? [abujhCard, card] : [card, abujhCard];
        })}
      </ScrollView>
    </View>
  );
}

function spotlightForEntry(
  { entry, festivalHi, festivalEn }: TodayRecommendation,
  thumbFontFamily: string,
  thumbColor: string
): FeatureSpotlight {
  // A festival card names the occasion instead of the generic line, so a reader
  // arriving from the morning's festive reminder lands on the same festival the
  // notification greeted them with (design.md §38 / §50).
  const isFestival = Boolean(festivalHi && festivalEn);
  return {
    key: entry.id,
    titleHi: entry.nameHi,
    titleEn: entry.nameEn,
    descHi: isFestival ? `आज ${festivalHi} है` : 'आज के लिए अनुशंसित',
    descEn: isFestival ? `Today is ${festivalEn}` : 'Recommended for today',
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
