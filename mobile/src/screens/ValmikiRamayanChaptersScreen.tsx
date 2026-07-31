import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import {
  valmikiRamayanChaptersManifest,
  valmikiRamayanTitleEn,
  valmikiRamayanTitleHi,
} from '@/data/valmiki-ramayan';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ValmikiRamayanChapters'>;

export default function ValmikiRamayanChaptersScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { getChapterProgress } = useReadingProgress();

  const title = contentByLang(lang, valmikiRamayanTitleHi, valmikiRamayanTitleEn);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('valmiki-ramayan')} />

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
          {valmikiRamayanChaptersManifest.map((chapter) => (
            <GitaChapterCard
              key={chapter.chapter}
              chapter={chapter}
              // The epic's subsection unit is the kāṇḍa, not the Gita's अध्याय, and
              // each one holds ślokas (design.md §53, §3 pill vocabulary).
              chapterLabelHi="काण्ड"
              chapterLabelEn="Kanda"
              unitLabelHi="श्लोक"
              unitLabelEn="shlokas"
              unitLabelEnSingular="shloka"
              onPress={() => {
                const resumeIndex =
                  getChapterProgress('valmiki-ramayan', chapter.chapter)?.verseIndex ?? 0;
                navigation.navigate('ValmikiRamayanReader', {
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
