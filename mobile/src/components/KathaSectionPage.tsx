import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { KathaContentSection } from '@/panchang/types';
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
  const isHindi = lang === 'hi';

  const title = isHindi ? section.titleHi : section.titleEn;
  const body = isHindi ? section.bodyHi : section.bodyEn;
  const pillText = isHindi ? `प्रसंग · ${index + 1}/${total}` : `Part · ${index + 1}/${total}`;

  const bodyStyle = isHindi
    ? {
        color: colors.inkSoft,
        fontFamily: typography.meaning.fontFamily,
        fontSize: typography.meaning.fontSize,
        lineHeight: typography.meaning.lineHeight,
      }
    : {
        color: colors.ink,
        fontFamily: typography.meaningEnglish.fontFamily,
        fontSize: typography.meaningEnglish.fontSize,
        lineHeight: typography.meaningEnglish.lineHeight,
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

        <Text style={[styles.title, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}>
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
  title: { fontSize: 20, marginBottom: 4, includeFontPadding: false },
  ornamentWrap: { marginVertical: -14 },
  para: { marginTop: 14, includeFontPadding: false },
});
