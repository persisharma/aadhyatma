import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { meaningScriptFor, shareCardMetrics } from '@/utils/shareCardType';
import { titleFontByLang } from '@/utils/langType';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';
import ShareBrandFooter from './ShareBrandFooter';

export type ShareCardProps = {
  /** Source id — resolves the same faded sketch the source's reader page shows. */
  sourceId: string;
  /**
   * Subsection key (kāṇḍa/stanza) for sources whose reader plate varies per
   * subsection (Valmiki Ramayan, Sundarkand); absent, the source-level plate
   * is used.
   */
  stanza?: number;
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  linesHi: string[];
  linesEn: string[];
  meaningHi?: string;
  meaningEn?: string;
  meaningGu?: string;
  meaningKn?: string;
  /**
   * One line set above the meaning in the title face (Gita Saar's theme line —
   * the idea the verse is shared for). gu/kn re-script the Hindi.
   */
  meaningTitleHi?: string;
  meaningTitleEn?: string;
  lang: Lang;
  width: number;
  /** Minimum height; long text grows the single exported image. */
  height: number;
  /** Actual native layout height, including wrapped text and branding. */
  onHeight?: (height: number) => void;
};

const ShareCard = React.forwardRef<View, ShareCardProps>(function ShareCard(props, ref) {
  const { colors, typography } = useTheme();
  const sectionName = contentByLang(props.lang, props.sectionNameHi, props.sectionNameEn);
  const verseLabel = contentByLang(props.lang, props.verseLabelHi, props.verseLabelEn);
  const meaning = meaningByLang(props.lang, props.meaningHi ?? '', props.meaningEn ?? '', {
    gu: props.meaningGu,
    kn: props.meaningKn,
  });
  const meaningTitle = meaningByLang(
    props.lang,
    props.meaningTitleHi ?? '',
    props.meaningTitleEn ?? ''
  );
  const lines = verseLinesByLang(props.lang, props.linesHi, props.linesEn);
  // Constrained surface (design.md §13 sanctioned): keeps its own tuned sizes, but the
  // font family must follow the script or gu/kn render as tofu. hi/en unchanged — en
  // romanization keeps rendering in the Devanagari face (which carries Latin glyphs), as before.
  const verseFont =
    props.lang === 'gu'
      ? fontFamilies.gujarati
      : props.lang === 'kn'
        ? fontFamilies.kannada
        : typography.verse.fontFamily;
  const meaningFont =
    props.lang === 'hi'
      ? typography.meaning.fontFamily
      : props.lang === 'gu'
        ? fontFamilies.gujarati
        : props.lang === 'kn'
          ? fontFamilies.kannada // kn meaning now renders in Kannada script
          : typography.cardLatin.fontFamily; // en
  // Keep type readable and let native text layout grow the image. Estimating
  // from authored line counts misses wrapping and used to clip long verses.
  const meaningScript = meaningScriptFor(props.lang);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={event => props.onHeight?.(event.nativeEvent.layout.height)}
      style={[
        styles.card,
        {
          width: props.width,
          minHeight: props.height,
          backgroundColor: colors.parchment,
          borderColor: colors.divider,
        },
      ]}
    >
      {/* Same faded source sketch + parchment overlay as the reader page; falls
          back to the plain parchment gradient for sources without a plate. */}
      <BackgroundLayer
        source={getReaderBackground(props.sourceId, { stanza: props.stanza })}
      />
      <View style={styles.headerBand}>
        <Text
          style={[
            styles.headerText,
            {
              color: colors.saffronDeep,
              // Cormorant tracking for Latin; script serif with no tracking for
              // Indic headers (tracking splits the shirorekha).
              fontFamily: props.lang === 'en' ? typography.cardLatin.fontFamily : meaningFont,
              fontSize: 13,
            },
            props.lang !== 'en' && { letterSpacing: 0 },
          ]}
        >
          {sectionName.toUpperCase()} · {verseLabel.toUpperCase()}
        </Text>
      </View>

      <View style={styles.body}>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={[
              styles.verseLine,
              {
                color: colors.ink,
                fontFamily: verseFont,
              },
            ]}
          >
            {line}
          </Text>
        ))}
      </View>

      <Ornament />

      {meaningTitle ? (
        <Text
          style={[
            styles.meaning,
            {
              color: colors.saffronDeep,
              fontFamily: titleFontByLang(props.lang),
            },
          ]}
        >
          {meaningTitle}
        </Text>
      ) : null}

      {meaning ? (
        <Text
          style={[
            styles.meaning,
            {
              color: colors.inkSoft,
              fontFamily: meaningFont,
              // Cormorant has a true italic cut; the Noto Serif Indic faces do
              // not, so an italic there is a synthesised skew that blurs the
              // matras. Same rule as `captionFont` in utils/scriptFont.ts.
              fontStyle: meaningScript === 'latin' ? 'italic' : 'normal',
            },
            // The title already took the block's top margin from the budget.
            meaningTitle ? { marginTop: 0 } : null,
          ]}
        >
          {meaning}
        </Text>
      ) : null}

      <ShareBrandFooter />
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    // Keeps the BackgroundLayer sketch inside the card's 1px border.
    overflow: 'hidden',
    // Geometry is shared with the meaning's line budget — change both together.
    paddingTop: shareCardMetrics.paddingTop,
    paddingBottom: shareCardMetrics.paddingBottom,
    paddingHorizontal: shareCardMetrics.paddingHorizontal,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  headerBand: {
    alignItems: 'center',
    marginBottom: 18,
  },
  headerText: {
    letterSpacing: 2.4,
    includeFontPadding: false,
  },
  body: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  verseLine: {
    fontSize: 24,
    lineHeight: shareCardMetrics.verseLineHeight,
    textAlign: 'center',
    marginBottom: shareCardMetrics.verseLineMargin,
    includeFontPadding: false,
  },
  meaning: {
    fontSize: shareCardMetrics.meaningFontSize,
    lineHeight: shareCardMetrics.meaningLineHeight,
    textAlign: 'center',
    marginTop: shareCardMetrics.meaningMarginTop,
    paddingHorizontal: shareCardMetrics.meaningPaddingHorizontal,
    includeFontPadding: false,
  },
});
