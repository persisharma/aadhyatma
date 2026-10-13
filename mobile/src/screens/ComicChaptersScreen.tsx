import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import ComicArt from '@/components/ComicArt';
import ComicLanguageNotice from '@/components/ComicLanguageNotice';
import { comicById } from '@/data/comics';
import { getComicBook, comicLanguage } from '@/data/comicBooks';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

export default function ComicChaptersScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'ComicChapters'>) {
  const { lang } = useGitaLanguage();
  const { colors, spacing, radii, typography, elevation } = useTheme();
  const language = comicLanguage(lang);
  const comic = comicById(route.params.comicId);
  const book = getComicBook(route.params.comicId);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={comic ? pick(lang, comic.title) : ''} variant="index" onBack={() => navigation.goBack()} />
    <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
    <ComicLanguageNotice />
    <FlatList testID="comic-episodes" data={book?.episodes ?? []} extraData={lang} keyExtractor={episode => episode.id}
      contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.md, gap: spacing.md }}
      initialNumToRender={4} maxToRenderPerBatch={4} windowSize={5}
      ListEmptyComponent={<Text style={{ color: colors.ink }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>}
      renderItem={({ item: episode, index }) => <Pressable testID={`comic-episode-${episode.id}`} accessibilityRole="button"
        accessibilityLabel={`${index + 1}. ${episode[language].title}`}
        onPress={() => navigation.navigate('ComicReader', { comicId: route.params.comicId, episodeId: episode.id })}
        style={({ pressed }) => ({ borderWidth: 1, borderColor: colors.cardActiveBorder, borderRadius: radii.lg, overflow: 'hidden', padding: 14, ...elevation.raised, opacity: pressed ? 0.85 : 1 })}>
        <LinearGradient colors={[colors.cardActiveFrom, colors.cardActiveTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 100, borderRadius: radii.sm, overflow: 'hidden' }}><ComicArt compact panel={episode.panels[0]} label={episode[language].title} /></View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ color: colors.saffronDeep, fontFamily: titleFontByLang(language), fontSize: typography.meaningLabel.fontSize }}>{language === 'hi' ? 'प्रसंग' : 'Episode'} {index + 1}</Text>
            <Text style={{ color: colors.ink, fontFamily: titleFontByLang(language), fontSize: typography.cardHindi.fontSize }}>{episode[language].title}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: titleFontByLang(language === 'hi' ? 'en' : 'hi'), fontSize: typography.cardLatin.fontSize }}>{episode[language === 'hi' ? 'en' : 'hi'].title}</Text>
          </View>
          <Text accessible={false} style={{ color: colors.saffron, fontSize: 26 }}>›</Text>
        </View>
      </Pressable>} />
  </SafeAreaView>;
}
