/** Illustrated prose page, adapted from KathaSectionPage (not a verse renderer). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
import { garudPuranImages } from '@assets/garud-puran';
import type { GarudPuranPage as Page, GarudPuranSource } from '@/data/garud-puran';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang } from '@/utils/localize';
import { meaningToken, pillTextStyle, scriptTitleFont } from '@/utils/langType';
import ReadingArtwork from './ReadingArtwork';
import ProseParagraph from './ProseParagraph';

type Props = { verse: Page; source: GarudPuranSource; width: number; topActions?: React.ReactNode };

export default function GarudPuranPage({ verse, width, topActions }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const body = commentaryByLang(lang, verse.bodyHi, verse.bodyEn);
  const title = contentByLang(lang, verse.titleHi, verse.titleEn);
  const bodyStyle = { ...meaningToken(lang, typography), color: colors.ink };
  return (
    <View style={[styles.page, { width }]} testID={`garud-page-${verse.id}`}>
      <AutoSlideScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.screenGutter }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
            <Text style={[pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'चयनित प्रसंग', 'Selected reading')}
            </Text>
          </View>
          <View style={styles.actions}>{topActions}</View>
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>{title}</Text>
        <View testID={verse.number === 1 ? `garud-art-${verse.id}` : undefined}>
          <ReadingArtwork source={verse.number === 1 ? garudPuranImages[verse.artId] : null} />
        </View>
        {body.map((paragraph, index) => <ProseParagraph key={index} style={[styles.paragraph, bodyStyle]}>{paragraph}</ProseParagraph>)}

      </AutoSlideScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { paddingTop: 8, paddingBottom: 32 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actions: { flexDirection: 'row', gap: 8 }, pill: { paddingHorizontal: 10, paddingVertical: 6 },
  title: { fontSize: 20, lineHeight: 30, marginTop: 8, marginBottom: 4 },
  paragraph: { marginBottom: 14 },
});
