import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { gitaChaptersManifest, gitaTitleEn, gitaTitleHi } from '@/data/gita';
import { BHAGAVATAM_ID, bhagavatamChaptersManifest, bhagavatamTitleHi, bhagavatamTitleEn } from '@/data/bhagavatam';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { cardFontByLang } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import BackgroundLayer from '@/components/BackgroundLayer';
import FocusedLightStatusBar from '@/components/FocusedLightStatusBar';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import GranthProgressScope from '@/components/GranthProgressScope';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { GitaReaderParams, RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GitaChapters'>;

export default function GitaChaptersIndexScreen({ navigation }: Props) {
  return <GitaStyleChapters onBack={() => navigation.goBack()} onOpenChapter={params => navigation.navigate('GitaReader', params)} />;
}

export function GitaStyleChapters({ isBhagavatam = false, onBack, onOpenChapter }: {
  isBhagavatam?: boolean;
  onBack: () => void;
  onOpenChapter: (params: GitaReaderParams) => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getChapterProgress } = useReadingProgress();

  const sourceId = isBhagavatam ? BHAGAVATAM_ID : 'bhagavad-gita';
  const chapters = isBhagavatam ? bhagavatamChaptersManifest : gitaChaptersManifest;
  const titleHi = isBhagavatam ? bhagavatamTitleHi : gitaTitleHi;
  const titleEn = isBhagavatam ? bhagavatamTitleEn : gitaTitleEn;
  const title = contentByLang(lang, titleHi, titleEn);
  const background = getSourceBackground(sourceId);
  const listingShare = buildListingShare({
    sourceId,
    titleHi: isBhagavatam ? `${titleHi} · चयनित पाठ` : titleHi,
    titleEn: isBhagavatam ? `${titleEn} · Selected readings` : titleEn,
    background,
    items: chapters.map((chapter) => ({
      titleHi: chapter.titleHi, titleEn: chapter.titleEn,
      detailHi: `${chapter.verseCount} श्लोक`,
      detailEn: `${chapter.verseCount} verses`,
    })),
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <FocusedLightStatusBar />
      <BackgroundLayer source={background} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={title}
          onBack={onBack}
          sideWidth={60}
          right={<ShareButton busy={shareBusy} accessibilityLabel="Share chapter listing" accessibilityHint="Share the complete chapter list as post, Story, or Reel cards" onPress={() => void share(listingShare, lang)} />}
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
          {isBhagavatam && <Text style={[typography.catalogBody, { textAlign: 'center', color: colors.inkMuted, fontFamily: cardFontByLang(lang) }]}>
            {contentByLang(lang, 'चयनित पाठ', 'Selected readings')}
          </Text>}
          <GranthProgressScope sourceId={sourceId}>
            {chapters.map((chapter) => (
              <GitaChapterCard
                key={chapter.chapter}
                chapter={chapter}
                onPress={() => {
                  const resumeIndex = getChapterProgress(sourceId, chapter.chapter)?.verseIndex ?? 0;
                  onOpenChapter({ chapter: chapter.chapter, initialIndex: resumeIndex });
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
