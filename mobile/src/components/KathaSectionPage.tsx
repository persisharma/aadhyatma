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

// One katha section rendered as a swipeable reader card (mirrors the stotram/
// gita verse-page card pattern: pill label, heading, ornament, scrollable body).
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

        <Ornament />

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
  scrollContent: { paddingTop: 16, paddingBottom: 48 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  pillText: { textTransform: 'uppercase', includeFontPadding: false },
  title: { fontSize: 20, marginBottom: 4, includeFontPadding: false },
  para: { marginTop: 14, includeFontPadding: false },
});
