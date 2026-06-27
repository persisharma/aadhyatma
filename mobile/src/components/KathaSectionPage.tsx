import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { KathaContentSection } from '@/panchang/types';
import { contentByLang, commentaryByLang } from '@/utils/localize';
import { scriptTitleFont, meaningToken } from '@/utils/langType';
import Ornament from './Ornament';

type Props = {
  section: KathaContentSection;
  index: number;
  total: number;
  width: number;
};

// One katha section as a swipeable reader card (pill, heading, ornament, body).
// Body text stays at its normal reading size; the card scrolls vertically when a
// section is longer than the screen, and you swipe right to the next section.
// Top chrome is kept tight so content sits high and most sections fit without scrolling.
export default function KathaSectionPage({ section, index, total, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const title = contentByLang(lang, section.titleHi, section.titleEn);
  const body = commentaryByLang(lang, section.bodyHi, section.bodyEn);
  const pillText = contentByLang(lang, `प्रसंग · ${index + 1}/${total}`, `Part · ${index + 1}/${total}`);

  const meaning = meaningToken(lang, typography);
  const bodyStyle = {
    color: lang === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaning.fontFamily,
    fontSize: meaning.fontSize,
    lineHeight: meaning.lineHeight,
  };

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter }]}
        showsVerticalScrollIndicator={false}
        accessible
        accessibilityLabel={[title, ...body].join('. ')}
      >
        <View style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
          <Text
            style={[
              styles.pillText,
              {
                color: colors.saffronDeep,
                fontSize: typography.versePill.fontSize,
                fontWeight: typography.versePill.fontWeight,
                letterSpacing: typography.versePill.letterSpacing,
              },
            ]}
          >
            {pillText}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
          {title}
        </Text>

        {/* Compress the shared Ornament's large vertical margin within the katha
            card so the body has more room to fit on one screen. */}
        <View style={styles.ornamentWrap}>
          <Ornament />
        </View>

        {body.map((paragraph, i) => (
          <Text key={i} style={[styles.para, bodyStyle]}>
            {paragraph}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, overflow: 'hidden' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 4, paddingBottom: 40 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  pillText: { textTransform: 'uppercase', includeFontPadding: false },
  // Devanagari title + prose — keep Android's font padding (no matra clip).
  title: { fontSize: 20, marginBottom: 4 },
  ornamentWrap: { marginVertical: -14 },
  para: { marginTop: 14 },
});
