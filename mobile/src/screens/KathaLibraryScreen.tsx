import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CatalogBackground from '@/components/CatalogBackground';
import ListingCard from '@/components/ListingCard';
import ObservanceArtwork from '@/components/ObservanceArtwork';
import ReaderHeader from '@/components/ReaderHeader';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { captionFont } from '@/utils/scriptFont';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import { backgroundImages } from '@assets/backgrounds';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '@/components/TextField';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import type { PanchangStackParamList } from '@/navigation/types';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'KathaLibrary'>;

export default function KathaLibraryScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const rootNav = useNavigation<any>();
  const [query, setQuery] = useState('');

  const library = useMemo(() => getKathaLibrary(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library;
    return library.filter((k) => `${k.titleHi} ${k.titleEn}`.toLowerCase().includes(q));
  }, [library, query]);

  const openKatha = (kathaId: string) => {
    rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId } });
  };

  return (
    <View style={styles.root}>
      <CatalogBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader title={contentByLang(lang, 'कथा संग्रह', 'Katha Library')} onBack={() => navigation.goBack()} sideWidth={48}
          titleContent={<>
            <Text style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), color: colors.ink }}>{contentByLang(lang, 'कथा संग्रह', 'Katha Library')}</Text>
            <Text style={{ ...captionFont(lang === 'en' ? 'कथा संग्रह' : 'Katha Library'), fontSize: 13, lineHeight: 20, color: colors.inkMuted }}>{lang === 'en' ? 'कथा संग्रह' : 'Katha Library'} · {library.length}</Text>
          </>} right={
          <ShareButton
            busy={shareBusy || filtered.length === 0}
            accessibilityLabel="Share katha listing"
            accessibilityHint="Share the currently listed kathas as post, Story, or Reel cards"
            onPress={() => void share(buildListingShare({
              sourceId: 'katha-library',
              titleHi: query.trim() ? 'कथा खोज परिणाम' : 'कथा संग्रह',
              titleEn: query.trim() ? 'Katha Search Results' : 'Katha Library',
              background: backgroundImages.category_granth_open_scripture,
              items: filtered.map((katha) => ({
                titleHi: katha.titleHi, titleEn: katha.titleEn,
                detailHi: `${katha.sections.length} खंड`,
                detailEn: `${katha.sections.length} sections`,
              })),
            }), lang)}
          />} />

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextField testID="katha-search"
            value={query}
            onChangeText={setQuery}
            placeholder={contentByLang(lang, 'कथाएँ खोजें…', 'Search stories…')}
            style={styles.search}
          />

          {filtered.map((katha) => {
            const rule = OBSERVANCE_RULES.find(rule => rule.kathaId === katha.id)
              ?? { deityEn: 'Guru Parampara', category: 'vrat' as const };
            return <ListingCard key={katha.id} testID={`katha-card-${katha.id}`} variant="observance" language={lang}
              title={contentByLang(lang, katha.titleHi, katha.titleEn)}
              secondary={lang === 'en' ? katha.titleHi : katha.titleEn}
              meta={<Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 20, color: colors.saffronDeep }}>{katha.sections.length} {contentByLang(lang, 'खंड', 'sections')}</Text>}
              thumbnail={<ObservanceArtwork rule={rule} />}
              onPress={() => openKatha(katha.id)} accessibilityLabel={`Read katha ${katha.titleEn}`} />;
          })}
          {filtered.length === 0 && (
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
              {meaningByLang(lang, 'कोई कथा नहीं मिली।', 'No stories found.')}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  search: { marginBottom: 8, height: undefined, minHeight: 44, paddingVertical: 8 },
});
