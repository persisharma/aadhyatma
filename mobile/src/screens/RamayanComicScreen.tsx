import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from '@/components/ListCard';
import DeityIcon from '@/components/DeityIcon';
import { ramayanaKandas, comicById } from '@/data/comics';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

/** The seven-kanda comic shelf (design.md §76.2). Shipped kandas open their
 * chapter listing; the rest are muted "coming soon" rows until their edition
 * ships. */
export default function RamayanComicScreen({ navigation }: NativeStackScreenProps<HomeStackParamList, 'RamayanComic'>) {
  const { lang } = useGitaLanguage();
  const { colors, spacing, typography } = useTheme();
  const title = pick(lang, { hi: 'रामायण कॉमिक', en: 'Ramayana Comic', gu: 'રામાયણ કોમિક', kn: 'ರಾಮಾಯಣ ಕಾಮಿಕ್' });
  const prompt = pick(lang, { hi: 'कौन-सा काण्ड पढ़ेंगे?', en: 'Which kanda shall we read?', gu: 'કયો કાંડ વાંચશો?', kn: 'ಯಾವ ಕಾಂಡವನ್ನು ಓದುತ್ತೀರಿ?' });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: spacing.md, gap: spacing.md }}>
        <Text style={{ color: colors.inkSoft, fontFamily: titleFontByLang(lang), fontSize: typography.subtitle.fontSize, lineHeight: 23, marginBottom: 6 }}>{prompt}</Text>
        {ramayanaKandas.map(kanda => {
          const comic = kanda.comicId ? comicById(kanda.comicId) : undefined;
          const ordered = orderTitlesByLanguage(lang, kanda.name.hi, kanda.name.en, CARD_TITLE_SIZES);
          const primary = { ...ordered.primary, text: lang === 'gu' ? kanda.name.gu : lang === 'kn' ? kanda.name.kn : ordered.primary.text };
          const meta = comic
            ? pick(lang, {
                hi: `${comic.episodeCount} प्रसंग · सचित्र`,
                en: `${comic.episodeCount} episodes · illustrated`,
                gu: `${comic.episodeCount} પ્રસંગ · સચિત્ર`,
                kn: `${comic.episodeCount} ಪ್ರಸಂಗಗಳು · ಚಿತ್ರಸಹಿತ`,
              })
            : pick(lang, { hi: 'जल्द आएँगे', en: 'Coming soon', gu: 'જલ્દી આવશે', kn: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ' });
          return (
            <ListCard
              key={kanda.id}
              size="compact"
              testID={`ramayan-kanda-${kanda.id}`}
              disabled={!comic}
              style={{ marginBottom: 0 }}
              accessibilityLabel={`${kanda.name.en}. ${comic ? `${comic.episodeCount} episodes` : 'Coming soon'}.`}
              onPress={comic ? () => navigation.navigate('ComicChapters', { comicId: comic.id }) : undefined}
              leading={<CardThumb><DeityIcon iconKey="bowArrow" /></CardThumb>}
            >
              <CardTitles primary={primary} secondary={ordered.secondary} meta={meta} />
            </ListCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
