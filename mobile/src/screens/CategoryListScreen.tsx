import React, { useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library, type LibraryEntry } from '@/data/texts';
import { categories } from '@/data/categories';
import { getRandomListingBackground } from '@/data/listingBackgrounds';
import LibraryCard from '@/components/LibraryCard';
import ResumeReadingSheet from '@/components/ResumeReadingSheet';
import {
  useReadingProgress,
  type ReadingProgress,
} from '@/contexts/ReadingProgressContext';
import { navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

export default function CategoryListScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { categoryId } = route.params;
  const { getProgress, clearProgress } = useReadingProgress();
  const [pendingEntry, setPendingEntry] = useState<LibraryEntry | null>(null);

  const backgroundImage = useMemo(() => getRandomListingBackground(), []);
  const categoryMeta = categories.find((c) => c.id === categoryId);
  const items = library.filter((e) => e.category === categoryId && !e.hidden);

  const handlePress = (entry: LibraryEntry) => {
    const progress = getProgress(entry.id);
    if (progress && progress.verseIndex > 0) {
      setPendingEntry(entry);
      return;
    }
    navigateToEntryStart(navigation, entry);
  };

  const pendingProgress = pendingEntry ? getProgress(pendingEntry.id) : undefined;
  const location = pendingProgress ? formatLocation(pendingProgress) : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={backgroundImage} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
          locations={[0, 0.4, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>
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
            setPendingEntry(null);
            navigateToProgress(navigation, progress);
          }}
          onStartOver={() => {
            const entry = pendingEntry;
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

function formatLocation(progress: ReadingProgress): { hi: string; en: string } {
  const verseNum = progress.verseIndex + 1;
  switch (progress.sourceId) {
    case 'hanuman-chalisa':
    case 'shiv-chalisa':
    case 'durga-chalisa':
    case 'ganesh-chalisa':
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
    case 'bhagavad-gita':
      return {
        hi: `अध्याय ${progress.chapter} · श्लोक ${verseNum}`,
        en: `Chapter ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'sundarkand':
      return {
        hi: `सर्ग ${progress.chapter} · पद ${verseNum}`,
        en: `Sarga ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'shiva-strotam':
    case 'durga-stotram':
    case 'ganesh-stotram':
    case 'vishnu-sahasranama':
    case 'hanuman-ashtak':
    case 'ram-stuti':
      return {
        hi: `स्तोत्र ${progress.chapter} · पद ${verseNum}`,
        en: `Stotram ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'ramcharitmanas':
      return {
        hi: `काण्ड ${progress.chapter} · पद ${verseNum}`,
        en: `Kanda ${progress.chapter} · Verse ${verseNum}`,
      };
    case 'om-jai-jagdish':
    case 'hanuman-aarti':
    case 'sankat-mochan':
    case 'jai-ganesh-deva':
    case 'om-jai-shiv-omkara':
    case 'jai-ambe-gauri':
    case 'aarti-kunj-bihari':
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
    default:
      return { hi: `पद ${verseNum}`, en: `Verse ${verseNum}` };
  }
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
