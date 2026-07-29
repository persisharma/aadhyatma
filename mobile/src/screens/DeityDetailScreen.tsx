import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { deityEssays } from '@/data/deityEssays';
import { getDeityBackground } from '@/data/backgrounds';
import { library, type ContentCategory, type LibraryEntry } from '@/data/texts';
import BackgroundLayer from '@/components/BackgroundLayer';
import LibraryCard from '@/components/LibraryCard';
import ResumeReadingSheet from '@/components/ResumeReadingSheet';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useNewContent } from '@/contexts/NewContentContext';
import { isChapteredEntry, navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import { formatLocation } from '@/utils/formatLocation';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DeityDetail'>;

export default function DeityDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { deityId } = route.params;
  const { getProgress, clearProgress, clearChapterProgress, isLoading } = useReadingProgress();
  const { markSeen } = useNewContent();
  const [pendingEntry, setPendingEntry] = useState<LibraryEntry | null>(null);
  const backgroundImage = useMemo(() => getDeityBackground(deityId), [deityId]);
  const deityMeta = deities.find((d) => d.id === deityId);
  const essay = deityEssays[deityId];
  const title = orderTitlesByLanguage(lang, deityMeta?.nameHi ?? '', deityMeta?.nameEn ?? '', {
    devPrimary: 16,
    devSecondary: 13,
    latPrimary: 16,
    latSecondary: 13,
  });
  const groups = useMemo(() => {
    const byCategory = new Map<ContentCategory, LibraryEntry[]>();
    for (const entry of library) {
      if (entry.hidden || entry.status !== 'active' || !entry.deities.includes(deityId)) continue;
      const list = byCategory.get(entry.category) ?? [];
      list.push(entry);
      byCategory.set(entry.category, list);
    }
    return categories
      .map((category) => ({ category, items: byCategory.get(category.id) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [deityId]);

  const handlePress = (entry: LibraryEntry) => {
    if (isLoading) {
      markSeen(entry.id);
      navigateToEntryStart(navigation, entry);
      return;
    }
    const progress = getProgress(entry.id);
    if (progress && progress.verseIndex > 0) {
      setPendingEntry(entry);
      return;
    }
    markSeen(entry.id);
    navigateToEntryStart(navigation, entry);
  };

  const pendingProgress = pendingEntry ? getProgress(pendingEntry.id) : undefined;
  const location = pendingProgress ? formatLocation(pendingProgress) : null;

  return (
    <View style={styles.root}>
      <BackgroundLayer source={backgroundImage} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: title.primary.fontFamily,
                fontSize: title.primary.fontSize,
                fontStyle: title.primary.fontStyle,
                color: colors.ink,
              }}
            >
              {title.primary.text}
            </Text>
            <Text
              style={{
                fontFamily: title.secondary.fontFamily,
                fontSize: title.secondary.fontSize,
                fontStyle: title.secondary.fontStyle,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {title.secondary.text}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.essay,
              {
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
                backgroundColor: colors.cardSurface,
              },
            ]}
          >
            <Text
              style={{
                color: colors.ink,
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 18,
              }}
            >
              {essay
                ? contentByLang(lang, essay.titleHi, essay.titleEn)
                : contentByLang(lang, deityMeta?.nameHi ?? '', deityMeta?.nameEn ?? '')}
            </Text>
            {essay && (
              <Text
                style={{
                  color: colors.inkSoft,
                  fontFamily: lang === 'en' ? typography.meaningEnglish.fontFamily : typography.meaning.fontFamily,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {contentByLang(lang, essay.bodyHi, essay.bodyEn)}
              </Text>
            )}
          </View>

          {groups.map(({ category, items }) => (
            <View key={category.id} style={styles.group}>
              <Text
                style={[
                  { color: colors.saffronDeep },
                  // sectionLabel is a Latin token (Inter + tracking); route Indic
                  // text through pillTextStyle to swap to the script serif and drop
                  // tracking so the shirorekha stays intact. (design.md §3)
                  pillTextStyle(lang, typography.sectionLabel),
                ]}
              >
                {contentByLang(lang, category.nameHi, category.nameEn)} {items.length}
              </Text>
              {items.map((entry) => (
                <LibraryCard key={entry.id} entry={entry} onPress={() => handlePress(entry)} />
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {pendingEntry && pendingProgress && location && (
        <ResumeReadingSheet
          visible
          titleHi={pendingEntry.nameHi}
          titleEn={pendingEntry.nameEn}
          locationHi={location.hi}
          locationEn={location.en}
          onResume={() => {
            const progress = pendingProgress;
            markSeen(pendingEntry.id);
            setPendingEntry(null);
            navigateToProgress(navigation, progress);
          }}
          onStartOver={() => {
            const entry = pendingEntry;
            const progress = pendingProgress;
            markSeen(entry.id);
            setPendingEntry(null);
            if (isChapteredEntry(entry) && progress?.chapter != null) {
              clearChapterProgress(entry.id, progress.chapter);
              navigateToProgress(navigation, { ...progress, verseIndex: 0 });
            } else {
              clearProgress(entry.id);
              navigateToEntryStart(navigation, entry);
            }
          }}
          onDismiss={() => setPendingEntry(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  essay: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  group: {
    gap: 10,
  },
});
