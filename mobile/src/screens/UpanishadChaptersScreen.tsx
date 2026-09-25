import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import {
  upanishadChaptersManifest,
  upanishadTitleEn,
  upanishadTitleHi,
} from '@/data/upanishad';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UpanishadChapters'>;

export default function UpanishadChaptersScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { getChapterProgress } = useReadingProgress();

  const title = contentByLang(lang, upanishadTitleHi, upanishadTitleEn);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('upanishad')} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: spacing.screenGutter, gap: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {upanishadChaptersManifest.map((chapter) => (
            <GitaChapterCard
              key={chapter.chapter}
              // The card's count is the mantras proper; the śānti-pāṭha page is
              // not a mantra of the text, so `verseCount` (pages) would overstate
              // it by one (design.md §75).
              chapter={{
                chapter: chapter.chapter,
                titleHi: chapter.titleHi,
                titleEn: chapter.titleEn,
                verseCount: chapter.mantraCount,
              }}
              // The subsection unit is the Upanishad itself, not the Gita's अध्याय,
              // and each one holds mantras (design.md §75, §3 pill vocabulary).
              chapterLabelHi="उपनिषद्"
              chapterLabelEn="Upanishad"
              unitLabelHi="मन्त्र"
              unitLabelEn="mantras"
              unitLabelEnSingular="mantra"
              onPress={() => {
                const resumeIndex =
                  getChapterProgress('upanishad', chapter.chapter)?.verseIndex ?? 0;
                navigation.navigate('UpanishadReader', {
                  chapter: chapter.chapter,
                  initialIndex: resumeIndex,
                });
              }}
            />
          ))}
        </ScrollView>
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
  toggleRow: {
    paddingVertical: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
