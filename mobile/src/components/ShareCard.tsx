import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { fitMeaningType, meaningScriptFor, shareCardMetrics } from '@/utils/shareCardType';
import Ornament from './Ornament';

export type ShareCardProps = {
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
  lang: Lang;
  width: number;
  height: number;
};

const ShareCard = React.forwardRef<View, ShareCardProps>(function ShareCard(props, ref) {
  const { colors, typography } = useTheme();
  const sectionName = contentByLang(props.lang, props.sectionNameHi, props.sectionNameEn);
  const verseLabel = contentByLang(props.lang, props.verseLabelHi, props.verseLabelEn);
  const meaning = meaningByLang(props.lang, props.meaningHi ?? '', props.meaningEn ?? '', {
    gu: props.meaningGu,
    kn: props.meaningKn,
  });
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
  // Deterministic size + leading for the meaning (see utils/shareCardType.ts).
  // Platform auto-fit is deliberately not used here: with a fixed lineHeight it
  // shrank the meaning to ~7 pt while the leading stayed at 24.
  const meaningScript = meaningScriptFor(props.lang);
  const meaningFit = fitMeaningType({
    meaning,
    verseLineCount: lines.length,
    cardWidth: props.width,
    cardHeight: props.height,
    script: meaningScript,
  });

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.card,
        {
          width: props.width,
          height: props.height,
          backgroundColor: colors.parchment,
          borderColor: colors.divider,
        },
      ]}
    >
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

      {meaning ? (
        <Text
          numberOfLines={meaningFit.numberOfLines}
          style={[
            styles.meaning,
            {
              color: colors.inkSoft,
              fontFamily: meaningFont,
              fontSize: meaningFit.fontSize,
              lineHeight: meaningFit.lineHeight,
              // Cormorant has a true italic cut; the Noto Serif Indic faces do
              // not, so an italic there is a synthesised skew that blurs the
              // matras. Same rule as `captionFont` in utils/scriptFont.ts.
              fontStyle: meaningScript === 'latin' ? 'italic' : 'normal',
            },
          ]}
        >
          {meaning}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text
          style={[
            styles.wordmarkHi,
            {
              color: colors.ink,
              fontFamily: typography.readerTitle.fontFamily,
            },
          ]}
        >
          वेदांश़
        </Text>
        <Text
          style={[
            styles.wordmarkLatin,
            {
              color: colors.saffronDeep,
              fontFamily: typography.cardLatin.fontFamily,
            },
          ]}
        >
          Vedansh — Sacred Texts, Daily Reading
        </Text>
        <Text
          style={[
            styles.storeLine,
            {
              color: colors.inkMuted,
              fontFamily: typography.cardLatin.fontFamily,
            },
          ]}
        >
          Now available on iOS & Android
        </Text>
      </View>
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
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
    // fontSize / lineHeight / fontStyle are set per-render from fitMeaningType().
    textAlign: 'center',
    marginTop: shareCardMetrics.meaningMarginTop,
    paddingHorizontal: shareCardMetrics.meaningPaddingHorizontal,
    includeFontPadding: false,
  },
  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  wordmarkHi: {
    // no tracking on the Devanagari wordmark — it splits the shirorekha
    fontSize: 18,
    includeFontPadding: false,
  },
  wordmarkLatin: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 3,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  storeLine: {
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
