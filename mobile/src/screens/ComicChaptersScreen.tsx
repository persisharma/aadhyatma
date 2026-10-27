import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import LanguageToggle from '@/components/LanguageToggle';
import ComicArt from '@/components/ComicArt';
import ListingCard, { ListingScope } from '@/components/ListingCard';
import { comicById } from '@/data/comics';
import { getComicBook, comicLanguage } from '@/data/comicBooks';
import { episodeCover } from '@/data/comicBooks/episodeCovers';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

export default function ComicChaptersScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'ComicChapters'>) {
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { colors, spacing } = useTheme();
  // Comic copy exists in hi/en only; gu/kn read the labelled English fallback.
  const language = comicLanguage(lang);
  const comic = comicById(route.params.comicId);
  const book = getComicBook(route.params.comicId);
  const episodes = book?.episodes ?? [];
  const kanda = comic?.kanda;
  const scope = kanda ? pick(lang, {
    hi: `${episodes.length} प्रसंग · वाल्मीकि रामायण के ${kanda.hi} की चित्र-कथा। श्लोक-दर-श्लोक अनुवाद नहीं है।`,
    en: `${episodes.length} episodes · A picture retelling of the ${kanda.en} of the Valmiki Ramayana. Not a verse-by-verse translation.`,
    gu: `${episodes.length} પ્રસંગ · વાલ્મીકિ રામાયણના ${kanda.gu}ની ચિત્રકથા. શ્લોક-દર-શ્લોક અનુવાદ નથી.`,
    kn: `${episodes.length} ಪ್ರಸಂಗಗಳು · ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣದ ${kanda.kn} ಚಿತ್ರಕಥೆ. ಶ್ಲೋಕ-ದರ-ಶ್ಲೋಕ ಅನುವಾದವಲ್ಲ.`,
  }) : '';
  const listingShare = comic && book ? buildListingShare({
    sourceId: route.params.comicId,
    titleHi: comic.title.hi, titleEn: comic.title.en,
    background: null,
    items: book.episodes.map((episode, index) => ({
      titleHi: episode.hi.title, titleEn: episode.en.title,
      detailHi: `प्रसंग ${index + 1}`, detailEn: `Episode ${index + 1}`,
    })),
  }) : null;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader
      title={comic ? pick(lang, comic.title) : ''}
      variant="index"
      onBack={() => navigation.goBack()}
      sideWidth={60}
      right={listingShare ? <ShareButton busy={shareBusy} accessibilityLabel="Share episode listing" accessibilityHint="Share the complete episode list as post, Story, or Reel cards" onPress={() => void share(listingShare, lang)} /> : null}
    />
    <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
    <FlatList testID="comic-episodes" data={episodes} extraData={lang} keyExtractor={episode => episode.id}
      contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.md, gap: spacing.md }}
      initialNumToRender={4} maxToRenderPerBatch={4} windowSize={5}
      ListHeaderComponent={episodes.length ? <ListingScope testID="comic-scope">{scope}</ListingScope> : null}
      ListEmptyComponent={<Text style={{ color: colors.ink }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>}
      renderItem={({ item: episode, index }) => {
        const cover = episodeCover(episode);
        const title = episode[language].title;
        return <ListingCard
          testID={`comic-episode-${episode.id}`}
          eyebrow={`${language === 'hi' ? 'प्रसंग' : 'Episode'} ${index + 1}`}
          title={title}
          meta={`${episode.panels.length} ${language === 'hi' ? 'पृष्ठ' : 'pages'}`}
          thumbnail={<ComicArt compact fill panel={cover.panel} comicId={route.params.comicId} focusX={cover.focusX} label={title} />}
          onPress={() => navigation.navigate('ComicReader', { comicId: route.params.comicId, episodeId: episode.id })}
        />;
      }} />
  </SafeAreaView>;
}
