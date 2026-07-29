import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { sundarkandChaptersManifest, sundarkandTitleEn, sundarkandTitleHi } from '@/data/sundarkand';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SundarkandChapters'>;

export default function SundarkandChaptersScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { getChapterProgress } = useReadingProgress();

  const title = contentByLang(lang, sundarkandTitleHi, sundarkandTitleEn);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('sundarkand')} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={title}
          onBack={() => navigation.goBack()}
          variant="index"
        />

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
          {sundarkandChaptersManifest.map((chapter) => (
            <GitaChapterCard
              key={chapter.chapter}
              chapter={chapter}
              onPress={() => {
                const resumeIndex = getChapterProgress('sundarkand', chapter.chapter)?.verseIndex ?? 0;
                navigation.navigate('SundarkandReader', { chapter: chapter.chapter, initialIndex: resumeIndex });
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
