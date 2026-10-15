import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import ComicArt from '@/components/ComicArt';
import ComicLanguageNotice from '@/components/ComicLanguageNotice';
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
  const { colors, spacing } = useTheme();
  // Comic copy exists in hi/en only; gu/kn read the labelled English fallback.
  const language = comicLanguage(lang);
  const comic = comicById(route.params.comicId);
  const book = getComicBook(route.params.comicId);
  const episodes = book?.episodes ?? [];
  const scope = language === 'hi'
    ? `${episodes.length} प्रसंग · वाल्मीकि रामायण के बालकाण्ड की चित्र-कथा। श्लोक-दर-श्लोक अनुवाद नहीं है।`
    : `${episodes.length} episodes · A picture retelling of the Bala Kanda of the Valmiki Ramayana. Not a verse-by-verse translation.`;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={comic ? pick(lang, comic.title) : ''} variant="index" onBack={() => navigation.goBack()} />
    <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
    <ComicLanguageNotice />
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
          thumbnail={<ComicArt compact fill panel={cover.panel} focusX={cover.focusX} label={title} />}
          onPress={() => navigation.navigate('ComicReader', { comicId: route.params.comicId, episodeId: episode.id })}
        />;
      }} />
  </SafeAreaView>;
}
