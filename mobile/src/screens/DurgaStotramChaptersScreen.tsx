import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { durgaStotramChaptersManifest, durgaStotramTitleHi, durgaStotramTitleEn } from '@/data/durga-stotram';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import GranthProgressScope from '@/components/GranthProgressScope';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DurgaStotramChapters'>;

export default function DurgaStotramChaptersScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getChapterProgress } = useReadingProgress();

  const title = contentByLang(lang, durgaStotramTitleHi, durgaStotramTitleEn);
  const listingShare = buildListingShare({
    sourceId: 'durga-stotram',
    titleHi: durgaStotramTitleHi, titleEn: durgaStotramTitleEn,
    background: getSourceBackground('durga-stotram'),
    items: durgaStotramChaptersManifest.map((chapter) => ({
      titleHi: chapter.titleHi, titleEn: chapter.titleEn,
      detailHi: `${chapter.verseCount} श्लोक`,
      detailEn: `${chapter.verseCount} verses`,
    })),
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('durga-stotram')} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={title}
          onBack={() => navigation.goBack()}
          sideWidth={60}
          right={<ShareButton busy={shareBusy} accessibilityLabel="Share chapter listing" accessibilityHint="Share the complete chapter list as post, Story, or Reel cards" onPress={() => void share(listingShare, lang)} />}
          variant="index"
        />

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          <GranthProgressScope sourceId="durga-stotram">
            {durgaStotramChaptersManifest.map((chapter) => (
              <GitaChapterCard
                key={chapter.chapter}
                chapter={chapter}
                onPress={() => {
                  const resumeIndex = getChapterProgress('durga-stotram', chapter.chapter)?.verseIndex ?? 0;
                  navigation.navigate('DurgaStotramReader', { chapter: chapter.chapter, initialIndex: resumeIndex });
                }}
              />
            ))}
          </GranthProgressScope>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  toggleRow: { paddingVertical: 8, paddingBottom: 16, alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
});
