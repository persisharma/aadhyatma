import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library, type LibraryEntry } from '@/data/texts';
import { categories } from '@/data/categories';
import { getCategoryBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import LibraryCard from '@/components/LibraryCard';
import ResumeReadingSheet from '@/components/ResumeReadingSheet';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useNewContent } from '@/contexts/NewContentContext';
import { navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import { formatLocation } from '@/utils/formatLocation';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

export default function CategoryListScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { categoryId } = route.params;
  const { getProgress, clearProgress, isLoading } = useReadingProgress();
  const { markSeen } = useNewContent();
  const [pendingEntry, setPendingEntry] = useState<LibraryEntry | null>(null);

  const backgroundImage = useMemo(() => getCategoryBackground(categoryId), [categoryId]);
  const categoryMeta = categories.find((c) => c.id === categoryId);
  const items = library.filter((e) => e.category === categoryId && !e.hidden);

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
      <StatusBar barStyle="light-content" />
      <BackgroundLayer source={backgroundImage} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Top bar */}
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
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              {categoryMeta?.nameHi ?? ''}
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 13,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {categoryMeta?.nameEn ?? ''}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((entry) => {
            const onPress = entry.status === 'active' ? () => handlePress(entry) : undefined;
            return <LibraryCard key={entry.id} entry={entry} onPress={onPress} />;
          })}
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
            markSeen(entry.id);
            setPendingEntry(null);
            clearProgress(entry.id);
            navigateToEntryStart(navigation, entry);
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
});
