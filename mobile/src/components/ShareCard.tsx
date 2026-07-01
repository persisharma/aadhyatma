import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
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
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 13,
            },
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
          numberOfLines={5}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={[
            styles.meaning,
            {
              color: colors.inkSoft,
              fontFamily: meaningFont,
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
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 28,
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
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 2,
    includeFontPadding: false,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    includeFontPadding: false,
  },
  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  wordmarkHi: {
    fontSize: 18,
    letterSpacing: 1,
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
