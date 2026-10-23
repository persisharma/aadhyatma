import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { KathaContentSection } from '@/panchang/types';
import { contentByLang, commentaryByLang } from '@/utils/localize';
import { scriptTitleFont, meaningToken, pillTextStyle } from '@/utils/langType';
import ProseReadingCard from './ProseReadingCard';
import ProseParagraph from './ProseParagraph';
import { backgroundImages } from '@assets/backgrounds';
import type { BackgroundImage } from '@/data/backgroundAsset';

type Props = {
  section: KathaContentSection;
  index: number;
  total: number;
  width: number;
  /**
   * The pill's leading word. Defaults to the katha's `प्रसंग` / `Part`; the
   * पितृ पक्ष परिचय reader passes `परिचय` / `Introduction` so the same page
   * anatomy serves a lesson without calling it a story part.
   */
  pillHi?: string;
  pillEn?: string;
  background?: BackgroundImage;
};

// One katha section as a continuous folio; only the opening section has a painting.
// Body text stays at its normal reading size; the page scrolls vertically when a
// section is longer than the screen, and you swipe left to the next section.
// Top chrome is kept tight so content sits high and most sections fit without scrolling.
export default function KathaSectionPage({ section, index, total, width, pillHi = 'प्रसंग', pillEn = 'Part', background = backgroundImages.category_granth_open_scripture }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const title = contentByLang(lang, section.titleHi, section.titleEn);
  const body = commentaryByLang(lang, section.bodyHi, section.bodyEn);
  const pillText = contentByLang(lang, `${pillHi} · ${index + 1}/${total}`, `${pillEn} · ${index + 1}/${total}`);

  const meaning = meaningToken(lang, typography);
  const bodyStyle = {
    color: lang === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaning.fontFamily,
    fontSize: meaning.fontSize,
    lineHeight: meaning.lineHeight,
  };

  return (
    <View style={[styles.page, { width }]}>
      <AutoSlideScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter }]}
        showsVerticalScrollIndicator={false}
      >
        <ProseReadingCard illustration={index === 0 ? background : undefined} heading={<>
          <View style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
            <Text
              style={[
                styles.pillText,
                pillTextStyle(lang, typography.versePill),
                { color: colors.saffronDeep },
              ]}
            >
              {pillText}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
            {title}
          </Text>

        </>}>
          {body.map((paragraph, i) => (
            <ProseParagraph key={i} style={[styles.para, bodyStyle]}>
              {paragraph}
            </ProseParagraph>
          ))}
        </ProseReadingCard>
      </AutoSlideScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, overflow: 'hidden' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 40 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  pillText: { textTransform: 'uppercase', includeFontPadding: false },
  // Devanagari title + prose — keep Android's font padding (no matra clip).
  title: { fontSize: 20, marginBottom: 4 },
  para: { marginBottom: 14 },
});
