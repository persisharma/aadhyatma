/**
 * नया — the Home strip that replaced the DISCOVER carousel (TRD-42 §4/§5).
 *
 * Present-or-absent is the whole vocabulary, the same stance the शुभ योग card
 * takes (design.md §69): when this user has opened everything, the section and
 * its heading render nothing at all. There is no "you're all caught up" state,
 * because that is a sentence nobody needs to read every morning.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { useFeatureSeen } from '@/contexts/FeatureSeenContext';
import { moreTabTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import { useTilePress } from '@/contexts/TilePressContext';
import type { FeatureFeedEntry } from '@/data/home/featureFeed';
import type { HomeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function NewFeaturesSection() {
  const { colors, typography, radii, spacing, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<Nav>();
  const rootNav = useNavigation<any>();
  const { pending, markFeatureSeen } = useFeatureSeen();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();

  const open = React.useCallback(
    (entry: FeatureFeedEntry) => () => {
      // Mark first: the card must be gone when the user comes back, whether or
      // not the navigation itself succeeds.
      markFeatureSeen(entry.id);
      const { target } = entry;
      if (target.tab === 'home') return navigation.navigate(target.screen as never);
      if (target.tab === 'more') return rootNav.navigate('MoreTab', moreTabTarget(target.screen));
      return rootNav.navigate('PanchangTab', panchangTabTarget(target.screen));
    },
    [markFeatureSeen, navigation, rootNav]
  );

  if (pending.length === 0) return null;

  const titleFont = lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.heading,
          // sectionLabel is a Latin token (Inter + tracking + uppercase); Indic
          // scripts take their own serif and drop both (design.md §3).
          pillTextStyle(lang, typography.sectionLabel),
          { color: colors.inkMuted },
        ]}
      >
        {contentByLang(lang, 'नया', 'NEW')}
      </Text>

      {pending.map((entry) => {
        const press = open(entry);
        return (
          <Pressable
            key={entry.id}
            onPress={() => activateTile(press)}
            onPressIn={() => beginTilePress(press)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel={`${entry.titleEn}. ${entry.descEn} Tap to open.`}
            style={({ pressed }) => [
              styles.card,
              {
                borderRadius: radii.md,
                borderColor: colors.cardActiveBorder,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                marginTop: spacing.sm,
              },
              elevation.card,
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={[colors.cardActiveFrom, colors.cardActiveTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.md }]}
            />
            <View style={[styles.thumb, { backgroundColor: colors.cardThumbActiveFrom }]}>
              <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 15, color: colors.saffronDeep }}>
                {entry.thumb}
              </Text>
            </View>
            <View style={styles.text}>
              <Text style={[styles.title, { color: colors.ink, fontFamily: titleFont }]} numberOfLines={1}>
                {contentByLang(lang, entry.titleHi, entry.titleEn)}
              </Text>
              <Text style={[styles.desc, { color: colors.inkSoft, fontFamily: bodyFont }]} numberOfLines={1}>
                {contentByLang(lang, entry.descHi, entry.descEn)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.sm }]}>
              <Text style={[styles.badgeText, { color: colors.newBadgeText }]}>NEW</Text>
            </View>
            <Text style={{ color: colors.gold, fontSize: 17 }}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  heading: { paddingHorizontal: 4, marginBottom: 2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, overflow: 'hidden' },
  thumb: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 14 },
  desc: { fontSize: 11.5, marginTop: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 3 },
  // 10 is the §3.0 floor; Inter carries the Latin "NEW" in every language.
  badgeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2 },
});
