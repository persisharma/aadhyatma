import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import { library, type LibraryEntry } from '@/data/texts';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { buildProgressTarget, navigateToProgress } from '@/navigation/entryRoutes';
import { readingProgressByRecency } from '@/utils/latestProgress';
import { formatLocation } from '@/utils/formatLocation';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont } from '@/utils/langType';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * Home "Continue reading" card (design.md §49): surfaces the most recent
 * *resumable* reading position so the daily loop starts from Home. Walks the
 * progress entries newest-first and shows the first one whose source is still
 * active/visible and routable — a hidden or retired source falls through to
 * the next entry instead of blanking the card. Navigation goes through
 * `navigateToProgress` — the same path as the resume sheets — so chaptered
 * sources get the chapters screen pushed under the reader (back lands on the
 * chapter list, not Home).
 */
export default function ContinueReadingCard() {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { progress, isLoading } = useReadingProgress();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const resumable = React.useMemo(() => {
    let found: { latest: ReadingProgress; entry: LibraryEntry } | null = null;
    for (const candidate of readingProgressByRecency(progress)) {
      const sourceId = canonicalSourceId(candidate.sourceId);
      const entry = library.find((e) => e.id === sourceId && e.status === 'active' && !e.hidden);
      // theerth is excluded: its progress target is the map, not a reader, and
      // navigateToProgress (deliberately) has no theerth branch.
      if (entry && entry.category !== 'theerth' && buildProgressTarget(candidate)) {
        found = { latest: candidate, entry };
        break;
      }
    }
    return found;
  }, [progress]);

  if (isLoading || !resumable) return null;
  const { latest, entry } = resumable;

  const { primary } = orderTitlesByLanguage(lang, entry.nameHi, entry.nameEn, {
    devPrimary: 15,
    devSecondary: 12,
    latPrimary: 16,
    latSecondary: 12,
  });

  // Per-source unit words (Sarga/Kanda/Stotram/पद …) come from the shared
  // formatLocation helper — same labels as the resume sheets.
  const position = formatLocation(latest);
  const positionEn = position.en;

  return (
    <Pressable
      onPress={() => navigateToProgress(navigation, latest)}
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
          {contentByLang(lang, position.hi, position.en)}
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
