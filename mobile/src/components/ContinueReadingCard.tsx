import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { library } from '@/data/texts';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { buildProgressTarget } from '@/navigation/entryRoutes';
import { latestReadingProgress } from '@/utils/latestProgress';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont } from '@/utils/langType';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * Home "Continue reading" card (design.md §49): surfaces the most recent
 * reading position so the daily loop starts from Home, not from re-finding the
 * text inside its category. Hidden until some progress exists. Routing reuses
 * the same table as bookmarks/notification deep links (`buildProgressTarget`),
 * so the card can never drift from what the readers accept.
 */
export default function ContinueReadingCard() {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { progress, isLoading } = useReadingProgress();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const latest = React.useMemo(() => latestReadingProgress(progress), [progress]);
  if (isLoading || !latest) return null;

  const sourceId = canonicalSourceId(latest.sourceId);
  const entry = library.find((e) => e.id === sourceId && e.status === 'active' && !e.hidden);
  const target = buildProgressTarget(latest);
  if (!entry || !target) return null;

  const { primary } = orderTitlesByLanguage(lang, entry.nameHi, entry.nameEn, {
    devPrimary: 15,
    devSecondary: 12,
    latPrimary: 16,
    latSecondary: 12,
  });

  const verseNo = latest.verseIndex + 1;
  const positionHi =
    latest.chapter != null ? `अध्याय ${latest.chapter} · श्लोक ${verseNo}` : `श्लोक ${verseNo}`;
  const positionEn =
    latest.chapter != null ? `Chapter ${latest.chapter} · Verse ${verseNo}` : `Verse ${verseNo}`;

  return (
    <Pressable
      onPress={() =>
        (navigation.navigate as (name: keyof HomeStackParamList, params: object) => void)(
          target.screen,
          target.params
        )
      }
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.lg,
        },
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Continue reading. ${entry.nameEn}, ${positionEn}. Tap to resume.`}
    >
      <View style={[styles.thumb, { backgroundColor: colors.saffronTint, borderRadius: radii.md }]}>
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 20,
            color: colors.saffronDeep,
            includeFontPadding: false,
          }}
        >
          {entry.thumb}
        </Text>
      </View>
      <View style={styles.body}>
        <Text
          style={[pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}
        >
          {contentByLang(lang, 'जारी रखें', 'Continue reading')}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            color: colors.ink,
            fontFamily: primary.fontFamily,
            fontSize: primary.fontSize,
            fontStyle: primary.fontStyle,
            letterSpacing: primary.letterSpacing,
          }}
        >
          {primary.text}
        </Text>
        {/* Position line: numerals/ranges never render in the thin italic face
            (design.md §3) — Devanagari serif carries hi/gu/kn, semibold Latin carries en. */}
        <Text
          numberOfLines={1}
          style={{
            marginTop: 1,
            color: colors.inkMuted,
            fontSize: 12,
            fontFamily:
              lang === 'en'
                ? fontFamilies.latinSemiBold
                : scriptBodyFont(lang, fontFamilies.devanagari),
          }}
        >
          {contentByLang(lang, positionHi, positionEn)}
        </Text>
      </View>
      <View style={[styles.cta, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
        <Text
          style={[
            pillTextStyle(lang, { ...typography.versePill, fontSize: 12 }),
            { color: colors.saffronDeep },
          ]}
        >
          {contentByLang(lang, 'पढ़ें', 'Read')} ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // Own top margin (not the parent's) so the gap collapses with the card
    // when there is no progress yet and the component renders nothing.
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  thumb: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
});
