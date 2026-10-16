import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { garudPuranChaptersManifest, type GarudPuranArtId } from '@/data/garud-puran';
import { garudPuranImages, garudPuranThumbFocus } from '@assets/garud-puran';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { readingParchment } from '@/data/backgroundAsset';
import ReaderHeader from '@/components/ReaderHeader';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import LanguageToggle from '@/components/LanguageToggle';
import ListingCard, { ListingScope, ListingSectionHeader, ListingThumbImage } from '@/components/ListingCard';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GarudPuranChapters'>;
const groups = [
  { kind: 'teaching', hi: 'जीवन की सीख', en: 'Teachings for life' },
  { kind: 'story', hi: 'कथाएँ और उनका अर्थ', en: 'Stories and their meaning' },
  { kind: 'tradition', hi: 'परम्पराओं को समझें', en: 'Understanding traditions' },
];

export default function GarudPuranChaptersScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getChapterProgress } = useReadingProgress();
  const listingShare = buildListingShare({
    sourceId: 'garud-puran', titleHi: 'गरुड़ पुराण', titleEn: 'Garud Puran',
    background: readingParchment,
    items: garudPuranChaptersManifest.map((reading) => ({
      titleHi: reading.titleHi, titleEn: reading.titleEn,
      detailHi: `${reading.verseCount} पृष्ठ`, detailEn: `${reading.verseCount} pages`,
    })),
  });
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'left', 'right']}>
      <ReaderHeader
        title={contentByLang(lang, 'गरुड़ पुराण', 'Garud Puran')}
        onBack={() => navigation.goBack()}
        variant="index"
        sideWidth={60}
        right={<ShareButton busy={shareBusy} accessibilityLabel="Share chapter listing" accessibilityHint="Share the complete reading list as post, Story, or Reel cards" onPress={() => void share(listingShare, lang)} />}
      />
      <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
      <ScrollView testID="garud-puran-index" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: 40, gap: spacing.md }}>
        <ListingScope>
          {contentByLang(lang, '12 चयनित पाठ · छोटी कथाएँ और सरल व्याख्या। यह सम्पूर्ण पुराण या श्लोक-दर-श्लोक अनुवाद नहीं है।', '12 selected readings with short stories and simple explanations. An editorial selection, not the complete Purana or a verse-by-verse translation.')}
        </ListingScope>
        {groups.map(group => (
          <View key={group.kind} style={{ gap: spacing.md }}>
            <ListingSectionHeader>{contentByLang(lang, group.hi, group.en)}</ListingSectionHeader>
            {garudPuranChaptersManifest.filter(row => row.kind === group.kind).map(reading => {
              const saved = getChapterProgress('garud-puran', reading.chapter);
              const artId = reading.artId as GarudPuranArtId;
              return (
                <ListingCard
                  key={reading.chapter}
                  testID={`garud-puran-reading-${reading.chapter}`}
                  eyebrow={`${contentByLang(lang, 'पाठ', 'Reading')} ${reading.chapter}`}
                  title={contentByLang(lang, reading.titleHi, reading.titleEn)}
                  meta={`${reading.verseCount} ${contentByLang(lang, 'पृष्ठ', reading.verseCount === 1 ? 'page' : 'pages')}`}
                  progress={saved ? (saved.verseIndex + 1) / reading.verseCount : undefined}
                  thumbnail={<ListingThumbImage source={garudPuranImages[artId]} focusX={garudPuranThumbFocus[artId]} />}
                  onPress={() => navigation.navigate('GarudPuranReader', { chapter: reading.chapter, initialIndex: saved?.verseIndex ?? 0 })}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ root: { flex: 1 } });
